import { Suspense } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Building2, LogOut, Megaphone, RotateCcw } from 'lucide-react';
import { SUPERVISOR } from '@/data/seed';
import { ApaAssistant } from '@/features/assistant';
import { RoadSelect } from '@/features/road';
import { useContractor, useSession } from '@/features/session';
import { useRoadProgressMap } from '@/features/shift';
import { Avatar, roleOf, shortName, useWorker } from '@/features/workforce';
import { LangToggle, useI18n } from '@/shared/i18n';
import { VoiceGuideToggle } from '@/shared/voice';
import { Logo, Pictogram } from '@/shared/ui';
import { clearSavedData } from '@/shared/lib/savedData';
import { NavButtons } from './NavButtons';
import { PageLoading } from './PageLoading';

export function AppShell() {
  const i = useI18n();
  const role = useSession((s) => s.role);
  const workerId = useSession((s) => s.workerId);
  const logout = useSession((s) => s.logout);
  const contractor = useContractor(useSession((s) => s.accountId));
  const worker = useWorker(workerId);
  const navigate = useNavigate();
  const progress = useRoadProgressMap();

  const supervisor = contractor ? { id: contractor.id, name: contractor.name, nameBn: contractor.name, color: SUPERVISOR.color } : SUPERVISOR;
  const person = role === 'worker' ? worker : role === 'supervisor' ? supervisor : undefined;

  const resetData = () => {
    if (!window.confirm(i.t('Delete everything saved on this device and start again?', 'এই ডিভাইসে রাখা সব তথ্য মুছে আবার শুরু করবেন?'))) return;
    clearSavedData();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-guide-600 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="RoadTrack">
              <Logo tone="light" className="[&>span:last-child]:hidden xl:[&>span:last-child]:inline" />
            </Link>
            <RoadSelect progress={progress} variant="header" className="hidden md:block" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {person ? (
              <span className="mr-1 hidden items-center gap-2 xl:flex">
                <Avatar person={person} size={36} />
                <span className="leading-tight">
                  <span className="block w-24 truncate font-semibold">{shortName(person, i.lang)}</span>
                  <span className="block w-24 truncate text-sm text-white/75">{contractor ? i.t('Contractor', 'ঠিকাদার') : i.tx(roleOf(person))}</span>
                </span>
              </span>
            ) : role === 'admin' ? (
              <span className="mr-1 hidden items-center gap-2 xl:flex">
                <Pictogram icon={Building2} shape="disc" size={36} onDark />
                <span className="font-semibold">{i.t('Head office', 'প্রধান কার্যালয়')}</span>
              </span>
            ) : null}
            {role === 'supervisor' && (
              <button
                type="button"
                onClick={() => navigate('/supervisor?view=complain')}
                title={i.t('Make a complaint', 'অভিযোগ করুন')}
                aria-label={i.t('Make a complaint', 'অভিযোগ করুন')}
                className="flex h-10 items-center justify-center gap-2 rounded-full bg-white/10 px-2.5 font-semibold transition hover:bg-white/20 lg:px-3"
              >
                <Megaphone className="h-5 w-5" />
                <span className="hidden lg:inline">{i.t('Complain', 'অভিযোগ')}</span>
              </button>
            )}
            <LangToggle tone="dark" />
            <VoiceGuideToggle withLabel />
            <button
              type="button"
              onClick={resetData}
              title={i.t('Start again', 'আবার শুরু করুন')}
              aria-label={i.t('Start again', 'আবার শুরু করুন')}
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
              className="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white/10 px-3 font-semibold transition hover:bg-white/20 lg:px-4"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden lg:inline">{i.t('Switch user', 'ব্যবহারকারী বদলান')}</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 md:py-8">
        <div className="-mt-1 mb-4 flex items-center justify-between gap-3 md:mt-0">
          <NavButtons />
          <RoadSelect progress={progress} variant="inline" className="min-w-0 md:hidden" />
        </div>
        <ApaAssistant />
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
