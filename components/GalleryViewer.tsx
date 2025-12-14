
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Checkbox } from 'primereact/checkbox';
import { Galleria, GalleriaResponsiveOptions } from 'primereact/galleria';
import { mockFetchContent, mockFetchMetadata } from '../services/mockApi';

export interface GalleryItem {
    id: string | number;
    thumbnail?: string; // Small preview or icon URL
    title: string;
    type: 'image' | 'pdf' | 'document';
    description?: string;
}

export interface GalleryViewerProps {
    items?: GalleryItem[];
    docId?: string | number;
    onFetchContent?: (id: string | number) => Promise<{ base64: string; mimeType: string }>;
    onFetchMetadata?: (id: string | number) => Promise<any[]>;
    className?: string;
    style?: React.CSSProperties;
}

export const GalleryViewer: React.FC<GalleryViewerProps> = ({ 
    items,
    docId,
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
    const [showInfo, setShowInfo] = useState(true);
    const [metaFilter, setMetaFilter] = useState('');
    
    // Data Loading State
    const [isLoading, setIsLoading] = useState(false);
    const [contentData, setContentData] = useState<{ base64: string; mimeType: string } | null>(null);
    const [metaData, setMetaData] = useState<any[]>([]);

    const galleriaRef = useRef<Galleria>(null);

    // Responsive settings for thumbnails
    const responsiveOptions: GalleriaResponsiveOptions[] = [
        {
            breakpoint: '991px',
            numVisible: 4
        },
        {
            breakpoint: '767px',
            numVisible: 3
        },
        {
            breakpoint: '575px',
            numVisible: 1
        }
    ];

    // Initialize Items
    useEffect(() => {
        if (items && items.length > 0) {
            setLocalItems(items);
            setActiveIndex(0);
        } else if (docId) {
            setLocalItems([{
                id: docId,
                title: `Document ${docId}`,
                type: 'image',
                thumbnail: undefined
            }]);
            setActiveIndex(0);
        } else {
            setLocalItems([]);
        }
    }, [items, docId]);

    const activeItem = localItems[activeIndex];

    // Fetch Content when Active Index changes
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!activeItem) return;

            setIsLoading(true);
            // Reset view transforms on change
            setZoom(1);
            setRotation(0);
            setContentData(null);
            setMetaData([]);

            try {
                // Parallel fetch
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

    // --- Toolbar Handlers ---
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
                    <head><title>Print ${activeItem?.title}</title></head>
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
        if (!contentData || !activeItem) return;
        const link = document.createElement('a');
        link.href = `data:${contentData.mimeType};base64,${contentData.base64}`;
        const ext = contentData.mimeType.split('/')[1];
        link.download = `${activeItem.title}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Templates ---

    const itemTemplate = (item: GalleryItem) => {
        // We only render the heavy content if this item is the currently active one
        // and data is loaded. Otherwise, we show a loading state or placeholder.
        const isActive = item.id === activeItem?.id;

        if (!isActive || isLoading) {
            return (
                <div className="flex flex-column align-items-center justify-content-center h-full w-full bg-black-alpha-90" style={{ minHeight: '400px' }}>
                    <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="4" />
                    <span className="text-white mt-3">Loading Secure Content...</span>
                </div>
            );
        }

        if (!contentData) {
            return (
                <div className="flex align-items-center justify-content-center h-full w-full bg-black-alpha-90 text-white">
                    <i className="pi pi-exclamation-triangle mr-2"></i> Content Unavailable
                </div>
            );
        }

        if (contentData.mimeType === 'application/pdf') {
            return (
                <div className="w-full h-full flex align-items-center justify-content-center bg-black-alpha-90" style={{ minHeight: '500px' }}>
                     <iframe
                        src={`data:application/pdf;base64,${contentData.base64}`}
                        className="w-full h-full border-none"
                        style={{ height: '600px' }} // Fixed height for PDF in galleria
                        title="PDF Viewer"
                    />
                </div>
            );
        }

        // Image Handling with Transformations
        // Note: Galleria items usually have fixed bounds. We use overflow-hidden on container usually,
        // but for zoom we might want overflow-auto. However, Galleria swipe logic might conflict.
        // We apply transforms to the img directly.
        return (
            <div className="w-full h-full flex align-items-center justify-content-center bg-black-alpha-90 overflow-hidden" style={{ minHeight: '500px' }}>
                <div className="overflow-auto w-full h-full flex align-items-center justify-content-center">
                    <img 
                        src={`data:${contentData.mimeType};base64,${contentData.base64}`} 
                        alt={item.title} 
                        style={{ 
                            width: zoom === 1 ? '100%' : `${zoom * 100}%`,
                            height: zoom === 1 ? '100%' : 'auto',
                            objectFit: 'contain',
                            transform: `rotate(${rotation}deg)`,
                            maxWidth: zoom === 1 ? '100%' : 'none',
                            maxHeight: zoom === 1 ? '100%' : 'none',
                            transition: 'transform 0.3s ease'
                        }} 
                    />
                </div>
            </div>
        );
    };

    const thumbnailTemplate = (item: GalleryItem) => {
        return (
            <div className="flex align-items-center justify-content-center h-5rem w-5rem overflow-hidden border-1 border-transparent hover:border-primary transition-colors">
                {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex flex-column align-items-center justify-content-center bg-surface-100 w-full h-full text-600">
                        <i className={`pi ${item.type === 'pdf' ? 'pi-file-pdf text-red-500' : 'pi-image'} text-xl mb-1`}></i>
                        <span className="text-xs">{item.type.toUpperCase()}</span>
                    </div>
                )}
            </div>
        );
    };

    // Header containing the Toolbar
    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between p-3 surface-card border-bottom-1 border-300 gap-3">
            <div className="font-bold text-lg text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis" style={{ maxWidth: '200px' }}>
                {activeItem?.title}
            </div>

            <div className="flex gap-3 align-items-center flex-wrap justify-content-end flex-1">
                <Tooltip target=".toolbar-btn" />
                
                {/* Grouped Zoom Controls */}
                <span className="p-buttonset shadow-1">
                    <Button icon="pi pi-search-plus" onClick={handleZoomIn} size="small" severity="secondary" tooltip="Zoom In" />
                    <Button icon="pi pi-search-minus" onClick={handleZoomOut} size="small" severity="secondary" tooltip="Zoom Out" />
                    <Button icon="pi pi-arrows-alt" onClick={handleFitScreen} size="small" severity="secondary" tooltip="Fit Screen" />
                </span>

                {/* Transformations & Actions */}
                <div className="flex gap-1">
                    <Button icon="pi pi-refresh" className="toolbar-btn" onClick={handleRotateCcw} rounded text severity="secondary" tooltip="Rotate Left" style={{transform: 'scaleX(-1)'}} />
                    <Button icon="pi pi-refresh" className="toolbar-btn" onClick={handleRotateCw} rounded text severity="secondary" tooltip="Rotate Right" />
                    <Button icon="pi pi-print" className="toolbar-btn" onClick={handlePrint} rounded text severity="secondary" tooltip="Print" />
                    <Button icon="pi pi-download" className="toolbar-btn" onClick={handleDownload} rounded text severity="secondary" tooltip="Download" />
                </div>

                {/* Toggle Metadata */}
                <div className="flex align-items-center border-left-1 border-300 pl-3">
                    <Checkbox 
                        inputId="showDetails" 
                        onChange={e => setShowInfo(!!e.checked)} 
                        checked={showInfo} 
                    />
                    <label htmlFor="showDetails" className="ml-2 text-sm cursor-pointer select-none">Show Details</label>
                </div>
            </div>
        </div>
    );

    if (localItems.length === 0) {
        return <div className="p-5 text-center text-500">No items available.</div>;
    }

    return (
        <div className={`flex flex-column md:flex-row shadow-2 border-round overflow-hidden surface-card ${className}`} style={{ height: 'calc(100vh - 9rem)', ...style }}>
            {/* Main Gallery Area */}
            <div className={`flex-1 min-w-0 transition-all ${showInfo ? 'border-right-1 border-300' : ''}`}>
                <Galleria 
                    ref={galleriaRef}
                    value={localItems} 
                    activeIndex={activeIndex} 
                    onItemChange={(e) => setActiveIndex(e.index)}
                    responsiveOptions={responsiveOptions} 
                    numVisible={5} 
                    style={{ maxWidth: '100%' }}
                    className="h-full flex flex-column"
                    
                    // Render custom header for toolbar
                    header={header}
                    
                    // Main Content
                    item={itemTemplate}
                    
                    // Thumbnails (Bottom strip)
                    thumbnail={thumbnailTemplate}
                    showThumbnails={localItems.length > 1}
                    showItemNavigators={localItems.length > 1}
                    showItemNavigatorsOnHover
                    circular
                />
            </div>

            {/* Metadata Sidebar */}
            {showInfo && (
                <div className="w-full md:w-20rem flex-shrink-0 flex flex-column bg-surface-50 transition-all">
                    <div className="p-3 border-bottom-1 border-200 bg-surface-0">
                        <div className="flex justify-content-between align-items-center mb-2">
                            <span className="font-bold text-800">Metadata</span>
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

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                         {isLoading ? (
                            <div className="flex align-items-center justify-content-center h-10rem">
                                <ProgressSpinner style={{width: '30px', height: '30px'}} />
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
                                <Column field="property" header="Property" className="font-semibold text-600 w-6rem"></Column>
                                <Column field="value" header="Value"></Column>
                            </DataTable>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
