import { Camera, Construction, TriangleAlert } from 'lucide-react';
import type { IncidentKey, Shift } from '@/core/types';
import { INCIDENT_KEYS, INCIDENTS } from '@/core/catalog';
import { kmToPct, pctToKm } from '@/core/roads';
import { useRoad } from '@/features/road';
import { useI18n } from '@/shared/i18n';
import { Badge, Card, CardHeader, Field, PhotoPicker, RoadStrip, Textarea, Tile } from '@/shared/ui';
import { INCIDENT_ICON } from './icons';
import { KmStepper } from './ShiftParts';

export function ProgressStep({
  shift,
  endKm,
  setEndKm,
  photos,
  setPhotos,
  tags,
  required,
  toggleTag,
  notes,
  setNotes,
}: {
  shift: Shift;
  endKm: number;
  setEndKm: (km: number) => void;
  photos: string[];
  setPhotos: (photos: string[]) => void;
  tags: IncidentKey[];
  required: IncidentKey[];
  toggleTag: (k: IncidentKey) => void;
  notes: string;
  setNotes: (notes: string) => void;
}) {
  const { t, fixed } = useI18n();
  const road = useRoad();
  const startKm = pctToKm(shift.startProgress, road);
  const endProgress = Math.max(shift.startProgress, kmToPct(endKm, road));
  return (
    <>
      <Card>
        <CardHeader
          icon={Construction}
          tone="mark"
          title={t('How many km of road are done now?', 'এখন রাস্তার কত কিলোমিটার হয়েছে?')}
          speak={{ en: "How many kilometres of road are done now? The yellow part is today's work.", bn: 'এখন রাস্তার কত কিলোমিটার হয়েছে? হলুদ অংশ আজকের কাজ।' }}
        />
        <RoadStrip progress={endProgress} lengthKm={road.lengthKm} today={{ from: shift.startProgress, to: endProgress }} />
        <KmStepper km={endKm} min={startKm} max={road.lengthKm} progress={endProgress} onChange={setEndKm}>
          <Badge tone="green" icon={Construction}>
            +{fixed(endKm - startKm, 2)} {t('km', 'কিমি')} {t('today', 'আজ')}
          </Badge>
        </KmStepper>
      </Card>
      <Card>
        <CardHeader
          icon={Camera}
          tone="sign"
          shape="disc"
          title={t('Photos of today’s work', 'আজকের কাজের ছবি')}
          speak={{ en: "Add photos of today's work. Tap Add photo.", bn: 'আজকের কাজের ছবি দিন। "ছবি যোগ করুন" চাপুন।' }}
        />
        <PhotoPicker photos={photos} onChange={setPhotos} />
      </Card>
      <Card>
        <CardHeader
          icon={TriangleAlert}
          shape="warn"
          tone="stop"
          title={t('Any problems today?', 'আজ কোনো সমস্যা হয়েছে?')}
          speak={{ en: 'Any problems today? Tap everything that happened.', bn: 'আজ কোনো সমস্যা হয়েছে? যা যা হয়েছে সব চাপুন।' }}
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {INCIDENT_KEYS.map((k) => (
            <Tile
              key={k}
              icon={INCIDENT_ICON[k]}
              shape="warn"
              tone="stop"
              label={INCIDENTS[k]}
              sub={required.includes(k) ? { en: 'Needed', bn: 'দরকারি' } : undefined}
              selected={tags.includes(k)}
              onPress={() => toggleTag(k)}
            />
          ))}
        </div>
        <div className="mt-4">
          <Field label={t('What happened? (optional)', 'কী হয়েছিল? (ঐচ্ছিক)')}>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('For example: 20 m redone because the slope was wrong.', 'যেমন: ঢাল ভুল হওয়ায় ২০ মিটার আবার করা হয়েছে।')}
            />
          </Field>
        </div>
      </Card>
    </>
  );
}
