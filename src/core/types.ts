import type { Text } from '@/shared/i18n/types';

export type { Text };

export type Role = 'admin' | 'supervisor' | 'worker';
export type Health = 'fit' | 'sick' | 'injured';
export type BreakType = 'rest' | 'snack';
export type PostKey = 'foreman' | 'mason' | 'operator' | 'roller' | 'laborer' | 'helper';
export type MaterialKey = 'bitumen' | 'stone' | 'sand' | 'cement' | 'diesel';
export type PayFlag = 'absent' | 'left' | 'senior' | 'sick' | 'injured';
export type IncidentKey = 'waste' | 'mistake' | 'injury' | 'machine' | 'weather';
export type ComplaintCategory = 'payment' | 'safety' | 'behaviour' | 'harassment' | 'conditions' | 'other';
export type ComplaintStatus = 'open' | 'reviewing' | 'resolved';
export type RaiseReason = 'responsibility' | 'skill' | 'prices' | 'hazard' | 'family' | 'other';
export type RaiseStatus = 'pending' | 'approved' | 'rejected';
export type PayrollStatus = 'pending' | 'approved';

export interface Person {
  id: string;
  name: string;
  nameBn: string;
  /** Each person has their own colour, so the same work icon still looks different for two people. */
  color: string;
}

export interface Worker extends Person {
  post: PostKey;
  age: number;
  dailyRate: number;
  phone: string;
}

export interface MaterialLine {
  key: MaterialKey;
  allocated: number;
  used: number;
  wasted: number;
}

export interface Attendance {
  workerId: string;
  presentAtStart: boolean;
  presentAtEnd: boolean;
  health: Health;
  output: number;
}

export interface BreakLog {
  id: string;
  type: BreakType;
  at: string;
}

export interface PayrollLine {
  workerId: string;
  basePay: number;
  deduction: number;
  welfareBonus: number;
  total: number;
  flags: PayFlag[];
}

export interface Shift {
  id: string;
  site: string;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'completed';
  startProgress: number;
  endProgress?: number;
  attendance: Attendance[];
  materials: MaterialLine[];
  breaks: BreakLog[];
  incidentTags: IncidentKey[];
  incidents: string;
  payroll: PayrollLine[];
  payrollStatus?: PayrollStatus;
}

export interface Complaint {
  id: string;
  fromWorkerId: string;
  anonymous: boolean;
  againstId: string;
  category: ComplaintCategory;
  message: string;
  audio?: string;
  createdAt: string;
  status: ComplaintStatus;
}

export interface RaiseRequest {
  id: string;
  workerId: string;
  currentRate: number;
  requestedRate: number;
  reason: RaiseReason;
  details: string;
  audio?: string;
  createdAt: string;
  status: RaiseStatus;
}

export interface Project {
  name: Text;
  section: Text;
  lengthKm: number;
}