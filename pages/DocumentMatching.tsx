import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { Image } from 'primereact/image';

const newWCN = () => ({ id: Math.random().toString(36).slice(2), value: "" });

// Mock data for a document with multiple pages
const MOCK_DOCUMENT_PAGES = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    src: `https://picsum.photos/seed/doc${i + 1}/600/800`,
    label: `Page ${i + 1}`
}));

const DocumentMatching: React.FC = () => {
    const toast = useRef<Toast>(null);

    const [form, setForm] = useState({
        accountNumber: "",
        acquirerRefNumber: "",
        chargebackRefNumber: "",
        note: "",
        pageSelection: "all",
        customPages: "",
    });

    const [workCaseNumbers, setWorkCaseNumbers] = useState([newWCN()]);
    const [submitted, setSubmitted] = useState(false);
    
    // Right column state
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [documentLoaded, setDocumentLoaded] = useState(false);

    // ── Field handlers ──────────────────────────────
    const handleChange = (field: string, value: string) =>
        setForm((f) => ({ ...f, [field]: value }));

    // ── WCN handlers ────────────────────────────────
    const handleWCNChange = (id: string, value: string) =>
        setWorkCaseNumbers((prev) =>
            prev.map((w) => (w.id === id ? { ...w, value } : w))
        );

    const addWCN = () =>
        setWorkCaseNumbers((prev) => [...prev, newWCN()]);

    const removeWCN = (id: string) =>
        setWorkCaseNumbers((prev) => prev.filter((w) => w.id !== id));

    const hasValidWCN = workCaseNumbers.some((w) => w.value.trim() !== "");

    // ── Document handlers ───────────────────────────
    const handleLoadDocument = () => {
        setDocumentLoaded(true);
        setSelectedPages(MOCK_DOCUMENT_PAGES.map(p => p.id));
        handleChange("pageSelection", "all");
        toast.current?.show({ severity: 'info', summary: 'Document Loaded', detail: 'Mock document loaded for matching.' });
    };

    const togglePageSelection = (id: number) => {
        let _selectedPages = [...selectedPages];
        if (_selectedPages.includes(id)) {
            _selectedPages = _selectedPages.filter(pageId => pageId !== id);
        } else {
            _selectedPages.push(id);
        }
        setSelectedPages(_selectedPages);
        
        // Update form pageSelection to custom if we're manually selecting
        if (_selectedPages.length === MOCK_DOCUMENT_PAGES.length) {
            handleChange("pageSelection", "all");
            handleChange("customPages", "");
        } else {
            handleChange("pageSelection", "custom");
            handleChange("customPages", _selectedPages.sort((a,b) => a-b).join(", "));
        }
    };

    const handleSelectAll = () => {
        if (selectedPages.length === MOCK_DOCUMENT_PAGES.length) {
            setSelectedPages([]);
            handleChange("pageSelection", "custom");
            handleChange("customPages", "");
        } else {
            setSelectedPages(MOCK_DOCUMENT_PAGES.map(p => p.id));
            handleChange("pageSelection", "all");
            handleChange("customPages", "");
        }
    };

    // Sync form page selection with right column
    const handlePageSelectionChange = (value: string) => {
        handleChange("pageSelection", value);
        if (value === "all") {
            setSelectedPages(MOCK_DOCUMENT_PAGES.map(p => p.id));
            handleChange("customPages", "");
        } else {
            setSelectedPages([]);
            handleChange("customPages", "");
        }
    };

    // Parse custom pages input and update visual selection
    const handleCustomPagesChange = (value: string) => {
        handleChange("customPages", value);
        
        if (!value.trim()) {
            setSelectedPages([]);
            return;
        }

        const pages = new Set<number>();
        const parts = value.split(',').map(p => p.trim());
        const maxPages = MOCK_DOCUMENT_PAGES.length;

        for (const part of parts) {
            if (!part) continue;
            if (part.includes('-')) {
                const [startStr, endStr] = part.split('-');
                const start = parseInt(startStr, 10);
                const end = parseInt(endStr, 10);
                if (!isNaN(start) && !isNaN(end) && start <= end) {
                    for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
                        pages.add(i);
                    }
                }
            } else {
                const num = parseInt(part, 10);
                if (!isNaN(num) && num >= 1 && num <= maxPages) {
                    pages.add(num);
                }
            }
        }
        setSelectedPages(Array.from(pages).sort((a, b) => a - b));
    };

    // ── Submit / Reset ───────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        if (!form.accountNumber || !hasValidWCN) return;

        if (!documentLoaded) {
            toast.current?.show({ severity: 'warn', summary: 'No Document', detail: 'Please load a document first.' });
            return;
        }

        if (selectedPages.length === 0) {
             toast.current?.show({ severity: 'warn', summary: 'No Pages Selected', detail: 'Please select at least one page to match.' });
             return;
        }

        toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: `Document attached to case with ${selectedPages.length} pages.`,
            life: 3500,
        });
        
        handleReset();
    };

    const handleReset = () => {
        setSubmitted(false);
        setForm({
            accountNumber: "",
            acquirerRefNumber: "",
            chargebackRefNumber: "",
            note: "",
            pageSelection: "all",
            customPages: "",
        });
        setWorkCaseNumbers([newWCN()]);
        setSelectedPages([]);
        setDocumentLoaded(false);
    };

    return (
        <div className="flex flex-column lg:flex-row surface-card border-round-2xl shadow-1 border-1 border-200 overflow-hidden" style={{ minHeight: '800px', height: 'calc(100vh - 11rem)' }}>
            <Toast ref={toast} position="bottom-center" />
            
            {/* ── Left Column: Form Sidebar ── */}
            <div className="w-full lg:w-26rem xl:w-30rem flex flex-column border-right-1 border-200 surface-card z-1 flex-shrink-0">
                
                {/* Header */}
                <div className="px-4 py-3 border-bottom-1 border-100 surface-card">
                    <div className="flex align-items-center gap-2 mb-2">
                        <div className="w-2rem h-2rem border-round-lg bg-primary-50 flex align-items-center justify-content-center">
                            <i className="pi pi-folder-open text-primary text-sm" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">
                            Case Management
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold m-0 text-900">
                        Attach Document
                    </h2>
                    <p className="text-500 text-sm mt-1 mb-0">
                        Link supporting documents to the relevant case identifiers.
                    </p>
                </div>

                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <form id="attach-form" onSubmit={handleSubmit} noValidate className="flex flex-column gap-4">

                        {/* Section: Case References */}
                        <div>
                            <div className="flex align-items-center gap-2 mb-3">
                                <i className="pi pi-tag text-400" />
                                <h3 className="text-sm font-bold uppercase text-900 m-0">Case References</h3>
                            </div>

                            {/* Account Number */}
                            <div className="mb-3">
                                <label htmlFor="accountNumber" className="block text-sm font-medium text-700 mb-2">
                                    Account Number <span className="text-red-500">*</span>
                                </label>
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-id-card text-400" />
                                    <InputText
                                        id="accountNumber"
                                        value={form.accountNumber}
                                        onChange={(e) => handleChange("accountNumber", e.target.value)}
                                        placeholder="e.g. ACC-00123456"
                                        className={`w-full ${submitted && !form.accountNumber ? "p-invalid" : ""}`}
                                    />
                                </span>
                                {submitted && !form.accountNumber && (
                                    <small className="text-red-500 mt-1 flex align-items-center gap-1">
                                        <i className="pi pi-exclamation-circle" /> Account number is required
                                    </small>
                                )}
                            </div>

                            {/* Work Case Numbers */}
                            <div className="mb-3">
                                <div className="flex align-items-center justify-content-between mb-2">
                                    <label className="block text-sm font-medium text-700">
                                        Work Case Number <span className="text-red-500">*</span>
                                    </label>
                                    <Badge value={workCaseNumbers.length} severity="info" className="bg-blue-100 text-blue-800" />
                                </div>

                                <div className="flex flex-column gap-2">
                                    {workCaseNumbers.map((wcn, idx) => (
                                        <div key={wcn.id} className="flex align-items-center gap-2 group">
                                            <span className="text-xs font-bold text-400 w-1rem text-right">
                                                {idx + 1}.
                                            </span>
                                            <span className="p-input-icon-left flex-1">
                                                <i className="pi pi-briefcase text-400" />
                                                <InputText
                                                    value={wcn.value}
                                                    onChange={(e) => handleWCNChange(wcn.id, e.target.value)}
                                                    placeholder={`e.g. WC-2024-${String(idx + 1).padStart(5, "0")}`}
                                                    className={`w-full ${submitted && idx === 0 && !hasValidWCN ? "p-invalid" : ""}`}
                                                />
                                            </span>
                                            <Button
                                                type="button"
                                                icon="pi pi-times"
                                                rounded
                                                text
                                                severity="secondary"
                                                onClick={() => removeWCN(wcn.id)}
                                                disabled={workCaseNumbers.length === 1}
                                                className="w-2rem h-2rem p-0 text-400 hover:text-red-500 hover:surface-hover"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {submitted && !hasValidWCN && (
                                    <small className="text-red-500 mt-1 flex align-items-center gap-1">
                                        <i className="pi pi-exclamation-circle" /> At least one work case number is required
                                    </small>
                                )}

                                <Button
                                    type="button"
                                    label="Add Another Case"
                                    icon="pi pi-plus"
                                    text
                                    size="small"
                                    className="mt-2 p-0 text-primary hover:surface-hover"
                                    onClick={addWCN}
                                />
                            </div>

                            {/* Acquirer & Chargeback */}
                            <div className="grid">
                                <div className="col-6">
                                    <label htmlFor="acquirerRefNumber" className="block text-sm font-medium text-700 mb-2 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                                        Acquirer Ref
                                    </label>
                                    <InputText
                                        id="acquirerRefNumber"
                                        value={form.acquirerRefNumber}
                                        onChange={(e) => handleChange("acquirerRefNumber", e.target.value)}
                                        placeholder="ARN-..."
                                        className="w-full"
                                    />
                                </div>
                                <div className="col-6">
                                    <label htmlFor="chargebackRefNumber" className="block text-sm font-medium text-700 mb-2 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                                        Chargeback Ref
                                    </label>
                                    <InputText
                                        id="chargebackRefNumber"
                                        value={form.chargebackRefNumber}
                                        onChange={(e) => handleChange("chargebackRefNumber", e.target.value)}
                                        placeholder="CBK-..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-1rem border-bottom-1 border-100 w-full mb-3" />

                        {/* Section: Page Selection */}
                        <div>
                            <div className="flex align-items-center gap-2 mb-3">
                                <i className="pi pi-file-pdf text-400" />
                                <h3 className="text-sm font-bold uppercase text-900 m-0">Page Selection</h3>
                            </div>

                            <div className="grid mb-3">
                                <div className="col-6">
                                <label className={`flex align-items-start gap-3 p-3 border-1 border-round-xl cursor-pointer transition-all transition-duration-200 ${
                                    form.pageSelection === "all" ? "border-primary surface-hover" : "border-200 surface-card hover:border-300 hover:surface-hover"
                                }`}>
                                    <RadioButton inputId="pageAll" name="pageSelection" value="all" checked={form.pageSelection === "all"} onChange={(e) => handlePageSelectionChange(e.value)} className="mt-1" />
                                    <div>
                                        <span className="block font-semibold text-sm text-900 mb-1">All Pages</span>
                                        <span className="block text-xs text-500">Attach entire document</span>
                                    </div>
                                </label>
                                </div>

                                <div className="col-6">
                                <label className={`flex align-items-start gap-3 p-3 border-1 border-round-xl cursor-pointer transition-all transition-duration-200 ${
                                    form.pageSelection === "custom" ? "border-primary surface-hover" : "border-200 surface-card hover:border-300 hover:surface-hover"
                                }`}>
                                    <RadioButton inputId="pageCustom" name="pageSelection" value="custom" checked={form.pageSelection === "custom"} onChange={(e) => handlePageSelectionChange(e.value)} className="mt-1" />
                                    <div>
                                        <span className="block font-semibold text-sm text-900 mb-1">Custom</span>
                                        <span className="block text-xs text-500">Specify page range</span>
                                    </div>
                                </label>
                                </div>
                            </div>

                            {form.pageSelection === "custom" && (
                                <div className="fadein animation-duration-500">
                                    <span className="p-input-icon-left w-full">
                                        <i className="pi pi-sort-numeric-up text-400" />
                                        <InputText
                                            value={form.customPages}
                                            onChange={(e) => handleCustomPagesChange(e.target.value)}
                                            placeholder="e.g. 1-3, 5, 7-9"
                                            className="w-full"
                                        />
                                    </span>
                                    <small className="text-500 block mt-2 line-height-3">
                                        Enter page numbers separated by commas, or click pages in the viewer to select them.
                                    </small>
                                </div>
                            )}
                        </div>

                        <div className="h-1rem border-bottom-1 border-100 w-full mb-3" />

                        {/* Section: Notes */}
                        <div>
                            <label htmlFor="note" className="block text-sm font-medium text-700 mb-2">
                                Additional Notes
                            </label>
                            <InputTextarea
                                id="note"
                                value={form.note}
                                onChange={(e) => handleChange("note", e.target.value)}
                                placeholder="Add context about this document..."
                                rows={3}
                                autoResize
                                className="w-full"
                            />
                        </div>

                    </form>
                </div>

                {/* Sticky Footer */}
                <div className="p-3 border-top-1 border-100 surface-50 flex justify-content-end gap-3">
                    <Button type="button" label="Clear" icon="pi pi-refresh" outlined severity="secondary" onClick={handleReset} />
                    <Button type="submit" form="attach-form" label="Attach Document" icon="pi pi-paperclip" disabled={submitted && (!form.accountNumber || !hasValidWCN)} />
                </div>
            </div>

            {/* ── Right Column: Document Viewer ── */}
            <div className="flex-1 flex flex-column surface-ground relative overflow-hidden">
                
                {/* Viewer Header */}
                <div className="h-4rem border-bottom-1 border-200 surface-card flex align-items-center justify-content-between px-4 shadow-1 z-1 flex-shrink-0">
                    <div className="flex align-items-center gap-4">
                        <h3 className="font-bold text-900 m-0">Document Viewer</h3>
                        {documentLoaded && (
                            <div className="h-1rem w-1rem border-left-1 border-200 hidden sm:block"></div>
                        )}
                        {documentLoaded && (
                            <div className="hidden sm:flex align-items-center gap-2">
                                <Button 
                                    label={selectedPages.length === MOCK_DOCUMENT_PAGES.length ? "Deselect All" : "Select All"} 
                                    icon={selectedPages.length === MOCK_DOCUMENT_PAGES.length ? "pi pi-times" : "pi pi-check-square"} 
                                    text 
                                    size="small" 
                                    severity="secondary"
                                    onClick={handleSelectAll} 
                                    className="p-1 text-sm"
                                />
                                <Badge value={`${selectedPages.length} selected`} severity={selectedPages.length > 0 ? "info" : "secondary"} className="text-xs" />
                            </div>
                        )}
                    </div>
                    <Button 
                        label={documentLoaded ? "Reload Document" : "Load Document"} 
                        icon="pi pi-cloud-download" 
                        severity={documentLoaded ? "secondary" : "primary"} 
                        outlined={documentLoaded}
                        onClick={handleLoadDocument} 
                    />
                </div>

                {/* Viewer Body */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {!documentLoaded ? (
                        <div className="flex flex-column align-items-center justify-content-center h-full text-400 surface-card border-2 border-dashed border-200 border-round-2xl max-w-30rem mx-auto" style={{ minHeight: '400px' }}>
                            <div className="w-5rem h-5rem surface-50 border-round-full flex align-items-center justify-content-center mb-4 shadow-1 border-1 border-100">
                                <i className="pi pi-file-pdf text-4xl text-300"></i>
                            </div>
                            <h3 className="text-lg font-bold text-700 mb-2">No Document Loaded</h3>
                            <p className="text-sm text-500 mb-4 text-center max-w-20rem line-height-3">
                                Load a document to preview its pages, select specific ranges, and attach them to the current case.
                            </p>
                            <Button label="Load Sample Document" icon="pi pi-cloud-download" onClick={handleLoadDocument} />
                        </div>
                    ) : (
                        <div className="grid pb-5">
                            {MOCK_DOCUMENT_PAGES.map((page) => {
                                const isSelected = selectedPages.includes(page.id);
                                return (
                                    <div key={page.id} className="col-6 md:col-4 lg:col-4 xl:col-3">
                                    <div 
                                        className={`
                                            group relative surface-card border-round-xl shadow-1 overflow-hidden cursor-pointer transition-all transition-duration-200 border-2
                                            ${isSelected ? 'border-primary' : 'border-transparent hover:border-300 hover:shadow-3'}
                                        `}
                                        onClick={() => togglePageSelection(page.id)}
                                    >
                                        {/* Selection Checkbox (Custom UI) */}
                                        <div className="absolute top-0 left-0 mt-2 ml-2 z-1">
                                            <div className={`w-1rem h-1rem border-round-full border-2 flex align-items-center justify-content-center transition-colors ${
                                                isSelected 
                                                    ? 'bg-primary border-primary text-white' 
                                                    : 'surface-card border-300 hover:border-400'
                                            }`}>
                                                {isSelected && <i className="pi pi-check text-xs font-bold"></i>}
                                            </div>
                                        </div>
                                        
                                        {/* Page Number Badge */}
                                        <div className="absolute top-0 right-0 mt-2 mr-2 z-1 bg-black-alpha-60 text-white text-xs font-medium px-2 py-1 border-round-md shadow-1">
                                            {page.label}
                                        </div>

                                        {/* Image Container */}
                                        <div className="aspect-[3/4] w-full surface-ground flex align-items-center justify-content-center overflow-hidden">
                                            <img 
                                                src={page.src} 
                                                alt={page.label} 
                                                className="w-full h-full object-cover transition-transform transition-duration-500 hover:scale-105"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                        
                                        {/* Hover Overlay & Preview Action */}
                                        <div className="absolute bottom-0 right-0 mb-2 mr-2 z-1">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Image 
                                                    src={page.src} 
                                                    alt={`Preview ${page.label}`}
                                                    preview 
                                                    template={
                                                        <div className="surface-card text-800 border-round-full w-2rem h-2rem flex align-items-center justify-content-center shadow-2 cursor-pointer transition-all hover:scale-110 hover:text-primary">
                                                            <i className="pi pi-eye"></i>
                                                        </div>
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
};

export default DocumentMatching;
