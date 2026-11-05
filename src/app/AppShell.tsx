import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, RotateCcw } from 'lucide-react';
import { PROJECT } from '@/core/seed';
import { useSession } from '@/features/session';
import { useWorker } from '@/features/workforce';
import { Logo } from '@/shared/ui';

const ROLE_LABEL = { admin: 'Higher Authority', supervisor: 'Supervisor', worker: 'Worker' } as const;

export function AppShell() {
  const role = useSession((s) => s.role);
  const workerId = useSession((s) => s.workerId);
  const logout = useSession((s) => s.logout);
  const worker = useWorker(workerId);
  const navigate = useNavigate();

  const who = role === 'worker' ? worker?.name : role === 'supervisor' ? PROJECT.supervisor : 'Project Director';

  const resetDemo = () => {
    if (!window.confirm('Reset all demo data to the original sample project?')) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith('roadtrack-'))
      .forEach((k) => localStorage.removeItem(k));
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen">
      <div className="hazard h-1.5" />
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-900/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
            <span className="hidden border-l border-zinc-700 pl-3 text-xs text-zinc-400 md:block">{PROJECT.name}</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            {role && (
              <div className="mr-1 hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight">{who}</p>
                <p className="text-[11px] uppercase tracking-wider text-amber-400">{ROLE_LABEL[role]}</p>
              </div>
            )}
            <button
              type="button"
              onClick={resetDemo}
              title="Reset demo data"
              aria-label="Reset demo data"
              className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Switch role</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}