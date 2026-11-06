import type { Text } from '@/shared/i18n';

export type Message = { id: number; from: 'me'; text: string } | { id: number; from: 'apa'; text: Text };
export type VoiceState = 'idle' | 'loading' | 'playing';
