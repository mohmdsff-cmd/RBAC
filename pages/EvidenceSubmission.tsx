
import React, { useState } from 'react';
import { UnifiedUpload } from '../components/UnifiedUpload';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

const EvidenceSubmission: React.FC = () => {
    const [caseId, setCaseId] = useState('');
    const [category, setCategory] = useState<string | null>(null);

    const categories = [
        { label: 'Cardholder Statement', value: 'statement' },
        { label: 'Merchant Receipt', value: 'receipt' },
        { label: 'Proof of Delivery', value: 'pod' },
        { label: 'Terms & Conditions', value: 'tnc' },
        { label: 'Refund Policy', value: 'refund_policy' }
    ];

    // Mock history data for the table
    const history = [
        { id: 'DOC-992', name: 'signed_receipt.pdf', type: 'Merchant Receipt', date: '2023-11-15', status: 'Processed' },
        { id: 'DOC-991', name: 'delivery_photo.jpg', type: 'Proof of Delivery', date: '2023-11-14', status: 'Pending' },
        { id: 'DOC-988', name: 'email_chain.msg', type: 'Correspondence', date: '2023-11-12', status: 'Flagged' },
    ];

    const getStatusSeverity = (status: string) => {
        switch(status) {
            case 'Processed': return 'success';
            case 'Pending': return 'warning';
            case 'Flagged': return 'danger';
            default: return 'info';
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-column gap-4">
             <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-900 m-0">Evidence Locker</h1>
                    <p className="text-500 m-0 mt-1">Securely attach supporting documentation to active dispute cases.</p>
                </div>
            </div>

            <div className="grid">
                {/* Left Column: Context Form */}
                <div className="col-12 lg:col-4 flex flex-column">
                    <div className="surface-card border-round-xl shadow-1 border-1 border-200 overflow-hidden h-full flex flex-column">
                        <div className="p-4 border-bottom-1 border-100 surface-50">
                            <h2 className="m-0 text-lg font-bold text-900">Case Details</h2>
                        </div>
                        <div className="p-4 flex flex-column gap-4 flex-1">
                            <div className="flex flex-column gap-2">
                                <label htmlFor="caseId" className="text-sm font-semibold text-700">Case Reference ID</label>
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-hashtag" />
                                    <InputText 
                                        id="caseId" 
                                        value={caseId} 
                                        onChange={(e) => setCaseId(e.target.value)} 
                                        placeholder="e.g. CB-2023-8842" 
                                        className="w-full p-inputtext-sm font-mono"
                                    />
                                </span>
                                <small className="text-500 text-xs">Enter the system ID generated during intake.</small>
                            </div>

                            <div className="flex flex-column gap-2">
                                <label htmlFor="category" className="text-sm font-semibold text-700">Evidence Category</label>
                                <Dropdown 
                                    id="category" 
                                    value={category} 
                                    options={categories} 
                                    onChange={(e) => setCategory(e.value)} 
                                    placeholder="Select Category" 
                                    className="w-full p-inputtext-sm"
                                    showClear
                                />
                            </div>

                            <div className="bg-indigo-50 p-4 border-round-xl border-1 border-indigo-100 mt-auto">
                                <div className="flex align-items-center gap-2 mb-3">
                                    <div className="w-2rem h-2rem bg-indigo-100 text-indigo-600 border-round-lg flex align-items-center justify-content-center">
                                        <i className="pi pi-shield text-sm"></i>
                                    </div>
                                    <span className="font-bold text-indigo-900 text-sm">Secure Transfer</span>
                                </div>
                                <p className="text-xs text-indigo-700 m-0 line-height-3">
                                    Files uploaded via this portal are automatically encrypted (AES-256) and tagged with the Case ID. 
                                    Ensure no unredacted PII is included in public metadata fields.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Upload Component */}
                <div className="col-12 lg:col-8 flex flex-column gap-4">
                    {/* Reuse UnifiedUpload with Type 2 (Secure) configuration */}
                    <div className="surface-card border-round-xl shadow-1 border-1 border-200 overflow-hidden p-4">
                        <UnifiedUpload 
                            uploadType={2} 
                            accept=".pdf,.png,.jpg,.jpeg,.tiff"
                            maxFileSize={15000000} // 15MB for evidence
                        />
                    </div>

                    {/* Bottom Row: Recent Submissions */}
                    <div className="surface-card border-round-xl shadow-1 border-1 border-200 overflow-hidden">
                        <div className="p-4 border-bottom-1 border-100 surface-50 flex justify-content-between align-items-center">
                            <h2 className="m-0 text-lg font-bold text-900">Recent Submissions</h2>
                        </div>
                        <div className="p-0">
                            <DataTable value={history} stripedRows size="small" className="text-sm align-items-center border-none" rowHover>
                                <Column field="id" header="Document ID" className="font-mono text-500 text-xs" style={{ width: '15%' }}></Column>
                                <Column field="name" header="File Name" body={(r) => <span className="font-semibold text-900">{r.name}</span>} style={{ width: '30%' }}></Column>
                                <Column field="type" header="Category" className="text-600" style={{ width: '25%' }}></Column>
                                <Column field="date" header="Date Uploaded" className="text-500 text-xs" style={{ width: '15%' }}></Column>
                                <Column field="status" header="Status" body={(r) => <Tag value={r.status} severity={getStatusSeverity(r.status)} className="px-3 py-1 border-round-3xl font-medium text-xs" />} style={{ width: '15%' }}></Column>
                            </DataTable>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvidenceSubmission;
