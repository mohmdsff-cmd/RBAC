import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputTextarea } from 'primereact/inputtextarea';
import { UnifiedUpload } from '../components/UnifiedUpload';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const CaseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [memo, setMemo] = useState('');
    const [memos, setMemos] = useState<{ id: number, text: string, date: string, author: string }[]>([
        { id: 1, text: 'Initial review completed. Awaiting merchant response.', date: '2023-11-10 10:00 AM', author: 'Agent Smith' }
    ]);

    const handleAddMemo = () => {
        if (!memo.trim()) return;
        setMemos([{
            id: Date.now(),
            text: memo,
            date: new Date().toLocaleString(),
            author: 'Current User'
        }, ...memos]);
        setMemo('');
    };

    // Mock case data
    const caseData = {
        id: id || 'CB-2023-8842',
        subject: 'Unauthorized Transaction',
        assignee: 'Agent Smith',
        status: 'In Progress',
        priority: 'High',
        date: '2023-11-08',
        amount: 1250.00,
        merchant: 'ACME Corp',
        description: 'Cardholder claims they did not authorize the transaction of $1250.00 at ACME Corp on Nov 8th. Card was in their possession.'
    };

    const documents = [
        { id: 'DOC-1', name: 'statement.pdf', type: 'Statement', date: '2023-11-09' }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-column gap-4">
            {/* Header */}
            <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-4 surface-card p-4 border-round-2xl shadow-1 border-1 border-200">
                <div className="flex align-items-center gap-4">
                    <Button icon="pi pi-arrow-left" text rounded severity="secondary" onClick={() => navigate(-1)} className="w-3rem h-3rem p-0 hover:surface-hover" />
                    <div>
                        <div className="flex align-items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-900 m-0">Case {caseData.id}</h1>
                            <Tag value={caseData.status} severity="info" className="px-3 py-1 border-round-3xl font-medium text-xs" />
                            <Tag value={caseData.priority} severity="danger" className="px-3 py-1 border-round-3xl font-medium text-xs" />
                        </div>
                        <p className="text-500 m-0 text-sm">{caseData.subject}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button label="Resolve Case" icon="pi pi-check" severity="success" className="border-round-xl px-4" />
                    <Button label="Escalate" icon="pi pi-exclamation-triangle" severity="warning" className="border-round-xl px-4" />
                </div>
            </div>

            <div className="grid">
                {/* Left Column: Case Info */}
                <div className="col-12 lg:col-4 flex flex-column gap-4">
                    <div className="surface-card border-round-2xl shadow-1 border-1 border-200 p-4">
                        <h2 className="text-lg font-bold text-900 mb-4 m-0">Case Information</h2>
                        <div className="flex flex-column gap-4">
                            <div>
                                <span className="block text-xs font-bold text-500 uppercase mb-1">Merchant</span>
                                <span className="font-semibold text-900">{caseData.merchant}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-500 uppercase mb-1">Disputed Amount</span>
                                <span className="font-mono font-semibold text-900 text-lg">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(caseData.amount)}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-500 uppercase mb-1">Date Filed</span>
                                <span className="font-semibold text-900">{caseData.date}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-500 uppercase mb-1">Assigned To</span>
                                <div className="flex align-items-center gap-2 mt-1">
                                    <div className="w-2rem h-2rem border-round-full bg-indigo-100 text-indigo-600 flex align-items-center justify-content-center text-xs font-bold">
                                        {caseData.assignee.charAt(0)}
                                    </div>
                                    <span className="font-semibold text-900">{caseData.assignee}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-top-1 border-100">
                                <span className="block text-xs font-bold text-500 uppercase mb-2">Description</span>
                                <p className="text-sm text-700 line-height-3 m-0">{caseData.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Memos & Documents */}
                <div className="col-12 lg:col-8 flex flex-column gap-4">
                    {/* Memos Section */}
                    <div className="surface-card border-round-2xl shadow-1 border-1 border-200 p-4">
                        <h2 className="text-lg font-bold text-900 mb-4 m-0">Case Memos</h2>
                        
                        <div className="flex flex-column gap-3 mb-4">
                            <InputTextarea 
                                value={memo} 
                                onChange={(e) => setMemo(e.target.value)} 
                                rows={3} 
                                placeholder="Add a new memo or note..." 
                                className="w-full border-round-xl p-3 text-sm"
                            />
                            <div className="flex justify-content-end">
                                <Button label="Add Memo" icon="pi pi-plus" onClick={handleAddMemo} disabled={!memo.trim()} className="border-round-xl px-4 py-2 text-sm" />
                            </div>
                        </div>

                        <div className="flex flex-column gap-3">
                            {memos.map(m => (
                                <div key={m.id} className="surface-ground border-round-xl p-3 border-1 border-100">
                                    <div className="flex justify-content-between align-items-center mb-2">
                                        <div className="flex align-items-center gap-2">
                                            <div className="w-2rem h-2rem border-round-full surface-300 text-600 flex align-items-center justify-content-center text-xs font-bold">
                                                {m.author.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-900 text-sm">{m.author}</span>
                                        </div>
                                        <span className="text-xs font-medium text-500">{m.date}</span>
                                    </div>
                                    <p className="text-sm text-700 m-0 line-height-3 pl-5">{m.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div className="surface-card border-round-2xl shadow-1 border-1 border-200 p-4">
                        <h2 className="text-lg font-bold text-900 mb-4 m-0">Documents</h2>
                        <div className="mb-4">
                            <UnifiedUpload uploadType={2} accept=".pdf,.png,.jpg" maxFileSize={15000000} />
                        </div>
                        
                        <h3 className="text-xs font-bold text-500 mb-3 uppercase">Attached Files</h3>
                        <DataTable value={documents} size="small" className="text-sm border-1 border-100 border-round-xl overflow-hidden" rowHover>
                            <Column field="name" header="File Name" className="font-medium text-900"></Column>
                            <Column field="type" header="Type" className="text-600"></Column>
                            <Column field="date" header="Date Added" className="text-500"></Column>
                            <Column body={() => <Button icon="pi pi-download" text rounded severity="secondary" className="w-2rem h-2rem p-0 hover:surface-hover" />} style={{ width: '4rem' }}></Column>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseDetail;
