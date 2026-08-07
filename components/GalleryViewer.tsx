
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Galleria, GalleriaResponsiveOptions } from 'primereact/galleria';
import FileSaver from 'file-saver';
import { GalleryMetadataItem } from '../services/mockApi';
import { useDocumentContent } from '../services/apiService';

export interface GalleryItem {
    id: string | number;
    thumbnail?: string;
    title: string;
    type: string;
    description?: string;
}

export interface GalleryViewerProps {
    documentId: string | number;
    metadata?: GalleryMetadataItem[];
    showInfo?: boolean; 
    className?: string;
    style?: React.CSSProperties;
}

export const GalleryViewer: React.FC<GalleryViewerProps> = ({ 
    documentId,
    metadata: propMetadata,
    showInfo = true,
    className,
    style
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    
    // View State
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [showInfoPanel, setShowInfoPanel] = useState(showInfo);
    const [metaFilter, setMetaFilter] = useState('');
    
    // React Query for Data Fetching
    const { data: documentContent, isLoading, error, isError, refetch } = useDocumentContent(documentId);

    const galleriaRef = useRef<Galleria>(null);
    const thumbnailScrollRef = useRef<HTMLDivElement>(null);

    // Map API Response to Gallery Items
    const localItems: GalleryItem[] = React.useMemo(() => {
        if (!documentContent) return [];
        
        return documentContent.pages.map((base64Str, index) => {
             // Ensure data URI prefix is present
             const src = base64Str.startsWith('data:') 
             ? base64Str 
             : `data:image/${documentContent.type};base64,${base64Str}`;

             return {
                id: `${documentId}-pg${index + 1}`,
                title: `${documentContent.fileName} - Page ${index + 1}`,
                type: documentContent.type,
                thumbnail: src,
                description: `Page ${index + 1} of ${documentContent.pages.length}`
            };
        });
    }, [documentContent, documentId]);

    const responsiveOptions: GalleriaResponsiveOptions[] = [
        { breakpoint: '1024px', numVisible: 5 },
        { breakpoint: '768px', numVisible: 3 },
        { breakpoint: '560px', numVisible: 1 }
    ];

    useEffect(() => {
        setShowInfoPanel(showInfo);
    }, [showInfo]);

    // Sync activeIndex with PageNumber
    useEffect(() => {
        setPageNumber(activeIndex + 1);
    }, [activeIndex]);

    // Reset view state when document changes
    useEffect(() => {
        setActiveIndex(0);
        setZoom(1);
        setRotation(0);
    }, [documentId]);

    // Scroll active thumbnail into view
    useEffect(() => {
        if (thumbnailScrollRef.current) {
            const activeThumb = thumbnailScrollRef.current.children[activeIndex] as HTMLElement;
            if (activeThumb) {
                activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeIndex, localItems.length]); // Added localItems dependency to ensure ref update

    const activeItem = localItems[activeIndex];

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 10));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.1));
    const handleRotateCw = () => setRotation((prev) => prev + 90);
    const handleRotateCcw = () => setRotation((prev) => prev - 90);
    const handleFitScreen = () => { setZoom(1); setRotation(0); };

    const handlePrint = () => {
        if (!activeItem || !activeItem.thumbnail) return;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Print ${activeItem.title}</title></head>
                    <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background-color: #fff;">
                        <img src="${activeItem.thumbnail}" style="max-width:100%; max-height:100%; transform: rotate(${rotation}deg);" />
                        <script>
                            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleDownload = () => {
        if (!activeItem || !activeItem.thumbnail) return;
        
        try {
            const base64Data = activeItem.thumbnail.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: `image/${activeItem.type}` });
            
            FileSaver.saveAs(blob, `${activeItem.title}.${activeItem.type}`);
        } catch (e) {
            console.error("Download failed", e);
        }
    };

    const itemTemplate = (item: GalleryItem) => {
        if (isLoading) {
            return (
                <div className="flex flex-column align-items-center justify-content-center h-full w-full bg-surface-0">
                    <ProgressSpinner style={{width: '40px', height: '40px'}} strokeWidth="3" />
                    <span className="text-400 text-xs mt-3 font-medium uppercase tracking-widest">Rendering Page...</span>
                </div>
            );
        }

        if (!item || !item.thumbnail) {
            return (
                <div className="flex align-items-center justify-content-center h-full w-full bg-surface-50 text-400">
                    <i className="pi pi-image mr-2 text-xl"></i> No Image Data
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
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="shadow-5 border-round-sm"
                        style={{ 
                            // Optimized for both tiny mock images and large documents
                            // zoom=1 : Fit to Screen (Both Dimensions)
                            // zoom!=1 : Scale Width (Overflow Scroll)
                            width: zoom === 1 ? '100%' : `${zoom * 100}%`,
                            height: zoom === 1 ? '100%' : 'auto',
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
        <div className="flex flex-wrap align-items-center justify-content-between px-3 py-2 surface-0 border-bottom-1 border-200 z-5 shadow-1 gap-2">
            <div className="flex flex-column">
                <span className="font-semibold text-800 text-sm">{activeItem?.title || 'Unknown Asset'}</span>
                <span className="text-xs text-500">Page {pageNumber} of {localItems.length || 0}</span>
            </div>

            <div className="flex gap-2 align-items-center">
                <div className="flex align-items-center surface-50 border-1 border-200 border-round-lg shadow-1 overflow-hidden h-2rem">
                    <Button icon="pi pi-minus" onClick={handleZoomOut} size="small" text severity="secondary" className="p-1 h-full w-2rem text-600 hover:surface-hover" />
                    <span className="px-2 text-xs font-mono font-medium text-700 border-x-1 border-200 select-none min-w-3rem text-center surface-0 h-full flex align-items-center justify-content-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <Button icon="pi pi-plus" onClick={handleZoomIn} size="small" text severity="secondary" className="p-1 h-full w-2rem text-600 hover:surface-hover" />
                    <Button icon="pi pi-expand" onClick={handleFitScreen} size="small" text severity="secondary" className="p-1 h-full w-2rem border-left-1 border-200 text-600 hover:surface-hover" tooltip="Fit" />
                </div>
                <div className="w-1px h-2rem surface-200 mx-1"></div>
                
                <Button icon="pi pi-refresh" onClick={handleRotateCcw} rounded text severity="secondary" tooltip="Rotate Left" style={{ transform: 'scaleX(-1)' }} className="text-600 hover:surface-hover" />
                <Button icon="pi pi-refresh" onClick={handleRotateCw} rounded text severity="secondary" tooltip="Rotate Right" className="text-600 hover:surface-hover" />
                
                <div className="w-1px h-2rem surface-200 mx-1"></div>

                <Button icon="pi pi-print" onClick={handlePrint} rounded text severity="secondary" tooltip="Print" className="text-600 hover:surface-hover" />
                <Button icon="pi pi-download" onClick={handleDownload} rounded text severity="secondary" tooltip="Download" className="text-600 hover:surface-hover" />
                
                <div className="w-1px h-2rem surface-200 mx-1"></div>

                <Button icon="pi pi-info-circle" onClick={() => setShowInfoPanel(!showInfoPanel)} rounded text severity={showInfoPanel ? 'primary' : 'secondary'} tooltip="Metadata" className={showInfoPanel ? "text-indigo-600 bg-indigo-50" : "text-600 hover:surface-hover"} />
            </div>
        </div>
    );

    if (isError) {
        return (
            <div className="flex flex-column align-items-center justify-content-center h-full surface-card gap-3 text-red-500">
                <i className="pi pi-exclamation-circle text-3xl"></i>
                <span className="font-bold">Error Loading Document</span>
                <span className="text-sm">{(error as Error)?.message || 'Failed to fetch content'}</span>
                <Button label="Retry" icon="pi pi-refresh" size="small" onClick={() => refetch()} />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-column align-items-center justify-content-center h-full surface-card gap-4">
                <ProgressSpinner />
                <span className="text-sm font-bold text-400 uppercase tracking-widest">Fetching Document Pages...</span>
            </div>
        );
    }

    if (localItems.length === 0) {
        return <div className="p-8 text-center text-400 surface-card border-1 border-200 italic h-full flex align-items-center justify-content-center">No assets available for this record.</div>;
    }

    return (
        <div className={`flex flex-row h-full surface-card overflow-hidden ${className}`} style={style}>
            
            {/* 1. Left Sidebar: Thumbnails */}
            <div className="w-6rem md:w-7rem surface-50 border-right-1 border-200 flex-shrink-0 flex flex-column z-2">
                <div className="p-2 flex flex-column gap-2 align-items-center surface-0 border-bottom-1 border-200">
                     <span className="text-xs font-semibold text-500 tracking-wider">PAGES</span>
                     <div className="flex align-items-center justify-content-between w-full gap-1">
                        <Button 
                            icon="pi pi-angle-left" 
                            text 
                            rounded 
                            size="small"
                            className="w-1.5rem h-1.5rem p-0 text-600 hover:surface-hover"
                            disabled={activeIndex === 0}
                            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                        />
                        <span className="text-xs font-mono font-medium text-700">{pageNumber} / {localItems.length}</span>
                        <Button 
                            icon="pi pi-angle-right" 
                            text 
                            rounded 
                            size="small"
                            className="w-1.5rem h-1.5rem p-0 text-600 hover:surface-hover"
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
                                flex-shrink-0 cursor-pointer border-round-md overflow-hidden transition-all border-2 relative w-full
                                ${index === activeIndex ? 'border-indigo-500 shadow-1' : 'border-200 opacity-70 hover:opacity-100 hover:border-indigo-300'}
                            `}
                            style={{ height: 'auto', aspectRatio: '1/1' }}
                        >
                            <img src={item.thumbnail} alt={`Page ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute top-0 right-0 bg-gray-900 text-white text-xs px-1 border-bottom-left-radius-xs font-mono" style={{ opacity: 0.7 }}>
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Main Content Body */}
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
                         <DataTable 
                            value={propMetadata || []} 
                            stripedRows 
                            size="small" 
                            className="text-xs p-datatable-sm border-none"
                            globalFilter={metaFilter}
                            globalFilterFields={['property', 'value']}
                            emptyMessage="Registry empty."
                        >
                            <Column field="property" header="Property" className="font-bold text-700 w-6rem py-2 surface-50 px-3 border-bottom-1 border-100"></Column>
                            <Column field="value" header="Value" className="text-600 py-2 px-3 border-bottom-1 border-100" body={(d) => <span className="word-break-all">{d.value}</span>}></Column>
                        </DataTable>
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
