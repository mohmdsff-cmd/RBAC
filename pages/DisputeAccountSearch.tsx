
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Timeline } from 'primereact/timeline';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { searchDisputeAccount, DisputeAccount, AccountHistory } from '../services/mockApi';
import { Message } from 'primereact/message';
import { Badge } from 'primereact/badge';

const DisputeAccountSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [account, setAccount] = useState<DisputeAccount | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setAccount(null);

        try {
            const result = await searchDisputeAccount(query);
            if (result) {
                setAccount(result);
            } else {
                setError('No dispute account found matching this ID.');
            }
        } catch (err) {
            setError('An error occurred during search.');
        } finally {
            setLoading(false);
        }
    };

    const customizeMarker = (item: AccountHistory) => {
        return (
            <span className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1" style={{ backgroundColor: item.status === 'New' ? '#3B82F6' : '#10B981' }}>
                <i className={`pi ${item.status === 'New' ? 'pi-plus' : 'pi-check'}`}></i>
            </span>
        );
    };

    const getRiskSeverity = (score: number) => {
        if (score > 80) return 'danger';
        if (score > 50) return 'warning';
        return 'success';
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-2">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-900 m-0">Dispute Account Lookup</h1>
                <p className="text-500 m-0 mt-2">Search for specific dispute records to view full history and evidence.</p>
            </div>

            <Card className="shadow-2 mb-5 border-round-xl">
                <form onSubmit={handleSearch} className="flex flex-column md:flex-row gap-3 align-items-end">
                    <div className="flex-grow-1 w-full">
                        <label htmlFor="search" className="block text-900 font-medium mb-2">Account or Dispute ID</label>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search" />
                            <InputText 
                                id="search" 
                                value={query} 
                                onChange={(e) => setQuery(e.target.value)} 
                                placeholder="e.g. DSP-8842 or ACC-1029" 
                                className="w-full" 
                            />
                        </span>
                    </div>
                    <Button label="Search" icon="pi pi-search" loading={loading} type="submit" className="w-full md:w-auto" />
                </form>
                {error && <Message severity="error" text={error} className="mt-3 w-full" />}
            </Card>

            {account && (
                <div className="grid animate-duration-500 fadein">
                    {/* Header Summary */}
                    <div className="col-12 mb-2">
                        <div className="surface-card p-4 border-round-xl shadow-2 border-left-3 border-blue-500 flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center">
                            <div>
                                <div className="flex align-items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-900 m-0">{account.disputeId}</h2>
                                    <Tag value={account.currentStatus} severity="info" className="text-sm px-3" />
                                </div>
                                <span className="text-600 font-medium text-lg">{account.customerName}</span>
                            </div>
                            <div className="flex flex-column align-items-end mt-3 md:mt-0 gap-2">
                                <span className="text-500 text-sm font-medium">Risk Score</span>
                                <div className="flex align-items-center gap-2">
                                    <Badge value={account.riskScore} severity={getRiskSeverity(account.riskScore)} size="xlarge"></Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Left Column: Details & Documents */}
                    <div className="col-12 lg:col-5">
                        <div className="flex flex-column gap-4">
                            {/* Detailed Data */}
                            <Card title="Account Details" className="shadow-2 border-round-xl h-full">
                                <ul className="list-none p-0 m-0">
                                    <li className="flex align-items-center py-3 px-2 border-top-1 border-bottom-1 border-100 flex-wrap">
                                        <div className="text-500 w-6 md:w-4 font-medium">Account ID</div>
                                        <div className="text-900 w-full md:w-8 md:flex-none">{account.accountId}</div>
                                    </li>
                                    <li className="flex align-items-center py-3 px-2 border-bottom-1 border-100 flex-wrap">
                                        <div className="text-500 w-6 md:w-4 font-medium">Email</div>
                                        <div className="text-900 w-full md:w-8 md:flex-none text-break">{account.email}</div>
                                    </li>
                                    <li className="flex align-items-center py-3 px-2 border-bottom-1 border-100 flex-wrap">
                                        <div className="text-500 w-6 md:w-4 font-medium">Phone</div>
                                        <div className="text-900 w-full md:w-8 md:flex-none">{account.phone}</div>
                                    </li>
                                    <li className="flex align-items-center py-3 px-2 border-bottom-1 border-100 flex-wrap">
                                        <div className="text-500 w-6 md:w-4 font-medium">Merchant</div>
                                        <div className="text-900 w-full md:w-8 md:flex-none font-bold">{account.merchant}</div>
                                    </li>
                                    <li className="flex align-items-center py-3 px-2 border-bottom-1 border-100 flex-wrap">
                                        <div className="text-500 w-6 md:w-4 font-medium">Amount</div>
                                        <div className="text-900 w-full md:w-8 md:flex-none font-bold">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(account.transactionAmount)}
                                        </div>
                                    </li>
                                </ul>
                            </Card>

                            {/* Documents */}
                            <Card title="Documents" className="shadow-2 border-round-xl">
                                {account.documents.length > 0 ? (
                                    <ul className="list-none p-0 m-0">
                                        {account.documents.map((doc) => (
                                            <li key={doc.id} className="flex align-items-center py-3 px-2 border-bottom-1 border-100 hover:surface-50 transition-colors cursor-pointer">
                                                <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                                                    <i className="pi pi-file text-blue-600 text-xl" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-900 mb-1">{doc.name}</div>
                                                    <div className="text-500 text-sm">{doc.type} • {doc.size} • {doc.date}</div>
                                                </div>
                                                <Button icon="pi pi-download" rounded text severity="secondary" aria-label="Download" />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center p-4 text-500 font-italic">No documents uploaded.</div>
                                )}
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: History & Notes */}
                    <div className="col-12 lg:col-7">
                        <div className="flex flex-column gap-4">
                             {/* Status History */}
                             <Card title="Status History" className="shadow-2 border-round-xl">
                                <Timeline 
                                    value={account.history} 
                                    align="alternate" 
                                    className="customized-timeline" 
                                    marker={customizeMarker} 
                                    content={(item) => (
                                        <Card className="mb-3 shadow-none border-1 border-200 surface-50">
                                            <div className="flex flex-column gap-1">
                                                <span className="font-bold text-900">{item.status}</span>
                                                <span className="text-500 text-sm">{item.date} by {item.user}</span>
                                                <p className="m-0 mt-2 text-700 line-height-3">{item.description}</p>
                                            </div>
                                        </Card>
                                    )} 
                                />
                            </Card>

                             {/* Case Notes */}
                             <Card title="Case Notes" className="shadow-2 border-round-xl">
                                <DataTable value={account.notes} paginator rows={5} className="text-sm">
                                    <Column field="date" header="Date" style={{ width: '25%' }}></Column>
                                    <Column field="author" header="Author" style={{ width: '25%' }}></Column>
                                    <Column field="note" header="Note" style={{ width: '50%' }}></Column>
                                </DataTable>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisputeAccountSearch;
