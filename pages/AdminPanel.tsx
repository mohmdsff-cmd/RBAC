import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { UserRole } from '../types';

interface UserData {
  id: number;
  name: string;
  roles: UserRole[];
  status: string;
}

const AdminPanel: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [users, setUsers] = useState<UserData[]>([
    { id: 1, name: 'Alice Johnson', roles: [UserRole.ADMIN, UserRole.VIEW_REPORTS], status: 'Active' },
    { id: 2, name: 'Bob Smith', roles: [UserRole.USER], status: 'Active' },
    { id: 3, name: 'Charlie Brown', roles: [UserRole.USER, UserRole.VIEW_DOCUMENTS], status: 'Inactive' },
    { id: 4, name: 'Diana Prince', roles: [UserRole.GUEST], status: 'Active' },
  ]);

  const statusBodyTemplate = (rowData: UserData) => {
    return <Tag value={rowData.status} severity={getSeverity(rowData)} />;
  };

  const rolesBodyTemplate = (rowData: UserData) => {
    return (
        <div className="flex flex-wrap gap-1">
            {rowData.roles.map(role => (
                <Tag key={role} value={role.replace('_', ' ')} className="text-[10px]" severity="info" />
            ))}
        </div>
    );
  };

  const getSeverity = (user: UserData) => {
    switch (user.status) {
      case 'Active': return 'success';
      case 'Inactive': return 'warning';
      case 'Banned': return 'danger';
      default: return null;
    }
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
  };

  const confirmDelete = (id: number) => {
    confirmDialog({
      message: 'Do you want to delete this user record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteUser(id),
    });
  };

  const actionBodyTemplate = (rowData: UserData) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded outlined className="mr-2" severity="info" aria-label="Edit" />
        <Button icon="pi pi-trash" rounded outlined severity="danger" aria-label="Delete" onClick={() => confirmDelete(rowData.id)} />
      </>
    );
  };

  const startContent = (
    <React.Fragment>
        <Button label="New User" icon="pi pi-plus" className="mr-2" severity="success" />
        <Button label="Export" icon="pi pi-upload" severity="help" />
    </React.Fragment>
  );

  return (
    <div className="space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className="pi pi-lock text-red-500 text-2xl"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <span className="font-bold">Restricted Access:</span> You are viewing this page because you have <strong>ADMIN</strong> privileges.
            </p>
          </div>
        </div>
      </div>

      <Card title="User Management System" className="shadow-sm">
        <Toolbar start={startContent} className="mb-4" />
        <DataTable value={users} paginator rows={5} rowsPerPageOptions={[5, 10, 25]} tableStyle={{ minWidth: '50rem' }}>
            <Column field="name" header="Name" sortable style={{ width: '25%' }}></Column>
            <Column field="roles" header="Roles" body={rolesBodyTemplate} style={{ width: '35%' }}></Column>
            <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ width: '20%' }}></Column>
            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
        </DataTable>
      </Card>
    </div>
  );
};

export default AdminPanel;