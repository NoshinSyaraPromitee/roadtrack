import { MapPin } from 'lucide-react';
import type { Text } from '@/core/types';
import { useI18n } from '@/shared/i18n';
import { Card, CardHeader, Chip, Field, Input } from '@/shared/ui';

export function PlaceCard({
  places,
  site,
  other,
  onSite,
  onOther,
}: {
  places: Text[];
  site: Text;
  other: string;
  onSite: (place: Text) => void;
  onOther: (text: string) => void;
}) {
  const { t, tx } = useI18n();
  return (
    <Card>
      <CardHeader
        icon={MapPin}
        title={t('Where is the crew working?', 'কোথায় কাজ হচ্ছে?')}
        speak={{ en: 'Where is the crew working? Tap a place.', bn: 'কোথায় কাজ হচ্ছে? একটি জায়গায় চাপ দিন।' }}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {places.map((p) => (
          <Chip
            key={p.en}
            selected={!other.trim() && site.en === p.en}
            onClick={() => {
              onOther('');
              onSite(p);
            }}
            className="justify-start text-left text-lg"
          >
            <MapPin />
            {tx(p)}
          </Chip>
        ))}
      </div>
      <div className="mt-4 max-w-md">
        <Field label={t('Somewhere else? Write the place or address', 'অন্য কোথাও? জায়গা বা ঠিকানা লিখুন')}>
          <Input value={other} onChange={(e) => onOther(e.target.value)} placeholder={t('For example: in front of Ali Hardware, Station Road', 'যেমন: আলী হার্ডওয়্যারের সামনে, স্টেশন রোড')} />
        </Field>
      </div>
    </Card>
  );
}
