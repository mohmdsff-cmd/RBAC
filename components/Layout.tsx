
import React, { useRef, useState } from 'react';
import { Menubar } from 'primereact/menubar';
import { BreadCrumb } from 'primereact/breadcrumb';
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
import { Dialog } from 'primereact/dialog';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Toast } from 'primereact/toast';
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
  const toastRef = useRef<Toast>(null);
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isBookmarked = bookmarks.some(b => b.route === location.pathname);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleJoinTeam = () => {
    toastRef.current?.show({
      severity: 'success',
      summary: 'Joined Operations Team',
      detail: 'You have been added to the Enterprise Operations workgroup successfully.',
      life: 4000
    });
  };

  const handlePinPage = () => {
      const path = location.pathname;
      let title = "New Bookmark";
      let subtitle = "Workspace";
      let icon = "pi-bookmark";
      let color = "blue";

      if (path === '/dashboard') { title = "Dashboard"; icon = "pi-home"; color = "cyan"; }
      else if (path === '/gallery') { title = "Document Vault"; icon = "pi-images"; color = "orange"; }
      else if (path === '/document-matching') { title = "Document Matching"; icon = "pi-file-edit"; color = "orange"; }
      else if (path === '/reports') { title = "Daily Reports"; icon = "pi-chart-bar"; color = "purple"; }
      else if (path === '/active-cases') { title = "Case Queue"; icon = "pi-briefcase"; color = "green"; }
      else if (path === '/search') { title = "Secure Search"; icon = "pi-search"; color = "indigo"; }
      else if (path === '/account-lookup') { title = "Account Lookup"; icon = "pi-id-card"; color = "indigo"; }
      else if (path === '/notifications') { title = "Audit Log"; icon = "pi-list"; color = "blue"; }
      else if (path === '/upload') { title = "Upload Portal"; icon = "pi-upload"; color = "teal"; }
      else if (path === '/evidence') { title = "Evidence Locker"; icon = "pi-lock"; color = "teal"; }
      else if (path === '/profile') { title = "User Profile"; icon = "pi-user"; color = "blue"; }

      dispatch(toggleBookmark({
          id: `BK-${Date.now()}`,
          title,
          subtitle,
          route: path,
          icon,
          color
      }));
  };

  const getUserInitials = () => {
    if (!user) return "OS";
    const name = user.operatorName || user.username || "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase() || "US";
  };

  const userMenuItems: MenuItem[] = [
    {
        label: 'Account Info',
        template: () => (
            <div className="p-3 flex align-items-center gap-3 w-16rem cursor-pointer hover:surface-hover transition-colors" onClick={() => navigate('/profile')}>
                <Avatar label={getUserInitials()} shape="circle" size="large" className="bg-blue-100 text-blue-900 font-bold" />
                <div className="flex flex-column overflow-hidden">
                    <span className="font-bold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                        {user?.operatorName || user?.username}
                    </span>
                    <span className="text-xs text-500 font-medium">Agent ID: {user?.id}</span>
                </div>
            </div>
        )
    },
    { separator: true },
    { 
        label: 'User Profile', 
        icon: 'pi pi-user', 
        command: () => navigate('/profile')
    },
    { 
        label: 'Help & Manuals', 
        icon: 'pi pi-question-circle', 
        command: () => navigate('/help')
    },
    { 
        label: 'Theme Settings', 
        icon: 'pi pi-cog', 
        command: () => setShowSettings(true)
    },
    { separator: true },
    { 
        label: 'Secure Sign Out', 
        icon: 'pi pi-power-off', 
        command: handleLogout,
        className: 'text-red-600 font-bold'
    }
  ];

  const subitemTemplate = (sub: any) => {
    return (
      <div 
        className="flex align-items-center p-3 gap-3 cursor-pointer hover:surface-hover border-round transition-colors w-full" 
        onClick={() => {
          if (sub.onClick) {
            sub.onClick();
          } else if (sub.command) {
            sub.command();
          }
        }}
      >
        <div className="p-2 border-round flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: '#f1f5f9', color: 'var(--apex-blue)', width: '38px', height: '38px', borderRadius: '4px' }}>
          <i className={`pi ${sub.primeIcon} text-base`}></i>
        </div>
        <div className="flex flex-column text-left leading-normal">
          <span className="font-bold text-900 text-sm">{sub.label}</span>
          <span className="text-500 text-xs mt-1" style={{ fontSize: '11px' }}>{sub.desc}</span>
        </div>
      </div>
    );
  };

  const navItems: MenuItem[] = [
    {
      label: 'Workspace',
      items: [
        { label: 'Dispute Dashboard', primeIcon: 'pi-chart-bar', desc: 'Analyze key dispute metrics', command: () => { navigate('/dashboard'); } },
        { label: 'Pending Items', primeIcon: 'pi-clock', desc: 'Review operational dispute pipeline', command: () => { navigate('/pending-items'); } },
        { label: 'Document Vault', primeIcon: 'pi-images', desc: 'Access full customer file archives', command: () => { navigate('/gallery'); } }
      ].map(sub => ({ ...sub, template: () => subitemTemplate(sub) }))
    },
    {
      label: 'Analytics',
      items: [
        { label: 'Trend Reports', primeIcon: 'pi-chart-line', desc: 'Assess pattern changes over time', command: () => { navigate('/reports'); } },
        { label: 'Active Queue', primeIcon: 'pi-list', desc: 'Track operational priority volumes', command: () => { navigate('/active-cases'); } },
        { label: 'Audit Log', primeIcon: 'pi-shield', desc: 'Investigate database access history', command: () => { navigate('/notifications'); } }
      ].map(sub => ({ ...sub, template: () => subitemTemplate(sub) }))
    },
    {
      label: 'Operations',
      items: [
        { label: 'Case Compliance', primeIcon: 'pi-folder-open', desc: 'Secure high-density case audit', command: () => { navigate('/case-management'); } },
        { label: 'Document Generator', primeIcon: 'pi-file-pdf', desc: 'Develop legal letters on demand', command: () => { navigate('/document-generator'); } },
        { label: 'Document Matching', primeIcon: 'pi-file-edit', desc: 'Match incoming dispute records', command: () => { navigate('/document-matching'); } },
        { label: 'Account Lookup', primeIcon: 'pi-id-card', desc: 'Find customer profile details', command: () => { navigate('/account-lookup'); } },
        { label: 'Secure Redactor', primeIcon: 'pi-eye-slash', desc: 'Securely mask document PII', command: () => { navigate('/redact'); } }
      ].map(sub => ({ ...sub, template: () => subitemTemplate(sub) }))
    },
    {
      label: 'Admin',
      items: [
        { label: 'Admin Profile', primeIcon: 'pi-user', desc: 'Configure roles and admin metadata', command: () => { navigate('/profile'); } },
        { label: 'Upload Portal', primeIcon: 'pi-upload', desc: 'Batch digest file deposits securely', command: () => { navigate('/upload'); } },
        { label: 'System Options', primeIcon: 'pi-sliders-h', desc: 'Modify default layout preferences', onClick: () => { setShowSettings(true); } }
      ].map(sub => ({ ...sub, template: () => subitemTemplate(sub) }))
    },
    {
      label: 'Support',
      items: [
        { label: 'User Guides', primeIcon: 'pi-question-circle', desc: 'Study references and tutorials', command: () => { navigate('/help'); } },
        { label: 'Submit Evidence', primeIcon: 'pi-lock', desc: 'Upload evidence folders securely', command: () => { navigate('/evidence'); } },
        { label: 'System Health', primeIcon: 'pi-heart-fill', desc: 'Monitor network connection health', command: () => { navigate('/help'); } }
      ].map(sub => ({ ...sub, template: () => subitemTemplate(sub) }))
    }
  ];

  const startSection = (
    <div className="flex align-items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}>
      <div className="w-10 h-10 text-white flex align-items-center justify-content-center shadow-1" style={{ width: '40px', height: '40px', backgroundColor: 'var(--apex-blue)', borderRadius: '4px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#ffffff" style={{ width: '22px', height: '22px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>
      <div className="flex flex-column text-left leading-normal">
        <span className="font-bold text-sm text-900 uppercase tracking-tight" style={{ fontSize: '13.5px', color: '#1a1a1a' }}>DisputeHub 360</span>
        <span className="text-500 font-bold uppercase" style={{ fontSize: '9px', letterSpacing: '0.05em', marginTop: '1px' }}>Enterprise Portal</span>
      </div>
    </div>
  );

  const endSection = user ? (
    <div className="flex align-items-center gap-3 ml-auto text-900">
      <Menu model={userMenuItems} popup ref={userMenu} id="user_popup_menu" className="shadow-4 border-1 border-100 border-round overflow-hidden mt-2" />
      <div 
          className="flex align-items-center gap-3 cursor-pointer p-1 pr-3 border-round hover:bg-slate-50 transition-all border-1 border-transparent text-800" 
          onClick={(event) => userMenu.current?.toggle(event)}
      >
          <Avatar 
            label={getUserInitials()} 
            shape="circle" 
            size="normal" 
            style={{ 
              width: '36px', 
              height: '36px', 
              backgroundColor: '#e0f2fe', 
              color: 'var(--apex-blue)', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} 
          />
          <div className="hidden lg:flex flex-column text-left leading-normal">
              <span className="text-xs font-bold text-900 mb-1">{user.operatorName || user.username}</span>
              <span className="text-500 font-medium opacity-70" style={{ fontSize: '10px' }}>Session Active</span>
          </div>
          <i className="pi pi-chevron-down text-xs ml-1 opacity-70"></i>
      </div>
    </div>
  ) : (
    <Button label="Login" icon="pi pi-user" size="small" onClick={() => navigate('/login')} />
  );

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const items = [];
    
    if (path === '/dashboard') {
      items.push({ label: 'Workspace' });
      items.push({ label: 'Dashboard' });
    } else if (path === '/gallery') {
      items.push({ label: 'Workspace' });
      items.push({ label: 'Document Vault' });
    } else if (path === '/document-matching') {
      items.push({ label: 'Operations' });
      items.push({ label: 'Document Matching' });
    } else if (path === '/document-generator') {
      items.push({ label: 'Operations' });
      items.push({ label: 'Document Generator' });
    } else if (path === '/upload') {
      items.push({ label: 'Admin' });
      items.push({ label: 'Upload Portal' });
    } else if (path === '/evidence') {
      items.push({ label: 'Support' });
      items.push({ label: 'Submit Evidence' });
    } else if (path === '/active-cases') {
      items.push({ label: 'Analytics' });
      items.push({ label: 'Active Queue' });
    } else if (path === '/pending-items') {
      items.push({ label: 'Workspace' });
      items.push({ label: 'Pending Items' });
    } else if (path === '/reports') {
      items.push({ label: 'Analytics' });
      items.push({ label: 'Trend Reports' });
    } else if (path === '/notifications') {
      items.push({ label: 'Analytics' });
      items.push({ label: 'Audit Log' });
    } else if (path === '/account-lookup') {
      items.push({ label: 'Operations' });
      items.push({ label: 'Account Lookup' });
    } else if (path === '/help') {
      items.push({ label: 'Support' });
      items.push({ label: 'User Guide' });
    } else if (path === '/profile') {
      items.push({ label: 'Admin' });
      items.push({ label: 'Admin Profile' });
    } else {
      const segment = path.replace('/', '').replace('-', ' ');
      if (segment) {
        items.push({ label: 'Workspace' });
        items.push({ label: segment.charAt(0).toUpperCase() + segment.slice(1) });
      }
    }
    return items;
  };

  const home = { icon: 'pi pi-home', command: () => { navigate('/'); } };

  return (
    <div className="min-h-screen surface-100 text-900 font-sans flex flex-column">
      <Toast ref={toastRef} />
      <SessionTimeout />
      
      {/* 5px tall full-width gradient accent bar */}
      <div className="top-accent-bar"></div>
      
      <header className="apex-header sticky top-0 z-5 shadow-2">
         <Menubar 
           model={navItems} 
           start={startSection} 
           end={endSection} 
           className="apex-menubar border-none bg-transparent" 
         />
      </header>
      
      {location.pathname !== '/dashboard' && location.pathname !== '/' && (
        <BreadCrumb 
           model={getBreadcrumbs()} 
           home={home} 
           style={{ 
             backgroundColor: '#ffffff', 
             borderRadius: '0px', 
             border: 'none', 
             borderBottom: '1px solid #D0D7E3', 
             padding: '0.6rem 1.5rem', 
             fontSize: '11.5px',
             fontFamily: 'var(--font-sans)',
             color: '#4b5563'
           }} 
         />
      )}

      <main className="flex-1 w-full max-w-screen-xl mx-auto p-4 md:p-6 lg:p-8 fadein animation-duration-500">
        {children}
      </main>

      <Dialog header="Agent Preferences" visible={showSettings} onHide={() => setShowSettings(false)} className="border-round-xl overflow-hidden shadow-6" style={{ width: '450px', borderRadius: '4px' }}>
          <ThemeSelector />
      </Dialog>
    </div>
  );
};

export default Layout;
