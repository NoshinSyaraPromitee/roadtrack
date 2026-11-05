import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, HardHat, LayoutDashboard, Smartphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Role } from '@/core/types';
import { useWorkforce } from '@/features/workforce';
import { Button, Select } from '@/shared/ui';
import { useSession } from './store';

const ROLES: Array<{ role: Role; title: string; desc: string; icon: LucideIcon; path: string }> = [
  {
    role: 'admin',
    title: 'Higher Authority',
    desc: 'Project dashboard, payroll approval, complaints, raise requests and the full recorded history.',
    icon: LayoutDashboard,
    path: '/admin',
  },
  {
    role: 'supervisor',
    title: 'Site Supervisor',
    desc: 'Clock in the crew, issue materials, get rest and snack reminders, then recount and close the shift.',
    icon: HardHat,
    path: '/supervisor',
  },
  {
    role: 'worker',
    title: 'Worker',
    desc: 'Track earnings from your phone, file a complaint and request a raise for a reasonable cause.',
    icon: Smartphone,
    path: '/worker',
  },
];

export function RolePicker() {
  const login = useSession((s) => s.login);
  const workers = useWorkforce((s) => s.workers);
  const navigate = useNavigate();
  const [workerId, setWorkerId] = useState(workers[0]?.id ?? '');

  const enter = (role: Role, path: string) => {
    login(role, role === 'worker' ? workerId : null);
    navigate(path);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {ROLES.map(({ role, title, desc, icon: Icon, path }) => (
        <div key={role} className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-amber-400/60">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-400 text-zinc-900">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold">{title}</h3>
          <p className="mt-1 flex-1 text-sm text-zinc-400">{desc}</p>
          {role === 'worker' && (
            <div className="mt-4">
              <Select value={workerId} onChange={(e) => setWorkerId(e.target.value)} aria-label="Sign in as worker">
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} - {w.post}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <Button className="mt-5 w-full" onClick={() => enter(role, path)}>
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}