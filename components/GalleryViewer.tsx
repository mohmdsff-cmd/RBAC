
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Galleria, GalleriaResponsiveOptions } from 'primereact/galleria';
import FileSaver from 'file-saver';
import { EmbedPDF } from './EmbedPDF';
import { mockFetchContent, mockFetchMetadata, mockFetchGalleryItems, GalleryItem, GalleryMetadataItem } from '../services/mockApi';

export interface GalleryViewerProps {
    documentId: string | number;
    metadata?: GalleryMetadataItem[];
    showInfo?: boolean; 
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

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 10));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.1));
    const handleRotateCw = () => setRotation((prev) => prev + 90);
    const handleRotateCcw = () => setRotation((prev) => prev - 90);
    const handleFitScreen = () => { setZoom(1); setRotation(0); };

    // Helper to extract raw base64 if data URI scheme is present
    const getCleanBase64 = (base64: string) => {
        return base64.includes('base64,') ? base64.split('base64,')[1] : base64;
    };

    // Helper to get full data URI for images
    const getImageSrc = (base64: string, mimeType: string) => {
        return base64.startsWith('data:') ? base64 : `data:${mimeType};base64,${base64}`;
    };

    const handlePrint = () => {
        if (!contentData) return;
        
        if (contentData.mimeType === 'application/pdf') {
             // For PDF, convert to blob URL and open
            const cleanBase64 = getCleanBase64(contentData.base64);
            const byteCharacters = atob(cleanBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const win = window.open(url, '_blank');
            if (win) {
                 setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
        } else {
            const src = getImageSrc(contentData.base64, contentData.mimeType);
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head><title>Print Asset</title></head>
                        <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background-color: #eee;">
                            <img src="${src}" style="max-width:100%; max-height:100%; transform: rotate(${rotation}deg);" />
                            <script>
                                window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
                            </script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
        }
    };

    const handleDownload = () => {
        if (!contentData || !activeItem) return;
        
        const cleanBase64 = getCleanBase64(contentData.base64);
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentData.mimeType });
        
        FileSaver.saveAs(blob, activeItem.title || 'document');
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
            const cleanBase64 = getCleanBase64(contentData.base64);
            return (
                <div className="w-full h-full bg-surface-0 overflow-hidden">
                    <EmbedPDF 
                        data={cleanBase64} 
                        fileName={item.title}
                        className="border-none shadow-none"
                    />
                </div>
            );
        }

        return (
            <div className="w-full h-full bg-surface-0 overflow-auto custom-scrollbar flex">
                <div className="m-auto transition-all transition-duration-300 p-3" 
                     style={{ 
                        minWidth: '100%', 
                        minHeight: '100%',
                        transform: `rotate(${rotation}deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                     }}>
                    <img 
                        src={getImageSrc(contentData.base64, contentData.mimeType)} 
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

    const detailHeader = (
        <div className="flex flex-wrap align-items-center justify-content-between px-3 py-2 surface-card border-bottom-1 border-200 z-5 shadow-1 gap-2">
            <div className="flex flex-column">
                <span className="font-bold text-700 text-sm">{activeItem?.title || 'Unknown Asset'}</span>
            </div>

            <div className="flex gap-2 align-items-center">
                 {/* Zoom Controls */}
                <div className="flex align-items-center bg-surface-50 border-1 border-200 border-round-lg shadow-sm overflow-hidden h-2rem">
                    <Button icon="pi pi-minus" onClick={handleZoomOut} size="small" text severity="secondary" className="p-1 h-full w-2rem" />
                    <span className="px-2 text-xs font-bold text-700 border-x-1 border-200 select-none min-w-3rem text-center bg-surface-0 h-full flex align-items-center justify-content-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <Button icon="pi pi-plus" onClick={handleZoomIn} size="small" text severity="secondary" className="p-1 h-full w-2rem" />
                    <Button icon="pi pi-expand" onClick={handleFitScreen} size="small" text severity="secondary" className="p-1 h-full w-2rem border-left-1 border-200" tooltip="Fit" />
                </div>
                <div className="w-1px h-2rem bg-300 mx-1"></div>
                
                {/* Rotations */}
                <Button icon="pi pi-refresh" onClick={handleRotateCcw} rounded text severity="secondary" tooltip="Rotate Left" style={{ transform: 'scaleX(-1)' }} />
                <Button icon="pi pi-refresh" onClick={handleRotateCw} rounded text severity="secondary" tooltip="Rotate Right" />
                
                <div className="w-1px h-2rem bg-300 mx-1"></div>

                {/* Actions */}
                <Button icon="pi pi-print" onClick={handlePrint} rounded text severity="secondary" tooltip="Print" />
                <Button icon="pi pi-download" onClick={handleDownload} rounded text severity="secondary" tooltip="Download" />
                
                <div className="w-1px h-2rem bg-300 mx-1"></div>

                <Button icon="pi pi-info-circle" onClick={() => setShowInfoPanel(!showInfoPanel)} rounded text severity={showInfoPanel ? 'primary' : 'secondary'} tooltip="Metadata" />
            </div>
        </div>
    );

    if (isItemsLoading) {
        return (
            <div className="flex flex-column align-items-center justify-content-center h-full surface-card gap-4">
                <ProgressSpinner />
                <span className="text-sm font-bold text-400 uppercase tracking-widest">Loading Secure Archives...</span>
            </div>
        );
    }

    if (localItems.length === 0) {
        return <div className="p-8 text-center text-400 surface-card border-1 border-200 italic h-full flex align-items-center justify-content-center">No assets available for this record.</div>;
    }

    return (
        <div className={`flex flex-row h-full surface-card overflow-hidden ${className}`} style={style}>
            
            {/* 1. Left Sidebar: Thumbnails with Top Pagination */}
            <div className="w-6rem md:w-7rem bg-surface-100 border-right-1 border-200 flex-shrink-0 flex flex-column z-2">
                {/* Pagination Header */}
                <div className="p-2 flex flex-column gap-2 align-items-center bg-surface-50 border-bottom-1 border-200">
                     <span className="text-xs font-bold text-600">FILES</span>
                     <div className="flex align-items-center justify-content-between w-full gap-1">
                        <Button 
                            icon="pi pi-angle-left" 
                            text 
                            rounded 
                            size="small"
                            className="w-1.5rem h-1.5rem p-0"
                            disabled={activeIndex === 0}
                            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                        />
                        <span className="text-xs font-semibold text-700">{activeIndex + 1} / {localItems.length}</span>
                        <Button 
                            icon="pi pi-angle-right" 
                            text 
                            rounded 
                            size="small"
                            className="w-1.5rem h-1.5rem p-0"
                            disabled={activeIndex === localItems.length - 1}
                            onClick={() => setActiveIndex(Math.min(localItems.length - 1, activeIndex + 1))}
                        />
                     </div>
                </div>

                <div 
                    className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-column gap-2 align-items-center" 
                    ref={thumbnailScrollRef}
                >
                    {localItems.map((item, index) => (
                        <div 
                            key={item.id} 
                            onClick={() => setActiveIndex(index)}
                            className={`
                                flex-shrink-0 cursor-pointer border-round-md overflow-hidden transition-all border-2 relative w-full aspect-ratio-square
                                ${index === activeIndex ? 'border-primary shadow-2 scale-105' : 'border-200 opacity-70 hover:opacity-100 hover:border-300'}
                            `}
                            style={{ height: 'auto', aspectRatio: '1/1' }}
                        >
                            {item.thumbnail ? (
                                <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex align-items-center justify-content-center bg-surface-0">
                                    <i className={`pi ${item.type === 'pdf' ? 'pi-file-pdf text-red-500' : 'pi-image text-blue-500'} text-xl`}></i>
                                </div>
                            )}
                            <div className="absolute top-0 right-0 bg-black-alpha-60 text-white text-xs px-1 border-bottom-left-radius-xs">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Main Content Body (Viewer + Metadata) */}
            <div className="flex-1 flex flex-column min-w-0 bg-surface-0 relative overflow-hidden">
                <Galleria 
                    ref={galleriaRef}
                    value={localItems} 
                    activeIndex={activeIndex} 
                    onItemChange={(e) => setActiveIndex(e.index)}
                    responsiveOptions={responsiveOptions} 
                    numVisible={0} 
                    className="h-full flex flex-column pro-galleria-v4"
                    header={detailHeader}
                    item={itemTemplate}
                    showThumbnails={false} 
                    showItemNavigators={false} 
                    circular={false}
                    autoPlay={false}
                />
            </div>

            {/* 3. Right Sidebar: Metadata */}
            {showInfoPanel && (
                <div className="w-20rem flex-shrink-0 flex flex-column bg-surface-0 border-left-1 border-200 shadow-left-1 transition-all z-3">
                    <div className="p-3 border-bottom-1 border-100 bg-surface-50 flex justify-content-between align-items-center">
                        <span className="text-xs font-bold text-700 uppercase tracking-widest">Metadata</span>
                        <Button icon="pi pi-times" onClick={() => setShowInfoPanel(false)} rounded text severity="secondary" size="small" className="w-2rem h-2rem" />
                    </div>
                    
                    <div className="p-2 bg-surface-50 border-bottom-1 border-100">
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search text-400 text-xs" />
                            <InputText 
                                value={metaFilter} 
                                onChange={(e) => setMetaFilter(e.target.value)} 
                                placeholder="Filter properties..." 
                                className="w-full p-inputtext-sm text-xs border-round-lg" 
                            />
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-surface-0">
                            {isLoading ? (
                            <div className="flex flex-column align-items-center justify-content-center h-12rem gap-3">
                                <ProgressSpinner style={{width: '24px', height: '24px'}} strokeWidth="4" />
                                <span className="text-xs text-400 font-bold uppercase tracking-tight text-center">Syncing Registry...</span>
                            </div>
                        ) : (
                            <DataTable 
                                value={metaData} 
                                stripedRows 
                                size="small" 
                                className="text-xs p-datatable-sm border-none"
                                globalFilter={metaFilter}
                                globalFilterFields={['property', 'value']}
                                emptyMessage="Registry empty."
                                rowClassName={() => ({ 'vertical-align-top': true })}
                            >
                                <Column field="property" header="Property" className="font-bold text-700 w-6rem py-2 surface-50 px-3 border-bottom-1 border-100"></Column>
                                <Column field="value" header="Value" className="text-600 py-2 px-3 border-bottom-1 border-100" body={(d) => <span className="word-break-all">{d.value}</span>}></Column>
                            </DataTable>
                        )}
                    </div>
                </div>
            )}
            
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .pro-galleria-v4.p-galleria { height: 100%; width: 100%; display: flex; flex-direction: column; }
                .pro-galleria-v4 .p-galleria-content { height: 100%; width: 100%; display: flex; flex-direction: column; flex: 1; min-height: 0; }
                .pro-galleria-v4 .p-galleria-item-wrapper { flex: 1; min-height: 0; display: flex; flex-direction: column; }
                .pro-galleria-v4 .p-galleria-item-container { flex: 1; min-height: 0; background: var(--surface-0); }
                .pro-galleria-v4 .p-galleria-item { height: 100%; width: 100%; }
                .word-break-all { word-break: break-all; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--surface-300); border-radius: 3px; }
            `}</style>
        </div>
    );
};
