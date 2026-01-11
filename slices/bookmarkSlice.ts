
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Bookmark {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  icon: string;
  color: string;
}

interface BookmarkState {
  items: Bookmark[];
}

const initialState: BookmarkState = {
  items: [
    { id: 'BK-1', title: 'Case #VS-1042', subtitle: 'Arbitration', route: '/active-cases', icon: 'pi-shield', color: 'blue' },
    { id: 'BK-2', title: 'Audit Q3', subtitle: 'Visa VCR', route: '/gallery', icon: 'pi-file-pdf', color: 'orange' },
    { id: 'BK-3', title: 'Network Reports', subtitle: 'Daily Performance', route: '/reports', icon: 'pi-chart-bar', color: 'purple' },
  ]
};

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark: (state, action: PayloadAction<Bookmark>) => {
      const exists = state.items.find(item => item.route === action.payload.route);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeBookmark: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    toggleBookmark: (state, action: PayloadAction<Bookmark>) => {
      const index = state.items.findIndex(item => item.route === action.payload.route);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
    },
    clearBookmarks: (state) => {
      state.items = [];
    }
  }
});

export const { addBookmark, removeBookmark, toggleBookmark, clearBookmarks } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
