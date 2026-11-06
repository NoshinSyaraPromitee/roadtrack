import { useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { shrinkPhoto } from '@/shared/lib/image';
import type { PhotoError } from '@/shared/lib/image';
import { cn } from '@/shared/lib/utils';

const PROBLEM: Record<PhotoError | 'full', { why: Text; fix: Text }> = {
  'not-image': {
    why: { en: 'The file you picked is not a photo.', bn: 'যে ফাইলটি বাছাই করেছেন সেটি ছবি নয়।' },
    fix: { en: 'Pick a photo from the camera or the gallery (JPG or PNG).', bn: 'ক্যামেরা বা গ্যালারি থেকে একটি ছবি বাছাই করুন (JPG বা PNG)।' },
  },
  'too-big': {
    why: { en: 'The photo is larger than 20 MB.', bn: 'ছবিটি ২০ এমবি-র চেয়ে বড়।' },
    fix: { en: 'Take the photo again at normal quality, or pick a smaller one.', bn: 'সাধারণ মানে আবার ছবি তুলুন, অথবা ছোট একটি ছবি বাছাই করুন।' },
  },
  unreadable: {
    why: { en: 'The phone could not open this photo. It may be damaged or in a format the browser cannot read (like HEIC).', bn: 'ফোন ছবিটি খুলতে পারেনি। ছবিটি নষ্ট, অথবা এমন ধরনের (যেমন HEIC) যা ব্রাউজার পড়তে পারে না।' },
    fix: { en: 'Take the photo again with the camera, or set the camera to save JPG photos.', bn: 'ক্যামেরা দিয়ে আবার ছবি তুলুন, অথবা ক্যামেরা সেটিংসে JPG ছবি সেভ চালু করুন।' },
  },
  full: {
    why: { en: 'You already added the most photos allowed.', bn: 'সর্বোচ্চ যতগুলো ছবি দেওয়া যায় তা দেওয়া হয়ে গেছে।' },
    fix: { en: 'Remove a photo with its × button to add another.', bn: 'আরেকটি দিতে একটি ছবির × বোতাম চেপে সেটি সরান।' },
  },
};

export function PhotoStrip({ photos, size = 'md' }: { photos: string[]; size?: 'sm' | 'md' }) {
  const i = useI18n();
  const [open, setOpen] = useState<string | null>(null);
  if (!photos.length) return null;
  return (
    <>
      <div className={cn('grid gap-2', size === 'sm' ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-4')}>
        {photos.map((src, idx) => (
          <button key={idx} type="button" onClick={() => setOpen(src)} className="overflow-hidden rounded-xl bg-black/5" aria-label={i.t(`Open photo ${idx + 1}`, `${i.num(idx + 1)} নম্বর ছবি খুলুন`)}>
            <img src={src} alt="" className="aspect-square w-full object-cover" />
          </button>
        ))}
      </div>
      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4" onClick={() => setOpen(null)}>
          <img src={open} alt="" className="max-h-full max-w-full rounded-xl" />
          <button type="button" onClick={() => setOpen(null)} aria-label={i.t('Close', 'বন্ধ করুন')} className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25">
            <X className="h-7 w-7" />
          </button>
        </div>
      )}
    </>
  );
}

export function PhotoPicker({ photos, onChange, max = 4 }: { photos: string[]; onChange: (photos: string[]) => void; max?: number }) {
  const i = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(0);
  const [problem, setProblem] = useState<PhotoError | 'full' | null>(null);
  const room = max - photos.length - loading;

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setProblem(null);
    const picked = Array.from(files);
    if (picked.length > room) setProblem('full');
    const take = picked.slice(0, Math.max(0, room));
    setLoading(take.length);
    const added: string[] = [];
    for (const f of take) {
      try {
        added.push(await shrinkPhoto(f));
      } catch (e) {
        const code = (e as Error).message as PhotoError;
        setProblem(code === 'not-image' || code === 'too-big' ? code : 'unreadable');
      }
    }
    setLoading(0);
    if (added.length) onChange([...photos, ...added]);
    if (input.current) input.current.value = '';
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((src, idx) => (
          <div key={idx} className="relative overflow-hidden rounded-xl bg-black/5">
            <img src={src} alt={i.t(`Photo ${idx + 1}`, `${i.num(idx + 1)} নম্বর ছবি`)} className="aspect-square w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setProblem(null);
                onChange(photos.filter((_, j) => j !== idx));
              }}
              aria-label={i.t('Remove this photo', 'এই ছবি সরান')}
              className="absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
        {Array.from({ length: loading }).map((_, idx) => (
          <div key={`l${idx}`} role="status" className="grid aspect-square place-items-center rounded-xl bg-black/5 text-ink-soft">
            <span className="flex flex-col items-center gap-1 text-sm">
              <Loader2 className="h-6 w-6 animate-spin" />
              {i.t('Adding…', 'যোগ হচ্ছে…')}
            </span>
          </div>
        ))}
        {room > 0 && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line bg-white px-2 text-center font-semibold text-guide-700 transition hover:border-guide-600 hover:bg-guide-50"
          >
            <Camera className="h-8 w-8" />
            <span className="text-sm leading-tight">{i.t('Add photo', 'ছবি যোগ করুন')}</span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => void add(e.target.files)} />
      <p className="mt-2 text-sm text-ink-soft">{i.t(`${i.num(photos.length)} of ${i.num(max)} photos`, `${i.num(max)}টির মধ্যে ${i.num(photos.length)}টি ছবি`)}</p>
      {problem && (
        <div role="alert" className="mt-2 rounded-xl bg-stop-50 p-3 text-[0.95rem] leading-snug">
          <p className="font-semibold text-stop-700">{i.tx(PROBLEM[problem].why)}</p>
          <p className="mt-1">{i.tx(PROBLEM[problem].fix)}</p>
        </div>
      )}
    </div>
  );
}
