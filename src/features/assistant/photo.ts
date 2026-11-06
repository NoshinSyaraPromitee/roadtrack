import { create } from 'zustand';

/** Apa's picture. It lives in public/Apa.jpg; the capital A matters on the live site. */
export const APA_PHOTO = '/Apa.jpg';

/**
 * Why the picture did not load.
 * missing: there is no file at public/Apa.jpg. not-image: the file there is not a picture.
 * broken: the file is a picture but damaged. offline: the page could not reach the file.
 */
export type PhotoProblem = 'missing' | 'not-image' | 'broken' | 'offline';

interface PhotoState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  problem: PhotoProblem | null;
  load: () => void;
}

/** Asks for the file again to find out exactly why the picture failed. */
async function diagnose(): Promise<PhotoProblem> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  try {
    const res = await fetch(APA_PHOTO, { cache: 'no-store' });
    const type = res.headers.get('content-type') ?? '';
    // A missing file comes back as 404, or as the app's own page on hosts that send every path to index.html.
    if (res.status === 404 || type.includes('text/html')) return 'missing';
    if (!type.startsWith('image/')) return 'not-image';
    return 'broken';
  } catch {
    return 'offline';
  }
}

/** One shared load for every place Apa's picture is shown. */
export const useApaPhoto = create<PhotoState>()((set) => ({
  status: 'idle',
  problem: null,
  load: () => {
    set({ status: 'loading', problem: null });
    const img = new Image();
    img.onload = () => set({ status: 'ready' });
    img.onerror = () => {
      void diagnose().then((problem) => set({ status: 'error', problem }));
    };
    img.src = APA_PHOTO;
  },
}));
