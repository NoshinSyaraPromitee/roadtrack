import type { Road } from '@/core/types';
import { pctToKm } from '@/core/roads';
import { useI18n } from '@/shared/i18n';
import { SpeakButton } from '@/shared/voice';
import { RoadStrip } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import { useRoadPhoto } from './useRoadPhoto';

function RoadPhoto({ road }: { road: Road }) {
  const { t } = useI18n();
  const photo = useRoadPhoto(road.photo);
  return (
    <div className="relative aspect-[16/9] bg-asphalt md:aspect-auto md:min-h-[300px]">
      <img
        src={photo.src}
        alt={t(`Photo of ${road.name.en}`, `${road.name.bn}-এর ছবি`)}
        onError={photo.onError}
        className={cn('absolute inset-0 h-full w-full object-cover', photo.isFallback && 'object-bottom')}
      />
      {!photo.isFallback && road.credit && (
        <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-xs text-white/90">{t(`Photo: ${road.credit}`, `ছবি: ${road.credit}`)}</span>
      )}
    </div>
  );
}

export function RoadHero({ road, progress, showName = false, className }: { road: Road; progress: number; showName?: boolean; className?: string }) {
  const i = useI18n();
  const { t, fixed } = i;
  const doneKm = pctToKm(progress, road);
  const leftKm = Math.max(0, road.lengthKm - doneKm);

  return (
    <figure className={cn('grid overflow-hidden rounded-[18px] border border-line bg-white md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]', className)}>
      <RoadPhoto key={`${road.id}:${road.photo ?? ''}`} road={road} />
      <figcaption className="flex flex-col justify-between gap-6 p-4 sm:p-6">
        <div>
          {showName && (
            <div className="mb-4">
              <p className="font-sign text-3xl leading-tight sm:text-[2.2rem]">{i.tx(road.name)}</p>
              <p className="text-ink-soft">{t(`${road.from.en} to ${road.to.en}, ${road.area.en}`, `${road.from.bn} থেকে ${road.to.bn}, ${road.area.bn}`)}</p>
            </div>
          )}
          <div className="flex items-end gap-3">
            <p className="font-sign text-6xl leading-none tabular-nums text-guide-700">{fixed(progress)}%</p>
            <SpeakButton
              size="sm"
              text={{
                en: `${i.numEn(doneKm, 2)} of ${i.numEn(road.lengthKm, 1)} kilometres are done. That is ${i.numEn(progress, 1)} percent.`,
                bn: `${fixed(road.lengthKm)} কিলোমিটারের মধ্যে ${fixed(doneKm, 2)} কিলোমিটার শেষ। মানে ${fixed(progress)} শতাংশ।`,
              }}
            />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-paper px-3 py-2.5">
              <dt className="text-sm text-ink-soft">{t('Paved', 'পাকা হয়েছে')}</dt>
              <dd className="font-sign text-2xl tabular-nums">
                {fixed(doneKm, 2)} {t('km', 'কিমি')}
              </dd>
            </div>
            <div className="rounded-xl bg-paper px-3 py-2.5">
              <dt className="text-sm text-ink-soft">{t('Still to build', 'বাকি আছে')}</dt>
              <dd className="font-sign text-2xl tabular-nums">
                {fixed(leftKm, 2)} {t('km', 'কিমি')}
              </dd>
            </div>
          </dl>
        </div>
        <RoadStrip progress={progress} lengthKm={road.lengthKm} />
      </figcaption>
    </figure>
  );
}
