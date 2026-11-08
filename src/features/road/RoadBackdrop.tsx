import { useRoad, useRoads } from './store';
import { useRoadPhoto } from './useRoadPhoto';

/**
 * A road photo behind the page, faded under a white wash so the form stays easy to read.
 * `other` shows the next road's photo instead of the chosen one, so two pages can look different.
 */
export function RoadBackdrop({ other = false }: { other?: boolean }) {
  const road = useRoad();
  const roads = useRoads();
  const next = roads[(roads.findIndex((r) => r.id === road.id) + 1) % roads.length];
  const photo = useRoadPhoto(other && next ? next.photo : road.photo);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img src={photo.src} alt="" onError={photo.onError} className="h-full w-full scale-105 object-cover opacity-50 blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/90" />
    </div>
  );
}
