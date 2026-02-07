
import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Notification } from '../slices/notificationSlice';
import { removeBookmark, clearBookmarks } from '../slices/bookmarkSlice';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items: notifications } = useSelector((state: RootState) => state.notifications);
  const { items: bookmarks } = useSelector((state: RootState) => state.bookmarks);
  const { currentTheme } = useSelector((state: RootState) => state.theme);
  
  const [chartOptions, setChartOptions] = useState({});
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [bookmarkSearch, setBookmarkSearch] = useState('');

  const rowHeight = '520px';

  const feedItems = useMemo(() => {
    return notifications;
  }, [notifications]);

  const filteredBookmarks = useMemo(() => {
    if (!bookmarkSearch.trim()) return bookmarks;
    return bookmarks.filter(b => 
      b.title.toLowerCase().includes(bookmarkSearch.toLowerCase()) || 
      b.subtitle.toLowerCase().includes(bookmarkSearch.toLowerCase())
    );
  }, [bookmarks, bookmarkSearch]);

  const currentIndex = feedItems.findIndex(n => n.id === selectedNotification?.id);

  const handleNext = () => {
    if (currentIndex < feedItems.length - 1) setSelectedNotification(feedItems[currentIndex + 1]);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setSelectedNotification(feedItems[currentIndex - 1]);
  };

  const openNotification = (notif: Notification) => {
    setSelectedNotification(notif);
    setShowDetailDialog(true);
  };

  useEffect(() => {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

      setChartOptions({
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true } }
        },
        scales: {
            x: { ticks: { color: textColorSecondary }, grid: { display: false } },
            y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, borderDash: [5, 5] } }
        }
      });
  }, [currentTheme]);

  const kpiData = [
      { title: 'Chargeback Win Rate', value: '72.4%', icon: 'pi pi-percentage', color: 'green', trend: '+4.2%', trendColor: 'text-green-500' },
      { title: 'Net Recovered', value: '$242,500', icon: 'pi pi-money-bill', color: 'blue', trend: 'Monthly Avg', trendColor: 'text-blue-500' },
      { title: 'Active Arb Cases', value: '18', icon: 'pi pi-shield', color: 'purple', trend: 'High Priority', trendColor: 'text-red-500' },
      { title: 'Pre-Arb Deadline', value: '4h 12m', icon: 'pi pi-clock', color: 'orange', trend: 'SLA Limit', trendColor: 'text-orange-500' },
  ];

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        { label: 'Visa', data: [142, 159, 180, 201, 156, 125, 90], fill: true, borderColor: '#0055A4', backgroundColor: 'rgba(0, 85, 164, 0.1)', tension: 0.4 },
        { label: 'Mastercard', data: [112, 129, 143, 105, 182, 113, 107], fill: true, borderColor: '#FF5F00', backgroundColor: 'rgba(255, 95, 0, 0.1)', tension: 0.4 }
    ]
  };

  const hasCriticalOutage = notifications.some(n => n.type === 'error');

  const renderDialogHeader = () => {
    if (!selectedNotification) return null;
    return (
        <div className="flex align-items-center gap-2">
            <i className={`pi ${selectedNotification.type === 'error' ? 'pi-exclamation-circle text-red-600' : 'pi-info-circle text-blue-600'} text-xl`}></i>
            <span>{selectedNotification.title}</span>
        </div>
    );
  };

  return (
    <div className="grid">
      {/* Welcome Banner */}
      <div className="col-12 mb-4">
          <div className="bg-green-50 p-4 border-round-xl shadow-2 border-1 border-green-200 flex flex-column md:flex-row align-items-center justify-content-between">
              <h1 className="text-3xl font-bold text-900 m-0">Welcome back, {user?.username}</h1>
              <div className="flex gap-2 mt-3 md:mt-0">
                  <Tag value="Visa Gateway Active" className="bg-white text-blue-700 border-1 border-blue-100" />
                  <Tag value="Mastercard Node Active" className="bg-white text-orange-700 border-1 border-orange-100" />
              </div>
          </div>
      </div>

      {/* KPI Cards */}
      {kpiData.map((kpi, i) => (
          <div key={i} className="col-12 md:col-6 lg:col-3 mb-4">
              <div className="surface-card shadow-1 p-4 border-round-xl border-1 border-200 h-full flex flex-column justify-content-between">
                  <div className="flex justify-content-between align-items-start mb-3">
                      <div>
                          <span className="block text-500 font-bold text-xs uppercase mb-1">{kpi.title}</span>
                          <div className="text-900 font-bold text-2xl">{kpi.value}</div>
                      </div>
                      <div className={`flex align-items-center justify-content-center bg-${kpi.color}-50 border-round-lg`} style={{ width: '3rem', height: '3rem' }}>
                          <i className={`${kpi.icon} text-${kpi.color}-500 text-xl`} />
                      </div>
                  </div>
                  <div className="flex align-items-center gap-2 mt-auto">
                      <span className={`text-xs font-bold ${kpi.trendColor}`}>{kpi.trend}</span>
                  </div>
              </div>
          </div>
      ))}

      {/* Dashboard Row 2: Equal Height Components */}
      <div className="col-12 lg:col-6 mb-4">
        <Card className="shadow-2 border-round-xl border-1 border-200 flex flex-column equal-height-card" style={{ height: rowHeight }} title="Network Dispute Volume">
            <div className="flex-1" style={{ minHeight: 0 }}>
                <Chart type="line" data={chartData} options={chartOptions} style={{ height: '100%' }} />
            </div>
        </Card>
      </div>

      <div className="col-12 lg:col-3 mb-4">
        <Panel header="Pinned Workspaces" className="shadow-2 border-round-xl border-1 border-200 flex flex-column equal-height-panel" style={{ height: rowHeight }}>
            <div className="flex flex-column h-full overflow-hidden">
                <span className="p-input-icon-left w-full mb-3 px-2">
                    <i className="pi pi-search text-xs" />
                    <InputText value={bookmarkSearch} onChange={(e) => setBookmarkSearch(e.target.value)} placeholder="Filter pins..." className="p-inputtext-sm w-full" />
                </span>
                <div className="overflow-y-auto flex-1 px-2 custom-scrollbar">
                    {filteredBookmarks.map((bookmark) => (
                        <div key={bookmark.id} onClick={() => navigate(bookmark.route)} className="surface-card p-2 border-round-lg mb-2 shadow-1 border-1 border-100 hover:border-primary transition-all cursor-pointer flex align-items-center gap-3">
                            <div className={`flex-shrink-0 flex align-items-center justify-content-center bg-${bookmark.color}-50 border-round`} style={{ width: '2rem', height: '2rem' }}>
                                <i className={`pi ${bookmark.icon} text-${bookmark.color}-500 text-sm`} />
                            </div>
                            <div className="flex flex-column overflow-hidden flex-1">
                                <span className="text-xs font-bold text-900 truncate">{bookmark.title}</span>
                                <span className="text-400" style={{ fontSize: '10px' }}>{bookmark.subtitle}</span>
                            </div>
                            <Button icon="pi pi-times" rounded text size="small" severity="secondary" onClick={(e) => { e.stopPropagation(); dispatch(removeBookmark(bookmark.id)); }} />
                        </div>
                    ))}
                </div>
            </div>
        </Panel>
      </div>

      <div className="col-12 lg:col-3 mb-4">
        <Panel header="Message Feed" className="shadow-2 border-round-xl border-1 border-200 flex flex-column equal-height-panel" style={{ height: rowHeight }}>
            <div className="flex flex-column h-full overflow-hidden">
                <div className="overflow-y-auto flex-1 px-2 custom-scrollbar">
                    {notifications.map((n) => (
                        <div key={n.id} onClick={() => openNotification(n)} className={`p-2 border-round-lg mb-2 border-1 cursor-pointer transition-all ${n.type === 'error' ? 'bg-red-50 border-red-200' : 'surface-50 border-100 hover:bg-surface-100'}`}>
                            <div className="flex align-items-center gap-2 mb-1">
                                <i className={`pi ${n.type === 'error' ? 'pi-bolt text-red-600' : 'pi-info-circle text-blue-500'} text-xs`}></i>
                                <span className="font-bold text-xs truncate">{n.title}</span>
                            </div>
                            <p className="text-500 m-0 overflow-hidden text-overflow-ellipsis" style={{ fontSize: '10px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}>{n.message}</p>
                        </div>
                    ))}
                    <Button label="Audit Registry" icon="pi pi-external-link" text size="small" className="w-full mt-2" onClick={() => navigate('/notifications')} />
                </div>
            </div>
        </Panel>
      </div>

      <Dialog header={renderDialogHeader()} visible={showDetailDialog} style={{ width: '400px' }} onHide={() => setShowDetailDialog(false)} footer={<Button label="Close" text onClick={() => setShowDetailDialog(false)} />}>
        {selectedNotification && <p className="line-height-3">{selectedNotification.message}</p>}
      </Dialog>

      <style>{`
        .equal-height-card .p-card-body, .equal-height-card .p-card-content { display: flex; flex-direction: column; flex: 1; height: 100%; padding: 1.25rem !important; }
        .equal-height-panel .p-panel-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 1rem 0.5rem; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--surface-300); border-radius: 10px; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      `}</style>
    </div>
  );
};

export default Dashboard;
