
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Slider } from 'primereact/slider';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ScrollPanel } from 'primereact/scrollpanel';

// Set worker for pdfjs using a stable CDN link that matches the dist
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

interface Redaction {
    id: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface EmbedPDFProps {
    data: string; // Base64 string
    fileName?: string;
    onSave?: (redactions: Redaction[]) => void;
    className?: string;
}

export const EmbedPDF: React.FC<EmbedPDFProps> = ({ data, fileName, onSave, className }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.1);
    const [isRedactMode, setIsRedactMode] = useState<boolean>(false);
    const [redactions, setRedactions] = useState<Redaction[]>([]);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [currentRect, setCurrentRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef<HTMLDivElement>(null);

    // Convert base64 to Blob URL for stability
    useEffect(() => {
        if (!data) return;
        
        try {
            const byteCharacters = atob(data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            setPdfUrl(url);
            
            return () => {
                URL.revokeObjectURL(url);
            };
        } catch (err) {
            console.error("PDF Blob conversion failed", err);
        }
    }, [data]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
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

    return (
        <div className={`flex flex-column h-full surface-ground overflow-hidden ${className}`}>
            {/* PDF Toolbar */}
            <div className="flex align-items-center justify-content-between px-3 py-2 surface-card border-bottom-1 border-200 z-5 shadow-1">
                <div className="flex align-items-center gap-2">
                    <div className="flex align-items-center bg-surface-50 border-round-lg p-1 border-1 border-200">
                        <Button icon="pi pi-chevron-left" text severity="secondary" size="small" className="w-2rem h-2rem" onClick={() => setPageNumber(Math.max(1, pageNumber - 1))} disabled={pageNumber <= 1} />
                        <span className="mx-2 text-xs font-bold text-700 min-w-3rem text-center select-none">
                            {pageNumber} / {numPages || '?'}
                        </span>
                        <Button icon="pi pi-chevron-right" text severity="secondary" size="small" className="w-2rem h-2rem" onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))} disabled={pageNumber >= numPages} />
                    </div>
                    <div className="hidden lg:flex align-items-center gap-2 ml-2">
                        <Slider value={scale * 100} onChange={(e) => setScale((e.value as number) / 100)} min={50} max={1000} style={{ width: '80px' }} />
                        <span className="text-xs font-bold text-500 ml-1">{Math.round(scale * 100)}%</span>
                    </div>
                </div>

                <div className="flex align-items-center gap-2">
                    <Tooltip target=".pdf-btn" position="bottom" />
                    <Button 
                        icon={`pi ${isRedactMode ? 'pi-eye-slash' : 'pi-pencil'}`} 
                        label={isRedactMode ? "View" : "Redact"} 
                        severity={isRedactMode ? "danger" : "secondary"} 
                        size="small" 
                        text={!isRedactMode}
                        raised={isRedactMode}
                        onClick={() => setIsRedactMode(!isRedactMode)}
                        className="pdf-btn"
                    />
                    <Button icon="pi pi-save" label="Save" severity="primary" size="small" onClick={() => onSave?.(redactions)} disabled={redactions.length === 0} className="pdf-btn" />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* PDF Viewer Stage */}
                <div className="flex-1 overflow-auto bg-gray-900 p-4 flex justify-content-center custom-scrollbar" ref={containerRef}>
                    <div className="relative shadow-8 bg-white" 
                         ref={pageRef}
                         onMouseDown={startDrawing}
                         onMouseMove={draw}
                         onMouseUp={stopDrawing}
                         style={{ cursor: isRedactMode ? 'crosshair' : 'default', height: 'fit-content' }}>
                        
                        {pdfUrl ? (
                            <Document
                                file={pdfUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<div className="p-8 text-center text-white"><ProgressSpinner strokeWidth="3" style={{width: '40px'}} /><p className="mt-2 text-xs uppercase tracking-widest font-bold">Mounting Document...</p></div>}
                                error={<Message severity="error" text="PDF interpretation failed." className="m-4" />}
                            >
                                <Page 
                                    pageNumber={pageNumber} 
                                    scale={scale} 
                                    renderAnnotationLayer={false} 
                                    renderTextLayer={!isRedactMode} 
                                />
                            </Document>
                        ) : (
                            <div className="p-8"><ProgressSpinner /></div>
                        )}

                        {/* Redaction Overlay Layer */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                            {redactions.filter(r => r.page === pageNumber).map(r => (
                                <div 
                                    key={r.id}
                                    className="absolute bg-black shadow-1 flex align-items-center justify-content-center pointer-events-auto"
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

                {/* Sidebar Redaction Log */}
                {isRedactMode && (
                    <div className="w-16rem bg-surface-0 border-left-1 border-200 hidden xl:flex flex-column animate-width animate-duration-300">
                        <div className="p-3 border-bottom-1 border-100 bg-surface-50">
                            <span className="text-xs font-bold text-700 uppercase tracking-widest block">Redaction Log</span>
                        </div>
                        <ScrollPanel className="flex-1 p-2">
                            {redactions.length === 0 ? (
                                <div className="p-4 text-center text-400 italic text-xs">No masking defined.</div>
                            ) : (
                                <div className="flex flex-column gap-2">
                                    {redactions.map((r, idx) => (
                                        <div key={r.id} className="p-2 surface-50 border-round border-1 border-200 flex align-items-center justify-content-between">
                                            <div className="flex flex-column">
                                                <span className="text-xs font-bold text-700">Page {r.page} • Mask #{idx+1}</span>
                                            </div>
                                            <Button icon="pi pi-trash" text severity="danger" size="small" onClick={() => removeRedaction(r.id)} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollPanel>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #111827;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #374151;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #4b5563;
                }
                .react-pdf__Page__canvas {
                    margin: 0 auto !important;
                    display: block !important;
                }
            `}</style>
        </div>
    );
};
