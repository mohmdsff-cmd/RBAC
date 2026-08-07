
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { AdvancedSearch } from '../components/AdvancedSearch';
import { searchActiveCases, SearchCriteria } from '../services/mockApi';
import { SecureAccountNumber } from '../components/SecureAccountNumber';

// Mock Data Types
interface Case {
  id: string;
  subject: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  date: string;
  status: string;
  amount?: number;
  encryptedAccountNumber?: string;
}

const ActiveCases: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<Case[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (criteria: SearchCriteria) => {
    // If criteria are empty, clear search
    if (!criteria.term && !criteria.amount && !criteria.cardNumber) {
        setSearchResults(null);
        setIsSearching(false);
        return;
    }

    setSearchLoading(true);
    try {
        const results = await searchActiveCases(criteria);
        setSearchResults(results);
        setIsSearching(true);
    } catch (e) {
        console.error(e);
    } finally {
        setSearchLoading(false);
    }
  };

  const actionTemplate = (rowData: Case) => (
    <Button icon="pi pi-search" rounded text severity="info" aria-label="View" className="w-8 h-8 p-0" onClick={() => navigate(`/case/${rowData.id}`)} />
  );

  const priorityTemplate = (rowData: Case) => {
    const color = rowData.priority === 'High' ? 'danger' : rowData.priority === 'Medium' ? 'warning' : 'success';
    return <Tag value={rowData.priority} severity={color} className="px-3 py-1 border-round-3xl font-medium tracking-wide text-xs" />;
  };

  const amountTemplate = (rowData: Case) => {
      return rowData.amount ? 
        <span className="font-mono font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rowData.amount)}</span> 
        : <span className="text-400">-</span>;
  };

  const secureCardTemplate = (rowData: Case) => {
      return (
          <SecureAccountNumber 
            encryptedAccountNumber={rowData.encryptedAccountNumber || ''}
            className="w-full"
          />
      );
  };

  // Reusable Case List Component
  const CaseList = ({ status, subStatus }: { status: string, subStatus: string }) => {
    // Generate dummy data based on props to simulate different lists
    const data: Case[] = Array.from({ length: 5 }, (_, i) => ({
      id: `CS-${status.substring(0, 1)}-${subStatus.substring(0, 1)}-${100 + i}`,
      subject: `${status} Case Analysis ${i + 1}`,
      assignee: ['Officer K.', 'Det. Miller', 'Agent Smith'][i % 3],
      priority: i % 3 === 0 ? 'High' : i % 2 === 0 ? 'Medium' : 'Low',
      date: new Date().toLocaleDateString(),
      status: status,
      amount: Math.floor(Math.random() * 5000),
      encryptedAccountNumber: `411111${Math.floor(100000 + Math.random() * 900000)}200${i}` // 16-digit token
    }));

    return (
      <div className="pt-4">
        <DataTable value={data} stripedRows size="small" className="text-sm align-middle border-1 border-100 border-round-xl overflow-hidden" rowHover>
          <Column field="id" header="Case ID" sortable className="font-mono text-600"></Column>
          <Column field="subject" header="Subject" className="font-medium text-900"></Column>
          <Column field="assignee" header="Assignee" className="text-600"></Column>
          <Column field="date" header="Date" sortable className="text-500"></Column>
          <Column field="amount" header="Amount" body={amountTemplate} sortable></Column>
          <Column field="encryptedAccountNumber" header="Account Number" body={secureCardTemplate} style={{ minWidth: '16rem' }}></Column>
          <Column field="priority" header="Priority" body={priorityTemplate} sortable></Column>
          <Column body={actionTemplate} style={{ width: '4rem' }}></Column>
        </DataTable>
      </div>
    );
  };

  // Content for the Report Tab
  const ReportView = () => {
    const chartData = {
        labels: ['Pending', 'Returned', 'Error', 'Completed'],
        datasets: [
            {
                data: [540, 325, 102, 702],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',  // Blue
                    'rgba(249, 115, 22, 0.8)',  // Orange
                    'rgba(239, 68, 68, 0.8)',   // Red
                    'rgba(16, 185, 129, 0.8)'    // Emerald
                ],
                borderWidth: 0
            }
        ]
    };
    const chartOptions = {
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } },
        cutout: '70%'
    };

    return (
        <div className="grid pt-4" style={{ rowGap: '1.5rem' }}>
            <div className="col-12 md:col-6">
                <div className="surface-0 border-round-2xl shadow-1 border-1 border-200 p-6 flex flex-column h-full">
                    <h3 className="text-lg font-bold text-900 mb-6 m-0">Case Distribution</h3>
                    <div className="flex justify-content-center flex-1 align-items-center" style={{ minHeight: '300px' }}>
                        <Chart type="doughnut" data={chartData} options={chartOptions} className="w-full" style={{ maxWidth: '300px' }} />
                    </div>
                </div>
            </div>
            <div className="col-12 md:col-6">
                <div className="surface-0 border-round-2xl shadow-1 border-1 border-200 p-6 flex flex-column h-full">
                    <h3 className="text-lg font-bold text-900 mb-6 m-0">Performance Metrics</h3>
                    <div className="flex flex-column gap-4">
                        <div className="flex justify-content-between align-items-center p-4 surface-50 border-round-xl border-1 border-100">
                            <span className="text-600 font-medium">Avg. Resolution Time</span>
                            <span className="font-bold text-900 text-lg">4.2 Days</span>
                        </div>
                        <div className="flex justify-content-between align-items-center p-4 surface-50 border-round-xl border-1 border-100">
                            <span className="text-600 font-medium">Backlog Clearance</span>
                            <span className="font-bold text-green-600 text-lg flex align-items-center gap-1"><i className="pi pi-arrow-up text-sm"></i> 12%</span>
                        </div>
                        <div className="flex justify-content-between align-items-center p-4 surface-50 border-round-xl border-1 border-100">
                            <span className="text-600 font-medium">Error Rate</span>
                            <span className="font-bold text-red-500 text-lg">2.1%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-column gap-6">
      <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-900 m-0 tracking-tight">Active Case Management</h1>
          <p className="text-500 m-0 mt-1">Track and manage cases across different operational stages.</p>
        </div>
      </div>

      <div className="surface-0 border-round-2xl shadow-1 border-1 border-200 p-6">
          <AdvancedSearch 
            onSearch={handleSearch} 
            loading={searchLoading} 
            layout="vertical" 
            contextLabel="Filter Cases"
          />
      </div>

      {isSearching ? (
         <div className="surface-0 border-round-2xl shadow-1 border-1 border-200 overflow-hidden">
            <div className="p-6 border-bottom-1 border-100 flex justify-content-between align-items-center bg-blue-50" style={{ backgroundColor: 'rgba(239, 246, 255, 0.3)' }}>
                <div className="flex align-items-center gap-3">
                    <div className="w-2rem h-2rem bg-blue-100 text-blue-600 border-round-xl flex align-items-center justify-content-center" style={{ width: '2.5rem', height: '2.5rem' }}>
                        <i className="pi pi-search text-xl"></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-900 m-0">Search Results</h2>
                        <span className="text-sm text-500">Found {searchResults?.length || 0} matching records.</span>
                    </div>
                </div>
                <Button label="Clear Search" icon="pi pi-times" text severity="secondary" onClick={() => { setIsSearching(false); setSearchResults(null); }} className="hover:surface-hover" />
            </div>
            <div className="p-6">
                <DataTable value={searchResults || []} stripedRows size="small" className="text-sm align-middle border-1 border-100 border-round-xl overflow-hidden" rowHover>
                    <Column field="id" header="Case ID" sortable className="font-mono text-600"></Column>
                    <Column field="subject" header="Subject" className="font-medium text-900"></Column>
                    <Column field="assignee" header="Assignee" className="text-600"></Column>
                    <Column field="status" header="Current Status" body={(r) => <Tag value={r.status} severity="info" className="px-3 py-1 border-round-3xl font-medium tracking-wide text-xs" />}></Column>
                    <Column field="amount" header="Amount" body={amountTemplate} sortable></Column>
                    <Column field="encryptedAccountNumber" header="Account Number" body={secureCardTemplate} style={{ minWidth: '16rem' }}></Column>
                    <Column field="priority" header="Priority" body={priorityTemplate} sortable></Column>
                    <Column body={actionTemplate} style={{ width: '4rem' }}></Column>
                </DataTable>
            </div>
         </div>
      ) : (
        <div className="surface-0 border-round-2xl shadow-1 border-1 border-200 overflow-hidden">
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} className="custom-tabview">
                
                {/* Tab 1: Pending */}
                <TabPanel header="Pending" leftIcon="pi pi-clock mr-2">
                    <div className="p-4">
                        <TabView className="sub-tabview">
                            <TabPanel header="Workable">
                                <CaseList status="Pending" subStatus="Workable" />
                            </TabPanel>
                            <TabPanel header="In Progress">
                                <CaseList status="Pending" subStatus="InProgress" />
                            </TabPanel>
                        </TabView>
                    </div>
                </TabPanel>

                {/* Tab 2: Returned */}
                <TabPanel header="Returned" leftIcon="pi pi-replay mr-2">
                    <div className="p-4">
                        <TabView className="sub-tabview">
                            <TabPanel header="Workable">
                                <CaseList status="Returned" subStatus="Workable" />
                            </TabPanel>
                            <TabPanel header="In Progress">
                                <CaseList status="Returned" subStatus="InProgress" />
                            </TabPanel>
                        </TabView>
                    </div>
                </TabPanel>

                {/* Tab 3: Error */}
                <TabPanel header="Error" leftIcon="pi pi-exclamation-triangle mr-2">
                    <div className="p-4">
                        <TabView className="sub-tabview">
                            <TabPanel header="Workable">
                                <CaseList status="Error" subStatus="Workable" />
                            </TabPanel>
                            <TabPanel header="In Progress">
                                <CaseList status="Error" subStatus="InProgress" />
                            </TabPanel>
                        </TabView>
                    </div>
                </TabPanel>

                {/* Tab 4: Report */}
                <TabPanel header="Reports" leftIcon="pi pi-chart-pie mr-2">
                    <div className="p-4">
                        <ReportView />
                    </div>
                </TabPanel>
            </TabView>
        </div>
      )}
    </div>
  );
};

export default ActiveCases;
