
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, User, UserRole, Client } from '../types';

interface LoginCredentials {
  username: string;
  roles: UserRole[];
}

const MOCK_CLIENTS: Client[] = [
    { id: 'C-101', name: 'Acme Global Corp', region: 'North America', status: 'Active' },
    { id: 'C-204', name: 'Zenith Financial', region: 'EMEA', status: 'Active' },
    { id: 'C-309', name: 'Quantum Logistics', region: 'APAC', status: 'Onboarding' },
    { id: 'C-412', name: 'Starlight Retail', region: 'North America', status: 'Inactive' }
];

// Helper to generate a large list of roles for demonstration
const getExtendedRoles = (): UserRole[] => {
    const standardRoles = [
        UserRole.ADMIN, 
        UserRole.VIEW_REPORTS, 
        UserRole.VIEW_DOCUMENTS, 
        UserRole.VIEW_SYSTEM,
        UserRole.USER
    ];
    
    // Simulating granular permission strings usually returned by IAM systems
    const granularPermissions = [
        'CASE_CREATE', 'CASE_READ', 'CASE_UPDATE', 'CASE_DELETE', 'CASE_ARCHIVE',
        'DISPUTE_INITIATE', 'DISPUTE_RESOLVE', 'DISPUTE_ESCALATE', 'DISPUTE_WITHDRAW',
        'FRAUD_DETECT_L1', 'FRAUD_DETECT_L2', 'FRAUD_REVIEW_MANAGER',
        'COMPLIANCE_CHECK_US', 'COMPLIANCE_CHECK_EU', 'COMPLIANCE_CHECK_APAC',
        'REPORT_GENERATE_DAILY', 'REPORT_GENERATE_WEEKLY', 'REPORT_GENERATE_CUSTOM',
        'USER_MANAGEMENT_READ', 'USER_MANAGEMENT_WRITE', 'ROLE_ASSIGNMENT',
        'SYSTEM_CONFIG_CORE', 'SYSTEM_CONFIG_INTEGRATIONS', 'SYSTEM_CONFIG_SECURITY',
        'AUDIT_ACCESS_FULL', 'AUDIT_ACCESS_READ_ONLY',
        'BILLING_VIEW_INVOICES', 'BILLING_UPDATE_METHOD', 'BILLING_DISPUTE',
        'API_TOKEN_GENERATE', 'API_TOKEN_REVOKE',
        'WEBHOOK_CONFIGURE', 'WEBHOOK_TEST',
        'WORKFLOW_APPROVE_L1', 'WORKFLOW_APPROVE_L2', 'WORKFLOW_APPROVE_FINAL',
        'DOCUMENT_SIGN_OFF', 'DOCUMENT_SEAL', 'DOCUMENT_DESTROY',
        'NOTIFICATION_BROADCAST', 'MAINTENANCE_MODE_TOGGLE'
    ];

    return [...standardRoles, ...granularPermissions] as UserRole[];
};

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
        operatorName: credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1),
        roles: credentials.roles.length > 0 ? credentials.roles : getExtendedRoles(), // Default to full list if none selected for demo
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.username)}&background=random`,
        clients: MOCK_CLIENTS
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
        username: 'admin_user',
        operatorName: 'System Administrator',
        roles: getExtendedRoles(),
        avatarUrl: `https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff`,
        clients: MOCK_CLIENTS
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
    username: 'admin_user',
    operatorName: 'System Administrator',
    roles: getExtendedRoles(),
    avatarUrl: `https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff`,
    clients: MOCK_CLIENTS
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
    },
    updateOperatorName: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.operatorName = action.payload;
        // Update avatar to match new name
        state.user.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(action.payload)}&background=0D8ABC&color=fff`;
      }
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

export const { logout, clearError, updateOperatorName } = authSlice.actions;
export default authSlice.reducer;
