import React, { useState } from 'react';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Tree } from 'primereact/tree';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { TreeNode } from 'primereact/treenode';
import { Tooltip } from 'primereact/tooltip';

// Mock Data Interfaces
interface NodeData {
  type: 'folder' | 'image' | 'document';
  src?: string;
  metadata: { property: string; value: string }[];
}

const Search: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | number | undefined>(undefined);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [metaFilter, setMetaFilter] = useState('');

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setSearched(true);
    setSelectedNode(null);
    setSelectedNodeKey(undefined);
    
    try {
        // Fetch from all 3 "APIs" simultaneously
        const [policeData, forensicsData, courtData] = await Promise.all([
            fetchPoliceData(searchId),
            fetchForensicsData(searchId),
            fetchCourtData(searchId)
        ]);

        const newNodes = [policeData, forensicsData, courtData];
        setNodes(newNodes);

        // Auto-select logic: Try to find the first image in the second API (Forensics) as it is most visual
        const firstImage = forensicsData.children?.[0]?.children?.[0];
        
        if (firstImage) {
            setSelectedNode(firstImage);
            setSelectedNodeKey(firstImage.key);
            setZoom(1);
            setRotation(0);
        } else {
            // Fallback to selecting the first root node
            setSelectedNode(policeData);
            setSelectedNodeKey(policeData.key);
        }

    } catch (error) {
        console.error("Error fetching data", error);
    } finally {
        setLoading(false);
    }
  };

  const onNodeSelect = (e: any) => {
    setSelectedNode(e.node);
    setZoom(1); // Reset zoom on node change
    setRotation(0); // Reset rotation on node change
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

  // Helper to render the center content based on node type
  const renderCenterContent = () => {
    if (!selectedNode) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <i className="pi pi-inbox text-5xl mb-3"></i>
                <p>Select an item from the tree</p>
            </div>
        );
    }

    const data = selectedNode.data as NodeData;

    if (data.type === 'image' && data.src) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden relative">
                <img 
                    src={data.src} 
                    alt={selectedNode.label as string} 
                    className="transition-transform duration-300 ease-out max-w-full max-h-full object-contain shadow-lg"
                    style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <i className={`text-6xl mb-4 ${selectedNode.icon}`}></i>
            <h3 className="text-xl font-semibold">{selectedNode.label}</h3>
            <p className="text-sm mt-2">Preview not available for this type.</p>
        </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-9rem)] gap-4">
        {/* Left Sidebar: Search Configuration */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col">
            <Card title="Case Search" className="h-full shadow-sm flex flex-col">
                 <div className="flex flex-col gap-4 h-full">
                    <p className="text-sm text-slate-500">
                        Enter a Case ID to retrieve aggregated data from connected systems.
                    </p>
                    
                    <form onSubmit={handleSearch} className="flex flex-col gap-3">
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search" />
                            <InputText 
                                placeholder="Case ID (e.g. 100)" 
                                value={searchId} 
                                onChange={(e) => setSearchId(e.target.value)} 
                                className="w-full"
                            />
                        </span>
                        <Button 
                            label="Search Records" 
                            icon="pi pi-search" 
                            loading={loading} 
                            type="submit" 
                            className="w-full" 
                        />
                    </form>

                    <div className="flex-1"></div>

                    {searched && (
                        <div className="p-3 bg-slate-50 rounded border border-slate-200 mt-auto">
                             <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active Query</span>
                             <div className="text-xl font-bold text-slate-800 my-1">{searchId}</div>
                             <div className="flex items-center gap-2 mt-2">
                                <i className="pi pi-check-circle text-green-500"></i>
                                <span className="text-xs text-slate-600">3 APIs Connected</span>
                             </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>

        {/* Right Side: Results Area */}
        <div className="flex-1 overflow-hidden h-full">
            {!searched ? (
                 <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded border-2 border-dashed border-slate-200">
                    <div className="text-center text-slate-400 p-6">
                        <i className="pi pi-server text-6xl mb-4 opacity-50"></i>
                        <h3 className="text-xl font-medium mb-2">No Data Loaded</h3>
                        <p className="max-w-xs mx-auto">Enter a valid Case ID in the sidebar to fetch and visualize records.</p>
                    </div>
                </div>
            ) : (
                <div className="h-full border rounded-lg shadow-sm bg-white overflow-hidden">
                    <Splitter style={{ height: '100%' }}>
                        {/* Panel 1: Tree with Filter */}
                        <SplitterPanel size={20} minSize={15} className="overflow-hidden flex flex-col">
                            <div className="p-3 bg-slate-50 border-b font-medium text-slate-700 flex justify-between items-center">
                                <span>Data Sources</span>
                            </div>
                            <div className="flex-1 overflow-auto custom-scrollbar p-2">
                                 <Tree 
                                    value={nodes} 
                                    selectionMode="single" 
                                    selectionKeys={selectedNodeKey} 
                                    onSelectionChange={(e) => setSelectedNodeKey(e.value)}
                                    onSelect={onNodeSelect}
                                    filter 
                                    filterMode="lenient" 
                                    filterPlaceholder="Filter items..."
                                    className="w-full border-none p-0"
                                />
                            </div>
                        </SplitterPanel>

                        {/* Panel 2: Image Canvas with Toolbar */}
                        <SplitterPanel size={55} minSize={30} className="overflow-hidden bg-slate-50 relative flex flex-col">
                            {selectedNode && (selectedNode.data as NodeData).type === 'image' && (
                               <div className="h-14 bg-white/95 backdrop-blur-sm border-b flex items-center justify-between px-3 shadow-sm z-20 shrink-0">
                                   <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{selectedNode.label}</span>
                                   <div className="flex gap-1 items-center">
                                        <Tooltip target=".search-toolbar-btn" />
                                        <Button icon="pi pi-search-plus" className="search-toolbar-btn" onClick={handleZoomIn} rounded text severity="secondary" tooltip="Zoom In" />
                                        <Button icon="pi pi-search-minus" className="search-toolbar-btn" onClick={handleZoomOut} rounded text severity="secondary" tooltip="Zoom Out" />
                                        <div className="w-px h-5 bg-slate-300 mx-1"></div>
                                        <Button icon="pi pi-refresh" className="search-toolbar-btn" onClick={handleRotateCcw} rounded text severity="secondary" tooltip="Rotate Left" style={{ transform: 'scaleX(-1)' }} />
                                        <Button icon="pi pi-refresh" className="search-toolbar-btn" onClick={handleRotateCw} rounded text severity="secondary" tooltip="Rotate Right" />
                                        <div className="w-px h-5 bg-slate-300 mx-1"></div>
                                        <Button icon="pi pi-arrows-alt" className="search-toolbar-btn" onClick={handleFitScreen} rounded text severity="secondary" tooltip="Reset View" />
                                        <div className="w-px h-5 bg-slate-300 mx-1"></div>
                                        <Button icon="pi pi-print" className="search-toolbar-btn" onClick={handlePrint} rounded text severity="secondary" tooltip="Print" />
                                        <Button icon="pi pi-download" className="search-toolbar-btn" onClick={handleDownload} rounded text severity="secondary" tooltip="Download" />
                                   </div>
                               </div>
                            )}
                            <div className="flex-1 overflow-hidden relative bg-slate-100">
                                 {renderCenterContent()}
                            </div>
                        </SplitterPanel>

                        {/* Panel 3: Metadata */}
                        <SplitterPanel size={25} minSize={15} className="overflow-hidden flex flex-col">
                             <div className="p-3 bg-slate-50 border-b font-medium text-slate-700 flex flex-col gap-2">
                                <span>Metadata</span>
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-search text-slate-400" />
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
                                        <Column field="property" header="Property" className="font-semibold text-slate-600 w-1/3"></Column>
                                        <Column field="value" header="Value"></Column>
                                    </DataTable>
                                ) : (
                                    <div className="p-4 text-sm text-slate-500 text-center mt-10">
                                        No item selected
                                    </div>
                                )}
                            </div>
                        </SplitterPanel>
                    </Splitter>
                </div>
            )}
        </div>
    </div>
  );
};

export default Search;