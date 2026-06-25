export type CarePlanStatus =
  | "draft"
  | "presented"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ClientPaymentMethod =
  | "cash"
  | "transfer"
  | "credit_card"
  | "debit_card"
  | "payment_link"
  | "other";

export type ClientPaymentStatus =
  | "pending"
  | "partial"
  | "paid"
  | "refunded"
  | "cancelled";

export type FollowUpPriority = "low" | "medium" | "high";
export type FollowUpStatus = "pending" | "completed" | "cancelled";

export type FileCategory =
  | "photo"
  | "before_after"
  | "study"
  | "prescription"
  | "document"
  | "payment_receipt"
  | "other";

export interface Client {
  id: string;
  name: string;
  phone: string;
  dateOfBirth?: string;
  firstVisitAt: string;
  notes?: string;
  tags: string[];
  totalAppointments: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CarePlanItem {
  id: string;
  serviceId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  numberOfSessions?: number;
  completedSessions?: number;
}

export interface CarePlan {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  status: CarePlanStatus;
  startDate?: string;
  estimatedEndDate?: string;
  items: CarePlanItem[];
  subtotal: number;
  discount?: number;
  total: number;
  initialPayment?: number;
  paidAmount: number;
  pendingAmount: number;
  internalNotes?: string;
  clientNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPayment {
  id: string;
  clientId: string;
  carePlanId?: string;
  concept: string;
  amount: number;
  paymentDate: string;
  paymentMethod: ClientPaymentMethod;
  status: ClientPaymentStatus;
  reference?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface ClientFollowUp {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  relatedPlanId?: string;
  relatedAppointmentId?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ClientFile {
  id: string;
  clientId: string;
  name: string;
  category: FileCategory;
  url: string;
  description?: string;
  date: string;
  afterUrl?: string;
  relatedPlanId?: string;
  relatedAppointmentId?: string;
  createdAt: string;
}

export interface ClientDataStore {
  version: string;
  clients: Client[];
  carePlans: CarePlan[];
  payments: ClientPayment[];
  followUps: ClientFollowUp[];
  files: ClientFile[];
}

// ── Labels ─────────────────────────────────────────────────────────────────────

export const CARE_PLAN_STATUS_LABELS: Record<CarePlanStatus, string> = {
  draft: "Borrador",
  presented: "Presentado",
  accepted: "Aceptado",
  in_progress: "En progreso",
  completed: "Completado",
  cancelled: "Cancelado",
};

export const CARE_PLAN_STATUS_COLORS: Record<CarePlanStatus, string> = {
  draft: "bg-[var(--ds-surface-muted)] text-[var(--ds-text-muted)]",
  presented: "bg-blue-50 text-blue-700",
  accepted: "bg-[var(--ds-success)]/10 text-[var(--ds-success)]",
  in_progress: "bg-[var(--ds-warning)]/10 text-[var(--ds-warning)]",
  completed: "bg-[var(--ds-success)]/15 text-[var(--ds-success)]",
  cancelled: "bg-red-50 text-red-600",
};

export const PAYMENT_METHOD_LABELS: Record<ClientPaymentMethod, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  credit_card: "Tarjeta crédito",
  debit_card: "Tarjeta débito",
  payment_link: "Link de pago",
  other: "Otro",
};

export const CLIENT_PAYMENT_STATUS_LABELS: Record<ClientPaymentStatus, string> = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagado",
  refunded: "Reembolsado",
  cancelled: "Cancelado",
};

export const CLIENT_PAYMENT_STATUS_COLORS: Record<ClientPaymentStatus, string> = {
  pending: "bg-[var(--ds-warning)]/10 text-[var(--ds-warning)]",
  partial: "bg-blue-50 text-blue-700",
  paid: "bg-[var(--ds-success)]/10 text-[var(--ds-success)]",
  refunded: "bg-purple-50 text-purple-700",
  cancelled: "bg-red-50 text-red-600",
};

export const FOLLOW_UP_PRIORITY_LABELS: Record<FollowUpPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export const FOLLOW_UP_PRIORITY_COLORS: Record<FollowUpPriority, string> = {
  low: "bg-[var(--ds-surface-muted)] text-[var(--ds-text-muted)]",
  medium: "bg-[var(--ds-warning)]/10 text-[var(--ds-warning)]",
  high: "bg-red-50 text-red-600",
};

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  photo: "Fotografía",
  before_after: "Antes / Después",
  study: "Estudio",
  prescription: "Receta",
  document: "Documento",
  payment_receipt: "Comprobante de pago",
  other: "Otro",
};

export const DEFAULT_TAGS = [
  "Cliente frecuente",
  "Primera visita",
  "Seguimiento",
  "Tratamiento activo",
  "Pendiente de pago",
];
