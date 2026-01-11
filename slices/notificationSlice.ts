
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
  category?: 'network' | 'system' | 'transaction';
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  items: Notification[];
}

const initialState: NotificationState = {
  items: [
    { 
      id: 'outage-1', 
      title: 'CRITICAL: Region West-2 Outage', 
      message: 'Mastercard authorization gateway in Region West-2 is currently unreachable. Failover in progress.', 
      type: 'error', 
      category: 'system',
      timestamp: 'Active Now', 
      read: false 
    },
    { 
      id: 'maint-1', 
      title: 'Scheduled Maintenance', 
      message: 'Visa VCR API will be offline for protocol updates on Sunday, 02:00 - 04:00 UTC.', 
      type: 'warn', 
      category: 'system',
      timestamp: 'Scheduled', 
      read: false 
    },
    { 
      id: '1', 
      title: 'Security Patch Applied', 
      message: 'Kernel version 5.14 updated successfully.', 
      type: 'success', 
      category: 'system',
      timestamp: '10m ago', 
      read: false 
    },
    { 
      id: '2', 
      title: 'Unauthorized Access Attempt', 
      message: 'Blocked IP 192.168.1.105 at Perimeter Alpha.', 
      type: 'warn', 
      category: 'network',
      timestamp: '1h ago', 
      read: false 
    }
  ]
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'read'>>) => {
      state.items.unshift({
        ...action.payload,
        id: Date.now().toString(),
        read: false
      });
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find(n => n.id === action.payload);
      if (item) item.read = true;
    },
    markAllAsRead: (state) => {
      state.items.forEach(n => n.read = true);
    },
    clearNotifications: (state) => {
      state.items = [];
    }
  }
});

export const { addNotification, markAsRead, markAllAsRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
