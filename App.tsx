import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { fetchUserProfile } from './slices/authSlice';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Gallery from './pages/Gallery';
import Reports from './pages/Reports';
import Search from './pages/Search';
import ActiveCases from './pages/ActiveCases';
import Help from './pages/Help';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';
import { ProgressSpinner } from 'primereact/progressspinner';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Attempt to fetch user profile on app load (Simulate SSO check)
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen surface-ground">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public/Error Routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes: Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.GUEST, UserRole.VIEW_REPORTS, UserRole.VIEW_DOCUMENTS, UserRole.VIEW_SYSTEM]}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

           {/* Protected Routes: Gallery */}
           <Route 
            path="/gallery" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_DOCUMENTS]}>
                <Gallery />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes: Search */}
          <Route 
            path="/search" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_DOCUMENTS, UserRole.VIEW_SYSTEM]}>
                <Search />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes: Active Cases */}
          <Route 
            path="/active-cases" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_REPORTS, UserRole.VIEW_SYSTEM]}>
                <ActiveCases />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes: Reports (Accessible by Admin OR View Reports) */}
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.VIEW_REPORTS]}>
                <Reports />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes: Help (Accessible by standard users) */}
          <Route 
            path="/help" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_REPORTS, UserRole.VIEW_DOCUMENTS, UserRole.VIEW_SYSTEM, UserRole.GUEST]}>
                <Help />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes: Admin Panel (Accessible only by Admin) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;