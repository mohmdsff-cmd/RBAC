
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { markAsRead, Notification } from '../slices/notificationSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';

const NotificationsPage: React.FC = () => {
  const { items } = useSelector((state: RootState) => state.notifications);
  const dispatch = useDispatch<AppDispatch>();
  const [globalFilter, setGlobalFilter] = useState('');

  const typeBodyTemplate = (rowData: Notification) => {
    const severityMap: Record<string, "info" | "success" | "warn" | "danger"> = {
      info: 'info',
      success: 'success',
      warn: 'warn',
      error: 'danger'
    };
    return <Tag value={rowData.type.toUpperCase()} severity={severityMap[rowData.type]} />;
  };

  const statusBodyTemplate = (rowData: Notification) => {
    return <Tag value={rowData.read ? 'READ' : 'UNREAD'} severity={rowData.read ? 'secondary' : 'info'} />;
  };

  const actionBodyTemplate = (rowData: Notification) => {
    return !rowData.read ? (
      <Button 
        icon="pi pi-check" 
        rounded 
        text 
        severity="success" 
        onClick={() => dispatch(markAsRead(rowData.id))} 
        tooltip="Mark as Read"
      />
    ) : null;
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h2 className="m-0 text-xl font-bold">Network Event Registry</h2>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText 
          type="search" 
          onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} 
          placeholder="Global Search..." 
        />
      </span>
    </div>
  );

  return (
    <div className="fadein animation-duration-300">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-900 m-0">Audit Logs</h1>
        <p className="text-500 mt-1">Complete historical record of network communications and system status events.</p>
      </div>

      <Card className="shadow-2 border-round-xl border-1 border-200">
        <DataTable 
          value={items} 
          header={header} 
          globalFilter={globalFilter}
          paginator 
          rows={10} 
          rowsPerPageOptions={[10, 20, 50]}
          stripedRows
          responsiveLayout="stack"
          emptyMessage="No events found in the registry."
          className="p-datatable-sm"
        >
          <Column field="timestamp" header="Timestamp" sortable style={{ width: '15%' }}></Column>
          <Column field="category" header="Category" sortable body={(r) => <Tag value={r.category?.toUpperCase() || 'GENERAL'} outlined severity="secondary" />} style={{ width: '10%' }}></Column>
          <Column field="type" header="Severity" body={typeBodyTemplate} sortable style={{ width: '10%' }}></Column>
          <Column field="title" header="Event Title" sortable style={{ width: '25%' }} className="font-bold"></Column>
          <Column field="message" header="Message" style={{ width: '30%' }}></Column>
          <Column header="Status" body={statusBodyTemplate} style={{ width: '10%' }}></Column>
          <Column body={actionBodyTemplate} style={{ width: '5%' }}></Column>
        </DataTable>
      </Card>
    </div>
  );
};

export default NotificationsPage;
