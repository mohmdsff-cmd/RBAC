
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
import RangeReports from './pages/RangeReports';
import Search from './pages/Search';
import ActiveCases from './pages/ActiveCases';
import CaseDetail from './pages/CaseDetail';
import Help from './pages/Help';
import UserProfile from './pages/UserProfile';
import Unauthorized from './pages/Unauthorized';
import NotificationsPage from './pages/NotificationsPage';
import UploadPortal from './pages/UploadPortal';
import EvidenceSubmission from './pages/EvidenceSubmission';
import DocumentMatching from './pages/DocumentMatching';
import PendingItems from './pages/PendingItems';
import PendingItemReview from './pages/PendingItemReview';
import DocumentGenerator from './pages/DocumentGenerator';
import LoginPage from './pages/LoginPage';
import DisputeAccountSearch from './pages/DisputeAccountSearch';
import PdfRedactionPage from './pages/PdfRedactionPage';
import CaseManagementDashboard from './pages/CaseManagementDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';
// import { ProgressSpinner } from 'primereact/progressspinner'; // No longer needed for full page blocking

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // We no longer block the entire app rendering on isLoading to prevent Router unmounting during login actions
  const { isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Attempt to fetch user profile on app load (Simulate SSO check)
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Removed the blocking loading check. 
  // Loading states for actions like Login are now handled within the specific pages/components.

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
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

           {/* Protected Routes: Notifications Registry */}
           <Route 
            path="/notifications" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_SYSTEM]}>
                <NotificationsPage />
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

          {/* Protected Routes: Upload Portal (Generic) */}
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_DOCUMENTS]}>
                <UploadPortal />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes: Evidence Submission (New) */}
          <Route 
            path="/evidence" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_DOCUMENTS]}>
                <EvidenceSubmission />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes: Document Matching (New) */}
          <Route 
            path="/document-matching" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_DOCUMENTS]}>
                <DocumentMatching />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes: Case Management Workspace (New) */}
          <Route 
            path="/case-management" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_DOCUMENTS, UserRole.VIEW_SYSTEM]}>
                <CaseManagementDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes: Document Generator (New) */}
          <Route 
            path="/document-generator" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_DOCUMENTS, UserRole.VIEW_SYSTEM]}>
                <DocumentGenerator />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes: Pending Items (New) */}
          <Route 
            path="/pending-items" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_DOCUMENTS, UserRole.VIEW_SYSTEM]}>
                <PendingItems />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pending-items/:id" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_DOCUMENTS, UserRole.VIEW_SYSTEM]}>
                <PendingItemReview />
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

          {/* Protected Routes: Dispute Account Search */}
          <Route 
            path="/account-lookup" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_DOCUMENTS, UserRole.VIEW_SYSTEM]}>
                <DisputeAccountSearch />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes: Document Redaction */}
          <Route 
            path="/redact" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_DOCUMENTS, UserRole.VIEW_SYSTEM]}>
                <PdfRedactionPage />
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

          {/* Protected Routes: Case Detail */}
          <Route 
            path="/case/:id" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_REPORTS, UserRole.VIEW_SYSTEM]}>
                <CaseDetail />
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

          {/* Protected Routes: Range Reports */}
          <Route 
            path="/range-reports" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.VIEW_REPORTS]}>
                <RangeReports />
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

          {/* Protected Routes: User Profile */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.USER, UserRole.VIEW_REPORTS, UserRole.VIEW_DOCUMENTS, UserRole.VIEW_SYSTEM, UserRole.GUEST]}>
                <UserProfile />
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
