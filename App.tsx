
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Gallery from './pages/Gallery';
import Reports from './pages/Reports';
import Search from './pages/Search';
import ActiveCases from './pages/ActiveCases';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes: Dashboard (Accessible by anyone with basic roles) */}
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