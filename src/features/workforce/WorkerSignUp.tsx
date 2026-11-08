import { useState } from 'react';
import { Check, UserPlus } from 'lucide-react';
import { POSTS } from '@/core/catalog';
import type { PostKey, Worker } from '@/core/types';
import { MAX_WORK_AGE, MIN_WORK_AGE, toWorker, workerProblems } from '@/core/newWorker';
import type { WorkerDraft, WorkerProblem } from '@/core/newWorker';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { ActionBar, Card, CardHeader, Input, Stepper, Tile } from '@/shared/ui';
import { uid } from '@/shared/lib/utils';
import { POST_ICON } from './postIcons';
import { useWorkforce } from './store';

const POST_KEYS = Object.keys(POSTS) as PostKey[];

const PROBLEM: Record<WorkerProblem, Text> = {
  name: { en: 'Write your name.', bn: 'আপনার নাম লিখুন।' },
  age: { en: `Age must be ${MIN_WORK_AGE} to ${MAX_WORK_AGE}.`, bn: `বয়স ${MIN_WORK_AGE} থেকে ${MAX_WORK_AGE} হতে হবে।` },
  post: { en: 'Tap the work you will do.', bn: 'কী কাজ করবেন তা চাপুন।' },
};

/** Three things only: name, age and the work. The new worker is signed in straight away. */
export function WorkerSignUp({ onDone, onBack }: { onDone: (worker: Worker) => void; onBack: () => void }) {
  const { t, tx } = useI18n();
  const count = useWorkforce((s) => s.workers.length);
  const addWorker = useWorkforce((s) => s.addWorker);
  const [draft, setDraft] = useState<WorkerDraft>({ name: '', age: 30, post: null });
  const [error, setError] = useState('');
  const set = (patch: Partial<WorkerDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setError('');
  };

  const join = () => {
    const problems = workerProblems(draft);
    if (problems.length) return setError(tx(PROBLEM[problems[0]]));
    const worker = toWorker(draft, uid('w'), count);
    addWorker(worker);
    onDone(worker);
  };

  return (
    <div className="space-y-4 pb-32">
      <Card>
        <CardHeader icon={UserPlus} title={t('Your name', 'আপনার নাম')} speak={{ en: 'Write your name.', bn: 'আপনার নাম লিখুন।' }} />
        <Input value={draft.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" aria-label={t('Your name', 'আপনার নাম')} placeholder={t('For example: Shafiq Mia', 'যেমন: শফিক মিয়া')} className="h-14 text-xl" />
      </Card>
      <Card>
        <CardHeader title={t('Your age', 'আপনার বয়স')} speak={{ en: 'How old are you? Use plus and minus.', bn: 'আপনার বয়স কত? যোগ আর বিয়োগ চিহ্ন ব্যবহার করুন।' }} />
        <Stepper value={draft.age} min={MIN_WORK_AGE} max={MAX_WORK_AGE} size="lg" unit={t('years', 'বছর')} label={t('Age', 'বয়স')} onChange={(age) => set({ age })} />
      </Card>
      <Card>
        <CardHeader title={t('What work will you do?', 'কী কাজ করবেন?')} speak={{ en: 'What work will you do? Tap one picture.', bn: 'কী কাজ করবেন? একটি ছবিতে চাপ দিন।' }} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {POST_KEYS.map((k) => (
            <Tile key={k} icon={POST_ICON[k]} tone="mark" label={POSTS[k]} selected={draft.post === k} onPress={() => set({ post: k })} />
          ))}
        </div>
      </Card>
      <ActionBar onBack={onBack} onNext={join} nextIcon={Check} nextLabel={t('Join and start', 'যোগ দিন ও শুরু করুন')} error={error} />
    </div>
  );
}
