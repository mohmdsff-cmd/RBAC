import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Card } from 'primereact/card';
import { EmbedPDF } from '../components/EmbedPDF';

interface PendingItemDetail {
    id: string;
    description: string;
    dateAdded: string;
    priority: 'High' | 'Medium' | 'Low';
    amount: number;
    customerName: string;
    accountNumber: string;
    merchant: string;
    status: string;
    dueDate: string;
}

const mockPendingItems: PendingItemDetail[] = [
    { id: 'PI-1001', description: 'Missing receipt for travel expense', dateAdded: '2023-10-25', priority: 'High', amount: 450.00, customerName: 'John Doe', accountNumber: '**** **** **** 1234', merchant: 'Delta Airlines', status: 'Pending Review', dueDate: '2023-11-01' },
    { id: 'PI-1002', description: 'Additional evidence required for dispute', dateAdded: '2023-10-26', priority: 'Medium', amount: 120.50, customerName: 'Jane Smith', accountNumber: '**** **** **** 5678', merchant: 'Amazon', status: 'Awaiting Evidence', dueDate: '2023-11-05' },
    { id: 'PI-1003', description: 'Customer signature missing on form', dateAdded: '2023-10-27', priority: 'Low', amount: 0.00, customerName: 'Alice Johnson', accountNumber: '**** **** **** 9012', merchant: 'N/A', status: 'Incomplete', dueDate: '2023-11-10' },
    { id: 'PI-1004', description: 'Invoice mismatch with PO', dateAdded: '2023-10-28', priority: 'High', amount: 3200.00, customerName: 'Bob Brown', accountNumber: '**** **** **** 3456', merchant: 'Tech Supplies Inc.', status: 'Discrepancy', dueDate: '2023-10-31' },
    { id: 'PI-1005', description: 'Proof of delivery needed', dateAdded: '2023-10-29', priority: 'Medium', amount: 85.00, customerName: 'Charlie Davis', accountNumber: '**** **** **** 7890', merchant: 'FedEx', status: 'Pending Review', dueDate: '2023-11-02' },
];

const PendingItemReview: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<PendingItemDetail | null>(null);
    const [memo, setMemo] = useState('');
    const [pdfData, setPdfData] = useState<string | null>(null);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        // Find the item based on the ID from the URL
        const foundItem = mockPendingItems.find(i => i.id === id);
        if (foundItem) {
            setItem(foundItem);
        } else {
            // Handle item not found (e.g., redirect or show error)
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Item not found.', life: 3000 });
        }
    }, [id]);

    const handleSubmit = () => {
        if (item) {
            toast.current?.show({ severity: 'success', summary: 'Success', detail: `Item ${item.id} processed successfully.`, life: 3000 });
            setTimeout(() => {
                navigate('/pending-items');
            }, 1000);
        }
    };

    const handleFileUpload = async (event: FileUploadHandlerEvent) => {
        const file = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setPdfData(base64String);
                toast.current?.show({ severity: 'info', summary: 'Document Loaded', detail: 'You can now view and redact the document.', life: 3000 });
            };
            reader.readAsDataURL(file);
        }
        event.options.clear();
    };

    const handleRedactionSave = (redactions: any[]) => {
        toast.current?.show({ 
            severity: 'success', 
            summary: 'Redactions Saved', 
            detail: `${redactions.length} regions have been flagged for secure masking.`,
            life: 3000 
        });
    };

    if (!item) {
        return (
            <div className="w-full max-w-7xl mx-auto p-4">
                <Toast ref={toast} />
                <div className="text-center text-500">Loading item details...</div>
            </div>
        );
    }

    const prioritySeverity = item.priority === 'High' ? 'danger' : item.priority === 'Medium' ? 'warning' : 'info';

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-column gap-4" style={{ minHeight: 'calc(100vh - 8rem)' }}>
            <Toast ref={toast} />
            
            <div className="flex align-items-center justify-content-between">
                <div className="flex align-items-center gap-3">
                    <Button icon="pi pi-arrow-left" text rounded severity="secondary" onClick={() => navigate('/pending-items')} aria-label="Back" />
                    <div>
                        <h1 className="text-2xl font-bold text-900 m-0 tracking-tight">Review Item: {item.id}</h1>
                        <p className="text-500 m-0 mt-1">Review details, attach documents, and submit your findings.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="Cancel" icon="pi pi-times" outlined severity="secondary" onClick={() => navigate('/pending-items')} />
                    <Button label="Submit Review" icon="pi pi-check" onClick={handleSubmit} />
                </div>
            </div>

            <div className="grid">
                <div className="col-12 lg:col-6">
                    <Card title="Item Details" className="shadow-1 border-round-xl h-full">
                        <div className="grid text-sm">
                            <div className="col-6 md:col-4 text-500 font-medium py-2 border-bottom-1 border-100">Item ID</div>
                            <div className="col-6 md:col-8 text-900 font-bold py-2 border-bottom-1 border-100">{item.id}</div>
                            
                            <div className="col-6 md:col-4 text-500 font-medium py-2 border-bottom-1 border-100">Description</div>
                            <div className="col-6 md:col-8 text-900 py-2 border-bottom-1 border-100">{item.description}</div>
                            
                            <div className="col-6 md:col-4 text-500 font-medium py-2 border-bottom-1 border-100">Customer Name</div>
                            <div className="col-6 md:col-8 text-900 py-2 border-bottom-1 border-100">{item.customerName}</div>
                            
                            <div className="col-6 md:col-4 text-500 font-medium py-2 border-bottom-1 border-100">Account Number</div>
                            <div className="col-6 md:col-8 text-900 font-mono py-2 border-bottom-1 border-100">{item.accountNumber}</div>
                            
                            <div className="col-6 md:col-4 text-500 font-medium py-2 border-bottom-1 border-100">Merchant</div>
                            <div className="col-6 md:col-8 text-900 py-2 border-bottom-1 border-100">{item.merchant}</div>
                            
                            <div className="col-6 md:col-4 text-500 font-medium py-2 border-bottom-1 border-100">Amount</div>
                            <div className="col-6 md:col-8 text-900 font-mono py-2 border-bottom-1 border-100">
                                {item.amount > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.amount) : '-'}
                            </div>
                            
                            <div className="col-6 md:col-4 text-500 font-medium py-2 border-bottom-1 border-100">Date Added</div>
                            <div className="col-6 md:col-8 text-900 py-2 border-bottom-1 border-100">{item.dateAdded}</div>
                            
                            <div className="col-6 md:col-4 text-500 font-medium py-2 border-bottom-1 border-100">Due Date</div>
                            <div className="col-6 md:col-8 text-900 py-2 border-bottom-1 border-100">{item.dueDate}</div>
                            
                            <div className="col-6 md:col-4 text-500 font-medium py-2 border-bottom-1 border-100">Priority</div>
                            <div className="col-6 md:col-8 text-900 py-2 border-bottom-1 border-100">
                                <Tag value={item.priority} severity={prioritySeverity} className="border-round-3xl" />
                            </div>
                            
                            <div className="col-6 md:col-4 text-500 font-medium py-2">Status</div>
                            <div className="col-6 md:col-8 text-900 py-2">
                                <Tag value={item.status} severity="info" className="border-round-3xl" />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 lg:col-6">
                    <Card title="Review Memo" className="shadow-1 border-round-xl h-full flex flex-column">
                        <InputTextarea 
                            id="memo" 
                            value={memo} 
                            onChange={(e) => setMemo(e.target.value)} 
                            rows={12} 
                            className="w-full flex-1" 
                            placeholder="Enter any additional notes, findings, or context here..." 
                        />
                    </Card>
                </div>
            </div>

            <Card title="Document Workspace" className="shadow-1 border-round-xl flex-1 flex flex-column overflow-hidden" style={{ minHeight: '600px' }}>
                {!pdfData ? (
                    <div className="flex flex-column align-items-center justify-content-center h-full py-6">
                        <i className="pi pi-file-pdf text-6xl text-300 mb-4"></i>
                        <h2 className="text-xl font-bold text-700 m-0 mb-2">No Document Attached</h2>
                        <p className="text-500 m-0 mb-4 text-center max-w-20rem">Upload a PDF document to view, redact, and attach it to this pending item.</p>
                        <FileUpload 
                            name="document" 
                            customUpload
                            uploadHandler={handleFileUpload}
                            accept="application/pdf" 
                            maxFileSize={10000000} 
                            emptyTemplate={<p className="m-0 text-500 text-center p-4">Drag and drop a PDF file here to upload.</p>} 
                            chooseLabel="Browse PDF" 
                            auto
                        />
                    </div>
                ) : (
                    <div className="flex-1 min-h-0 h-full relative" style={{ height: '600px' }}>
                        <Button 
                            icon="pi pi-times" 
                            rounded 
                            severity="danger" 
                            aria-label="Remove Document" 
                            className="absolute z-5 shadow-2" 
                            style={{ top: '1rem', right: '1rem' }}
                            onClick={() => setPdfData(null)}
                            tooltip="Remove Document"
                            tooltipOptions={{ position: 'left' }}
                        />
                        <EmbedPDF 
                            data={pdfData} 
                            fileName={`document_${item.id}.pdf`} 
                            onSave={handleRedactionSave}
                            className="border-round-xl border-1 border-200"
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PendingItemReview;
