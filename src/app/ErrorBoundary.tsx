import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { clearSavedData } from '@/shared/lib/savedData';

/**
 * Catches any crash below it and shows a plain screen instead of a white page.
 * Old saved data is the usual cause, so "Start again" clears it and reloads.
 * The text is in both languages because the language store itself may be what broke.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('RoadTrack crashed', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center bg-paper p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-[0_24px_48px_-16px_rgba(23,32,27,0.35)]">
          <h1 className="font-sign text-3xl leading-tight">কিছু একটা ভুল হয়েছে</h1>
          <p className="mt-1 text-lg text-ink-soft">Something went wrong</p>
          <p className="mt-4 text-ink-soft">
            আবার শুরু করলে এই ফোনে রাখা পুরোনো তথ্য মুছে যাবে।
            <br />
            Starting again clears the old data saved on this phone.
          </p>
          <button
            type="button"
            onClick={() => {
              clearSavedData();
              window.location.href = '/';
            }}
            className="mt-6 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-guide-600 text-xl font-semibold text-white transition hover:bg-guide-700"
          >
            <RotateCcw className="h-6 w-6" />
            আবার শুরু করুন / Start again
          </button>
          <button type="button" onClick={() => window.location.reload()} className="mt-3 h-12 w-full rounded-2xl text-lg font-semibold text-guide-700 hover:bg-guide-50">
            শুধু রিলোড করুন / Just reload
          </button>
        </div>
      </div>
    );
  }
}
