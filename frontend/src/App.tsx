import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PartnersPage } from './pages/PartnersPage';
import { ConnectorsPage } from './pages/ConnectorsPage';
import { ThuPage } from './pages/ThuPage';
import { ChiPage } from './pages/ChiPage';
import { QuyetToanPage } from './pages/QuyetToanPage';
import { BalancePage } from './pages/BalancePage';
import { ReconciliationPage } from './pages/ReconciliationPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="connectors" element={<ConnectorsPage />} />
        <Route path="thu" element={<ThuPage />} />
        <Route path="chi" element={<ChiPage />} />
        <Route path="quyet-toan" element={<QuyetToanPage />} />
        <Route path="balance" element={<BalancePage />} />
        <Route path="reconciliation" element={<ReconciliationPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
