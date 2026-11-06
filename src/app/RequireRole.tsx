import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { Role } from '@/core/types';
import { useSession } from '@/features/session';

/** Opens a page only for its own role. The supervisor and the head office must also have signed in. */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const current = useSession((s) => s.role);
  const accountId = useSession((s) => s.accountId);
  if (current !== role) return <Navigate to="/" replace />;
  if (role !== 'worker' && !accountId) return <Navigate to="/" replace />;
  return <>{children}</>;
}
