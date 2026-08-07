
import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Badge } from 'primereact/badge';
import { Notification } from '../slices/notificationSlice';
import { removeBookmark } from '../slices/bookmarkSlice';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items: notifications } = useSelector((state: RootState) => state.notifications);
  const { items: bookmarks } = useSelector((state: RootState) => state.bookmarks);
  const { currentTheme } = useSelector((state: RootState) => state.theme);
  
  const [chartOptions, setChartOptions] = useState({});
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [bookmarkSearch, setBookmarkSearch] = useState('');

  const filteredBookmarks = useMemo(() => {
    if (!bookmarkSearch.trim()) return bookmarks;
    return bookmarks.filter(b => 
      b.title.toLowerCase().includes(bookmarkSearch.toLowerCase()) || 
      b.subtitle.toLowerCase().includes(bookmarkSearch.toLowerCase())
    );
  }, [bookmarks, bookmarkSearch]);

  const openNotification = (notif: Notification) => {
    setSelectedNotification(notif);
    setShowDetailDialog(true);
  };

  useEffect(() => {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color') || '#334155';
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#64748b';
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#e2e8f0';

      setChartOptions({
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true, padding: 15 } }
        },
        scales: {
            x: { ticks: { color: textColorSecondary }, grid: { display: false } },
            y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, borderDash: [5, 5] }, border: { display: false } }
        }
      });
  }, [currentTheme]);

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        { label: 'Visa', data: [142, 159, 180, 201, 156, 125, 90], fill: true, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.4, borderWidth: 2 },
        { label: 'Mastercard', data: [112, 129, 143, 105, 182, 113, 107], fill: true, borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', tension: 0.4, borderWidth: 2 }
    ]
  };

  const pendingByDate = [
    { label: 'SLA Expiring Today', sublabel: 'Immediate response required', count: 12, icon: 'pi pi-exclamation-triangle', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Due in 1 - 3 Days', sublabel: 'Pre-arbitration window', count: 28, icon: 'pi pi-clock', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Due in 4 - 7 Days', sublabel: 'Standard response queue', count: 35, icon: 'pi pi-calendar', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Due > 7 Days', sublabel: 'New & intake stage cases', count: 18, icon: 'pi pi-calendar-plus', color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  const pendingByReason = [
    { code: '10.4', name: 'Fraud / Unauthorized', count: 42, percentage: 45, barBg: 'bg-red-500' },
    { code: '13.1', name: 'Goods / Services Not Received', count: 24, percentage: 26, barBg: 'bg-amber-500' },
    { code: '12.6', name: 'Duplicate Processing', count: 15, percentage: 16, barBg: 'bg-blue-500' },
    { code: '13.3', name: 'Not as Described / Defective', count: 12, percentage: 13, barBg: 'bg-purple-500' },
  ];

  const renderDialogHeader = () => {
    if (!selectedNotification) return null;
    return (
        <div className="flex align-items-center gap-3">
            <div className={`w-3rem h-3rem border-round-full flex align-items-center justify-content-center ${selectedNotification.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                <i className={`pi ${selectedNotification.type === 'error' ? 'pi-exclamation-circle' : 'pi-info-circle'} text-xl`}></i>
            </div>
            <span className="font-semibold text-900">{selectedNotification.title}</span>
        </div>
    );
  };

  return (
    <div className="flex flex-column gap-4">
      {/* Welcome Header */}

      <h2 className="text-2xl md:text-xl font-bold text-900 m-0 text-center">Welcome To DisputeHub 360</h2>

      {/* Middle Row: Chart on Left | Pending Cases (by Date & Reason) on Right */}
      <div className="grid align-items-stretch">
        
        {/* Chart Section */}
        <div className="col-12 lg:col-7 flex flex-column">
            <div className="surface-card border-round-xl shadow-1 border-1 border-200 flex flex-column h-full" style={{ minHeight: '500px' }}>
                <div className="p-4 border-bottom-1 border-100 flex justify-content-between align-items-center">
                    <h2 className="text-lg font-bold text-900 m-0 flex align-items-center gap-2">
                        <i className="pi pi-chart-line text-primary"></i>
                        <span>Network Dispute Volume</span>
                    </h2>
                    <Button icon="pi pi-ellipsis-h" text rounded aria-label="Options" className="text-500 hover:text-900" />
                </div>
                <div className="p-4 flex-1 min-h-0">
                    <Chart type="line" data={chartData} options={chartOptions} className="h-full w-full" />
                </div>
            </div>
        </div>

        {/* Right Section: Stacked Pending Cases by Date & Reason */}
        <div className="col-12 lg:col-5 flex flex-column gap-3">
            
            {/* Pending Cases by Date */}
            <div className="flex-1 surface-card border-round-xl shadow-1 border-1 border-200 flex flex-column p-3.5 justify-content-between">
                <div className="flex justify-content-between align-items-center mb-2">
                    <h3 className="text-sm font-bold text-900 m-0 uppercase flex align-items-center gap-2">
                        <i className="pi pi-calendar text-blue-600"></i>
                        <span>Pending Cases by Date</span>
                    </h3>
                    <Badge value="93 Pending" severity="warning" className="bg-amber-100 text-amber-800" />
                </div>
                <div className="flex flex-column gap-2 justify-content-around flex-1">
                    {pendingByDate.map((item, idx) => (
                        <div key={idx} onClick={() => navigate('/active-cases')} className="flex align-items-center justify-content-between p-2 border-round-lg surface-50 hover:surface-hover cursor-pointer transition-colors border-1 border-100">
                            <div className="flex align-items-center gap-2.5">
                                <span className={`w-2rem h-2rem border-round-lg flex align-items-center justify-content-center ${item.bg} ${item.color} font-bold text-xs`}>
                                    <i className={item.icon}></i>
                                </span>
                                <div>
                                    <div className="text-xs font-bold text-900">{item.label}</div>
                                </div>
                            </div>
                            <div className="flex align-items-center gap-2">
                                <span className="text-xs font-bold font-mono text-800">{item.count}</span>
                                <i className="pi pi-chevron-right text-xs text-400"></i>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending Cases by Reason */}
            <div className="flex-1 surface-card border-round-xl shadow-1 border-1 border-200 flex flex-column p-3.5 justify-content-between">
                <div className="flex justify-content-between align-items-center mb-2">
                    <h3 className="text-sm font-bold text-900 m-0 uppercase flex align-items-center gap-2">
                        <i className="pi pi-filter text-purple-600"></i>
                        <span>Pending Cases by Reason</span>
                    </h3>
                    <span className="text-xs text-500 font-medium">Distribution</span>
                </div>
                <div className="flex flex-column gap-2 justify-content-around flex-1">
                    {pendingByReason.map((reason, idx) => (
                        <div key={idx} className="flex flex-column gap-1">
                            <div className="flex justify-content-between text-xs">
                                <span className="font-semibold text-800">{reason.code} - {reason.name}</span>
                                <span className="font-bold font-mono text-700">{reason.count} ({reason.percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 border-round h-2 overflow-hidden">
                                <div className={`${reason.barBg} h-full border-round transition-all`} style={{ width: `${reason.percentage}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

      </div>

      {/* Bottom Row: 3 Columns - MESSAGE FEED | BOOKMARKS | QUICK ACTION */}
      <div className="grid">
        
        {/* MESSAGE FEED */}
        <div className="col-12 lg:col-4 flex flex-column">
            <div className="surface-card border-round-xl shadow-1 border-1 border-200 flex flex-column h-24rem">
                <div className="p-3 border-bottom-1 border-100 flex justify-content-between align-items-center surface-50 border-round-top-xl">
                    <h3 className="text-sm font-bold text-900 m-0 uppercase flex align-items-center gap-2">
                        <i className="pi pi-bell text-blue-500"></i>
                        <span>MESSAGE FEED</span>
                    </h3>
                    <Badge value={notifications.length} severity="info" className="bg-blue-100 text-blue-700"></Badge>
                </div>
                <div className="p-3 flex flex-column h-full overflow-hidden">
                    <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar flex flex-column gap-2">
                        {notifications.length === 0 ? (
                             <div className="text-center text-500 text-xs py-4">No new messages</div>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} onClick={() => openNotification(n)} className={`p-2.5 border-round-xl border-1 cursor-pointer transition-all ${n.type === 'error' ? 'surface-ground border-red-200 hover:surface-hover' : 'surface-card border-200 hover:border-300 hover:shadow-1'}`}>
                                    <div className="flex align-items-center gap-2 mb-1">
                                        <i className={`pi ${n.type === 'error' ? 'pi-bolt text-red-500' : 'pi-info-circle text-blue-500'} text-xs`}></i>
                                        <span className="font-semibold text-xs text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis">{n.title}</span>
                                    </div>
                                    <p className="text-[11px] text-500 m-0 line-height-3">{n.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <Button label="View Audit Registry" icon="pi pi-arrow-right" iconPos="right" text size="small" className="w-full mt-2 text-xs font-medium text-primary hover:surface-hover" onClick={() => navigate('/notifications')} />
                </div>
            </div>
        </div>

        {/* BOOKMARKS */}
        <div className="col-12 lg:col-4 flex flex-column">
            <div className="surface-card border-round-xl shadow-1 border-1 border-200 flex flex-column h-24rem">
                <div className="p-3 border-bottom-1 border-100 flex justify-content-between align-items-center surface-50 border-round-top-xl">
                    <h3 className="text-sm font-bold text-900 m-0 uppercase flex align-items-center gap-2">
                        <i className="pi pi-bookmark-fill text-indigo-500"></i>
                        <span>BOOKMARKS</span>
                    </h3>
                    <span className="text-xs text-500 font-mono font-bold">{bookmarks.length} saved</span>
                </div>
                <div className="p-3 flex flex-column h-full overflow-hidden">
                    <span className="p-input-icon-left w-full mb-3">
                        <i className="pi pi-search text-xs" />
                        <InputText value={bookmarkSearch} onChange={(e) => setBookmarkSearch(e.target.value)} placeholder="Filter bookmarks..." className="w-full p-inputtext-sm text-xs" />
                    </span>
                    <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar flex flex-column gap-2">
                        {filteredBookmarks.length === 0 ? (
                            <div className="text-center text-500 text-xs py-4">No saved bookmarks</div>
                        ) : (
                            filteredBookmarks.map((bookmark) => (
                                <div key={bookmark.id} onClick={() => navigate(bookmark.route)} className="flex align-items-center gap-2.5 p-2 border-round-lg hover:surface-hover border-1 border-transparent transition-all cursor-pointer">
                                    <div className={`flex-shrink-0 flex align-items-center justify-content-center bg-${bookmark.color}-50 border-round-lg w-2.5rem h-2.5rem`}>
                                        <i className={`pi ${bookmark.icon} text-${bookmark.color}-600 text-xs`} />
                                    </div>
                                    <div className="flex flex-column overflow-hidden flex-1">
                                        <span className="text-xs font-semibold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis">{bookmark.title}</span>
                                        <span className="text-[11px] text-500 white-space-nowrap overflow-hidden text-overflow-ellipsis">{bookmark.subtitle}</span>
                                    </div>
                                    <Button icon="pi pi-times" rounded text size="small" className="text-400 hover:text-red-500 hover:surface-hover w-1.5rem h-1.5rem p-0" onClick={(e) => { e.stopPropagation(); dispatch(removeBookmark(bookmark.id)); }} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* QUICK ACTION */}
        <div className="col-12 lg:col-4 flex flex-column">
            <div className="surface-card border-round-xl shadow-1 border-1 border-200 flex flex-column h-24rem">
                <div className="p-3 border-bottom-1 border-100 flex justify-content-between align-items-center surface-50 border-round-top-xl">
                    <h3 className="text-sm font-bold text-900 m-0 uppercase flex align-items-center gap-2">
                        <i className="pi pi-bolt text-amber-500"></i>
                        <span>QUICK ACTION</span>
                    </h3>
                    <Tag value="Fast Links" className="bg-amber-50 text-amber-800 border-1 border-amber-200 text-[10px]" />
                </div>
                <div className="p-3 flex flex-column gap-2 overflow-y-auto custom-scrollbar flex-1">
                    <Button 
                        label="Active Case Queue" 
                        icon="pi pi-folder-open text-primary" 
                        className="p-button-outlined p-button-secondary text-left font-semibold text-xs justify-content-start gap-2 p-2.5"
                        onClick={() => navigate('/active-cases')}
                    />
                    <Button 
                        label="Document Generator" 
                        icon="pi pi-file-edit text-indigo-600" 
                        className="p-button-outlined p-button-secondary text-left font-semibold text-xs justify-content-start gap-2 p-2.5"
                        onClick={() => navigate('/doc-generator')}
                    />
                    <Button 
                        label="Evidence Upload Portal" 
                        icon="pi pi-upload text-emerald-600" 
                        className="p-button-outlined p-button-secondary text-left font-semibold text-xs justify-content-start gap-2 p-2.5"
                        onClick={() => navigate('/upload')}
                    />
                    <Button 
                        label="Dispute Account Search" 
                        icon="pi pi-search text-amber-600" 
                        className="p-button-outlined p-button-secondary text-left font-semibold text-xs justify-content-start gap-2 p-2.5"
                        onClick={() => navigate('/account-search')}
                    />
                    <Button 
                        label="Analytics & Range Reports" 
                        icon="pi pi-chart-bar text-purple-600" 
                        className="p-button-outlined p-button-secondary text-left font-semibold text-xs justify-content-start gap-2 p-2.5"
                        onClick={() => navigate('/range-reports')}
                    />
                </div>
            </div>
        </div>

      </div>

      {/* Notification Detail Modal */}
      <Dialog header={renderDialogHeader()} visible={showDetailDialog} style={{ width: '450px' }} className="border-round-2xl overflow-hidden shadow-6" onHide={() => setShowDetailDialog(false)} footer={<Button label="Close" onClick={() => setShowDetailDialog(false)} className="w-full border-round-xl" />}>
        {selectedNotification && (
            <div className="py-4">
                <p className="text-700 line-height-3 m-0">{selectedNotification.message}</p>
                <div className="mt-4 pt-4 border-top-1 border-100 flex justify-content-between align-items-center text-xs text-500">
                    <span>{selectedNotification.timestamp}</span>
                    <span className="uppercase font-semibold">{selectedNotification.type}</span>
                </div>
            </div>
        )}
      </Dialog>
    </div>
  );
};

export default Dashboard;
