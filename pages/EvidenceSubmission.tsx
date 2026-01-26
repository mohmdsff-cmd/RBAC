
import React, { useState } from 'react';
import { UnifiedUpload } from '../components/UnifiedUpload';
import { Card } from 'primereact/card';
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
        <div className="w-full max-w-6xl mx-auto mt-4">
             <div className="mb-4">
                <h1 className="text-3xl font-bold text-800 m-0">Evidence Locker</h1>
                <p className="text-500 m-0 mt-2">Securely attach supporting documentation to active dispute cases.</p>
            </div>

            <div className="grid">
                {/* Left Column: Context Form */}
                <div className="col-12 lg:col-4">
                    <Card title="Case Details" className="shadow-1 h-full">
                        <div className="flex flex-column gap-4">
                            <div className="flex flex-column gap-2">
                                <label htmlFor="caseId" className="font-medium text-700">Case Reference ID</label>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-hashtag" />
                                    <InputText 
                                        id="caseId" 
                                        value={caseId} 
                                        onChange={(e) => setCaseId(e.target.value)} 
                                        placeholder="e.g. CB-2023-8842" 
                                        className="w-full"
                                    />
                                </span>
                                <small className="text-500">Enter the system ID generated during intake.</small>
                            </div>

                            <div className="flex flex-column gap-2">
                                <label htmlFor="category" className="font-medium text-700">Evidence Category</label>
                                <Dropdown 
                                    id="category" 
                                    value={category} 
                                    options={categories} 
                                    onChange={(e) => setCategory(e.value)} 
                                    placeholder="Select Category" 
                                    className="w-full"
                                    showClear
                                />
                            </div>

                            <div className="bg-blue-50 p-3 border-round border-1 border-blue-200 mt-2">
                                <div className="flex align-items-center gap-2 mb-2">
                                    <i className="pi pi-shield text-blue-600"></i>
                                    <span className="font-bold text-blue-800">Secure Transfer</span>
                                </div>
                                <p className="text-sm text-blue-700 m-0 line-height-3">
                                    Files uploaded via this portal are automatically encrypted (AES-256) and tagged with the Case ID. 
                                    Ensure no unredacted PII is included in public metadata fields.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Upload Component */}
                <div className="col-12 lg:col-8">
                    {/* Reuse UnifiedUpload with Type 2 (Secure) configuration */}
                    <UnifiedUpload 
                        uploadType={2} 
                        accept=".pdf,.png,.jpg,.jpeg,.tiff"
                        maxFileSize={15000000} // 15MB for evidence
                    />
                </div>

                {/* Bottom Row: Recent Submissions */}
                <div className="col-12 mt-4">
                    <Card title="Recent Submissions" className="shadow-1">
                        <DataTable value={history} stripedRows size="small" tableStyle={{ minWidth: '50rem' }}>
                            <Column field="id" header="Document ID" style={{ width: '15%' }}></Column>
                            <Column field="name" header="File Name" body={(r) => <span className="font-medium text-900">{r.name}</span>} style={{ width: '30%' }}></Column>
                            <Column field="type" header="Category" style={{ width: '25%' }}></Column>
                            <Column field="date" header="Date Uploaded" style={{ width: '15%' }}></Column>
                            <Column field="status" header="Status" body={(r) => <Tag value={r.status} severity={getStatusSeverity(r.status)} />} style={{ width: '15%' }}></Column>
                        </DataTable>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EvidenceSubmission;
