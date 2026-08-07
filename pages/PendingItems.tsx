import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';

interface PendingItem {
    id: string;
    description: string;
    dateAdded: string;
    priority: 'High' | 'Medium' | 'Low';
    amount: number;
}

const mockPendingItems: PendingItem[] = [
    { id: 'PI-1001', description: 'Missing receipt for travel expense', dateAdded: '2023-10-25', priority: 'High', amount: 450.00 },
    { id: 'PI-1002', description: 'Additional evidence required for dispute', dateAdded: '2023-10-26', priority: 'Medium', amount: 120.50 },
    { id: 'PI-1003', description: 'Customer signature missing on form', dateAdded: '2023-10-27', priority: 'Low', amount: 0.00 },
    { id: 'PI-1004', description: 'Invoice mismatch with PO', dateAdded: '2023-10-28', priority: 'High', amount: 3200.00 },
    { id: 'PI-1005', description: 'Proof of delivery needed', dateAdded: '2023-10-29', priority: 'Medium', amount: 85.00 },
];

const PendingItems: React.FC = () => {
    const [items, setItems] = useState<PendingItem[]>(mockPendingItems);
    const navigate = useNavigate();
    const toast = React.useRef<Toast>(null);

    const openReviewPage = (item: PendingItem) => {
        navigate(`/pending-items/${item.id}`);
    };

    const priorityTemplate = (rowData: PendingItem) => {
        const severity = rowData.priority === 'High' ? 'danger' : rowData.priority === 'Medium' ? 'warning' : 'info';
        return <Tag value={rowData.priority} severity={severity} className="px-3 py-1 border-round-3xl font-medium tracking-wide text-xs" />;
    };

    const amountTemplate = (rowData: PendingItem) => {
        return rowData.amount > 0 ? 
            <span className="font-mono font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rowData.amount)}</span> 
            : <span className="text-400">-</span>;
    };

    const actionTemplate = (rowData: PendingItem) => {
        return (
            <Button label="Review" icon="pi pi-search" size="small" outlined onClick={() => openReviewPage(rowData)} />
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-column gap-6">
            <Toast ref={toast} />
            <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-900 m-0 tracking-tight">Pending Items</h1>
                    <p className="text-500 m-0 mt-1">Review pending items, attach required documents, and add memos.</p>
                </div>
            </div>

            <div className="surface-0 border-round-2xl shadow-1 border-1 border-200 overflow-hidden p-4">
                <DataTable value={items} paginator rows={10} stripedRows size="small" className="text-sm align-middle border-1 border-100 border-round-xl overflow-hidden" rowHover emptyMessage="No pending items found.">
                    <Column field="id" header="Item ID" sortable className="font-mono text-600" style={{ width: '15%' }}></Column>
                    <Column field="description" header="Description" className="font-medium text-900" style={{ width: '35%' }}></Column>
                    <Column field="dateAdded" header="Date Added" sortable className="text-500" style={{ width: '15%' }}></Column>
                    <Column field="amount" header="Amount" body={amountTemplate} sortable style={{ width: '15%' }}></Column>
                    <Column field="priority" header="Priority" body={priorityTemplate} sortable style={{ width: '10%' }}></Column>
                    <Column body={actionTemplate} style={{ width: '10%', textAlign: 'center' }}></Column>
                </DataTable>
            </div>
        </div>
    );
};

export default PendingItems;
