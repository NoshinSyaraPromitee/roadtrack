import { useState } from 'react';
import { AudioLines, Volume2 } from 'lucide-react';
import { useLang } from '@/shared/i18n';
import type { Text } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';
import { canSpeak, speak } from './speech';

const SIZES = { sm: 'h-9 w-9 [&_svg]:size-4', md: 'h-11 w-11 [&_svg]:size-5', lg: 'h-14 w-14 [&_svg]:size-7' };

export function SpeakButton({ text, size = 'md', tone = 'light', className }: { text: Text; size?: keyof typeof SIZES; tone?: 'light' | 'dark'; className?: string }) {
  const lang = useLang((s) => s.lang);
  const [speaking, setSpeaking] = useState(false);
  if (!canSpeak()) return null;

  return (
    <button
      type="button"
      onClick={() => {
        setSpeaking(true);
        speak(text, lang, () => setSpeaking(false));
      }}
      aria-label={lang === 'bn' ? 'শুনুন' : 'Listen'}
      title={lang === 'bn' ? 'শুনুন' : 'Listen'}
      className={cn(
        'grid shrink-0 place-items-center rounded-full transition',
        SIZES[size],
        tone === 'dark' ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-guide-50 text-guide-700 hover:bg-guide-100',
        speaking && (tone === 'dark' ? 'ring-4 ring-white/30' : 'ring-4 ring-guide-100'),
        className,
      )}
    >
      {speaking ? <AudioLines className="animate-pulse" /> : <Volume2 />}
    </button>
  );
}
