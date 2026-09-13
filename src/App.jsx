import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

function Guard({ children }) {
  const { ready, isAuthenticated, needsSetup } = useAuth();
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        جاري التحميل...
      </div>
    );
  }
  if (!isAuthenticated || needsSetup) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated, needsSetup, ready } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={ready && isAuthenticated && !needsSetup ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        element={
          <Guard>
            <AppShell />
          </Guard>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
