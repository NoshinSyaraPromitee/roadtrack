import { lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { useLang } from '@/shared/i18n';
import { SubmitNotice } from '@/shared/ui';
import { AppShell } from './AppShell';
import { ErrorBoundary } from './ErrorBoundary';
import { RequireRole } from './RequireRole';

/** Each role's page is its own download, so a worker's phone never fetches the head office screens. */
const AdminPage = lazy(() => import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const SupervisorPage = lazy(() => import('@/pages/SupervisorPage').then((m) => ({ default: m.SupervisorPage })));
const WorkerPage = lazy(() => import('@/pages/WorkerPage').then((m) => ({ default: m.WorkerPage })));

export default function App() {
  const lang = useLang((s) => s.lang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
