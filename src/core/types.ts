export type Role = 'admin' | 'supervisor' | 'worker';
export type Health = 'fit' | 'sick' | 'injured';
export type BreakType = 'rest' | 'snack';

export interface Worker {
  id: string;
  name: string;
  post: string;
  age: number;
  dailyRate: number;
  phone: string;
}

export interface MaterialLine {
  name: string;
  unit: string;
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
  name: string;
  post: string;
  basePay: number;
  deduction: number;
  welfareBonus: number;
  total: number;
  notes: string[];
}

export type PayrollStatus = 'pending' | 'approved';

export interface Shift {
  id: string;
  site: string;
  supervisor: string;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'completed';
  startProgress: number;
  endProgress?: number;
  attendance: Attendance[];
  materials: MaterialLine[];
  breaks: BreakLog[];
  incidents: string;
  payroll: PayrollLine[];
  payrollStatus?: PayrollStatus;
}

export type ComplaintStatus = 'open' | 'reviewing' | 'resolved';

export interface Complaint {
  id: string;
  fromWorkerId: string;
  anonymous: boolean;
  against: string;
  category: string;
  message: string;
  createdAt: string;
  status: ComplaintStatus;
}

export type RaiseStatus = 'pending' | 'approved' | 'rejected';

export interface RaiseRequest {
  id: string;
  workerId: string;
  currentRate: number;
  requestedRate: number;
  reason: string;
  details: string;
  createdAt: string;
  status: RaiseStatus;
}

export interface Project {
  name: string;
  section: string;
  lengthKm: number;
  supervisor: string;
}