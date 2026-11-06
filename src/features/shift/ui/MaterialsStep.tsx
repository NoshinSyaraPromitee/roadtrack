import { CircleCheck, Package, TriangleAlert } from 'lucide-react';
import type { MaterialLine } from '@/core/types';
import { MATERIAL_BY_KEY } from '@/core/catalog';
import { useI18n } from '@/shared/i18n';
import { Badge, Button, Card, CardHeader, StackBar, Stepper } from '@/shared/ui';
import { pct } from '@/shared/lib/utils';
import { MaterialPicto } from './icons';

export const WASTE_LIMIT = 5;

export function MaterialsStep({ mats, updateMat }: { mats: MaterialLine[]; updateMat: (idx: number, patch: Partial<MaterialLine>) => void }) {
  const { t, tx, num } = useI18n();
  return (
    <Card>
      <CardHeader
        icon={Package}
        tone="plain"
        title={t('What was used?', 'কতটা মাল খরচ হলো?')}
        speak={{ en: 'What was used? Green is used, red is wasted, grey is left over.', bn: 'কতটা মাল খরচ হলো? সবুজ খরচ, লাল নষ্ট, ধূসর বাকি।' }}
      />
      <ul className="space-y-3">
        {mats.map((m, idx) => {
          const def = MATERIAL_BY_KEY[m.key];
          const left = m.allocated - m.used - m.wasted;
          const tooMuch = pct(m.wasted, m.allocated) > WASTE_LIMIT;
          return (
            <li key={m.key} className="rounded-2xl border border-line p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <MaterialPicto k={m.key} />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold leading-tight">{tx(def.name)}</p>
                  <p className="text-sm text-ink-soft">
                    {t('Given', 'দেওয়া হয়েছে')} {num(m.allocated)} {tx(def.unit)}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => updateMat(idx, { used: m.allocated - m.wasted })}>
                  <CircleCheck />
                  {t('All used', 'সব খরচ')}
                </Button>
              </div>
              <StackBar
                className="mt-3"
                total={m.allocated}
                parts={[
                  { value: m.used, className: 'bg-guide-500' },
                  { value: m.wasted, className: 'bg-stop-500' },
                ]}
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-guide-200 p-2.5">
                  <p className="mb-1.5 px-1 text-sm font-semibold text-guide-700">
                    {t('Used', 'খরচ')}
                  </p>
                  <Stepper value={m.used} step={def.step} max={m.allocated - m.wasted} unit={tx(def.unit)} label={t('Used', 'খরচ')} onChange={(v) => updateMat(idx, { used: v })} />
                </div>
                <div className="rounded-2xl border-2 border-stop-100 p-2.5">
                  <p className="mb-1.5 px-1 text-sm font-semibold text-stop-600">
                    {t('Wasted', 'নষ্ট')}
                  </p>
                  <Stepper
                    value={m.wasted}
                    step={def.wasteStep}
                    max={m.allocated}
                    unit={tx(def.unit)}
                    label={t('Wasted', 'নষ্ট')}
                    tone="stop"
                    onChange={(v) => updateMat(idx, { wasted: v, used: Math.min(m.used, m.allocated - v) })}
                  />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-ink-soft">
                <span>
                  {t('Left over', 'বাকি')}: <b className="text-ink">{num(left)}</b> {tx(def.unit)}
                </span>
                {tooMuch && (
                  <Badge tone="red" icon={TriangleAlert}>
                    {t(`More than ${num(WASTE_LIMIT)}% wasted`, `${num(WASTE_LIMIT)}%-এর বেশি নষ্ট`)}
                  </Badge>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
