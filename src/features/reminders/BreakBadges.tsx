import { Coffee, Cookie } from 'lucide-react';
import type { BreakLog } from '@/core/types';
import { useI18n } from '@/shared/i18n';
import { Badge } from '@/shared/ui';

export function BreakBadges({ breaks }: { breaks: BreakLog[] }) {
  const i = useI18n();
  return (
    <>
      {breaks.map((b) => (
        <Badge key={b.id} tone={b.type === 'snack' ? 'yellow' : 'blue'} icon={b.type === 'snack' ? Cookie : Coffee}>
          {i.time(b.at)}
        </Badge>
      ))}
    </>
  );
}
