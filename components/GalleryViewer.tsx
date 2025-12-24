
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Galleria, GalleriaResponsiveOptions } from 'primereact/galleria';
import { Checkbox } from 'primereact/checkbox';
import { mockFetchContent, mockFetchMetadata, mockFetchGalleryItems, GalleryItem, GalleryMetadataItem } from '../services/mockApi';

export interface GalleryViewerProps {
    documentId: string | number;
    metadata?: GalleryMetadataItem[];
    showInfo?: boolean; // Renamed from showMetadataInitial
    onFetchItems?: (id: string | number) => Promise<GalleryItem[]>;
    onFetchContent?: (id: string | number) => Promise<{ base64: string; mimeType: string }>;
    onFetchMetadata?: (id: string | number) => Promise<GalleryMetadataItem[]>;
    className?: string;
    style?: React.CSSProperties;
}

export const GalleryViewer: React.FC<GalleryViewerProps> = ({ 
    documentId,
    metadata: propMetadata,
    showInfo = true,
    onFetchItems = mockFetchGalleryItems,
    onFetchContent = mockFetchContent,
    onFetchMetadata = mockFetchMetadata,
    className,
    style
}) => {
    const [localItems, setLocalItems] = useState<GalleryItem[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    
    // View State
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [showInfoPanel, setShowInfoPanel] = useState(showInfo);
    const [metaFilter, setMetaFilter] = useState('');
    
    // Data Loading State
    const [isItemsLoading, setIsItemsLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [contentData, setContentData] = useState<{ base64: string; mimeType: string } | null>(null);
    const [metaData, setMetaData] = useState<GalleryMetadataItem[]>([]);

    const galleriaRef = useRef<Galleria>(null);
    const thumbnailScrollRef = useRef<HTMLDivElement>(null);

    const responsiveOptions: GalleriaResponsiveOptions[] = [
        { breakpoint: '1024px', numVisible: 5 },
        { breakpoint: '768px', numVisible: 3 },
        { breakpoint: '560px', numVisible: 1 }
    ];

    // Update internal state if prop changes
    useEffect(() => {
        setShowInfoPanel(showInfo);
    }, [showInfo]);

    // Scroll active thumbnail into view
    useEffect(() => {
        if (thumbnailScrollRef.current) {
            const activeThumb = thumbnailScrollRef.current.children[activeIndex] as HTMLElement;
            if (activeThumb) {
                activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeIndex]);

    // Fetch initial asset list based on documentId
    useEffect(() => {
        const fetchItems = async () => {
            setIsItemsLoading(true);
            try {
                const items = await onFetchItems(documentId);
                setLocalItems(items);
                setActiveIndex(0);
            } catch (error) {
                console.error("Failed to fetch gallery items", error);
                setLocalItems([]);
            } finally {
                setIsItemsLoading(false);
            }
        };
        fetchItems();
    }, [documentId, onFetchItems]);

    const activeItem = localItems[activeIndex];

    // Fetch Content & Handle Metadata when active item changes
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!activeItem) return;

            setIsLoading(true);
            setZoom(1);
            setRotation(0);
            setContentData(null);
            
            if (propMetadata) {
                setMetaData(propMetadata);
            } else {
                setMetaData([]);
            }

            try {
                const [content, fetchedDetails] = await Promise.all([
                    onFetchContent(activeItem.id),
                    propMetadata ? Promise.resolve(null) : onFetchMetadata(activeItem.id)
                ]);

                if (isMounted) {
                    setContentData(content);
                    if (fetchedDetails) {
                        setMetaData(fetchedDetails);
                    }
                }
            } catch (error) {
                console.error("Failed to load secure content", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadData();

        return () => { isMounted = false; };
    }, [activeItem, onFetchContent, onFetchMetadata, propMetadata]);

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));
    const handleRotateCw = () => setRotation((prev) => prev + 90);
    const handleRotateCcw = () => setRotation((prev) => prev - 90);
    const handleFitScreen = () => { setZoom(1); setRotation(0); };

    const handlePrev = () => {
        setActiveIndex(prev => (prev === 0 ? localItems.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex(prev => (prev === localItems.length - 1 ? 0 : prev + 1));
    };

    const handlePrint = () => {
        if (!contentData) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const isPdf = contentData.mimeType === 'application/pdf';
            const contentHtml = isPdf 
                ? `<iframe src="data:${contentData.mimeType};base64,${contentData.base64}" style="width:100%; height:100vh; border:none;"></iframe>`
                : `<img src="data:${contentData.mimeType};base64,${contentData.base64}" style="max-width:100%; transform: rotate(${rotation}deg);" />`;

            printWindow.document.write(`
                <html>
                    <head><title>Asset Preview</title></head>
                    <body style="margin:0; background:#fff; height:100vh; display:flex; justify-content:center; align-items:center;">
                        ${contentHtml}
                        ${!isPdf ? '<script>window.onload = () => { window.print(); window.close(); }</script>' : ''}
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleDownload = () => {
        if (!contentData || !activeItem) return;
        const link = document.createElement('a');
        link.href = `data:${contentData.mimeType};base64,${contentData.base64}`;
        const ext = contentData.mimeType.split('/')[1];
        link.download = `asset_${activeItem.id}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const itemTemplate = (item: GalleryItem) => {
        const isActive = item.id === activeItem?.id;

        if (!isActive || isLoading) {
            return (
                <div className="flex flex-column align-items-center justify-content-center h-full w-full bg-surface-0">
                    <ProgressSpinner style={{width: '40px', height: '40px'}} strokeWidth="3" />
                    <span className="text-400 text-xs mt-3 font-medium uppercase tracking-widest">Handshake...</span>
                </div>
            );
        }

        if (!contentData) {
            return (
                <div className="flex align-items-center justify-content-center h-full w-full bg-surface-50 text-400">
                    <i className="pi pi-lock mr-2 text-xl"></i> Secure Access Only
                </div>
            );
        }

        if (contentData.mimeType === 'application/pdf') {
            return (
                <div className="w-full h-full flex align-items-center justify-content-center bg-surface-100 p-2 overflow-hidden">
                     <iframe
                        src={`data:application/pdf;base64,${contentData.base64}#toolbar=0`}
                        className="w-full h-full border-none shadow-5 border-round-sm"
                        style={{ maxWidth: '1000px', backgroundColor: '#fff' }}
                        title="Document Viewer"
                    />
                </div>
            );
        }

        return (
            <div className="w-full h-full bg-surface-0 overflow-auto custom-scrollbar p-3 flex align-items-start justify-content-start">
                <div className="m-auto flex align-items-center justify-content-center transition-all transition-duration-300" 
                     style={{ 
                        minWidth: '100%', 
                        minHeight: '100%',
                        transform: `rotate(${rotation}deg)` 
                     }}>
                    <img 
                        src={`data:${contentData.mimeType};base64,${contentData.base64}`} 
                        alt="" 
                        className="shadow-5 border-round-sm"
                        style={{ 
                            width: zoom === 1 ? 'auto' : `${zoom * 100}%`,
                            maxWidth: zoom === 1 ? '100%' : 'none',
                            maxHeight: zoom === 1 ? '100%' : 'none',
                            objectFit: 'contain'
                        }} 
                    />
                </div>
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between px-3 py-2 surface-card border-bottom-1 border-200 z-5 shadow-1 gap-2">
            <Tooltip target=".toolbar-btn" position="bottom" />
            
            <div className="flex flex-wrap gap-2 align-items-center">
                {/* Zoom Controls */}
                <div className="flex align-items-center bg-surface-50 border-1 border-200 border-round-lg shadow-sm overflow-hidden h-2rem">
                    <Button 
                        icon="pi pi-minus" 
                        onClick={handleZoomOut} 
                        size="small" 
                        text 
                        severity="secondary" 
                        className="p-1 h-full w-2rem toolbar-btn" 
                        tooltip="Zoom Out" 
                    />
                    <span className="px-2 md:px-3 text-xs font-bold text-700 border-x-1 border-200 select-none min-w-3rem md:min-w-4rem text-center bg-surface-0 h-full flex align-items-center justify-content-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <Button 
                        icon="pi pi-plus" 
                        onClick={handleZoomIn} 
                        size="small" 
                        text 
                        severity="secondary" 
                        className="p-1 h-full w-2rem toolbar-btn" 
                        tooltip="Zoom In" 
                    />
                    <Button 
                        icon="pi pi-expand" 
                        onClick={handleFitScreen} 
                        size="small" 
                        text 
                        severity="secondary" 
                        className="p-1 h-full w-2rem border-left-1 border-200 toolbar-btn" 
                        tooltip="Fit to Screen" 
                    />
                </div>

                {/* Metadata Checkbox Toggle */}
                <div className="flex align-items-center ml-2 mr-3 px-3 py-1 bg-surface-50 border-1 border-200 border-round-lg h-2rem">
                    <Checkbox inputId="cb_metadata" onChange={e => setShowInfoPanel(e.checked || false)} checked={showInfoPanel}></Checkbox>
                    <label htmlFor="cb_metadata" className="ml-2 text-xs font-bold text-700 cursor-pointer select-none">Metadata</label>
                </div>
            </div>

            {/* Other actions */}
            <div className="flex gap-1 align-items-center">
                <div className="flex gap-1 border-right-1 border-200 pr-2 hidden md:flex">
                    <Button icon="pi pi-undo" className="toolbar-btn" onClick={handleRotateCcw} rounded text severity="secondary" tooltip="Rotate Left" />
                    <Button icon="pi pi-redo" className="toolbar-btn" onClick={handleRotateCw} rounded text severity="secondary" tooltip="Rotate Right" />
                </div>

                <div className="flex gap-1">
                    <Button icon="pi pi-print" className="toolbar-btn" onClick={handlePrint} rounded text severity="secondary" tooltip="Print" />
                    <Button icon="pi pi-download" className="toolbar-btn" onClick={handleDownload} rounded text severity="secondary" tooltip="Export" />
                </div>
            </div>
        </div>
    );

    if (isItemsLoading) {
        return (
            <div className="flex flex-column align-items-center justify-content-center h-20rem surface-card border-round-xl border-1 border-200 gap-4">
                <ProgressSpinner />
                <span className="text-sm font-bold text-400 uppercase tracking-widest">Loading Secure Archives...</span>
            </div>
        );
    }

    if (localItems.length === 0) {
        return <div className="p-8 text-center text-400 surface-card border-round-xl shadow-1 border-1 border-200 italic">No assets available for this record.</div>;
    }

    return (
        <div className={`flex flex-column md:flex-row shadow-6 border-round-xl overflow-hidden surface-card border-1 border-200 ${className}`} style={{ minHeight: '500px', height: 'auto', maxHeight: 'calc(100vh - 12rem)', ...style }}>
            
            {/* Asset Rail (Thumbnails Column on Left) */}
            <div className="w-full md:w-7rem lg:w-9rem flex-shrink-0 bg-surface-50 border-bottom-1 md:border-bottom-none md:border-right-1 border-200 flex flex-row md:flex-column overflow-hidden">
                
                {/* Thumbnail Navigation Controls */}
                <div className="flex md:flex-column align-items-center justify-content-center gap-2 py-2 md:py-3 border-right-1 md:border-right-none md:border-bottom-1 border-200 bg-surface-0 shadow-sm z-3 px-3">
                    <Button 
                        icon="pi pi-chevron-left" 
                        onClick={handlePrev} 
                        size="small" 
                        rounded 
                        text 
                        className="w-2rem h-2rem text-700 hover:bg-surface-100" 
                        tooltip="Previous"
                    />
                    <div className="flex align-items-center text-900 text-xs font-bold bg-surface-0 border-1 border-200 px-2 py-1 border-round-sm mx-1">
                        <span>{activeIndex + 1}</span>
                        <span className="mx-1 text-400">/</span>
                        <span className="text-400">{localItems.length}</span>
                    </div>
                    <Button 
                        icon="pi pi-chevron-right" 
                        onClick={handleNext} 
                        size="small" 
                        rounded 
                        text 
                        className="w-2rem h-2rem text-700 hover:bg-surface-100" 
                        tooltip="Next"
                    />
                </div>

                {/* Thumbnails Strip (Scrollable) */}
                <div className="flex-1 overflow-x-auto md:overflow-y-auto no-scrollbar py-2 px-2 md:px-0 flex flex-row md:flex-column align-items-center" ref={thumbnailScrollRef}>
                    {localItems.map((item, index) => (
                        <div 
                            key={item.id} 
                            onClick={() => setActiveIndex(index)}
                            className={`flex-shrink-0 cursor-pointer border-round overflow-hidden transition-all mx-1 md:mx-0 md:my-2 border-2 w-4rem md:w-5rem lg:w-6rem shadow-sm ${index === activeIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            style={{ height: '4rem' }}
                        >
                            {item.thumbnail ? (
                                <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex align-items-center justify-content-center bg-surface-200">
                                    <i className={`pi ${item.type === 'pdf' ? 'pi-file-pdf text-red-500' : 'pi-image'} text-sm`}></i>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Viewer Stage (Image in Middle) */}
            <div className="flex-1 min-w-0 flex flex-column bg-surface-0 relative overflow-hidden h-25rem md:h-full">
                <Galleria 
                    ref={galleriaRef}
                    value={localItems} 
                    activeIndex={activeIndex} 
                    onItemChange={(e) => setActiveIndex(e.index)}
                    responsiveOptions={responsiveOptions} 
                    numVisible={0} 
                    className="h-full flex flex-column pro-galleria-v4"
                    header={header}
                    item={itemTemplate}
                    showThumbnails={false} 
                    showItemNavigators={false} 
                    circular
                    autoPlay={false}
                />
            </div>

            {/* Property Sidebar (Metadata Column on Right) */}
            {showInfoPanel && (
                <div className="w-full md:w-18rem lg:w-22rem flex-shrink-0 flex flex-column bg-surface-0 border-top-1 md:border-top-none md:border-left-1 border-200 shadow-left-1 transition-all">
                    <div className="p-3 lg:p-4 border-bottom-1 border-100 bg-surface-50">
                        <div className="flex justify-content-between align-items-center mb-3">
                            <span className="text-xs font-bold text-700 uppercase tracking-widest">Metadata Registry</span>
                            <Button icon="pi pi-times" onClick={() => setShowInfoPanel(false)} rounded text severity="secondary" size="small" />
                        </div>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search text-400" />
                            <InputText 
                                value={metaFilter} 
                                onChange={(e) => setMetaFilter(e.target.value)} 
                                placeholder="Filter properties..." 
                                className="w-full p-inputtext-sm border-round-lg shadow-sm" 
                            />
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-surface-0 min-h-15rem md:max-h-none">
                         {isLoading ? (
                            <div className="flex flex-column align-items-center justify-content-center h-12rem gap-3">
                                <ProgressSpinner style={{width: '24px', height: '24px'}} strokeWidth="4" />
                                <span className="text-xs text-400 font-bold uppercase tracking-tight text-center">Syncing...</span>
                            </div>
                        ) : (
                            <DataTable 
                                value={metaData} 
                                stripedRows 
                                size="small" 
                                className="text-xs p-datatable-sm"
                                globalFilter={metaFilter}
                                globalFilterFields={['property', 'value']}
                                emptyMessage="Registry empty."
                            >
                                <Column field="property" header="Property" className="font-bold text-700 w-8rem py-2 surface-50 px-3"></Column>
                                <Column field="value" header="Value" className="text-600 py-2 px-3"></Column>
                            </DataTable>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .pro-galleria-v4.p-galleria {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .pro-galleria-v4 .p-galleria-content {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-height: 0;
                }

                .pro-galleria-v4 .p-galleria-item-wrapper {
                    flex: 1;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                }

                .pro-galleria-v4 .p-galleria-item-container {
                    flex: 1;
                    min-height: 0;
                    background: var(--surface-0);
                }

                .pro-galleria-v4 .p-galleria-item {
                    height: 100%;
                    width: 100%;
                }

                .shadow-left-1 {
                    box-shadow: -4px 0 12px rgba(0,0,0,0.02);
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: var(--surface-0);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--surface-200);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--surface-300);
                }
            `}</style>
        </div>
    );
};
