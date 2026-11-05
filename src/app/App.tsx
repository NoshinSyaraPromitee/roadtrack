import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminPage } from '@/pages/AdminPage';
import { LoginPage } from '@/pages/LoginPage';
import { SupervisorPage } from '@/pages/SupervisorPage';
import { WorkerPage } from '@/pages/WorkerPage';
import { AppShell } from './AppShell';
import { RequireRole } from './RequireRole';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<AppShell />}>
          <Route path="/admin" element={<RequireRole role="admin"><AdminPage /></RequireRole>} />
          <Route path="/supervisor" element={<RequireRole role="supervisor"><SupervisorPage /></RequireRole>} />
          <Route path="/worker" element={<RequireRole role="worker"><WorkerPage /></RequireRole>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}