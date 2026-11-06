import { useId } from 'react';
import { cn } from '@/shared/lib/utils';

export type ApaMood = 'idle' | 'listening' | 'talking';

const SKIN = '#b5774f';
const SKIN_SHADE = '#9a6040';
const HAIR = '#1d1411';

/** Apa, drawn in code: a Bangladeshi site helper in a green saree with a red border and a headset. Her mouth moves while she talks. */
export function ApaFace({ mood = 'idle', size = 96, className }: { mood?: ApaMood; size?: number; className?: string }) {
  const clip = useId();

  return (
    <span className={cn('relative inline-grid shrink-0 place-items-center', className)} style={{ width: size, height: size }}>
      {mood === 'listening' && <span className="absolute inset-0 animate-ping rounded-full bg-sign-500/30" />}
      <svg viewBox="0 0 200 200" className="relative h-full w-full" role="img" aria-label="Apa">
        <defs>
          <clipPath id={clip}>
            <circle cx="100" cy="100" r="98" />
          </clipPath>
        </defs>
        <circle cx="100" cy="100" r="100" fill={mood === 'listening' ? '#1c5fb0' : '#ffc930'} />
        <g clipPath={`url(#${clip})`}>
          <circle cx="100" cy="100" r="88" fill={mood === 'listening' ? '#c8daf1' : '#fff4cc'} />

          {/* hair behind the head and the bun */}
          <circle cx="100" cy="46" r="20" fill={HAIR} />
          <path d="M56 104 C 50 60, 150 60, 144 104 L 148 150 L 52 150 Z" fill={HAIR} />

          {/* neck and body */}
          <path d="M86 132 H114 V160 H86 Z" fill={SKIN_SHADE} />
          <path d="M22 210 C 26 170, 52 154, 84 152 L 116 152 C 148 154, 174 170, 178 210 Z" fill="#0f7a5c" />
          <path d="M84 152 C 92 166, 108 166, 116 152 Z" fill="#7d1f2b" />
          {/* saree border across the shoulder */}
          <path d="M120 150 C 140 156, 158 168, 170 196 L 156 204 C 146 180, 132 166, 112 160 Z" fill="#c8102e" />
          <path d="M122 156 C 140 162, 154 174, 163 196" stroke="#ffc930" strokeWidth="3" fill="none" strokeDasharray="2 5" strokeLinecap="round" />

          {/* ears and gold earrings */}
          <ellipse cx="62" cy="106" rx="6" ry="9" fill={SKIN_SHADE} />
          <ellipse cx="138" cy="106" rx="6" ry="9" fill={SKIN_SHADE} />
          <circle cx="62" cy="118" r="3.5" fill="#e0a526" />

          {/* face */}
          <ellipse cx="100" cy="102" rx="38" ry="44" fill={SKIN} />
          <ellipse cx="80" cy="120" rx="7" ry="4.5" fill="#c95f4f" opacity="0.35" />
          <ellipse cx="120" cy="120" rx="7" ry="4.5" fill="#c95f4f" opacity="0.35" />

          {/* hair in front, parted in the middle */}
          <path d="M60 102 C 56 54, 144 54, 140 102 C 136 82, 122 68, 102 66 L 100 72 L 98 66 C 78 68, 64 82, 60 102 Z" fill={HAIR} />

          {/* eyebrows */}
          <path d="M76 90 Q 85 85, 93 89" stroke={HAIR} strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M107 89 Q 115 85, 124 90" stroke={HAIR} strokeWidth="3.2" fill="none" strokeLinecap="round" />

          {/* eyes with kajal; they blink */}
          <g className="apa-blink">
            <ellipse cx="85" cy="101" rx="6.5" ry="4.6" fill="#ffffff" />
            <ellipse cx="115" cy="101" rx="6.5" ry="4.6" fill="#ffffff" />
            <circle cx="85.5" cy="101" r="3.6" fill="#2b1a12" />
            <circle cx="115.5" cy="101" r="3.6" fill="#2b1a12" />
            <circle cx="86.6" cy="99.8" r="1.1" fill="#ffffff" />
            <circle cx="116.6" cy="99.8" r="1.1" fill="#ffffff" />
            <path d="M78 99.5 Q 85 94.5, 92.5 99.5" stroke="#140c09" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M107.5 99.5 Q 115 94.5, 122 99.5" stroke="#140c09" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </g>

          {/* nose and nose pin */}
          <path d="M100 104 Q 97 114, 100 117 Q 103 118, 105 116" stroke={SKIN_SHADE} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <circle cx="106.5" cy="115" r="1.9" fill="#f3c64b" />

          {/* mouth */}
          {mood === 'talking' ? (
            <g className="apa-talk">
              <ellipse cx="100" cy="131" rx="9" ry="6" fill="#6e2430" />
              <path d="M92 129 Q 100 126, 108 129" stroke="#a5444f" strokeWidth="2" fill="none" />
            </g>
          ) : (
            <path d="M89 128 Q 100 138, 111 128 Q 100 133, 89 128 Z" fill="#a5444f" stroke="#a5444f" strokeWidth="2" strokeLinejoin="round" />
          )}

          {/* headset */}
          <path d="M60 96 C 58 52, 142 52, 140 96" stroke="#2c3330" strokeWidth="5" fill="none" strokeLinecap="round" />
          <rect x="132" y="96" width="12" height="20" rx="5" fill="#2c3330" />
          <path d="M136 114 C 134 128, 126 134, 114 135" stroke="#2c3330" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="113" cy="135" r="3.5" fill="#2c3330" />
        </g>
      </svg>
    </span>
  );
}
