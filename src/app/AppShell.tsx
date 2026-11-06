import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Building2, LogOut, RotateCcw } from 'lucide-react';
import { SUPERVISOR } from '@/core/seed';
import { ApaAssistant } from '@/features/assistant';
import { RoadSwitcher } from '@/features/road';
import { useSession } from '@/features/session';
import { useRoadProgressMap } from '@/features/shift';
import { Avatar, roleOf, shortName, useWorker } from '@/features/workforce';
import { LangToggle, useI18n } from '@/shared/i18n';
import { VoiceGuideToggle } from '@/shared/voice';
import { Logo, Pictogram } from '@/shared/ui';

export function AppShell() {
  const i = useI18n();
  const role = useSession((s) => s.role);
  const workerId = useSession((s) => s.workerId);
  const logout = useSession((s) => s.logout);
  const worker = useWorker(workerId);
  const navigate = useNavigate();
  const progress = useRoadProgressMap();

  const person = role === 'worker' ? worker : role === 'supervisor' ? SUPERVISOR : undefined;

  const resetDemo = () => {
    if (!window.confirm(i.t('Reset all demo data to the sample project?', 'সব ডেমো তথ্য মুছে নমুনা প্রকল্পে ফিরে যাবেন?'))) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith('roadtrack-') && k !== 'roadtrack-v3-lang')
      .forEach((k) => localStorage.removeItem(k));
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-guide-700 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="RoadTrack">
              <Logo tone="light" className="[&>span:last-child]:hidden xl:[&>span:last-child]:inline" />
            </Link>
            <span className="hidden min-w-0 md:flex">
              <RoadSwitcher progress={progress} />
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {person ? (
              <span className="mr-1 hidden items-center gap-2 lg:flex">
                <Avatar person={person} size={36} />
                <span className="leading-tight">
                  <span className="block font-semibold">{shortName(person, i.lang)}</span>
                  <span className="block text-sm text-white/75">{i.tx(roleOf(person))}</span>
                </span>
              </span>
            ) : role === 'admin' ? (
              <span className="mr-1 hidden items-center gap-2 lg:flex">
                <Pictogram icon={Building2} tone="sign" shape="disc" size={36} />
                <span className="font-semibold">{i.t('Head office', 'প্রধান কার্যালয়')}</span>
              </span>
            ) : null}
            <LangToggle tone="dark" />
            <VoiceGuideToggle />
            <button
              type="button"
              onClick={resetDemo}
              title={i.t('Reset demo data', 'ডেমো তথ্য রিসেট')}
              aria-label={i.t('Reset demo data', 'ডেমো তথ্য রিসেট')}
              className="grid h-10 w-10 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              aria-label={i.t('Switch user', 'ব্যবহারকারী বদলান')}
              className="flex h-10 items-center gap-2 rounded-full bg-white/10 px-3 font-semibold transition hover:bg-white/20"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden lg:inline">{i.t('Switch user', 'ব্যবহারকারী বদলান')}</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 md:py-8">
        <div className="-mt-1 mb-3 md:hidden">
          <RoadSwitcher progress={progress} variant="page" />
        </div>
        <ApaAssistant />
        <Outlet />
      </main>
    </div>
  );
}
