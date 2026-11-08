import { useState } from 'react';
import { CircleCheck, X } from 'lucide-react';
import type { Machine } from '@/core/types';
import { MAX_REPAIR_COST, lastRepair, repairCost } from '@/core/machines';
import { useI18n } from '@/shared/i18n';
import { Button, confirmSent, Stepper } from '@/shared/ui';
import { useEquipment } from './store';

/** Shows what fixing this machine has cost, and asks for the amount when it is marked fixed. */
export function RepairControl({ m, needed }: { m: Machine; needed: boolean }) {
  const i = useI18n();
  const serviced = useEquipment((s) => s.serviced);
  const [asking, setAsking] = useState(false);
  const [cost, setCost] = useState(0);
  const spent = repairCost(m);
  const last = lastRepair(m);

  return (
    <div className="mt-3 space-y-3">
      {spent > 0 && (
        <p className="text-sm text-ink-soft">
          {i.t('Spent on repairs', 'মেরামতে খরচ')}: <span className="font-sign text-lg text-ink tabular-nums">{i.taka(spent)}</span>
          {last && <span>{i.t(` · last ${i.taka(last.cost)} on ${i.date(last.at)}`, ` · শেষবার ${i.date(last.at)} ${i.taka(last.cost)}`)}</span>}
        </p>
      )}
      {asking ? (
        <div className="space-y-3 rounded-xl bg-paper p-3">
          <p className="font-semibold">{i.t('How much did the fix cost?', 'মেরামতে কত টাকা লেগেছে?')}</p>
          <Stepper value={cost} step={500} min={0} max={MAX_REPAIR_COST} prefix="৳" label={i.t('Repair cost', 'মেরামতের খরচ')} onChange={setCost} />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setAsking(false)}>
              <X />
              {i.t('Cancel', 'বাতিল')}
            </Button>
            <Button
              size="sm"
              className="min-w-0 flex-1"
              onClick={() => {
                serviced(m.id, cost);
                confirmSent({ en: 'Repair saved', bn: 'মেরামত সেভ হয়েছে' });
                setAsking(false);
                setCost(0);
              }}
            >
              <CircleCheck />
              {cost > 0 ? i.t(`Save ${i.taka(cost)}`, `${i.taka(cost)} সেভ করুন`) : i.t('Save, no cost', 'সেভ করুন, খরচ নেই')}
            </Button>
          </div>
        </div>
      ) : (
        needed && (
          <Button variant="secondary" size="sm" onClick={() => setAsking(true)}>
            <CircleCheck />
            {i.t('Fixed and serviced', 'ঠিক ও সার্ভিস করা হয়েছে')}
          </Button>
        )
      )}
    </div>
  );
}
