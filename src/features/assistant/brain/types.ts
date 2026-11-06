import type { Complaint, HealthReport, Machine, RaiseRequest, Road, Role, Shift, Worker } from '@/core/types';
import type { Text } from '@/shared/i18n';
import type { IconType } from '@/shared/ui';

export type QuestionKey =
  | 'my_pay'
  | 'daily_rate'
  | 'raise'
  | 'complaints'
  | 'next_break'
  | 'extra_pay'
  | 'how_complain'
  | 'shift_now'
  | 'how_start'
  | 'how_finish'
  | 'crew_care'
  | 'progress'
  | 'pay_pending'
  | 'waste'
  | 'help'
  | 'machines'
  | 'health'
  | 'intro';

export interface ApaContext {
  role: Role;
  road: Road;
  worker?: Worker;
  workers: Worker[];
  shifts: Shift[];
  machines: Machine[];
  health: HealthReport[];
  raises: RaiseRequest[];
  complaints: Complaint[];
  ownComplaintIds?: string[];
  now?: number;
}

export interface QuestionDef {
  icon: IconType;
  label: Text;
  labelBy?: Partial<Record<Role, Text>>;
  words: string[];
}
