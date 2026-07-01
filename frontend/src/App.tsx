import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import ChangePassword from './pages/auth/ChangePassword';
import Dashboard from './pages/Dashboard';
import CaseManagement from './pages/cases/CaseManagement';
import CaseDetails from './pages/cases/CaseDetails';
import EvidenceStorage from './pages/evidence/EvidenceStorage';
import Reporting from './pages/reports/Reporting';
import Settings from './pages/Settings';
import AuditLog from './pages/AuditLog';
import UserAdministration from './pages/admin/UserAdministration';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PasswordReadyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.mustChangePassword) return <Navigate to="/change-password" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'System Administrator') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><PasswordReadyRoute><DashboardLayout /></PasswordReadyRoute></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="cases" element={<CaseManagement />} />
        <Route path="cases/:id" element={<CaseDetails />} />
        <Route path="evidence" element={<EvidenceStorage />} />
        <Route path="reports" element={<Reporting />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin/users" element={<AdminRoute><UserAdministration /></AdminRoute>} />
        <Route path="audit" element={<AdminRoute><AuditLog /></AdminRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
