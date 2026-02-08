
import React, { useState, useRef, useEffect } from 'react';
import { Tree } from 'primereact/tree';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TreeNode } from 'primereact/treenode';
import { Tooltip } from 'primereact/tooltip';
import { ContextMenu } from 'primereact/contextmenu';
import { MenuItem } from 'primereact/menuitem';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useSearchTree, SearchNodeData } from '../services/apiService';

interface SearchResultsProps {
    docCaseId?: string;
    accountNumber?: string;
    status?: string | null;
    priority?: string | null;
    onReset: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
    docCaseId = '', 
    accountNumber, 
    status, 
    priority, 
    onReset 
}) => {
    // Local state for nodes to allow UI expansion/collapse
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

    // --- Data Fetching via Service ---
    const { 
        data: treeData, 
        isLoading: loading, 
        isFetching,
        refetch 
    } = useSearchTree(docCaseId, !!docCaseId);

    // Sync React Query data with local state and handle auto-selection
    useEffect(() => {
        if (treeData) {
            setNodes(treeData);

            // Logic to auto-select the first image node if available
            let nodeToSelect: TreeNode | null = null;
            
            // Try to find first image in API 2 (Forensics)
            const forensicsNode = treeData.find(n => n.key === 'api2');
            if (forensicsNode && forensicsNode.children) {
                const folder = forensicsNode.children.find(c => c.children && c.children.length > 0);
                if (folder && folder.children) {
                    nodeToSelect = folder.children[0];
                }
            }
            
            // Fallback to first node
            if (!nodeToSelect && treeData.length > 0) {
                nodeToSelect = treeData[0];
            }

            if (nodeToSelect) {
                setSelectedNode(nodeToSelect);
                setSelectedNodeKey(nodeToSelect.key);
                setZoom(1);
                setRotation(0);
            }
        }
    }, [treeData, docCaseId]); // Re-run when data or search term changes

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
        const node = e.node;
        setSelectedNode(node);
        setZoom(1); 
        setRotation(0); 

        // Auto-expand/collapse folder on click
        if (node.children && node.children.length > 0) {
            toggleNodeExpansion(node);
        }
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
        const src = (selectedNode?.data as SearchNodeData)?.src;
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
        const src = (selectedNode?.data as SearchNodeData)?.src;
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
        const data = node.data as SearchNodeData;

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
        // Show spinner if fetching new data (refreshing context)
        if (isFetching) {
            return (
                <div className="flex flex-column align-items-center justify-content-center h-full bg-surface-50 opacity-80 z-5">
                    <ProgressSpinner />
                    <span className="text-sm font-bold text-500 uppercase tracking-widest mt-3">Syncing Databases...</span>
                </div>
            );
        }

        if (!selectedNode || !selectedNode.data) {
            return (
                <div className="flex flex-column align-items-center justify-content-center h-full text-400">
                    <i className="pi pi-inbox text-5xl mb-3"></i>
                    <p>Select an item from the tree</p>
                </div>
            );
        }

        const data = selectedNode.data as SearchNodeData;

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

    const isImage = selectedNode?.data && (selectedNode.data as SearchNodeData).type === 'image';

    return (
        <div className="flex flex-column h-full gap-3">
            <ContextMenu model={menuModel} ref={cm} />
            
            {/* Active Context Toolbar */}
            <div className="surface-card p-3 border-round-xl shadow-1 border-1 border-200 flex align-items-center justify-content-between shrink-0">
                <div className="flex align-items-center gap-3 overflow-hidden">
                    <div className="flex flex-column overflow-hidden">
                        <span className="text-xs font-bold text-700 uppercase">Current Search Context</span>
                        <div className="flex gap-2">
                            <span className="text-900 font-bold text-lg white-space-nowrap overflow-hidden text-overflow-ellipsis">
                                {docCaseId || 'Unspecified Query'}
                            </span>
                            {accountNumber && (
                                <span className="text-600 text-lg"> | {accountNumber}</span>
                            )}
                        </div>
                    </div>
                    <div className="hidden xl:flex gap-2 ml-4">
                        {status && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 border-round">{status}</span>}
                        {priority && <span className="text-xs px-2 py-1 bg-red-100 text-red-700 border-round">{priority} Priority</span>}
                    </div>
                </div>
                <Button 
                    label="Reset" 
                    icon="pi pi-times" 
                    onClick={onReset} 
                    size="small" 
                    severity="secondary" 
                    outlined
                />
            </div>

            {/* 3-Pane Result Layout */}
            <div className="flex-1 overflow-hidden flex border-1 border-300 border-round-xl shadow-1 surface-card">
                {/* Panel 1: Tree with Filter */}
                <div className="w-16rem md:w-18rem flex flex-column border-right-1 border-200 h-full flex-shrink-0 bg-surface-0 overflow-hidden">
                    <div className="p-2 surface-ground border-bottom-1 border-200 font-medium text-700 flex justify-content-between align-items-center">
                        <span className="text-xs font-bold ml-1">RESULTS</span>
                        <div className="flex gap-1">
                            <Button icon="pi pi-angle-double-down" rounded text severity="secondary" size="small" tooltip="Expand" onClick={() => toggleExpansion(true)} disabled={nodes.length === 0} />
                            <Button icon="pi pi-angle-double-up" rounded text severity="secondary" size="small" tooltip="Collapse" onClick={() => toggleExpansion(false)} disabled={nodes.length === 0} />
                            <Button icon="pi pi-refresh" rounded text severity="secondary" size="small" tooltip="Reload" onClick={() => refetch()} disabled={!docCaseId || isFetching} loading={isFetching} />
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
                            filterPlaceholder="Filter..."
                            className="w-full border-none p-0 text-sm"
                        />
                    </div>
                </div>

                {/* Panel 2: Image Canvas with Toolbar */}
                <div className="flex-1 flex flex-column h-full min-w-0 relative surface-ground z-1 overflow-hidden">
                    <div className="h-3rem surface-overlay border-bottom-1 border-300 flex align-items-center justify-content-between px-3 shadow-1 z-2 flex-shrink-0">
                        <span className="text-sm font-medium text-700 white-space-nowrap overflow-hidden text-overflow-ellipsis max-w-15rem">
                            {selectedNode ? selectedNode.label : 'No Selection'}
                        </span>
                        <div className="flex gap-1 align-items-center">
                            <Tooltip target=".search-toolbar-btn" />
                            <Button icon="pi pi-search-plus" className="search-toolbar-btn p-button-sm w-2rem h-2rem" onClick={handleZoomIn} rounded text severity="secondary" tooltip="Zoom In" disabled={!isImage} />
                            <Button icon="pi pi-search-minus" className="search-toolbar-btn p-button-sm w-2rem h-2rem" onClick={handleZoomOut} rounded text severity="secondary" tooltip="Zoom Out" disabled={!isImage} />
                            <div className="w-1px h-1rem bg-300 mx-1"></div>
                            <Button icon="pi pi-refresh" className="search-toolbar-btn p-button-sm w-2rem h-2rem" onClick={handleRotateCcw} rounded text severity="secondary" tooltip="Rotate Left" style={{ transform: 'scaleX(-1)' }} disabled={!isImage} />
                            <Button icon="pi pi-refresh" className="search-toolbar-btn p-button-sm w-2rem h-2rem" onClick={handleRotateCw} rounded text severity="secondary" tooltip="Rotate Right" disabled={!isImage} />
                            <div className="w-1px h-1rem bg-300 mx-1"></div>
                            <Button icon="pi pi-arrows-alt" className="search-toolbar-btn p-button-sm w-2rem h-2rem" onClick={handleFitScreen} rounded text severity="secondary" tooltip="Reset View" disabled={!isImage} />
                            <div className="w-1px h-1rem bg-300 mx-1"></div>
                            <Button icon="pi pi-download" className="search-toolbar-btn p-button-sm w-2rem h-2rem" onClick={handleDownload} rounded text severity="secondary" tooltip="Download" disabled={!isImage} />
                            <Button icon={`pi ${showMetadata ? 'pi-eye-slash' : 'pi-eye'}`} className="search-toolbar-btn p-button-sm w-2rem h-2rem" onClick={() => setShowMetadata(!showMetadata)} rounded text severity={showMetadata ? 'primary' : 'secondary'} tooltip={showMetadata ? 'Hide Metadata' : 'Show Metadata'} />
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden relative surface-100">
                            {renderCenterContent()}
                    </div>
                </div>

                {/* Panel 3: Metadata */}
                {showMetadata && (
                    <div className="w-16rem md:w-18rem flex flex-column border-left-1 border-200 h-full flex-shrink-0 bg-surface-0 overflow-hidden">
                        <div className="p-2 surface-ground border-bottom-1 border-200 font-medium text-700 flex flex-column gap-2">
                            <div className="flex justify-content-between align-items-center">
                                <span className="text-xs font-bold">METADATA</span>
                                <Button icon="pi pi-times" rounded text size="small" severity="secondary" className="w-2rem h-2rem" onClick={() => setShowMetadata(false)} />
                            </div>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-search text-400 text-xs" />
                                <InputText 
                                    value={metaFilter} 
                                    onChange={(e) => setMetaFilter(e.target.value)} 
                                    placeholder="Filter props..." 
                                    className="w-full p-inputtext-sm text-sm" 
                                />
                            </span>
                        </div>
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            {selectedNode && selectedNode.data ? (
                                <DataTable 
                                    value={(selectedNode.data as SearchNodeData).metadata} 
                                    stripedRows 
                                    size="small" 
                                    className="text-sm border-none"
                                    globalFilter={metaFilter}
                                    globalFilterFields={['property', 'value']}
                                    emptyMessage="No metadata."
                                >
                                    <Column field="property" header="Property" className="font-semibold text-600 w-5"></Column>
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
    );
};
