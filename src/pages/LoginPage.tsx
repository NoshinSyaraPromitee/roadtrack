import { LoginFlow } from '@/features/session';
import { useRoadProgressMap } from '@/features/shift';
import { LangToggle } from '@/shared/i18n';
import { VoiceGuideToggle } from '@/shared/voice';
import { Logo } from '@/shared/ui';

export function LoginPage() {
  const progress = useRoadProgressMap();

  return (
    <div className="min-h-screen">
      <header className="bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <VoiceGuideToggle tone="light" withLabel />
            <LangToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <LoginFlow progress={progress} />
      </main>
    </div>
  );
}
