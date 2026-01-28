
import React, { useRef, useState } from 'react';
import { MegaMenu } from 'primereact/megamenu';
import { Button } from 'primereact/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout } from '../slices/authSlice';
import { markAsRead, markAllAsRead } from '../slices/notificationSlice';
import { toggleBookmark } from '../slices/bookmarkSlice';
import { MenuItem } from 'primereact/menuitem';
import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ThemeSelector } from './ThemeSelector';
import { SessionTimeout } from './SessionTimeout';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items: notifications } = useSelector((state: RootState) => state.notifications);
  const { items: bookmarks } = useSelector((state: RootState) => state.bookmarks);
  
  const userMenu = useRef<Menu>(null);
  const notificationOp = useRef<OverlayPanel>(null);
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isBookmarked = bookmarks.some(b => b.route === location.pathname);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handlePinPage = () => {
      // Logic to determine bookmark metadata based on current route
      const path = location.pathname;
      let title = "New Bookmark";
      let subtitle = "Workspace";
      let icon = "pi-bookmark";
      let color = "blue";

      if (path === '/dashboard') { title = "Dashboard"; icon = "pi-home"; color = "cyan"; }
      else if (path === '/gallery') { title = "Document Vault"; icon = "pi-images"; color = "orange"; }
      else if (path === '/reports') { title = "Daily Reports"; icon = "pi-chart-bar"; color = "purple"; }
      else if (path === '/active-cases') { title = "Case Queue"; icon = "pi-briefcase"; color = "green"; }
      else if (path === '/search') { title = "Secure Search"; icon = "pi-search"; color = "indigo"; }
      else if (path === '/notifications') { title = "Audit Log"; icon = "pi-list"; color = "blue"; }
      else if (path === '/upload') { title = "Upload Portal"; icon = "pi-upload"; color = "teal"; }
      else if (path === '/evidence') { title = "Evidence Locker"; icon = "pi-lock"; color = "teal"; }

      dispatch(toggleBookmark({
          id: `BK-${Date.now()}`,
          title,
          subtitle,
          route: path,
          icon,
          color
      }));
  };

  const userMenuItems: MenuItem[] = [
    {
        label: 'Account Info',
        template: (item) => (
            <div className="p-3 flex align-items-center gap-3 w-16rem">
                <Avatar image={user?.avatarUrl} shape="circle" size="large" className="shadow-1" />
                <div className="flex flex-column overflow-hidden">
                    <span className="font-bold text-900 text-overflow-ellipsis overflow-hidden white-space-nowrap">
                        {user?.username}
                    </span>
                    <span className="text-xs text-500 font-medium">Resolution Agent ID: {user?.id}</span>
                </div>
            </div>
        )
    },
    { separator: true },
    { 
        label: 'Performance Profile', 
        icon: 'pi pi-user', 
        command: () => navigate('/help')
    },
    { 
        label: 'Settings', 
        icon: 'pi pi-cog', 
        command: () => setShowSettings(true)
    },
    { separator: true },
    { 
        label: 'Secure Sign Out', 
        icon: 'pi pi-power-off', 
        command: handleLogout,
        className: 'text-red-500 font-bold'
    }
  ];

  const items: MenuItem[] = [
    { label: 'Overview', icon: 'pi pi-home', command: () => navigate('/') },
    {
        label: 'Case Queues',
        icon: 'pi pi-briefcase',
        visible: !!user,
        items: [
            [
                {
                    label: 'Active Workstreams',
                    items: [
                        { label: 'Dispute Dashboard', icon: 'pi pi-chart-bar', command: () => navigate('/dashboard') },
                        { label: 'Chargeback Lookup', icon: 'pi pi-search', command: () => navigate('/search') },
                        { label: 'Network Pending', icon: 'pi pi-list', command: () => navigate('/active-cases') }
                    ]
                },
                {
                    label: 'Evidence & Compliance',
                    items: [
                        { label: 'Document Vault', icon: 'pi pi-images', command: () => navigate('/gallery') },
                        { label: 'Submit Evidence', icon: 'pi pi-lock', command: () => navigate('/evidence') },
                        { label: 'Upload Portal', icon: 'pi pi-upload', command: () => navigate('/upload') }
                    ]
                }
            ]
        ]
    }
  ];

  const start = (
    <div className="text-xl font-bold text-800 mr-4 flex align-items-center gap-2 cursor-pointer transition-colors hover:text-primary" onClick={() => navigate('/')}>
        <i className="pi pi-credit-card text-primary text-2xl"></i> 
        <span className="hidden sm:inline">DisputeHub 360</span>
    </div>
  );

  const end = user ? (
    <div className="flex align-items-center gap-2 md:gap-3 ml-auto">
        <Button 
            icon={`pi ${isBookmarked ? 'pi-bookmark-fill' : 'pi-bookmark'}`} 
            rounded 
            text 
            severity={isBookmarked ? "primary" : "secondary"}
            onClick={handlePinPage}
            tooltip={isBookmarked ? "Remove Pin" : "Pin Workspace"}
            tooltipOptions={{ position: 'bottom' }}
        />
        
        <div className="relative">
            <Button 
                icon="pi pi-bell" 
                rounded 
                text 
                severity="secondary" 
                onClick={(e) => notificationOp.current?.toggle(e)}
                className="p-overlay-badge"
            >
                {unreadCount > 0 && <Badge value={unreadCount} severity="danger"></Badge>}
            </Button>
            <OverlayPanel ref={notificationOp} className="w-20rem md:w-25rem shadow-6 p-0 overflow-hidden">
                <div className="flex align-items-center justify-content-between p-3 border-bottom-1 border-100 bg-surface-50">
                    <span className="font-bold text-900">Network Alerts</span>
                    <Button label="Acknowledge All" text size="small" onClick={() => dispatch(markAllAsRead())} />
                </div>
                <div className="max-h-20rem overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-500">No new alerts</div>
                    ) : (
                        notifications.map((n) => (
                            <div 
                                key={n.id} 
                                className={`p-3 flex align-items-start gap-3 border-bottom-1 border-50 hover:bg-surface-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50' : ''}`}
                                onClick={() => {
                                    dispatch(markAsRead(n.id));
                                    notificationOp.current?.hide();
                                    navigate('/notifications');
                                }}
                            >
                                <i className={`pi ${n.type === 'warn' ? 'pi-exclamation-triangle text-orange-500' : n.type === 'error' ? 'pi-times-circle text-red-500' : 'pi-info-circle text-blue-500'} mt-1`}></i>
                                <div className="flex flex-column gap-1 overflow-hidden">
                                    <span className={`text-sm font-bold ${!n.read ? 'text-900' : 'text-700'}`}>{n.title}</span>
                                    <span className="text-xs text-600 line-height-2">{n.message}</span>
                                    <span className="text-xs text-400 mt-1">{n.timestamp}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-2 bg-surface-50 text-center border-top-1 border-100">
                    <Button 
                        label="View All Events" 
                        text 
                        size="small" 
                        className="w-full" 
                        onClick={() => {
                            notificationOp.current?.hide();
                            navigate('/notifications');
                        }}
                    />
                </div>
            </OverlayPanel>
        </div>

        <Menu model={userMenuItems} popup ref={userMenu} id="user_popup_menu" className="shadow-6 border-round-xl overflow-hidden" />
        <div 
            className="flex align-items-center gap-2 cursor-pointer p-1 pr-3 border-round-pill hover:surface-100 transition-all border-1 border-transparent hover:border-300" 
            onClick={(event) => userMenu.current?.toggle(event)}
        >
            <Avatar image={user.avatarUrl} shape="circle" size="normal" className="surface-200 shadow-sm" />
            <div className="hidden lg:flex flex-column text-left">
                <span className="text-xs font-bold text-900 line-height-1 mb-1">{user.username}</span>
                <span className="text-xs text-500 font-medium">Session Active</span>
            </div>
            <i className="pi pi-chevron-down text-xs text-400 ml-1"></i>
        </div>
    </div>
  ) : (
    <Button label="Login" icon="pi pi-user" size="small" onClick={() => navigate('/login')} />
  );

  return (
    <div className="min-h-screen surface-ground">
      <SessionTimeout />
      <div className="shadow-2 surface-card sticky top-0 z-5 border-bottom-1 border-200">
        <div className="w-full max-w-7xl mx-auto flex align-items-center">
            <MegaMenu model={items} orientation="horizontal" start={start} end={end} className="border-none border-noround bg-transparent px-4 py-2 flex-grow-1" breakpoint="960px" />
        </div>
      </div>
      <main className="w-full max-w-7xl mx-auto p-4 md:p-6 fadein animation-duration-400">
        {children}
      </main>
      <Dialog header="Agent Preferences" visible={showSettings} style={{ width: '450px' }} onHide={() => setShowSettings(false)}>
          <ThemeSelector />
      </Dialog>
    </div>
  );
};

export default Layout;
