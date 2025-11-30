
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Messages } from 'primereact/messages';
import { Button } from 'primereact/button';
import { ImageUploader } from '../components/ImageUploader';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentTheme } = useSelector((state: RootState) => state.theme); // Listen for theme changes
  const msgs = useRef<Messages>(null);
  
  // State for chart options to force re-render on theme change
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    // Show a system notification on mount
    msgs.current?.show([
        { severity: 'info', summary: 'System Maintenance', detail: 'Scheduled maintenance this Sunday at 02:00 AM UTC.', sticky: true, closable: false },
        { severity: 'warn', summary: 'Policy Update', detail: 'New evidence handling protocols are effective immediately.', sticky: true }
    ]);
  }, []);

  // Update chart colors when theme changes
  useEffect(() => {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

      setChartOptions({
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: { labels: { color: textColor } }
        },
        scales: {
            x: { 
                ticks: { color: textColorSecondary }, 
                grid: { color: surfaceBorder } 
            },
            y: { 
                ticks: { color: textColorSecondary }, 
                grid: { color: surfaceBorder } 
            }
        }
      });
  }, [currentTheme]);

  // KPI Data
  const kpiData = [
      { title: 'Pending Cases', value: '12', icon: 'pi pi-briefcase', color: 'blue', subtext: '+2 from yesterday' },
      { title: 'Pending Docs', value: '5', icon: 'pi pi-file', color: 'orange', subtext: 'Requires review' },
      { title: 'System Errors', value: '3', icon: 'pi pi-exclamation-triangle', color: 'red', subtext: 'Attention needed' },
      { title: 'Processed Today', value: '48', icon: 'pi pi-check-circle', color: 'green', subtext: '98% efficiency' },
  ];

  // Mock Chart Data - Case Volume
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            label: 'New Cases',
            data: [28, 48, 40, 19, 86, 27, 90],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: '#3b82f6',
            fill: true,
            tension: 0.4
        },
        {
            label: 'Closed Cases',
            data: [12, 51, 62, 33, 21, 62, 45],
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            borderColor: '#22c55e',
            fill: true,
            tension: 0.4
        }
    ]
  };

  // Mock Table Data - Recent Cases
  const recentCases = [
    { id: 'CS-2023-001', type: 'Investigation', status: 'Active', assignee: 'Officer K.', priority: 'High' },
    { id: 'CS-2023-045', type: 'Forensics', status: 'Pending Doc', assignee: 'Lab Tech', priority: 'Medium' },
    { id: 'CS-2023-089', type: 'Court Order', status: 'Closed', assignee: 'Judge Dredd', priority: 'Low' },
    { id: 'CS-2023-112', type: 'Warrant', status: 'Error', assignee: 'System', priority: 'High' },
  ];

  const statusTemplate = (rowData: any) => {
      const severity = rowData.status === 'Active' ? 'success' : rowData.status === 'Error' ? 'danger' : rowData.status === 'Closed' ? 'info' : 'warning';
      return <Tag value={rowData.status} severity={severity} />;
  };

  return (
    <div className="grid">
      {/* Welcome & Notifications */}
      <div className="col-12">
          <Messages ref={msgs} className="mb-2" />
          <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4">
              <div>
                  <h1 className="text-3xl font-bold text-800 m-0">Dashboard Overview</h1>
                  <p className="text-500 m-0">Welcome back, {user?.username}. Here's what's happening today.</p>
              </div>
              <div className="text-right mt-2 md:mt-0">
                  <span className="block text-xl font-semibold text-primary">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
          </div>
      </div>

      {/* KPI Cards */}
      {kpiData.map((kpi, i) => (
          <div key={i} className="col-12 md:col-6 lg:col-3">
              <div className="surface-card shadow-1 p-3 border-round border-left-3 border-primary-500 h-full">
                  <div className="flex justify-content-between mb-3">
                      <div>
                          <span className="block text-500 font-medium mb-3">{kpi.title}</span>
                          <div className="text-900 font-medium text-xl">{kpi.value}</div>
                      </div>
                      <div className={`flex align-items-center justify-content-center bg-${kpi.color}-100 border-round`} style={{ width: '2.5rem', height: '2.5rem' }}>
                          <i className={`${kpi.icon} text-${kpi.color}-500 text-xl`} />
                      </div>
                  </div>
                  <span className={`text-${kpi.color}-500 font-medium`}>{kpi.subtext}</span>
              </div>
          </div>
      ))}

      {/* Charts & Graphs */}
      <div className="col-12 lg:col-8">
        <Card title="Case Volume Analytics" subTitle="Weekly intake vs closed cases" className="shadow-1 h-full">
            <Chart type="line" data={chartData} options={chartOptions} className="h-20rem" />
        </Card>
      </div>

      {/* Notifications Panel */}
      <div className="col-12 lg:col-4">
        <Panel header="Notifications" className="h-full">
            <div className="flex flex-column gap-3">
                <div className="flex align-items-center p-2 surface-hover border-round cursor-pointer transition-colors">
                    <i className="pi pi-envelope text-blue-500 mr-3 text-2xl"></i>
                    <div>
                        <span className="font-semibold block text-sm">New Message from Admin</span>
                        <span className="text-xs text-500">Just now</span>
                    </div>
                </div>
                <div className="flex align-items-center p-2 surface-hover border-round cursor-pointer transition-colors">
                    <i className="pi pi-file text-orange-500 mr-3 text-2xl"></i>
                    <div>
                        <span className="font-semibold block text-sm">Case #1024 Updated</span>
                        <span className="text-xs text-500">2 hours ago</span>
                    </div>
                </div>
                <div className="flex align-items-center p-2 surface-hover border-round cursor-pointer transition-colors">
                    <i className="pi pi-check-circle text-green-500 mr-3 text-2xl"></i>
                    <div>
                        <span className="font-semibold block text-sm">System Backup Complete</span>
                        <span className="text-xs text-500">5 hours ago</span>
                    </div>
                </div>
                <div className="flex align-items-center p-2 surface-hover border-round cursor-pointer transition-colors">
                    <i className="pi pi-exclamation-circle text-red-500 mr-3 text-2xl"></i>
                    <div>
                        <span className="font-semibold block text-sm">Failed Login Attempt</span>
                        <span className="text-xs text-500">Yesterday</span>
                    </div>
                </div>
                <div className="mt-2 text-center">
                    <Button label="View All" link size="small" />
                </div>
            </div>
        </Panel>
      </div>

      {/* Recent Cases Table */}
      <div className="col-12 md:col-6">
        <Card title="Recent Activity" className="shadow-1 h-full">
            <DataTable value={recentCases} stripedRows showGridlines size="small" className="text-sm">
                <Column field="id" header="ID"></Column>
                <Column field="type" header="Type"></Column>
                <Column field="assignee" header="Assignee"></Column>
                <Column field="status" header="Status" body={statusTemplate}></Column>
            </DataTable>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="col-12 md:col-6">
        <Panel header="Quick Upload Evidence" toggleable>
          <p className="text-sm text-500 mb-3">Securely upload documents or images directly to the vault.</p>
          <ImageUploader onUpload={(files) => console.log("Dashboard uploaded:", files)} />
        </Panel>
      </div>
    </div>
  );
};

export default Dashboard;
