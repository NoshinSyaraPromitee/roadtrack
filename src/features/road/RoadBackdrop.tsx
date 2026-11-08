import { useRoad } from './store';
import { useRoadPhoto } from './useRoadPhoto';

/** The chosen road's photo behind the page, faded under a white wash so the form stays easy to read. */
export function RoadBackdrop() {
  const road = useRoad();
  const photo = useRoadPhoto(road.photo);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img src={photo.src} alt="" onError={photo.onError} className="h-full w-full scale-105 object-cover opacity-50 blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/90" />
    </div>
  );
}
