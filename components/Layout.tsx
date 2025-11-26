
import React from 'react';
import { MegaMenu } from 'primereact/megamenu';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout } from '../slices/authSlice';
import { UserRole } from '../types';
import { MenuItem } from 'primereact/menuitem';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const hasRole = (rolesToCheck: UserRole[]) => {
    return user?.roles.some(role => rolesToCheck.includes(role)) ?? false;
  };

  // Mega Menu Model
  const items: MenuItem[] = [
    {
        label: 'Home',
        icon: 'pi pi-home',
        command: () => navigate('/')
    },
    {
        label: 'Workplace',
        icon: 'pi pi-briefcase',
        visible: !!user,
        items: [
            [
                {
                    label: 'General',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-chart-bar', command: () => navigate('/dashboard') },
                        { label: 'Search Records', icon: 'pi pi-search', command: () => navigate('/search') },
                        { label: 'Active Cases', icon: 'pi pi-list', command: () => navigate('/active-cases') },
                        { label: 'My Profile', icon: 'pi pi-user' },
                        { label: 'Settings', icon: 'pi pi-cog' }
                    ]
                },
                {
                    label: 'Content',
                    items: [
                        { 
                            label: 'Gallery', 
                            icon: 'pi pi-images', 
                            command: () => navigate('/gallery') 
                        },
                        { 
                            label: 'Documents', 
                            icon: 'pi pi-file',
                            visible: hasRole([UserRole.ADMIN, UserRole.USER, UserRole.VIEW_DOCUMENTS])
                        },
                        { 
                          label: 'Reports', 
                          icon: 'pi pi-file-pdf',
                          command: () => navigate('/reports'),
                          visible: hasRole([UserRole.ADMIN, UserRole.VIEW_REPORTS])
                        }
                    ]
                }
            ],
            [
                {
                    label: 'Communication',
                    items: [
                        { label: 'Messages', icon: 'pi pi-envelope' },
                        { label: 'Notifications', icon: 'pi pi-bell' }
                    ]
                }
            ]
        ]
    },
    {
        label: 'Administration',
        icon: 'pi pi-shield',
        // Visible if Admin OR has specific view permissions for sub-items
        visible: hasRole([UserRole.ADMIN, UserRole.VIEW_SYSTEM]),
        className: 'font-bold text-red-500',
        items: [
            [
                {
                    label: 'Users',
                    visible: hasRole([UserRole.ADMIN]),
                    items: [
                        { label: 'User Management', icon: 'pi pi-users', command: () => navigate('/admin') },
                        { label: 'Roles & Permissions', icon: 'pi pi-key' }
                    ]
                },
                {
                    label: 'System',
                    // Visible if Admin OR View System
                    visible: hasRole([UserRole.ADMIN, UserRole.VIEW_SYSTEM]),
                    items: [
                        { label: 'Logs', icon: 'pi pi-list' },
                        { label: 'Audit', icon: 'pi pi-search' }
                    ]
                }
            ]
        ]
    }
  ];

  const start = <div className="text-xl font-bold text-slate-800 mr-4 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}><i className="pi pi-lock text-primary"></i> PrimeSecure</div>;

  const end = user ? (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end text-sm">
        <span className="font-semibold text-slate-700">{user.username}</span>
        <div className="flex gap-1">
            {user.roles.slice(0, 2).map(r => (
                 <span key={r} className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider">{r.replace('VIEW_', '')}</span>
            ))}
            {user.roles.length > 2 && <span className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">+ {user.roles.length - 2}</span>}
        </div>
      </div>
      {user.avatarUrl && <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-300" />}
      <Button 
        label="Logout" 
        icon="pi pi-power-off" 
        severity="danger" 
        text 
        size="small"
        onClick={() => dispatch(logout())} 
      />
    </div>
  ) : (
    <Button label="Login" icon="pi pi-user" size="small" onClick={() => navigate('/login')} />
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="shadow-sm bg-white">
        <div className="container mx-auto">
            <MegaMenu model={items} orientation="horizontal" start={start} end={end} className="border-none rounded-none bg-transparent px-4 py-3" breakpoint="960px" />
        </div>
      </div>
      <main className="container mx-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
