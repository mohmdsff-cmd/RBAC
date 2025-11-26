
import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';

// Mock Data Types
interface Case {
  id: string;
  subject: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  date: string;
  status: string;
}

const ActiveCases: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Reusable Case List Component
  const CaseList = ({ status, subStatus }: { status: string, subStatus: string }) => {
    // Generate dummy data based on props to simulate different lists
    const data: Case[] = Array.from({ length: 5 }, (_, i) => ({
      id: `CS-${status.substring(0, 1)}-${subStatus.substring(0, 1)}-${100 + i}`,
      subject: `${status} Case Analysis ${i + 1}`,
      assignee: ['Officer K.', 'Det. Miller', 'Agent Smith'][i % 3],
      priority: i % 3 === 0 ? 'High' : i % 2 === 0 ? 'Medium' : 'Low',
      date: new Date().toLocaleDateString(),
      status: status
    }));

    const priorityTemplate = (rowData: Case) => {
      const color = rowData.priority === 'High' ? 'danger' : rowData.priority === 'Medium' ? 'warning' : 'success';
      return <Tag value={rowData.priority} severity={color} />;
    };

    const actionTemplate = () => (
      <Button icon="pi pi-search" rounded text severity="info" aria-label="View" />
    );

    return (
      <div className="pt-2">
        <DataTable value={data} stripedRows size="small" className="text-sm">
          <Column field="id" header="Case ID" sortable></Column>
          <Column field="subject" header="Subject"></Column>
          <Column field="assignee" header="Assignee"></Column>
          <Column field="date" header="Date" sortable></Column>
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
                    'rgba(59, 130, 246, 0.6)',  // Blue
                    'rgba(249, 115, 22, 0.6)',  // Orange
                    'rgba(239, 68, 68, 0.6)',   // Red
                    'rgba(34, 197, 94, 0.6)'    // Green
                ]
            }
        ]
    };
    const chartOptions = {
        plugins: { legend: { position: 'bottom' } }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <Card title="Case Distribution" className="shadow-sm">
                 <div className="flex justify-center">
                    <Chart type="doughnut" data={chartData} options={chartOptions} className="w-full md:w-[300px]" />
                 </div>
            </Card>
            <Card title="Performance Metrics" className="shadow-sm">
                 <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                        <span className="text-slate-600">Avg. Resolution Time</span>
                        <span className="font-bold text-slate-800">4.2 Days</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                        <span className="text-slate-600">Backlog Clearance</span>
                        <span className="font-bold text-green-600">+12%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                        <span className="text-slate-600">Error Rate</span>
                        <span className="font-bold text-red-500">2.1%</span>
                    </div>
                 </div>
            </Card>
        </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Active Case Management</h1>
        <p className="text-slate-500">Track and manage cases across different operational stages.</p>
      </div>

      <div className="card bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
            
            {/* Tab 1: Pending */}
            <TabPanel header="Pending" leftIcon="pi pi-clock mr-2">
                <div className="p-2">
                    <TabView>
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
                <div className="p-2">
                    <TabView>
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
                 <div className="p-2">
                    <TabView>
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
                <ReportView />
            </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default ActiveCases;
