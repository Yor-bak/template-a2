import type { AppointmentStatus, PaymentStatus } from "@/types";

export const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
];

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  rejected: "Rechazada",
  rescheduled: "Reagendada",
  completed: "Finalizada",
  cancelled: "Cancelada",
  no_show: "No asistió",
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending:     "bg-[var(--ds-warning)]/12 text-[var(--ds-warning)]",
  confirmed:   "bg-[var(--ds-accent)]/12 text-[var(--ds-accent)]",
  rejected:    "bg-[var(--ds-error)]/12 text-[var(--ds-error)]",
  rescheduled: "bg-[var(--ds-text-muted)]/12 text-[var(--ds-text-muted)]",
  completed:   "bg-[var(--ds-success)]/12 text-[var(--ds-success)]",
  cancelled:   "bg-[var(--ds-surface-muted)] text-[var(--ds-text-muted)]",
  no_show:     "bg-[var(--ds-warning)]/8 text-[var(--ds-warning)]",
};

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Sin pagar",
  paid: "Pagada",
  partial: "Parcial",
  courtesy: "Cortesía",
};

export const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  unpaid:   "bg-[var(--ds-error)]/12 text-[var(--ds-error)]",
  paid:     "bg-[var(--ds-success)]/12 text-[var(--ds-success)]",
  partial:  "bg-[var(--ds-warning)]/12 text-[var(--ds-warning)]",
  courtesy: "bg-[var(--ds-text-muted)]/12 text-[var(--ds-text-muted)]",
};

export const DEMO_TODAY = "2025-06-10";
