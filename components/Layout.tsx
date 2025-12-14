
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
    // In a "No Login Page" scenario (SSO), "Logout" typically involves 
    // killing the local session and reloading/redirecting to the IDP.
    // For this simulation, we reload the app to re-trigger the "fetchUserProfile" check.
    dispatch(logout());
    window.location.reload(); 
  };

  // User Menu Model
  const userMenuItems: MenuItem[] = [
    {
        template: (item, options) => {
            return (
                <div className="p-3 flex flex-column align-items-start gap-2 w-15rem">
                    <span className="font-bold text-900">{user?.username}</span>
                    <div className="flex flex-wrap gap-1">
                        {user?.roles.map(r => (
                            <span key={r} className="text-xs text-white bg-primary px-2 py-1 border-round uppercase">
                                {r.replace('VIEW_', '').replace('_', ' ')}
                            </span>
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
        command: () => navigate('/help') // directing to help/profile area
    },
    {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => setShowSettings(true)
    },
    { separator: true },
    {
        label: 'Logout',
        icon: 'pi pi-power-off',
        className: 'text-red-500',
        command: handleLogout
    }
  ];

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
        className: 'submenu-align-left', // Align Left: Expands to the right
        items: [
            [
                {
                    label: 'General',
                    items: [
                        { label: 'Dashboard', icon: 'pi pi-chart-bar', command: () => navigate('/dashboard') },
                        { label: 'Search Records', icon: 'pi pi-search', command: () => navigate('/search') },
                        { label: 'Active Cases', icon: 'pi pi-list', command: () => navigate('/active-cases') },
                        { label: 'Help', icon: 'pi pi-question-circle', command: () => navigate('/help') },
                        { label: 'My Profile', icon: 'pi pi-user' },
                        { label: 'Settings', icon: 'pi pi-cog', command: () => setShowSettings(true) }
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
        label: 'Sports',
        icon: 'pi pi-clock',
        visible: !!user,
        className: 'submenu-align-center', // Align Center: Expands both ways
        items: [
            [
                {
                    label: 'Football',
                    items: [{ label: 'Kits' }, { label: 'Shoes' }, { label: 'Shorts' }, { label: 'Training' }]
                }
            ],
            [
                {
                    label: 'Running',
                    items: [{ label: 'Accessories' }, { label: 'Shoes' }, { label: 'T-Shirts' }, { label: 'Shorts' }]
                }
            ],
            [
                {
                    label: 'Swimming',
                    items: [{ label: 'Kickboard' }, { label: 'Nose Clip' }, { label: 'Swimsuits' }, { label: 'Paddles' }]
                }
            ],
            [
                {
                    label: 'Tennis',
                    items: [{ label: 'Balls' }, { label: 'Rackets' }, { label: 'Shoes' }, { label: 'Training' }]
                }
            ]
        ]
    },
    {
        label: 'Administration',
        icon: 'pi pi-shield',
        // Visible if Admin OR has specific view permissions for sub-items
        visible: hasRole([UserRole.ADMIN, UserRole.VIEW_SYSTEM]),
        // Align Right: Expands to the left to prevent overflow
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

  const start = <div className="text-xl font-bold text-800 mr-4 flex align-items-center gap-2 cursor-pointer" onClick={() => navigate('/')}><i className="pi pi-lock text-primary"></i> PrimeSecure</div>;

  const end = user ? (
    <div className="flex align-items-center gap-3">
        <div className="flex flex-column align-items-end hidden md:flex">
             <span className="font-semibold text-700 text-sm">Welcome back</span>
        </div>
        
        <Menu model={userMenuItems} popup ref={userMenu} id="popup_menu_left" />
        
        <div className="relative cursor-pointer" onClick={(event) => userMenu.current?.toggle(event)} aria-controls="popup_menu_left" aria-haspopup>
            <Avatar 
                image={user.avatarUrl} 
                icon={!user.avatarUrl ? 'pi pi-user' : undefined}
                shape="circle" 
                size="large" 
                className="surface-200 text-700 border-1 border-300" 
            />
            <Badge severity="success" className="absolute" style={{ bottom: '-2px', right: '-2px', width: '10px', height: '10px', minWidth: '10px', borderRadius: '50%', padding: 0 }}></Badge>
        </div>
    </div>
  ) : (
    <Button label="Login" icon="pi pi-user" size="small" onClick={() => window.location.reload()} />
  );

  return (
    <div className="min-h-screen surface-ground">
      <div className="shadow-1 surface-card sticky top-0 z-5">
        <div className="w-full max-w-7xl mx-auto">
            <MegaMenu model={items} orientation="horizontal" className="border-none border-noround bg-transparent px-4 py-3" breakpoint="960px" />
        </div>
      </div>
      <main className="w-full max-w-7xl mx-auto p-4 md:p-6">
        {children}
      </main>

      <Dialog header="Application Settings" visible={showSettings} style={{ width: '30vw' }} onHide={() => setShowSettings(false)}>
          <ThemeSelector />
      </Dialog>
    </div>
  );
};

export default Layout;
