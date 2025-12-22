
import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Slider } from 'primereact/slider';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ScrollPanel } from 'primereact/scrollpanel';

// Set worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Redaction {
    id: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface EmbedPDFProps {
    data: string; // Base64 or URL
    fileName?: string;
    onSave?: (redactions: Redaction[]) => void;
    className?: string;
}

export const EmbedPDF: React.FC<EmbedPDFProps> = ({ data, fileName, onSave, className }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.2);
    const [isRedactMode, setIsRedactMode] = useState<boolean>(false);
    const [redactions, setRedactions] = useState<Redaction[]>([]);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [currentRect, setCurrentRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef<HTMLDivElement>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const startDrawing = (e: React.MouseEvent) => {
        if (!isRedactMode || !pageRef.current) return;
        
        const rect = pageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setIsDrawing(true);
        setCurrentRect({ x, y, w: 0, h: 0 });
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || !currentRect || !pageRef.current) return;
        
        const rect = pageRef.current.getBoundingClientRect();
        const w = e.clientX - rect.left - currentRect.x;
        const h = e.clientY - rect.top - currentRect.y;
        
        setCurrentRect({ ...currentRect, w, h });
    };

    const stopDrawing = () => {
        if (isDrawing && currentRect && (Math.abs(currentRect.w) > 5 || Math.abs(currentRect.h) > 5)) {
            const newRedaction: Redaction = {
                id: `redact-${Date.now()}`,
                page: pageNumber,
                // Handle negative widths/heights if dragged backwards
                x: currentRect.w < 0 ? currentRect.x + currentRect.w : currentRect.x,
                y: currentRect.h < 0 ? currentRect.y + currentRect.h : currentRect.y,
                width: Math.abs(currentRect.w),
                height: Math.abs(currentRect.h)
            };
            setRedactions([...redactions, newRedaction]);
        }
        setIsDrawing(false);
        setCurrentRect(null);
    };

    const removeRedaction = (id: string) => {
        setRedactions(redactions.filter(r => r.id !== id));
    };

    const clearPageRedactions = () => {
        setRedactions(redactions.filter(r => r.page !== pageNumber));
    };

    return (
        <div className={`flex flex-column h-full surface-ground border-round-xl overflow-hidden shadow-2 ${className}`}>
            {/* PDF Toolbar */}
            <div className="flex align-items-center justify-content-between px-4 py-2 surface-card border-bottom-1 border-300 z-5">
                <div className="flex align-items-center gap-3">
                    <div className="flex align-items-center bg-surface-100 border-round-lg p-1 px-2 border-1 border-200">
                        <Button icon="pi pi-chevron-left" text severity="secondary" size="small" onClick={() => setPageNumber(Math.max(1, pageNumber - 1))} disabled={pageNumber <= 1} />
                        <span className="mx-2 text-sm font-bold text-700 min-w-4rem text-center">
                            {pageNumber} / {numPages || '?'}
                        </span>
                        <Button icon="pi pi-chevron-right" text severity="secondary" size="small" onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))} disabled={pageNumber >= numPages} />
                    </div>
                    <div className="hidden md:flex align-items-center gap-2 ml-4">
                        <i className="pi pi-search-minus text-400 text-xs" />
                        <Slider value={scale * 100} onChange={(e) => setScale((e.value as number) / 100)} min={50} max={200} style={{ width: '100px' }} />
                        <i className="pi pi-search-plus text-400 text-xs" />
                        <span className="text-xs font-mono text-500 ml-2">{Math.round(scale * 100)}%</span>
                    </div>
                </div>

                <div className="flex align-items-center gap-2">
                    <Tooltip target=".pdf-btn" position="bottom" />
                    <Button 
                        icon="pi pi-pencil" 
                        label={isRedactMode ? "Stop Redacting" : "Redact Mode"} 
                        severity={isRedactMode ? "danger" : "secondary"} 
                        size="small" 
                        outlined={!isRedactMode}
                        onClick={() => setIsRedactMode(!isRedactMode)}
                        className="pdf-btn"
                        tooltip="Enable click-and-drag redaction"
                    />
                    <div className="border-left-1 border-300 h-2rem mx-2"></div>
                    <Button icon="pi pi-trash" severity="danger" text size="small" onClick={clearPageRedactions} disabled={!redactions.some(r => r.page === pageNumber)} tooltip="Clear page redactions" className="pdf-btn" />
                    <Button icon="pi pi-save" label="Save" severity="primary" size="small" onClick={() => onSave?.(redactions)} tooltip="Apply all redactions" className="pdf-btn" />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* PDF Viewer Stage */}
                <div className="flex-1 overflow-auto bg-gray-800 p-4 flex justify-content-center custom-scrollbar" ref={containerRef}>
                    <div className="relative shadow-8" 
                         ref={pageRef}
                         onMouseDown={startDrawing}
                         onMouseMove={draw}
                         onMouseUp={stopDrawing}
                         style={{ cursor: isRedactMode ? 'crosshair' : 'default' }}>
                        
                        <Document
                            file={data.startsWith('data:') ? data : `data:application/pdf;base64,${data}`}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={<div className="p-8"><ProgressSpinner /></div>}
                            error={<Message severity="error" text="Failed to load document." />}
                        >
                            <Page 
                                pageNumber={pageNumber} 
                                scale={scale} 
                                renderAnnotationLayer={false} 
                                renderTextLayer={!isRedactMode} 
                            />
                        </Document>

                        {/* Redaction Overlay Layer */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                            {redactions.filter(r => r.page === pageNumber).map(r => (
                                <div 
                                    key={r.id}
                                    className="absolute bg-black shadow-1 flex align-items-center justify-content-center group pointer-events-auto"
                                    style={{
                                        left: r.x,
                                        top: r.y,
                                        width: r.width,
                                        height: r.height,
                                        opacity: 0.95
                                    }}
                                >
                                    {isRedactMode && (
                                        <Button 
                                            icon="pi pi-times" 
                                            className="p-button-rounded p-button-danger p-button-text p-0 w-1rem h-1rem" 
                                            style={{ fontSize: '0.6rem' }}
                                            onClick={(e) => { e.stopPropagation(); removeRedaction(r.id); }}
                                        />
                                    )}
                                </div>
                            ))}
                            
                            {/* Currently Drawing Rect */}
                            {currentRect && (
                                <div 
                                    className="absolute bg-black-alpha-60 border-1 border-white"
                                    style={{
                                        left: currentRect.w < 0 ? currentRect.x + currentRect.w : currentRect.x,
                                        top: currentRect.h < 0 ? currentRect.y + currentRect.h : currentRect.y,
                                        width: Math.abs(currentRect.w),
                                        height: Math.abs(currentRect.h)
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Registry */}
                <div className="w-18rem bg-surface-card border-left-1 border-300 hidden lg:flex flex-column">
                    <div className="p-3 border-bottom-1 border-200 bg-surface-50">
                        <span className="text-xs font-bold text-700 uppercase tracking-widest flex align-items-center gap-2">
                            <i className="pi pi-shield text-primary"></i> Redaction Log
                        </span>
                    </div>
                    <ScrollPanel className="flex-1 p-2">
                        {redactions.length === 0 ? (
                            <div className="p-4 text-center text-500 italic text-sm">No redactions applied yet.</div>
                        ) : (
                            <div className="flex flex-column gap-2">
                                {redactions.map((r, idx) => (
                                    <div key={r.id} className="p-2 surface-50 border-round border-1 border-200 flex align-items-center justify-content-between hover:surface-100 transition-colors">
                                        <div className="flex flex-column">
                                            <span className="text-xs font-bold text-700">Ref #{idx + 1}</span>
                                            <span className="text-xs text-500">Page {r.page} • Box: {Math.round(r.width)}x{Math.round(r.height)}</span>
                                        </div>
                                        <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => removeRedaction(r.id)} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollPanel>
                    <div className="p-3 border-top-1 border-200 bg-surface-50">
                         <Button label="Clear All" icon="pi pi-refresh" severity="secondary" text className="w-full text-xs" onClick={() => setRedactions([])} disabled={redactions.length === 0} />
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1f2937;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #4b5563;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #6b7280;
                }
                .react-pdf__Page__canvas {
                    margin: 0 auto;
                }
            `}</style>
        </div>
    );
};
