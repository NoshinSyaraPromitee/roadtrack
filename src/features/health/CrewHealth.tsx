import { HeartPulse, ThumbsUp } from 'lucide-react';
import { Avatar, personName, roleOf, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { VoiceNote } from '@/shared/voice';
import { Card, CardHeader, EmptyState } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { HEALTH_ICON } from './meta';
import { HEALTH_LABEL, sickDays, todaysReports } from './model';
import { useHealthReports } from './store';

/** What the crew told the app about their health today. Sick and hurt first. */
export function CrewHealth() {
  const i = useI18n();
  const reports = useHealthReports((s) => s.reports);
  const workers = useWorkforce((s) => s.workers);
  const today = todaysReports(reports).sort((a, b) => Number(a.status === 'fit') - Number(b.status === 'fit'));
  const notWell = today.filter((r) => r.status !== 'fit').length;
  const silent = workers.filter((w) => !today.some((r) => r.workerId === w.id));

  return (
    <Card>
      <CardHeader
        icon={HeartPulse}
        tone="stop"
        shape="disc"
        title={i.t('Crew health today', 'আজ শ্রমিকদের শরীর')}
        speak={{
          en: `${notWell} workers are not well today. ${silent.length} have not told yet.`,
          bn: `আজ ${i.num(notWell)} জন শ্রমিক ভালো নেই। ${i.num(silent.length)} জন এখনো জানাননি।`,
        }}
        action={
          <span className={cn('font-semibold', notWell ? 'text-stop-600' : 'text-guide-700')}>
            {notWell ? i.t(`${i.num(notWell)} not well`, `${i.num(notWell)} জন ভালো নেই`) : i.t('Everyone is well', 'সবাই ভালো')}
          </span>
        }
      />
      {today.length === 0 ? (
        <EmptyState icon={ThumbsUp} title={i.t('No one has sent anything today', 'আজ কেউ কিছু পাঠাননি')} />
      ) : (
        <ul className="space-y-2">
          {today.map((r) => {
            const w = workers.find((x) => x.id === r.workerId);
            if (!w) return null;
            const m = HEALTH_ICON[r.status];
            return (
              <li key={r.id} className={cn('rounded-2xl border p-3', r.status === 'fit' ? 'border-line' : 'border-stop-100 bg-stop-50/50')}>
                <div className="flex items-center gap-3">
                  <Avatar person={w} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{personName(w, i.lang)}</p>
                    <p className="truncate text-sm text-ink-soft">{i.tx(roleOf(w))}</p>
                  </div>
                  <span className={cn('text-right font-semibold leading-tight', m.text)}>
                    {i.tx(HEALTH_LABEL[r.status])}
                    {r.status !== 'fit' && sickDays(reports, r.workerId).streak > 1 && (
                      <span className="block text-sm">{i.t(`${i.num(sickDays(reports, r.workerId).streak)} days in a row`, `টানা ${i.num(sickDays(reports, r.workerId).streak)} দিন`)}</span>
                    )}
                  </span>
                </div>
                {(r.note || r.audio) && (
                  <div className="mt-2 space-y-2 pl-14">
                    {r.note && <p>{r.note}</p>}
                    {r.audio && <VoiceNote src={r.audio} />}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {silent.length > 0 && (
        <p className="mt-3 text-ink-soft">
          {i.t('Not told yet:', 'এখনো জানাননি:')} {silent.map((w) => personName(w, i.lang)).join(', ')}
        </p>
      )}
    </Card>
  );
}
