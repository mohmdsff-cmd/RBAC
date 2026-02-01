
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateOperatorName } from '../slices/authSlice';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';

const UserProfile: React.FC = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const toast = useRef<Toast>(null);

    const [operatorName, setOperatorName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        if (user?.operatorName) {
            setOperatorName(user.operatorName);
        }
    }, [user]);

    const handleUpdateName = async () => {
        if (!operatorName.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Operator Name cannot be empty.' });
            return;
        }

        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600));
        
        dispatch(updateOperatorName(operatorName));
        setLoading(false);
        setIsEditing(false);
        
        toast.current?.show({ severity: 'success', summary: 'Profile Updated', detail: 'Operator name has been changed successfully.' });
    };

    const statusBodyTemplate = (rowData: any) => {
        const severity = rowData.status === 'Active' ? 'success' : rowData.status === 'Inactive' ? 'danger' : 'warning';
        return <Tag value={rowData.status} severity={severity} />;
    };

    const roleColors: {[key: string]: string} = {
        'ADMIN': 'red',
        'USER': 'blue',
        'VIEW_REPORTS': 'purple',
        'VIEW_DOCUMENTS': 'orange',
        'VIEW_SYSTEM': 'cyan',
        'GUEST': 'gray'
    };

    const filteredRoles = user?.roles.filter(r => r.toLowerCase().includes(roleFilter.toLowerCase())) || [];

    return (
        <div className="w-full max-w-6xl mx-auto mt-4">
            <Toast ref={toast} />
            
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-800 m-0">User Profile</h1>
                <p className="text-500 m-0 mt-2">Manage your account settings, preferences, and client assignments.</p>
            </div>

            <div className="grid">
                {/* Left Column: Identity Card */}
                <div className="col-12 md:col-4">
                    <Card className="shadow-2 h-full text-center">
                        <div className="flex flex-column align-items-center mb-4">
                            <div className="relative mb-3">
                                <Avatar 
                                    image={user?.avatarUrl} 
                                    className="w-8rem h-8rem shadow-3 cursor-pointer hover:shadow-5 transition-all" 
                                    shape="circle" 
                                    size="xlarge" 
                                />
                                <span className="absolute bottom-0 right-0 bg-green-500 border-2 border-white border-circle w-2rem h-2rem flex align-items-center justify-content-center">
                                    <i className="pi pi-check text-white text-xs font-bold"></i>
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-900 m-0">{user?.operatorName}</h2>
                            <span className="text-600 mt-1">@{user?.username}</span>
                            <div className="mt-3">
                                <Tag value={user?.id} icon="pi pi-id-card" severity="secondary" className="px-3" />
                            </div>
                        </div>
                        
                        <Divider />
                        
                        <div className="flex flex-column gap-3 text-left p-2">
                            <div className="field">
                                <label htmlFor="operatorName" className="block text-sm font-medium text-700 mb-2">Operator Name</label>
                                <div className="p-inputgroup">
                                    <InputText 
                                        id="operatorName" 
                                        value={operatorName} 
                                        onChange={(e) => setOperatorName(e.target.value)} 
                                        disabled={!isEditing}
                                        className={!isEditing ? 'opacity-70' : ''}
                                    />
                                    {!isEditing ? (
                                        <Button icon="pi pi-pencil" severity="secondary" onClick={() => setIsEditing(true)} tooltip="Edit Name" />
                                    ) : (
                                        <>
                                            <Button icon="pi pi-check" severity="success" onClick={handleUpdateName} loading={loading} tooltip="Save" />
                                            <Button icon="pi pi-times" severity="danger" onClick={() => { setIsEditing(false); setOperatorName(user?.operatorName || ''); }} tooltip="Cancel" />
                                        </>
                                    )}
                                </div>
                                <small className="text-500 mt-1 block">Visible on audit logs and report footers.</small>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Roles & Clients */}
                <div className="col-12 md:col-8">
                    <div className="flex flex-column gap-4">
                        
                        {/* Roles Section - Updated for large number of roles */}
                        <Card className="shadow-2">
                            <div className="flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                                <div className="flex align-items-center gap-2">
                                     <h2 className="text-xl font-bold m-0 text-900">Assigned Roles</h2>
                                     <Badge value={user?.roles.length || 0} severity="info"></Badge>
                                </div>
                                {user?.roles && user.roles.length > 5 && (
                                     <span className="p-input-icon-left w-full md:w-15rem">
                                        <i className="pi pi-search text-sm" />
                                        <InputText 
                                            value={roleFilter} 
                                            onChange={(e) => setRoleFilter(e.target.value)} 
                                            placeholder="Filter roles..." 
                                            className="w-full p-inputtext-sm py-2 text-sm" 
                                        />
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-500 mb-3">
                                Your account is provisioned with the following security roles. 
                                Contact an administrator to request privilege elevation.
                            </p>
                            <div className="flex flex-wrap gap-2 max-h-15rem overflow-y-auto custom-scrollbar p-1">
                                {filteredRoles.map(role => (
                                    <div key={role} className={`surface-50 border-1 border-${roleColors[role] || 'blue'}-200 border-round px-3 py-2 flex align-items-center gap-2`}>
                                        <div className={`w-2 h-2 border-circle bg-${roleColors[role] || 'blue'}-500`}></div>
                                        <span className={`text-${roleColors[role] || 'blue'}-700 font-medium text-sm`}>{role.replace(/_/g, ' ')}</span>
                                    </div>
                                ))}
                                {filteredRoles.length === 0 && <span className="text-500 text-sm italic">No roles match your filter.</span>}
                            </div>
                        </Card>

                        {/* Clients Section */}
                        <Card className="shadow-2" title={
                            <div className="flex align-items-center justify-content-between">
                                <span>Client Portfolio</span>
                                <Badge value={user?.clients?.length || 0} severity="info"></Badge>
                            </div>
                        }>
                            <DataTable 
                                value={user?.clients || []} 
                                stripedRows 
                                size="small" 
                                className="text-sm"
                                emptyMessage="No clients assigned."
                                paginator={user?.clients && user.clients.length > 5}
                                rows={5}
                                rowsPerPageOptions={[5, 10, 20]}
                            >
                                <Column field="name" header="Organization" sortable className="font-medium"></Column>
                                <Column field="id" header="Client ID" style={{ width: '15%' }}></Column>
                                <Column field="region" header="Region" sortable style={{ width: '20%' }}></Column>
                                <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ width: '15%' }}></Column>
                                <Column body={() => <Button icon="pi pi-angle-right" rounded text size="small" />} style={{ width: '5%' }}></Column>
                            </DataTable>
                        </Card>
                    </div>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: var(--surface-100);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--surface-400);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--surface-500);
                }
            `}</style>
        </div>
    );
};

export default UserProfile;
