
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
  VIEW_REPORTS = 'VIEW_REPORTS',
  VIEW_DOCUMENTS = 'VIEW_DOCUMENTS',
  VIEW_SYSTEM = 'VIEW_SYSTEM'
}

export interface Client {
  id: string;
  name: string;
  region: string;
  status: 'Active' | 'Inactive' | 'Onboarding';
}

export interface User {
  id: string;
  username: string;
  operatorName?: string;
  roles: UserRole[];
  avatarUrl?: string;
  clients?: Client[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Define a type for the location state to handle redirect paths
export interface LocationState {
  from?: {
    pathname: string;
  };
}
