import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import type { MaterialLine } from '@/core/types';
import { MATERIAL_BY_KEY } from '@/core/catalog';
import { useI18n } from '@/shared/i18n';
import { Card, CardHeader, Segmented } from '@/shared/ui';
import type { SegmentOption } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';

type Part = 'used' | 'wasted' | 'left';
type Show = 'all' | 'used' | 'wasted';

const COLOR: Record<Part, string> = { used: '#1f6b26', wasted: '#d3263a', left: '#cfd5cf' };
const TEXT: Record<Part, string> = { used: 'text-guide-700', wasted: 'text-stop-600', left: 'text-ink-soft' };

const SHOW: SegmentOption<Show>[] = [
  { value: 'all', label: { en: 'All', bn: 'সব' }, tone: 'neutral' },
  { value: 'used', label: { en: 'Used', bn: 'খরচ' }, tone: 'green' },
  { value: 'wasted', label: { en: 'Wasted', bn: 'নষ্ট' }, tone: 'red' },
];

export function MaterialTotals({ lines, title, filterable = false }: { lines: MaterialLine[]; title?: string; filterable?: boolean }) {
  const i = useI18n();
  const { t, tx, num, fixed } = i;
  const [show, setShow] = useState<Show>('all');
  const share = (v: number, all: number) => (all > 0 ? (v / all) * 100 : 0);

  const rows = lines.map((m) => {
    const def = MATERIAL_BY_KEY[m.key];
    const left = Math.max(0, m.allocated - m.used - m.wasted);
    return {
      key: m.key,
      name: tx(def.name),
      unit: tx(def.unit),
      qty: { used: m.used, wasted: m.wasted, left } as Record<Part, number>,
      pct: { used: share(m.used, m.allocated), wasted: share(m.wasted, m.allocated), left: share(left, m.allocated) } as Record<Part, number>,
    };
  });
  const avg = (k: Part) => (rows.length ? rows.reduce((s, r) => s + r.pct[k], 0) / rows.length : 0);

  const label: Record<Part, string> = { used: t('Used', 'খরচ'), wasted: t('Wasted', 'নষ্ট'), left: t('Left over', 'বাকি') };
  const parts: Part[] = show === 'all' ? ['used', 'wasted', 'left'] : [show];
  const pctText = (v: number) => `${fixed(v, 0)}%`;

  return (
    <Card>
      <CardHeader
        icon={BarChart3}
        title={title ?? t('All materials together', 'সব মালামালের হিসাব')}
        speak={{
          en: `Of all materials, on average ${i.numEn(Math.round(avg('used')))} percent was used, ${i.numEn(Math.round(avg('wasted')))} percent wasted and ${i.numEn(Math.round(avg('left')))} percent is left.`,
          bn: `সব মালামাল মিলিয়ে গড়ে ${num(Math.round(avg('used')))}% খরচ, ${num(Math.round(avg('wasted')))}% নষ্ট আর ${num(Math.round(avg('left')))}% বাকি।`,
        }}
      />

      {filterable && (
        <div className="mb-4 max-w-sm rounded-2xl border-2 border-line p-2">
          <p className="mb-1.5 px-1 text-sm font-semibold text-ink-soft">{t('Show', 'দেখান')}</p>
          <Segmented boxed label={t('Show', 'দেখান')} options={SHOW} value={show} onChange={setShow} />
        </div>
      )}

      <div className={cn('mb-4 grid gap-2', parts.length === 3 ? 'grid-cols-3' : 'grid-cols-1 sm:max-w-[12rem]')}>
        {parts.map((p) => (
          <div key={p} className="rounded-xl border border-line px-2 py-2.5 text-center">
            <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-soft">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: COLOR[p] }} />
              {label[p]}
            </p>
            <p className={cn('mt-1 font-sign text-2xl leading-none tabular-nums', TEXT[p])}>{pctText(avg(p))}</p>
          </div>
        ))}
      </div>

      <ul className="space-y-3.5">
        {rows.map((r) => (
          <li key={r.key}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="font-semibold">{r.name}</span>
              {show !== 'all' && (
                <span className={cn('text-sm font-semibold tabular-nums', TEXT[show])}>
                  {num(r.qty[show])} {r.unit}
                </span>
              )}
            </div>
            <div className="flex h-7 overflow-hidden rounded-lg bg-paper" role="img" aria-label={parts.map((p) => `${label[p]} ${pctText(r.pct[p])}`).join(', ')}>
              {parts.map((p) =>
                r.pct[p] > 0 ? (
                  <div
                    key={p}
                    title={`${label[p]}: ${num(r.qty[p])} ${r.unit} (${pctText(r.pct[p])})`}
                    className={cn('grid min-w-0 place-items-center text-xs font-bold', p === 'left' ? 'text-ink' : 'text-white')}
                    style={{ width: `${r.pct[p]}%`, backgroundColor: COLOR[p] }}
                  >
                    {r.pct[p] >= 12 && pctText(r.pct[p])}
                  </div>
                ) : null,
              )}
            </div>
            <p className="mt-1 flex flex-wrap gap-x-4 text-sm tabular-nums">
              {parts.map((p) => (
                <span key={p} className={cn('font-semibold', TEXT[p])}>
                  {label[p]} {pctText(r.pct[p])}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
