import { useState } from 'react';
import { Check, MessageSquareText, Pencil, X } from 'lucide-react';
import type { PayrollLine } from '@/core/types';
import { payrollTotal } from '@/core/payroll';
import type { PayEdit } from '@/core/payroll';
import { Avatar, personName, roleOf, useWorkforce } from '@/features/workforce';
import { useI18n } from '@/shared/i18n';
import { Button, Stepper, Textarea } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { PayFlags } from './PayFlags';

function PayEditor({ line, edit, onSave, onCancel }: { line: PayrollLine; edit?: PayEdit; onSave: (edit: PayEdit | null) => void; onCancel: () => void }) {
  const i = useI18n();
  const worked = line.basePay - line.deduction + line.welfareBonus;
  const [adjustment, setAdjustment] = useState(edit?.adjustment ?? 0);
  const [note, setNote] = useState(edit?.note ?? '');
  const [error, setError] = useState('');

  const save = () => {
    if (adjustment !== 0 && !note.trim()) {
      setError(i.t('Write why you changed the pay. The office reads it before paying.', 'টাকা কেন বদলালেন তা লিখুন। টাকা দেওয়ার আগে অফিস এটি পড়বে।'));
      return;
    }
    onSave(adjustment === 0 && !note.trim() ? null : { adjustment, note: note.trim() });
  };

  return (
    <div className="mt-3 space-y-3 rounded-xl bg-paper p-3">
      <div>
        <p className="mb-1 text-sm font-semibold text-ink-soft">{i.t('Add or cut money (taka)', 'টাকা যোগ বা কাটা (টাকা)')}</p>
        <div className="max-w-xs">
          <Stepper value={adjustment} step={50} min={-worked} max={5000} label={i.t('Change in taka', 'কত টাকা বদল')} tone={adjustment < 0 ? 'stop' : 'plain'} onChange={setAdjustment} />
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          {i.t('New pay', 'নতুন মজুরি')}: <b className="text-ink">{i.taka(Math.max(0, worked + adjustment))}</b>
        </p>
      </div>
      <div>
        <p className="mb-1 text-sm font-semibold text-ink-soft">{i.t('Comment', 'মন্তব্য')}</p>
        <Textarea
          rows={2}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setError('');
          }}
          placeholder={i.t('For example: worked 2 hours extra', 'যেমন: ২ ঘণ্টা বেশি কাজ করেছেন')}
        />
        {error && <p className="mt-1 text-sm font-semibold text-stop-600">{error}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={save}>
          <Check />
          {i.t('Save', 'সেভ করুন')}
        </Button>
        <Button size="sm" variant="secondary" onClick={onCancel}>
          <X />
          {i.t('Cancel', 'বাতিল')}
        </Button>
        {edit && (
          <Button size="sm" variant="ghost" onClick={() => onSave(null)} className="text-stop-600">
            {i.t('Remove the change', 'বদল মুছুন')}
          </Button>
        )}
      </div>
    </div>
  );
}

export function PayrollList({ lines, edits = {}, onEdit }: { lines: PayrollLine[]; edits?: Record<string, PayEdit>; onEdit?: (workerId: string, edit: PayEdit | null) => void }) {
  const i = useI18n();
  const workers = useWorkforce((s) => s.workers);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div>
      <ul className="space-y-1">
        {lines.map((l) => {
          const w = workers.find((x) => x.id === l.workerId);
          if (!w) return null;
          const adj = l.adjustment ?? 0;
          return (
            <li key={l.workerId} className="py-3">
              <div className={cn('grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3', l.total === 0 && 'opacity-60')}>
                <Avatar person={w} size={48} dim={l.total === 0} />
                <div className="min-w-0">
                  <p className="truncate font-semibold leading-tight">{personName(w, i.lang)}</p>
                  <p className="mb-1.5 truncate text-sm text-ink-soft">{i.tx(roleOf(w))}</p>
                  <PayFlags flags={l.flags} />
                </div>
                <div className="text-right">
                  <p className="font-sign text-2xl tabular-nums">{i.taka(l.total)}</p>
                  {(l.deduction > 0 || l.welfareBonus > 0 || adj !== 0) && (
                    <p className="text-sm tabular-nums text-ink-soft">
                      {i.taka(l.basePay)}
                      {l.deduction > 0 && <span className="ml-1 text-stop-600">-{i.taka(l.deduction)}</span>}
                      {l.welfareBonus > 0 && <span className="ml-1 text-guide-700">+{i.taka(l.welfareBonus)}</span>}
                      {adj !== 0 && <span className={cn('ml-1', adj > 0 ? 'text-guide-700' : 'text-stop-600')}>{adj > 0 ? `+${i.taka(adj)}` : `-${i.taka(-adj)}`}</span>}
                    </p>
                  )}
                </div>
              </div>
              {l.note && editing !== l.workerId && (
                <p className="mt-2 flex items-start gap-2 pl-[3.75rem] text-ink-soft">
                  <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <span className="font-semibold text-ink">{i.t('Supervisor’s comment', 'সুপারভাইজারের মন্তব্য')}:</span> {l.note}
                  </span>
                </p>
              )}
              {onEdit && editing !== l.workerId && (
                <div className="mt-1 pl-[3.75rem]">
                  <button type="button" onClick={() => setEditing(l.workerId)} className="flex h-9 items-center gap-1.5 rounded-lg px-1.5 font-semibold text-guide-700 hover:bg-guide-50">
                    <Pencil className="h-4 w-4" />
                    {edits[l.workerId] ? i.t('Change the edit or comment', 'বদল বা মন্তব্য ঠিক করুন') : i.t('Change pay or add a comment', 'মজুরি বদলান বা মন্তব্য দিন')}
                  </button>
                </div>
              )}
              {onEdit && editing === l.workerId && (
                <PayEditor
                  line={l}
                  edit={edits[l.workerId]}
                  onCancel={() => setEditing(null)}
                  onSave={(edit) => {
                    onEdit(l.workerId, edit);
                    setEditing(null);
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3">
        <span className="font-semibold">{i.t('Total to pay', 'মোট দিতে হবে')}</span>
        <span className="font-sign text-3xl tabular-nums">{i.taka(payrollTotal(lines))}</span>
      </div>
    </div>
  );
}
