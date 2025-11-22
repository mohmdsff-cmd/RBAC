export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
  VIEW_REPORTS = 'VIEW_REPORTS',
  VIEW_DOCUMENTS = 'VIEW_DOCUMENTS',
  VIEW_SYSTEM = 'VIEW_SYSTEM'
}

export interface User {
  id: string;
  username: string;
  roles: UserRole[];
  avatarUrl?: string;
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