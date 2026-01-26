
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, User, UserRole } from '../types';

interface LoginCredentials {
  username: string;
  roles: UserRole[];
}

// Mock API Call to login (Simulating form-based auth)
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockUser: User = {
        id: 'usr_' + Math.floor(Math.random() * 100000),
        username: credentials.username,
        roles: credentials.roles,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.username)}&background=random`
      };
      
      return mockUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to login');
    }
  }
);

// Mock API Call to get current user profile (Simulating SSO/Session-based auth)
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      // Login disabled: Resolve immediately with Admin user
      const mockUser: User = {
        id: 'usr_admin_bypass',
        username: 'AdminUser', 
        roles: [
          UserRole.ADMIN, 
          UserRole.VIEW_REPORTS, 
          UserRole.VIEW_DOCUMENTS, 
          UserRole.VIEW_SYSTEM,
          UserRole.USER
        ],
        avatarUrl: `https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff`
      };
      
      return mockUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

// Default state is authenticated to bypass login screen
const initialState: AuthState = {
  user: {
    id: 'usr_admin_bypass',
    username: 'AdminUser',
    roles: [
        UserRole.ADMIN, 
        UserRole.VIEW_REPORTS, 
        UserRole.VIEW_DOCUMENTS, 
        UserRole.VIEW_SYSTEM,
        UserRole.USER
    ],
    avatarUrl: `https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff`
  },
  isAuthenticated: true,
  isLoading: false, 
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        // Do not set isLoading to true to avoid flashing spinner on already authenticated state
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        // Even if fetch fails, keep default state to ensure access
        // state.isAuthenticated = false; 
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
