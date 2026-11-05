import { useId } from 'react';
import type { Look } from '@/core/types';

const INK = '#1d1f1e';

const HAIR: Record<string, string> = {
  short: 'M19.4 27 C18.6 17.4 24.6 12 32 12 C39.4 12 45.4 17.4 44.6 27 C43.4 22.4 40.6 19.6 36.6 18.7 C33.4 20.6 26.8 20.9 22.8 19.9 C21.2 21.6 20 24 19.4 27 Z',
  side: 'M19.1 28.4 C17.4 16.6 24.6 10.8 32.6 11 C40.8 11.2 46.6 16.8 44.9 28.4 C44.2 23.8 42.8 20.6 40.2 18.6 C35.8 20.8 27.9 20.2 23.3 18 C21.1 20.7 19.7 24 19.1 28.4 Z',
  cap: 'M19.9 23.6 C20.1 15.4 25.4 11.8 32 11.8 C38.6 11.8 43.9 15.4 44.1 23.6 C40.5 21.4 36.4 20.6 32 20.6 C27.6 20.6 23.5 21.4 19.9 23.6 Z',
};

/** A simple drawn portrait, so workers can find themselves without reading a name. */
export function Face({ look, size = 56, className }: { look: Look; size?: number; className?: string }) {
  const clip = useId();
  const beard = look.beardColor ?? look.hairColor;
  const scarf = look.hair === 'scarf';
  const brow = look.hair === 'short' || look.hair === 'side' ? look.hairColor : look.beardColor ?? '#2a2320';

  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="64" height="64" fill={look.bg} />
        {scarf && <path d="M15.8 31 C15 16.6 22.8 9.4 32 9.4 C41.2 9.4 49 16.6 48.2 31 C47.8 40 44.2 45.6 39.4 48.4 L24.6 48.4 C19.8 45.6 16.2 40 15.8 31 Z" fill={look.hairColor} />}
        <path d="M5 66 C7 50.4 18.6 44.2 32 44.2 C45.4 44.2 57 50.4 59 66 Z" fill={look.shirt} />
        {!scarf && (
          <>
            <path d="M26.6 36 H37.4 V45.6 C37.4 48 35 49.4 32 49.4 C29 49.4 26.6 48 26.6 45.6 Z" fill={look.skin} />
            <path d="M26.6 40.4 C29.6 42.2 34.4 42.2 37.4 40.4 V37 H26.6 Z" fill="#000" opacity="0.13" />
            <path d="M26.4 44.6 L32 51 L37.6 44.6 Z" fill={look.skin} />
            <circle cx="19.7" cy="29" r="2.9" fill={look.skin} />
            <circle cx="44.3" cy="29" r="2.9" fill={look.skin} />
          </>
        )}
        <ellipse cx="32" cy="28.2" rx={scarf ? 11.4 : 12.4} ry="13.6" fill={look.skin} />

        {HAIR[look.hair] && <path d={HAIR[look.hair]} fill={look.hairColor} stroke={look.hair === 'cap' ? '#d6d0c3' : 'none'} strokeWidth="0.8" />}
        {look.hair === 'cap' && <path d="M21.6 21.8 C25.6 19.8 38.4 19.8 42.4 21.8" fill="none" stroke="#d6d0c3" strokeWidth="0.8" strokeDasharray="1.4 1.2" />}
        {look.hair === 'bald' && (
          <>
            <path d="M19.4 30.6 C18.8 25.8 19.6 22.6 21.6 20.6 L22.6 29.6 Z" fill={look.hairColor} />
            <path d="M44.6 30.6 C45.2 25.8 44.4 22.6 42.4 20.6 L41.4 29.6 Z" fill={look.hairColor} />
            <ellipse cx="27.5" cy="17.6" rx="3.6" ry="1.8" fill="#fff" opacity="0.22" />
          </>
        )}
        {scarf && <path d="M20 26.6 C20.2 17.4 25.4 12.6 32 12.6 C38.6 12.6 43.8 17.4 44 26.6 C41.6 21 37.4 18.4 32 18.4 C26.6 18.4 22.4 21 20 26.6 Z" fill={look.hairColor} />}
        {look.hair === 'helmet' && (
          <>
            <path d="M17.4 24.6 C17.4 14.4 23.8 8.6 32 8.6 C40.2 8.6 46.6 14.4 46.6 24.6 Z" fill={look.hairColor} stroke="#c3c8c2" strokeWidth="1" />
            <path d="M32 9.2 V24.2" stroke="#dde1dc" strokeWidth="3.2" />
            <rect x="13.8" y="23.8" width="36.4" height="4.2" rx="2.1" fill={look.hairColor} stroke="#c3c8c2" strokeWidth="1" />
          </>
        )}

        {look.beard === 'full' && (
          <path d="M19.8 28.6 C19.6 38.8 25 43.8 32 43.8 C39 43.8 44.4 38.8 44.2 28.6 C42.6 33.6 39.4 36 32 36 C24.6 36 21.4 33.6 19.8 28.6 Z" fill={beard} />
        )}

        <path d="M25 23.3 Q27.4 21.9 29.8 23.1" fill="none" stroke={brow} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M34.2 23.1 Q36.6 21.9 39 23.3" fill="none" stroke={brow} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="27.4" cy="27.4" r="1.55" fill={INK} />
        <circle cx="36.6" cy="27.4" r="1.55" fill={INK} />
        <path d="M30.6 30.6 Q32 31.6 33.4 30.6" fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M28 34.2 Q32 37.2 36 34.2" fill="none" stroke={look.beard === 'full' ? '#3b2a22' : INK} strokeWidth="1.6" strokeLinecap="round" />
        {(look.beard === 'moustache' || look.beard === 'full') && (
          <path d="M26.8 33 C28.6 31.2 30.8 31 32 32.2 C33.2 31 35.4 31.2 37.2 33 C35.4 34 33.6 33.8 32 33.2 C30.4 33.8 28.6 34 26.8 33 Z" fill={beard} />
        )}
        {look.glasses && (
          <>
            <circle cx="27.4" cy="27.4" r="3.7" fill="#fff" fillOpacity="0.14" stroke="#2a2a2a" strokeWidth="1.3" />
            <circle cx="36.6" cy="27.4" r="3.7" fill="#fff" fillOpacity="0.14" stroke="#2a2a2a" strokeWidth="1.3" />
            <path d="M31.1 27.2 Q32 26.4 32.9 27.2" fill="none" stroke="#2a2a2a" strokeWidth="1.3" />
          </>
        )}
      </g>
    </svg>
  );
}