
import React, { useState, useRef } from 'react';
import { Tree } from 'primereact/tree';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { TreeNode } from 'primereact/treenode';
import { Tooltip } from 'primereact/tooltip';
import { ContextMenu } from 'primereact/contextmenu';
import { MenuItem } from 'primereact/menuitem';
import { AdvancedSearch } from '../components/AdvancedSearch';
import { SearchCriteria } from '../services/mockApi';

// Mock Data Interfaces
interface NodeData {
  type: 'folder' | 'image' | 'document';
  src?: string;
  metadata: { property: string; value: string }[];
}

const Search: React.FC = () => {
  const [activeCriteria, setActiveCriteria] = useState<SearchCriteria | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | number | undefined>(undefined);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [metaFilter, setMetaFilter] = useState('');
  
  // UI State
  const [showMetadata, setShowMetadata] = useState(true);
  const [menuModel, setMenuModel] = useState<MenuItem[]>([]);
  const cm = useRef<ContextMenu>(null);

  // --- Mock API 1: Police Records System ---
  const fetchPoliceData = async (id: string): Promise<TreeNode> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
    return {
        key: 'api1',
        label: 'Police Records (API 1)',
        data: { 
            type: 'folder', 
            metadata: [
                { property: 'Source System', value: 'RMS-Pro' },
                { property: 'Department', value: 'Metro Police' },
                { property: 'Case Status', value: 'Active' }
            ] 
        },
        icon: 'pi pi-fw pi-shield',
        children: [
            {
                key: 'api1-doc1',
                label: `Incident_Report_${id}.pdf`,
                icon: 'pi pi-fw pi-file-pdf',
                data: { 
                    type: 'document', 
                    metadata: [
                        { property: 'Author', value: 'Sgt. O\'Malley' },
                        { property: 'Date Filed', value: '2023-11-12' },
                        { property: 'Pages', value: '5' }
                    ] 
                }
            },
            {
                key: 'api1-folder1',
                label: 'Witness Statements',
                icon: 'pi pi-fw pi-folder',
                data: { type: 'folder', metadata: [{ property: 'Count', value: '2' }] },
                children: [
                    {
                        key: 'api1-doc2',
                        label: 'Statement_Doe.txt',
                        icon: 'pi pi-fw pi-file',
                        data: { type: 'document', metadata: [{ property: 'Witness', value: 'John Doe' }] }
                    }
                ]
            }
        ]
    };
  };

  // --- Mock API 2: Forensics Lab (Images) ---
  const fetchForensicsData = async (id: string): Promise<TreeNode> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate slightly longer delay
    return {
        key: 'api2',
        label: 'Forensics Lab (API 2)',
        data: { 
            type: 'folder', 
            metadata: [
                { property: 'Source System', value: 'LIMS-Cloud' },
                { property: 'Lab ID', value: `LAB-${id}` }
            ] 
        },
        icon: 'pi pi-fw pi-search',
        children: [
            {
                key: 'api2-folder1',
                label: 'Crime Scene Photos',
                icon: 'pi pi-fw pi-images',
                data: { type: 'folder', metadata: [{ property: 'Resolution', value: 'High' }] },
                expanded: true, // Auto expand this folder
                children: [
                    { 
                        key: 'api2-img1', 
                        label: 'Scene_Overview.jpg', 
                        icon: 'pi pi-fw pi-image', 
                        data: { 
                            type: 'image', 
                            src: 'https://picsum.photos/800/600?random=101',
                            metadata: [
                                { property: 'Filename', value: 'Scene_Overview.jpg' },
                                { property: 'Dimensions', value: '4000x3000' },
                                { property: 'ISO', value: '400' }
                            ]
                        } 
                    },
                    { 
                        key: 'api2-img2', 
                        label: 'Evidence_Marker_1.jpg', 
                        icon: 'pi pi-fw pi-image', 
                        data: { 
                            type: 'image', 
                            src: 'https://picsum.photos/800/600?random=102',
                            metadata: [
                                { property: 'Filename', value: 'Evidence_Marker_1.jpg' },
                                { property: 'Dimensions', value: '4000x3000' },
                                { property: 'Macro', value: 'Yes' }
                            ]
                        } 
                    }
                ]
            }
        ]
    };
  };

  // --- Mock API 3: Court Documents ---
  const fetchCourtData = async (id: string): Promise<TreeNode> => {
    await new Promise(resolve => setTimeout(resolve, 800)); 
    return {
        key: 'api3',
        label: 'Judiciary System (API 3)',
        data: { 
            type: 'folder', 
            metadata: [
                { property: 'Source System', value: 'CourtConnect' },
                { property: 'Jurisdiction', value: 'District 9' }
            ] 
        },
        icon: 'pi pi-fw pi-building',
        children: [
            {
                key: 'api3-doc1',
                label: `Warrant_${id}_Signed.pdf`,
                icon: 'pi pi-fw pi-file-pdf',
                data: { 
                    type: 'document', 
                    metadata: [
                        { property: 'Judge', value: 'Hon. P. Denton' },
                        { property: 'Date Signed', value: '2023-11-10' }
                    ] 
                }
            }
        ]
    };
  };

  const handleSearch = async (criteria: SearchCriteria) => {
    if (!criteria.term && !criteria.amount && !criteria.cardNumber) return;

    setLoading(true);
    setSearched(true);
    setActiveCriteria(criteria);
    setSelectedNode(null);
    setSelectedNodeKey(undefined);
    
    const searchId = criteria.term || 'Unknown';

    try {
        const [policeData, forensicsData, courtData] = await Promise.all([
            fetchPoliceData(searchId),
            fetchForensicsData(searchId),
            fetchCourtData(searchId)
        ]);

        const newNodes = [policeData, forensicsData, courtData];
        setNodes(newNodes);

        // Auto-select logic
        const firstImage = forensicsData.children?.[0]?.children?.[0];
        
        if (firstImage) {
            setSelectedNode(firstImage);
            setSelectedNodeKey(firstImage.key);
            setZoom(1);
            setRotation(0);
        } else {
            setSelectedNode(policeData);
            setSelectedNodeKey(policeData.key);
        }

    } catch (error) {
        console.error("Error fetching data", error);
    } finally {
        setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (activeCriteria) {
      handleSearch(activeCriteria);
    }
  };

  const toggleExpansion = (isExpanded: boolean) => {
    const _nodes = [...nodes];
    const traverse = (items: TreeNode[]) => {
      items.forEach(item => {
        item.expanded = isExpanded;
        if (item.children) traverse(item.children);
      });
    };
    traverse(_nodes);
    setNodes(_nodes);
  };

  const toggleNodeExpansion = (node: TreeNode) => {
      node.expanded = !node.expanded;
      setNodes([...nodes]);
  };

  const onNodeSelect = (e: any) => {
    setSelectedNode(e.node);
    setZoom(1); 
    setRotation(0); 
  };
  
  const onNodeUnselect = () => {
    setSelectedNode(null);
  };

  // Image Toolbar Handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 0.5));
  const handleRotateCw = () => setRotation((prev) => prev + 90);
  const handleRotateCcw = () => setRotation((prev) => prev - 90);
  const handleFitScreen = () => {
      setZoom(1);
      setRotation(0);
  };

  const handlePrint = () => {
    const src = (selectedNode?.data as NodeData)?.src;
    if (!src) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print Image</title></head>
          <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh;">
            <img src="${src}" style="max-width:100%; max-height:100%; transform: rotate(${rotation}deg);" />
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownload = async () => {
    const src = (selectedNode?.data as NodeData)?.src;
    if (!src) return;

    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = (selectedNode?.label as string) || 'download.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(src, '_blank');
    }
  };

  const onNodeContextMenu = (event: any) => {
    const node = event.node;
    setSelectedNode(node);
    setSelectedNodeKey(node.key);
    // Reset canvas state on context selection
    setZoom(1); 
    setRotation(0);

    const items: MenuItem[] = [];
    const data = node.data as NodeData;

    if (data.type === 'image') {
        items.push({ 
            label: 'View', 
            icon: 'pi pi-fw pi-eye', 
            command: () => {} // Selection already handled
        });
        items.push({ separator: true });
        items.push({ 
            label: 'Download', 
            icon: 'pi pi-fw pi-download', 
            command: () => handleDownload()
        });
        items.push({ 
            label: 'Print', 
            icon: 'pi pi-fw pi-print', 
            command: () => handlePrint()
        });
    } else if (data.type === 'folder') {
         items.push({
             label: node.expanded ? 'Collapse' : 'Expand',
             icon: node.expanded ? 'pi pi-fw pi-folder' : 'pi pi-fw pi-folder-open',
             command: () => toggleNodeExpansion(node)
         });
    } else {
        items.push({
             label: 'View Details',
             icon: 'pi pi-fw pi-list',
             command: () => setShowMetadata(true)
        });
    }
    
    items.push({ separator: true });
    items.push({
        label: showMetadata ? 'Hide Metadata' : 'Show Metadata',
        icon: 'pi pi-fw pi-info-circle',
        command: () => setShowMetadata(!showMetadata)
    });

    setMenuModel(items);
    if (cm.current) {
        cm.current.show(event.originalEvent);
    }
  };

  const renderCenterContent = () => {
    if (!selectedNode || !selectedNode.data) {
        return (
            <div className="flex flex-column align-items-center justify-content-center h-full text-400">
                <i className="pi pi-inbox text-5xl mb-3"></i>
                <p>Select an item from the tree</p>
            </div>
        );
    }

    const data = selectedNode.data as NodeData;

    if (data.type === 'image' && data.src) {
        return (
            <div className="w-full h-full flex align-items-center justify-content-center surface-900 overflow-hidden relative">
                <img 
                    src={data.src} 
                    alt={selectedNode.label as string} 
                    className="transition-transform transition-duration-300 ease-out max-w-full max-h-full shadow-4"
                    style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, objectFit: 'contain' }}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-column align-items-center justify-content-center h-full text-500">
            <i className={`text-6xl mb-4 ${selectedNode.icon}`}></i>
            <h3 className="text-xl font-semibold">{selectedNode.label}</h3>
            <p className="text-sm mt-2">Preview not available for this type.</p>
        </div>
    );
  };

  const isImage = selectedNode?.data && (selectedNode.data as NodeData).type === 'image';

  return (
    <div className="flex flex-column md:flex-row gap-4" style={{ height: 'calc(100vh - 9rem)' }}>
        <ContextMenu model={menuModel} ref={cm} />
        
        {/* Left Sidebar: Search Configuration */}
        <div className="w-full md:w-22rem flex-shrink-0 flex flex-column">
            <Card title="Case Search" className="h-full shadow-1 flex flex-column">
                 <div className="flex flex-column gap-4 h-full">
                    <p className="text-sm text-500 m-0">
                        Enter a criteria to retrieve aggregated data from connected systems.
                    </p>
                    
                    <AdvancedSearch 
                        onSearch={handleSearch} 
                        loading={loading} 
                        layout="vertical"
                        contextLabel="Search Records"
                    />

                    <div className="flex-grow-1"></div>

                    {searched && activeCriteria && (
                        <div className="p-3 surface-ground border-round border-1 border-200 mt-auto">
                             <span className="text-xs text-500 uppercase font-bold text-center block mb-1">Active Query</span>
                             <div className="text-xl font-bold text-800 my-1">
                                {activeCriteria.term || 'Filters Applied'}
                             </div>
                             <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 border-round">3 APIs</span>
                                {activeCriteria.amount && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 border-round">${activeCriteria.amount}</span>}
                                {activeCriteria.cardNumber && <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 border-round">Card: ...{activeCriteria.cardNumber}</span>}
                             </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>

        {/* Right Side: Results Area */}
        <div className="flex-1 overflow-hidden h-full">
            <div className="flex h-full w-full border-1 border-300 border-round shadow-1 surface-card overflow-hidden">
                {/* Panel 1: Tree with Filter */}
                <div className="w-18rem md:w-20rem flex flex-column border-right-1 border-200 h-full flex-shrink-0 bg-surface-0 overflow-hidden">
                    <div className="p-3 surface-ground border-bottom-1 border-200 font-medium text-700 flex justify-content-end align-items-center">
                        <div className="flex gap-1">
                            <Button icon="pi pi-angle-double-down" rounded text severity="secondary" tooltip="Expand All" onClick={() => toggleExpansion(true)} disabled={nodes.length === 0} />
                            <Button icon="pi pi-angle-double-up" rounded text severity="secondary" tooltip="Collapse All" onClick={() => toggleExpansion(false)} disabled={nodes.length === 0} />
                            <Button icon="pi pi-refresh" rounded text severity="secondary" tooltip="Refresh Data" onClick={handleRefresh} disabled={!activeCriteria} />
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto custom-scrollbar p-2">
                            <Tree 
                            value={nodes} 
                            selectionMode="single" 
                            selectionKeys={selectedNodeKey} 
                            onSelectionChange={(e) => setSelectedNodeKey(e.value)}
                            onSelect={onNodeSelect}
                            onUnselect={onNodeUnselect}
                            onContextMenu={onNodeContextMenu}
                            metaKeySelection={false}
                            filter 
                            filterMode="lenient" 
                            filterPlaceholder="Filter items..."
                            className="w-full border-none p-0"
                        />
                    </div>
                </div>

                {/* Panel 2: Image Canvas with Toolbar */}
                <div className="flex-1 flex flex-column h-full min-w-0 relative surface-ground z-1 overflow-hidden">
                    <div className="h-4rem surface-overlay border-bottom-1 border-300 flex align-items-center justify-content-between px-3 shadow-1 z-2 flex-shrink-0">
                        <span className="text-sm font-medium text-700 white-space-nowrap overflow-hidden text-overflow-ellipsis max-w-15rem">
                            {selectedNode ? selectedNode.label : 'No Selection'}
                        </span>
                        <div className="flex gap-1 align-items-center">
                            <Tooltip target=".search-toolbar-btn" />
                            <Button icon="pi pi-search-plus" className="search-toolbar-btn" onClick={handleZoomIn} rounded text severity="secondary" tooltip="Zoom In" disabled={!isImage} />
                            <Button icon="pi pi-search-minus" className="search-toolbar-btn" onClick={handleZoomOut} rounded text severity="secondary" tooltip="Zoom Out" disabled={!isImage} />
                            <div className="w-1px h-2rem bg-300 mx-1"></div>
                            <Button icon="pi pi-refresh" className="search-toolbar-btn" onClick={handleRotateCcw} rounded text severity="secondary" tooltip="Rotate Left" style={{ transform: 'scaleX(-1)' }} disabled={!isImage} />
                            <Button icon="pi pi-refresh" className="search-toolbar-btn" onClick={handleRotateCw} rounded text severity="secondary" tooltip="Rotate Right" disabled={!isImage} />
                            <div className="w-1px h-2rem bg-300 mx-1"></div>
                            <Button icon="pi pi-arrows-alt" className="search-toolbar-btn" onClick={handleFitScreen} rounded text severity="secondary" tooltip="Reset View" disabled={!isImage} />
                            <div className="w-1px h-2rem bg-300 mx-1"></div>
                            <Button icon="pi pi-print" className="search-toolbar-btn" onClick={handlePrint} rounded text severity="secondary" tooltip="Print" disabled={!isImage} />
                            <Button icon="pi pi-download" className="search-toolbar-btn" onClick={handleDownload} rounded text severity="secondary" tooltip="Download" disabled={!isImage} />
                            <div className="w-1px h-2rem bg-300 mx-1"></div>
                            <Button icon={`pi ${showMetadata ? 'pi-eye-slash' : 'pi-eye'}`} className="search-toolbar-btn" onClick={() => setShowMetadata(!showMetadata)} rounded text severity={showMetadata ? 'primary' : 'secondary'} tooltip={showMetadata ? 'Hide Metadata' : 'Show Metadata'} />
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden relative surface-100">
                            {renderCenterContent()}
                    </div>
                </div>

                {/* Panel 3: Metadata */}
                {showMetadata && (
                    <div className="w-18rem md:w-20rem flex flex-column border-left-1 border-200 h-full flex-shrink-0 bg-surface-0 overflow-hidden">
                        <div className="p-2 surface-ground border-bottom-1 border-200 font-medium text-700 flex flex-column gap-2">
                            <div className="flex justify-content-between align-items-center">
                                <span>Metadata</span>
                                <Button icon="pi pi-times" rounded text size="small" severity="secondary" onClick={() => setShowMetadata(false)} />
                            </div>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-search text-400" />
                                <InputText 
                                    value={metaFilter} 
                                    onChange={(e) => setMetaFilter(e.target.value)} 
                                    placeholder="Filter..." 
                                    className="w-full p-inputtext-sm" 
                                />
                            </span>
                        </div>
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            {selectedNode && selectedNode.data ? (
                                <DataTable 
                                    value={(selectedNode.data as NodeData).metadata} 
                                    stripedRows 
                                    size="small" 
                                    className="text-sm border-none"
                                    globalFilter={metaFilter}
                                    globalFilterFields={['property', 'value']}
                                    emptyMessage="No metadata found."
                                >
                                    <Column field="property" header="Property" className="font-semibold text-600 w-4"></Column>
                                    <Column field="value" header="Value"></Column>
                                </DataTable>
                            ) : (
                                <div className="p-4 text-sm text-500 text-center mt-6">
                                    No item selected
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Search;
