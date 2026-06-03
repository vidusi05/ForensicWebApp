import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import CaseManagement from './pages/cases/CaseManagement';
import EvidenceStorage from './pages/evidence/EvidenceStorage';
import Reporting from './pages/reports/Reporting';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cases" element={<CaseManagement />} />
          <Route path="evidence" element={<EvidenceStorage />} />
          <Route path="reports" element={<Reporting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
