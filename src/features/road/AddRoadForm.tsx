import { useState } from 'react';
import { MapPinned, Plus } from 'lucide-react';
import { MAX_ROAD_KM, roadProblems, toRoad } from '@/core/newRoad';
import type { RoadDraft, RoadProblem } from '@/core/newRoad';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { Button, Card, CardHeader, confirmSent, Field, Input, PhotoPicker, Stepper, Textarea } from '@/shared/ui';
import { uid } from '@/shared/lib/utils';
import { useRoadStore, useRoads } from './store';

type PairKey = 'name' | 'area' | 'from' | 'to';

const PAIRS: Array<{ key: PairKey; label: Text; en: Text; bn: string }> = [
  { key: 'name', label: { en: 'Road name', bn: 'রাস্তার নাম' }, en: { en: 'For example: Uttara Sector 7 Road', bn: 'যেমন: Uttara Sector 7 Road' }, bn: 'যেমন: উত্তরা সেক্টর ৭ সড়ক' },
  { key: 'area', label: { en: 'Area', bn: 'এলাকা' }, en: { en: 'For example: Uttara, Dhaka', bn: 'যেমন: Uttara, Dhaka' }, bn: 'যেমন: উত্তরা, ঢাকা' },
  { key: 'from', label: { en: 'Starts at', bn: 'যেখান থেকে শুরু' }, en: { en: 'For example: Jasimuddin Road', bn: 'যেমন: Jasimuddin Road' }, bn: 'যেমন: জসীমউদ্দীন রোড' },
  { key: 'to', label: { en: 'Ends at', bn: 'যেখানে শেষ' }, en: { en: 'For example: Rajlakshmi', bn: 'যেমন: Rajlakshmi' }, bn: 'যেমন: রাজলক্ষ্মী' },
];

const ERROR: Record<RoadProblem, Text> = {
  name: { en: 'Write the road name in English, at least 3 letters.', bn: 'রাস্তার নাম ইংরেজিতে লিখুন, অন্তত ৩টি অক্ষর।' },
  area: { en: 'Write the area in English.', bn: 'এলাকার নাম ইংরেজিতে লিখুন।' },
  from: { en: 'Write where the road starts, in English.', bn: 'রাস্তা কোথা থেকে শুরু, ইংরেজিতে লিখুন।' },
  to: { en: 'Write where the road ends, in English.', bn: 'রাস্তা কোথায় শেষ, ইংরেজিতে লিখুন।' },
  length: { en: 'Set the length between 0.1 and 200 km.', bn: 'দৈর্ঘ্য ০.১ থেকে ২০০ কিমির মধ্যে দিন।' },
  duplicate: { en: 'A road with this name already exists. Use a different name.', bn: 'এই নামে একটি রাস্তা আগেই আছে। অন্য নাম দিন।' },
};

const blank: RoadDraft = { nameEn: '', nameBn: '', areaEn: '', areaBn: '', fromEn: '', fromBn: '', toEn: '', toBn: '', lengthKm: 2, places: '' };

export function AddRoadForm({ onAdded }: { onAdded: () => void }) {
  const i = useI18n();
  const { t } = i;
  const roads = useRoads();
  const addRoad = useRoadStore((s) => s.addRoad);
  const [draft, setDraft] = useState<RoadDraft>(blank);
  const [photos, setPhotos] = useState<string[]>([]);
  const [problems, setProblems] = useState<RoadProblem[]>([]);
  const set = (patch: Partial<RoadDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setProblems([]);
  };
  const errorFor = (k: RoadProblem) => (problems.includes(k) ? i.tx(ERROR[k]) : undefined);

  const submit = () => {
    const found = roadProblems(draft, roads);
    setProblems(found);
    if (found.length) return;
    addRoad(toRoad({ ...draft, photo: photos[0] }, uid('road')));
    confirmSent({ en: 'Road added', bn: 'রাস্তা যোগ হয়েছে' }, { en: `${draft.nameEn.trim()} is now in the road list.`, bn: `${draft.nameBn.trim() || draft.nameEn.trim()} এখন রাস্তার তালিকায় আছে।` });
    setDraft(blank);
    setPhotos([]);
    onAdded();
  };

  return (
    <Card>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <CardHeader
          icon={MapPinned}
          title={t('Add a new road', 'নতুন রাস্তা যোগ করুন')}
        />
        <div className="space-y-5">
          {PAIRS.map((p) => (
            <div key={p.key} className="grid gap-3 sm:grid-cols-2">
              <Field label={`${i.tx(p.label)} (English)`} error={errorFor(p.key) ?? (p.key === 'name' ? errorFor('duplicate') : undefined)}>
                <Input value={draft[`${p.key}En`]} onChange={(e) => set({ [`${p.key}En`]: e.target.value })} placeholder={i.tx(p.en)} />
              </Field>
              <Field label={`${i.tx(p.label)} (বাংলা)`}>
                <Input value={draft[`${p.key}Bn`]} onChange={(e) => set({ [`${p.key}Bn`]: e.target.value })} placeholder={p.bn} lang="bn" />
              </Field>
            </div>
          ))}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-sm font-semibold">{t('Length of the road', 'রাস্তার দৈর্ঘ্য')}</p>
              <Stepper value={draft.lengthKm} step={0.1} decimals={1} min={0.1} max={MAX_ROAD_KM} unit={t('km', 'কিমি')} label={t('Length in km', 'দৈর্ঘ্য কিমি')} onChange={(v) => set({ lengthKm: v })} />
              {errorFor('length') && <p className="mt-1.5 text-sm font-semibold text-stop-600">{errorFor('length')}</p>}
            </div>
            <Field label={t('Work places on the way (one per line, optional)', 'পথের কাজের জায়গা (প্রতি লাইনে একটি, ঐচ্ছিক)')} hint={t('Start and end are added for you.', 'শুরু আর শেষের জায়গা নিজে থেকেই যোগ হবে।')}>
              <Textarea rows={3} value={draft.places} onChange={(e) => set({ places: e.target.value })} placeholder={t('Sector 7 Park\nHouse Building', 'সেক্টর ৭ পার্ক\nহাউস বিল্ডিং')} />
            </Field>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold">{t('Photo of the road (optional)', 'রাস্তার ছবি (ঐচ্ছিক)')}</p>
            <PhotoPicker photos={photos} onChange={setPhotos} max={1} />
          </div>
          {problems.length > 0 && (
            <p role="alert" className="rounded-xl bg-stop-50 px-3 py-2.5 font-semibold text-stop-700">
              {t('Fix the marked fields, then add the road again.', 'চিহ্নিত ঘরগুলো ঠিক করে আবার রাস্তা যোগ করুন।')}
            </p>
          )}
          <Button type="submit" size="lg">
            <Plus />
            {t('Add road', 'রাস্তা যোগ করুন')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
