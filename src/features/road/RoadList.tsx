import { useState } from 'react';
import { Route, Trash2 } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { Badge, Button, Card, CardHeader } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { useRoadStore, useRoads } from './store';
import { ROAD_PHOTO_FALLBACK } from './useRoadPhoto';

export function RoadList({ progress, onOpen }: { progress: Record<string, number>; onOpen: (id: string) => void }) {
  const i = useI18n();
  const { t, tx, fixed } = i;
  const roads = useRoads();
  const roadId = useRoadStore((s) => s.roadId);
  const setRoad = useRoadStore((s) => s.setRoad);
  const removeRoad = useRoadStore((s) => s.removeRoad);
  const [confirming, setConfirming] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader icon={Route} title={t('All roads', 'সব রাস্তা')} subtitle={t(`${roads.length} roads`, `${i.num(roads.length)}টি রাস্তা`)} />
      <ul className="divide-y divide-line">
        {roads.map((r) => {
          const p = progress[r.id] ?? 0;
          return (
            <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-paper">
                <img src={r.photo ?? ROAD_PHOTO_FALLBACK} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.src = ROAD_PHOTO_FALLBACK)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn('font-sign text-xl leading-tight', r.id === roadId && 'text-guide-700')}>{tx(r.name)}</p>
                <p className="text-sm text-ink-soft">
                  {tx(r.area)}, {fixed(r.lengthKm)} {t('km', 'কিমি')}, {p === 0 ? t('not started', 'শুরু হয়নি') : t(`${fixed(p)}% done`, `${fixed(p)}% শেষ`)}
                </p>
                {r.custom && <Badge tone="blue">{t('Added by the office', 'অফিস যোগ করেছে')}</Badge>}
              </div>
              <div className="flex items-center gap-2">
                {r.custom &&
                  (confirming === r.id ? (
                    <>
                      <Button size="sm" variant="danger" onClick={() => removeRoad(r.id)}>
                        {t('Yes, remove', 'হ্যাঁ, সরান')}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setConfirming(null)}>
                        {t('Keep', 'রাখুন')}
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setConfirming(r.id)} aria-label={t(`Remove ${r.name.en}`, `${r.name.bn} সরান`)}>
                      <Trash2 />
                    </Button>
                  ))}
                <Button
                  size="sm"
                  variant={r.id === roadId ? 'chosen' : 'secondary'}
                  onClick={() => {
                    setRoad(r.id);
                    onOpen(r.id);
                  }}
                >
                  {r.id === roadId ? t('Open now', 'এখন খোলা') : t('Open', 'খুলুন')}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
