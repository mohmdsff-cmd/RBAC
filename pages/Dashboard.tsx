import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { ImageUploader } from '../components/ImageUploader';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Mock Chart Data
  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
        {
            label: 'User Activity',
            data: [65, 59, 80, 81, 56, 55],
            fill: true,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.2)',
            tension: 0.4
        }
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
  };

  // Mock Table Data
  const products = [
    { id: '1000', code: 'f230fh0g', name: 'Bamboo Watch', category: 'Accessories', quantity: 24 },
    { id: '1001', code: 'nvklal43', name: 'Black Watch', category: 'Accessories', quantity: 61 },
    { id: '1002', code: 'zz21cz3c', name: 'Blue Band', category: 'Fitness', quantity: 2 },
    { id: '1003', code: '244wgerg', name: 'Blue T-Shirt', category: 'Clothing', quantity: 25 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-1 md:col-span-2">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-8 rounded-lg shadow-md mb-6">
          <h1 className="text-3xl font-bold mb-2">Hello, {user?.username}!</h1>
          <div className="flex items-center gap-2 mt-3">
            <span className="opacity-90">Your current roles:</span>
            <div className="flex gap-2 flex-wrap">
                {user?.roles.map(role => (
                    <Tag key={role} value={role} className="bg-white/20 text-white border-none" />
                ))}
            </div>
          </div>
        </div>
      </div>

      <Card title="Activity Overview" className="shadow-sm h-full">
        <Chart type="line" data={chartData} options={chartOptions} className="h-[300px]" />
      </Card>

      <Card title="Recent Items" className="shadow-sm h-full">
         <DataTable value={products} stripedRows showGridlines tableStyle={{ minWidth: '20rem' }}>
            <Column field="code" header="Code"></Column>
            <Column field="name" header="Name"></Column>
            <Column field="category" header="Category"></Column>
            <Column field="quantity" header="Qty"></Column>
        </DataTable>
      </Card>

      <div className="col-span-1">
        <Panel header="Quick Upload" toggleable>
          <p className="text-sm text-slate-500 mb-3">Upload documents or images directly to your personal storage.</p>
          <ImageUploader onUpload={(files) => console.log("Dashboard uploaded:", files)} />
        </Panel>
      </div>

      <div className="col-span-1">
        <Panel header="System Status" toggleable>
          <p className="m-0 text-slate-600">
            All systems are operational.
            {!user?.roles.includes('ADMIN' as any) && (
              <span className="block mt-2 text-orange-500 italic">
                <i className="pi pi-info-circle mr-1"></i>
                Note: You do not have access to the Admin Panel. Try logging in as an Administrator to see the difference.
              </span>
            )}
          </p>
        </Panel>
      </div>
    </div>
  );
};

export default Dashboard;