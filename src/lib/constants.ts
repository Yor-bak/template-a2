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
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  rescheduled: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-700",
  no_show: "bg-orange-100 text-orange-800",
};

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Sin pagar",
  paid: "Pagada",
  partial: "Parcial",
  courtesy: "Cortesía",
};

export const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  unpaid: "bg-red-50 text-red-700",
  paid: "bg-green-50 text-green-700",
  partial: "bg-yellow-50 text-yellow-700",
  courtesy: "bg-purple-50 text-purple-700",
};

export const DEMO_TODAY = "2025-06-10";
