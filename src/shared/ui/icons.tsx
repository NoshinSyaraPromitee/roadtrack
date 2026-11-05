import type { ComponentType, CSSProperties } from 'react';

export type IconType = ComponentType<{ className?: string; style?: CSSProperties; strokeWidth?: number }>;

/** The bent figure with a walking stick used on "elderly people" road signs. */
export function ElderIcon({ className, style, strokeWidth = 2 }: { className?: string; style?: CSSProperties; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <circle cx="11.5" cy="3.8" r="2" />
      <path d="M10.6 7.2c-1.6 1.4-2.4 3.6-2.2 6.6" />
      <path d="M10.2 9.4l3.6 2.3" />
      <path d="M14.4 11.4l1.1 9.8" />
      <path d="M8.4 13.8l-2.6 7.4" />
      <path d="M8.4 13.8l3 3.2.4 4.2" />
    </svg>
  );
}