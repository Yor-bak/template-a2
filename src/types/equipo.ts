// ─── Worker (team member) ────────────────────────────────────────────────────

export type WorkerRole = "business_admin" | "worker";
export type CompensationType = "percentage" | "fixed" | "manual";
export type CommissionStatus = "pending" | "approved" | "paid" | "cancelled";
export type SettlementStatus = "open" | "closed" | "paid";

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: WorkerRole;
  specialty?: string;
  compensationType: CompensationType;
  compensationValue: number; // 0–100 for percentage; peso amount for fixed; 0 for manual
  isActive: boolean;
  color: string; // hex, for calendar display
  createdAt: string;
}

// ─── Commission ───────────────────────────────────────────────────────────────

export interface WorkerCommission {
  id: string;
  workerId: string;
  appointmentId: string;
  appointmentDate: string;
  patientName: string;
  serviceName: string;
  serviceAmount: number;
  compensationType: CompensationType;
  compensationValue: number;
  earnedAmount: number;
  status: CommissionStatus;
  settlementId?: string;
  notes?: string;
  createdAt: string;
}

// ─── Settlement ───────────────────────────────────────────────────────────────

export interface WorkerSettlement {
  id: string;
  workerId: string;
  periodLabel: string; // e.g. "Jun 2026 — 1ª quincena"
  periodStart: string;
  periodEnd: string;
  commissionIds: string[];
  totalEarned: number;
  status: SettlementStatus;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

// ─── Appointment assignment map ───────────────────────────────────────────────

export type AssignmentMap = Record<string, string>; // appointmentId → workerId

// ─── Store root ───────────────────────────────────────────────────────────────

export interface EquipoStore {
  workers: Worker[];
  commissions: WorkerCommission[];
  settlements: WorkerSettlement[];
  assignments: AssignmentMap;
}

// ─── Label / color maps ───────────────────────────────────────────────────────

export const ROLE_LABELS: Record<WorkerRole, string> = {
  business_admin: "Administrador",
  worker: "Trabajador",
};

export const COMPENSATION_LABELS: Record<CompensationType, string> = {
  percentage: "Porcentaje",
  fixed: "Monto fijo",
  manual: "Manual",
};

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  paid: "Pagado",
  cancelled: "Cancelado",
};

export const SETTLEMENT_STATUS_LABELS: Record<SettlementStatus, string> = {
  open: "Abierta",
  closed: "Cerrada",
  paid: "Pagada",
};

export const WORKER_COLORS = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];
