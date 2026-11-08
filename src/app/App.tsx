import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminPage } from '@/pages/AdminPage';
import { LoginPage } from '@/pages/LoginPage';
import { SupervisorPage } from '@/pages/SupervisorPage';
import { WorkerPage } from '@/pages/WorkerPage';
import { useLang } from '@/shared/i18n';
import { SubmitNotice } from '@/shared/ui';
import { AppShell } from './AppShell';
import { RequireRole } from './RequireRole';

export default function App() {
  const lang = useLang((s) => s.lang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <BrowserRouter>
      <SubmitNotice />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<AppShell />}>
          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <AdminPage />
              </RequireRole>
            }
          />
          <Route
            path="/supervisor"
            element={
              <RequireRole role="supervisor">
                <SupervisorPage />
              </RequireRole>
            }
          />
          <Route
            path="/worker"
            element={
              <RequireRole role="worker">
                <WorkerPage />
              </RequireRole>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
