import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';
import { Checkbox } from 'primereact/checkbox';

export interface GalleryItem {
    id: string | number;
    thumbnail?: string; // Small preview or icon URL
    title: string;
    type: 'image' | 'pdf' | 'document';
    description?: string;
}

export interface GalleryViewerProps {
    items: GalleryItem[];
    onFetchContent: (id: string | number) => Promise<{ base64: string; mimeType: string }>;
    onFetchMetadata: (id: string | number) => Promise<any[]>;
    className?: string;
    style?: React.CSSProperties;
}

export const GalleryViewer: React.FC<GalleryViewerProps> = ({ 
    items, 
    onFetchContent, 
    onFetchMetadata,
    className,
    style
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [showInfo, setShowInfo] = useState(true);
    const [metaFilter, setMetaFilter] = useState('');
    
    // Loaded Data State
    const [isLoading, setIsLoading] = useState(false);
    const [contentData, setContentData] = useState<{ base64: string; mimeType: string } | null>(null);
    const [metaData, setMetaData] = useState<any[]>([]);

    const activeItem = items[currentIndex];

    // Fetch data when active item changes
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!activeItem) return;

            setIsLoading(true);
            setZoom(1);
            setRotation(0);
            setContentData(null);
            setMetaData([]);

            try {
                // Parallel fetch for content and details
                const [content, details] = await Promise.all([
                    onFetchContent(activeItem.id),
                    onFetchMetadata(activeItem.id)
                ]);

                if (isMounted) {
                    setContentData(content);
                    setMetaData(details);
                }
            } catch (error) {
                console.error("Failed to load gallery item data", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadData();

        return () => { isMounted = false; };
    }, [activeItem, onFetchContent, onFetchMetadata]);

    // Navigation Handlers
    const handleNext = () => {
        if (items.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = () => {
        if (items.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const selectImage = (index: number) => {
        setCurrentIndex(index);
    };

    // Toolbar Actions
    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 5));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 0.5));
    const handleRotateCw = () => setRotation((prev) => prev + 90);
    const handleRotateCcw = () => setRotation((prev) => prev - 90);
    const handleFitScreen = () => { setZoom(1); setRotation(0); };

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
                    <head><title>Print ${activeItem.title}</title></head>
                    <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh;">
                        ${contentHtml}
                        ${!isPdf ? '<script>window.onload = () => { window.print(); window.close(); }</script>' : ''}
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleDownload = () => {
        if (!contentData) return;
        
        const link = document.createElement('a');
        link.href = `data:${contentData.mimeType};base64,${contentData.base64}`;
        link.download = `${activeItem.title}.${contentData.mimeType.split('/')[1]}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderMainContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-column align-items-center justify-content-center h-full gap-3">
                    <ProgressSpinner style={{width: '50px', height: '50px'}} />
                    <span className="text-400">Fetching secure content...</span>
                </div>
            );
        }

        if (!contentData) {
             return <div className="flex align-items-center justify-content-center h-full text-500">No content available</div>;
        }

        if (contentData.mimeType === 'application/pdf') {
            return (
                <div className="w-full h-full relative">
                    <object
                        data={`data:application/pdf;base64,${contentData.base64}`}
                        type="application/pdf"
                        className="w-full h-full"
                    >
                        <p>Alternative text - include a link <a href={`data:application/pdf;base64,${contentData.base64}`}>to the PDF!</a></p>
                    </object>
                </div>
            );
        }

        // Image with Overflow/Scroll support
        // We use width% for zoom to force layout scrollbars on parent
        return (
            <div className="w-full h-full flex align-items-center justify-content-center">
                 <img 
                    src={`data:${contentData.mimeType};base64,${contentData.base64}`}
                    alt={activeItem.title}
                    className="transition-all transition-duration-200 ease-out shadow-4"
                    style={{ 
                        width: zoom === 1 ? '100%' : `${zoom * 100}%`,
                        height: zoom === 1 ? '100%' : 'auto',
                        objectFit: 'contain',
                        transform: `rotate(${rotation}deg)`,
                        maxWidth: zoom === 1 ? '100%' : 'none',
                        maxHeight: zoom === 1 ? '100%' : 'none'
                    }}
                />
            </div>
        );
    };

    if (!items || items.length === 0) {
        return <div className="p-5 text-center text-500">No items in gallery.</div>;
    }

    return (
        <div className={`flex border-1 border-300 border-round shadow-2 overflow-hidden surface-card ${className}`} style={{ height: 'calc(100vh - 9rem)', ...style }}>
            {/* Left Sidebar - Thumbnails */}
            <div className="w-10rem surface-ground border-right-1 border-300 flex flex-column flex-shrink-0">
                <div className="p-3 border-bottom-1 border-300 surface-card flex align-items-center justify-content-between shadow-1 z-1">
                    <Button icon="pi pi-arrow-left" onClick={handlePrev} rounded text severity="secondary" aria-label="Previous" size="small" />
                    <span className="font-bold text-600 text-sm">{currentIndex + 1} / {items.length}</span>
                    <Button icon="pi pi-arrow-right" onClick={handleNext} rounded text severity="secondary" aria-label="Next" size="small" />
                </div>

                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                    <div className="flex flex-column gap-3">
                        {items.map((item, index) => (
                            <div 
                                key={item.id}
                                onClick={() => selectImage(index)}
                                className={`cursor-pointer border-round overflow-hidden border-2 transition-all hover:shadow-2 aspect-ratio-square relative flex align-items-center justify-content-center surface-0 ${
                                    index === currentIndex 
                                        ? 'border-primary shadow-2' 
                                        : 'border-transparent opacity-70 hover:opacity-100 hover:border-300'
                                }`}
                                style={{ aspectRatio: '1/1' }}
                            >
                                {item.thumbnail ? (
                                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <i className={`pi ${item.type === 'pdf' ? 'pi-file-pdf text-red-500' : 'pi-image text-500'} text-3xl`} />
                                )}
                                {item.type === 'pdf' && item.thumbnail && (
                                     <div className="absolute bottom-0 right-0 bg-red-500 text-white text-xs px-1 border-round-top-left">PDF</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Center Main Area */}
            <div className="flex-1 flex flex-column relative surface-900 overflow-hidden min-w-0">
                {/* Toolbar */}
                <div className="h-4rem surface-overlay border-bottom-1 border-300 flex align-items-center justify-content-between px-4 shadow-1 z-2 flex-shrink-0 gap-3">
                    <div className="text-sm text-500 font-medium white-space-nowrap overflow-hidden text-overflow-ellipsis max-w-10rem hidden md:block">
                        {activeItem.title}
                    </div>
                    
                    <div className="flex gap-4 align-items-center flex-wrap justify-content-end flex-1">
                        <Tooltip target=".toolbar-btn" />

                        {/* Grouped Zoom Controls */}
                        <span className="p-buttonset shadow-1">
                            <Button icon="pi pi-search-plus" onClick={handleZoomIn} size="small" severity="secondary" tooltip="Zoom In" />
                            <Button icon="pi pi-search-minus" onClick={handleZoomOut} size="small" severity="secondary" tooltip="Zoom Out" />
                            <Button icon="pi pi-arrows-alt" onClick={handleFitScreen} size="small" severity="secondary" tooltip="Fit Screen" />
                        </span>

                        {/* Standard Actions */}
                        <div className="flex gap-1">
                            <Button icon="pi pi-refresh" className="toolbar-btn" onClick={handleRotateCcw} rounded text severity="secondary" tooltip="Rotate Left" style={{transform: 'scaleX(-1)'}} />
                            <Button icon="pi pi-refresh" className="toolbar-btn" onClick={handleRotateCw} rounded text severity="secondary" tooltip="Rotate Right" />
                            <Button icon="pi pi-print" className="toolbar-btn" onClick={handlePrint} rounded text severity="secondary" tooltip="Print" />
                            <Button icon="pi pi-download" className="toolbar-btn" onClick={handleDownload} rounded text severity="secondary" tooltip="Download" />
                        </div>
                        
                        {/* Checkbox Toggle for View Mode */}
                        <div className="flex align-items-center gap-3 border-left-1 border-300 pl-3">
                             <div className="flex align-items-center">
                                <Checkbox 
                                    inputId="showDetails" 
                                    onChange={e => setShowInfo(!!e.checked)} 
                                    checked={showInfo} 
                                />
                                <label htmlFor="showDetails" className="ml-2 text-sm cursor-pointer select-none">Show Details</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Canvas - Overflow Auto enabled for scrolling zoomed images */}
                <div className="flex-1 relative overflow-auto surface-900">
                    {renderMainContent()}
                </div>
            </div>

            {/* Right Sidebar - Metadata */}
            {showInfo && (
                <div className="w-20rem surface-ground border-left-1 border-300 flex flex-column flex-shrink-0 transition-all transition-duration-300">
                    <div className="p-4 border-bottom-1 border-300 surface-card">
                        <div className="flex justify-content-between align-items-center mb-3">
                            <div>
                                <h3 className="font-bold text-800 m-0">Metadata</h3>
                                <p className="text-xs text-500 m-0 mt-1">Properties</p>
                            </div>
                            {/* Close button that toggles checkbox off */}
                            <Button icon="pi pi-times" onClick={() => setShowInfo(false)} rounded text severity="secondary" size="small" aria-label="Close" />
                        </div>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search text-400" />
                            <InputText 
                                value={metaFilter} 
                                onChange={(e) => setMetaFilter(e.target.value)} 
                                placeholder="Filter properties..." 
                                className="w-full p-inputtext-sm" 
                            />
                        </span>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {isLoading ? (
                            <div className="p-4">
                                <Skeleton className="mb-2" />
                                <Skeleton width="10rem" className="mb-2" />
                                <Skeleton width="5rem" className="mb-2" />
                                <Skeleton height="2rem" className="mb-2" />
                            </div>
                        ) : (
                            <DataTable 
                                value={metaData} 
                                stripedRows 
                                size="small" 
                                className="text-sm border-none"
                                globalFilter={metaFilter}
                                globalFilterFields={['property', 'value']}
                                emptyMessage="No metadata."
                            >
                                <Column field="property" header="Property" className="font-semibold text-600" style={{ width: '40%' }}></Column>
                                <Column field="value" header="Value"></Column>
                            </DataTable>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};