
import React, { useRef, useState } from 'react';
import { MegaMenu } from 'primereact/megamenu';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout } from '../slices/authSlice';
import { UserRole } from '../types';
import { MenuItem } from 'primereact/menuitem';
import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import { ThemeSelector } from './ThemeSelector';
import { SessionTimeout } from './SessionTimeout';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const userMenu = useRef<Menu>(null);
  const [showSettings, setShowSettings] = useState(false);

  const hasRole = (rolesToCheck: UserRole[]) => {
    return user?.roles.some(role => rolesToCheck.includes(role)) ?? false;
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.reload(); 
  };

  // Refined User Menu Model to include Username, Group, Profile, and Logout explicitly
  const userMenuItems: MenuItem[] = [
    {
        label: 'Account Info',
        template: (item, options) => {
            return (
                <div className="p-3 flex align-items-center gap-3 w-16rem">
                    <Avatar image={user?.avatarUrl} shape="circle" size="large" className="shadow-1" />
                    <div className="flex flex-column overflow-hidden">
                        <span className="font-bold text-900 text-overflow-ellipsis overflow-hidden white-space-nowrap">
                            {user?.username}
                        </span>
                        <span className="text-xs text-500 font-medium">Security ID: {user?.id}</span>
                    </div>
                </div>
            );
        }
    },
    { separator: true },
    {
        label: 'Group / Roles',
        icon: 'pi pi-users',
        template: (item, options) => {
            return (
                <div className="px-3 py-2 flex flex-column gap-1 surface-50">
                    <span className="text-xs font-bold text-500 uppercase tracking-widest px-1">Organization Groups</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {user?.roles.map(r => (
                            <Badge 
                                key={r} 
                                value={r.replace('VIEW_', '').replace('_', ' ')} 
                                severity="info" 
                                className="text-xs uppercase"
                            />
                        ))}
                    </div>
                </div>
            );
        }
    },
    { separator: true },
    { 
        label: 'My Profile', 
        icon: 'pi pi-user', 
        command: () => navigate('/help'),
        className: 'hover:bg-primary-50 transition-colors'
    },
    { 
        label: 'Settings', 
        icon: 'pi pi-cog', 
        command: () => setShowSettings(true),
        className: 'hover:bg-primary-50 transition-colors'
    },
    { separator: true },
    { 
        label: 'Sign Out', 
        icon: 'pi pi-power-off', 
        command: handleLogout,
        className: 'text-red-500 font-bold hover:bg-red-50 transition-colors'
    }
  ];

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
        className: 'submenu-align-left',
        items: [
            [
                {
                    label: 'General',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-chart-bar', command: () => navigate('/dashboard') },
                        { label: 'Search Records', icon: 'pi pi-search', command: () => navigate('/search') },
                        { label: 'Active Cases', icon: 'pi pi-list', command: () => navigate('/active-cases') },
                        { label: 'Help', icon: 'pi pi-question-circle', command: () => navigate('/help') }
                    ]
                },
                {
                    label: 'Content',
                    items: [
                        { label: 'Gallery', icon: 'pi pi-images', command: () => navigate('/gallery') },
                        { 
                            label: 'Redaction Tool', 
                            icon: 'pi pi-shield',
                            command: () => navigate('/redact'),
                            visible: hasRole([UserRole.ADMIN, UserRole.VIEW_DOCUMENTS])
                        },
                        { 
                          label: 'Daily Reports', 
                          icon: 'pi pi-file-pdf',
                          command: () => navigate('/reports'),
                          visible: hasRole([UserRole.ADMIN, UserRole.VIEW_REPORTS])
                        },
                        { 
                          label: 'Range Reports', 
                          icon: 'pi pi-calendar-plus',
                          command: () => navigate('/range-reports'),
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
        visible: hasRole([UserRole.ADMIN, UserRole.VIEW_SYSTEM]),
        className: 'font-bold text-red-500 submenu-align-right',
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

  const start = (
    <div className="text-xl font-bold text-800 mr-4 flex align-items-center gap-2 cursor-pointer transition-colors hover:text-primary" onClick={() => navigate('/')}>
        <i className="pi pi-lock text-primary text-2xl"></i> 
        <span className="hidden sm:inline">PrimeSecure</span>
    </div>
  );

  const end = user ? (
    <div className="flex align-items-center gap-3 ml-auto">
        <Menu model={userMenuItems} popup ref={userMenu} id="user_popup_menu" className="shadow-6 border-round-xl overflow-hidden" />
        <div 
            className="flex align-items-center gap-2 cursor-pointer p-1 pr-3 border-round-pill hover:surface-100 transition-all border-1 border-transparent hover:border-300" 
            onClick={(event) => userMenu.current?.toggle(event)}
        >
            <div className="relative">
                <Avatar 
                    image={user.avatarUrl} 
                    icon={!user.avatarUrl ? 'pi pi-user' : undefined}
                    shape="circle" 
                    size="large" 
                    className="surface-200 text-700 border-1 border-300 shadow-sm" 
                />
                <Badge severity="success" className="absolute" style={{ bottom: '2px', right: '2px', border: '2px solid white', width: '12px', height: '12px', minWidth: '12px', borderRadius: '50%', padding: 0 }}></Badge>
            </div>
            <div className="hidden lg:flex flex-column text-left">
                <span className="text-sm font-bold text-900 line-height-1 mb-1">{user.username}</span>
                <span className="text-xs text-500 font-medium">Online</span>
            </div>
            <i className="pi pi-chevron-down text-xs text-400 ml-1"></i>
        </div>
    </div>
  ) : (
    <Button label="Login" icon="pi pi-user" size="small" onClick={() => window.location.reload()} raised />
  );

  return (
    <div className="min-h-screen surface-ground">
      <SessionTimeout />
      <div className="shadow-2 surface-card sticky top-0 z-5 border-bottom-1 border-200">
        <div className="w-full max-w-7xl mx-auto flex align-items-center">
            <MegaMenu 
                model={items} 
                orientation="horizontal" 
                start={start} 
                end={end}
                className="border-none border-noround bg-transparent px-4 py-2 flex-grow-1" 
                breakpoint="960px" 
            />
        </div>
      </div>
      <main className="w-full max-w-7xl mx-auto p-4 md:p-6 fadein animation-duration-400">
        {children}
      </main>

      <Dialog header="Application Settings" visible={showSettings} style={{ width: '450px' }} onHide={() => setShowSettings(false)} breakpoints={{ '960px': '75vw', '641px': '90vw' }}>
          <ThemeSelector />
      </Dialog>
    </div>
  );
};

export default Layout;
