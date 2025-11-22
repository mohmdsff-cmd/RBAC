import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, User, UserRole } from '../types';

// Mock Login Thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, roles }: { username: string; roles: UserRole[] }, { rejectWithValue }) => {
    try {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!username) throw new Error('Username is required');
      if (!roles || roles.length === 0) throw new Error('At least one role is required');

      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        roles,
        avatarUrl: `https://ui-avatars.com/api/?name=${username}&background=random`
      };
      return mockUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
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
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;