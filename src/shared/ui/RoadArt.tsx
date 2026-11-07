export function RollerArt({ width = 64, className }: { width?: number; className?: string }) {
  return (
    <svg viewBox="-64 -92 102 94" width={width} height={(width * 94) / 102} className={className} aria-hidden="true">
      <rect x="-46" y="-44" width="70" height="26" rx="5" fill="#f2a91c" />
      <rect x="-20" y="-78" width="34" height="36" rx="4" fill="#f2a91c" />
      <rect x="-15" y="-73" width="24" height="16" rx="2" fill="#bfe3f2" />
      <rect x="-22" y="-82" width="38" height="6" rx="2" fill="#2d3438" />
      <rect x="-50" y="-30" width="78" height="8" fill="#c9850a" />
      <rect x="-62" y="-32" width="40" height="32" rx="14" fill="#4b5563" />
      <rect x="-58" y="-28" width="32" height="24" rx="11" fill="#6b7280" />
      <circle cx="18" cy="-14" r="14" fill="#1f2937" />
      <circle cx="18" cy="-14" r="6" fill="#9ca3af" />
      <rect x="30" y="-90" width="5" height="16" fill="#2d3438" />
    </svg>
  );
}

export function ConeArt({ height = 20, className }: { height?: number; className?: string }) {
  return (
    <svg viewBox="-10 -23 20 24" width={(height * 20) / 24} height={height} className={className} aria-hidden="true">
      <rect x="-9" y="-2" width="18" height="3" rx="1" fill="#c2410c" />
      <path d="M-6 -2 L-1.6 -22 L1.6 -22 L6 -2Z" fill="#f97316" />
      <path d="M-4.2 -9 L4.2 -9 L3.3 -13 L-3.3 -13Z" fill="#fff" />
    </svg>
  );
}
