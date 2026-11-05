import { useEffect, useRef, useState } from 'react';
import { Bell, BellRing, Coffee, Cookie, Timer } from 'lucide-react';
import type { BreakLog, BreakType } from '@/core/types';
import { DEMO_POLICY, REAL_POLICY, getBreakStatus } from '@/core/reminderPolicy';
import { Badge, Button, Card, CardHeader, Switch } from '@/shared/ui';
import { fmtDuration, fmtTime } from '@/shared/lib/utils';
import { useNow } from '@/shared/lib/useNow';
import { useReminderSettings } from './store';

interface Props {
  startedAt: string;
  breaks: BreakLog[];
  onLog: (type: BreakType) => void;
}

const COPY: Record<BreakType, { title: string; text: string }> = {
  rest: {
    title: 'Rest break due',
    text: 'Give the crew 15 minutes in the shade with drinking water. Check on senior and unwell workers first.',
  },
  snack: {
    title: 'Snack time',
    text: 'Serve snacks and water (tea, bread, banana) and let everyone rest for 20-30 minutes.',
  },
};

const canNotify = () => typeof window !== 'undefined' && 'Notification' in window;

export function BreakReminder({ startedAt, breaks, onLog }: Props) {
  const demoMode = useReminderSettings((s) => s.demoMode);
  const setDemoMode = useReminderSettings((s) => s.setDemoMode);
  const now = useNow();
  const policy = demoMode ? DEMO_POLICY : REAL_POLICY;
  const status = getBreakStatus(startedAt, breaks, policy, now);
  const due = status.due;

  const [permission, setPermission] = useState<NotificationPermission>(() => (canNotify() ? Notification.permission : 'denied'));
  const lastAlert = useRef('');

  useEffect(() => {
    if (!due) return;
    const key = `${due}-${breaks.length}`;
    if (lastAlert.current === key) return;
    lastAlert.current = key;
    if (canNotify() && Notification.permission === 'granted') {
      new Notification(`RoadTrack: ${COPY[due].title}`, { body: COPY[due].text });
    }
    navigator.vibrate?.([200, 100, 200]);
  }, [due, breaks.length]);

  const enableAlerts = async () => {
    if (!canNotify()) return;
    setPermission(await Notification.requestPermission());
  };

  const subtitle = demoMode
    ? `Demo speed: rest every ${policy.restEveryMin} min, snack every ${policy.snackEveryMin} min`
    : `Rest every ${policy.restEveryMin / 60} h, snack every ${policy.snackEveryMin / 60} h`;

  return (
    <Card tone={due ? 'alert' : 'default'}>
      <CardHeader
        icon={due ? BellRing : Timer}
        title="Rest & snack reminders"
        subtitle={subtitle}
        action={
          <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
            Demo speed
            <Switch checked={demoMode} onChange={setDemoMode} label="Demo speed" />
          </label>
        }
      />

      {due ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 animate-bounce place-items-center rounded-2xl bg-amber-400 text-zinc-900">
              {due === 'snack' ? <Cookie className="h-6 w-6" /> : <Coffee className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-lg font-extrabold">{COPY[due].title}</p>
              <p className="text-sm text-zinc-700">{COPY[due].text}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="dark" onClick={() => onLog('rest')}>
              <Coffee className="h-4 w-4" /> Log rest
            </Button>
            <Button onClick={() => onLog('snack')}>
              <Cookie className="h-4 w-4" /> Log snack
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-500">Next {status.nextType} reminder in</p>
            <p className="font-mono text-3xl font-bold tabular-nums">{fmtDuration(status.msUntilNext)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canNotify() && permission !== 'granted' && (
              <Button variant="secondary" size="sm" onClick={enableAlerts}>
                <Bell className="h-4 w-4" /> Enable phone alerts
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => onLog('rest')}>
              <Coffee className="h-4 w-4" /> Log rest now
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onLog('snack')}>
              <Cookie className="h-4 w-4" /> Log snack now
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-200/70 pt-4 text-xs text-zinc-500">
        <span className="font-semibold uppercase tracking-wide">Break log</span>
        {breaks.length === 0 ? (
          <span>No breaks yet</span>
        ) : (
          breaks.map((b) => (
            <Badge key={b.id} tone={b.type === 'snack' ? 'amber' : 'blue'}>
              {b.type === 'snack' ? 'Snack' : 'Rest'} {fmtTime(b.at)}
            </Badge>
          ))
        )}
      </div>
    </Card>
  );
}