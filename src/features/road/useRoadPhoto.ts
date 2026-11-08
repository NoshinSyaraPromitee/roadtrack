import { useState } from 'react';

export const ROAD_PHOTO_FALLBACK = '/scenes/site-banner.svg';

/** The road's own photo, or the drawn site scene when there is none or it fails to load. */
export function useRoadPhoto(photo?: string) {
  const [broken, setBroken] = useState<string | null>(null);
  const ok = !!photo && broken !== photo;
  return { src: ok ? photo : ROAD_PHOTO_FALLBACK, isFallback: !ok, onError: () => setBroken(photo ?? null) };
}
