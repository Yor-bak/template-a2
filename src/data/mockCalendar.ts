import type { AvailabilityRule, ManualBlock, ClosedDay } from "@/types/calendar";

export const defaultAvailabilityRules: AvailabilityRule[] = [
  // Lunes
  { id: "r-1-1", dayOfWeek: 1, isActive: true, startTime: "09:00", endTime: "14:00", blockLabel: "Mañana" },
  { id: "r-1-2", dayOfWeek: 1, isActive: true, startTime: "16:00", endTime: "19:00", blockLabel: "Tarde" },
  // Martes
  { id: "r-2-1", dayOfWeek: 2, isActive: true, startTime: "09:00", endTime: "14:00", blockLabel: "Mañana" },
  // Miércoles
  { id: "r-3-1", dayOfWeek: 3, isActive: true, startTime: "09:00", endTime: "14:00", blockLabel: "Mañana" },
  { id: "r-3-2", dayOfWeek: 3, isActive: true, startTime: "16:00", endTime: "19:00", blockLabel: "Tarde" },
  // Jueves
  { id: "r-4-1", dayOfWeek: 4, isActive: true, startTime: "09:00", endTime: "14:00", blockLabel: "Mañana" },
  // Viernes
  { id: "r-5-1", dayOfWeek: 5, isActive: true, startTime: "09:00", endTime: "15:00", blockLabel: "Continuo" },
  // Sábado
  { id: "r-6-1", dayOfWeek: 6, isActive: true, startTime: "09:00", endTime: "13:00", blockLabel: "Mañana" },
  // Domingo: sin reglas = día no laborable
];

export const defaultManualBlocks: ManualBlock[] = [
  {
    id: "mb-1",
    date: "2025-06-16",
    startTime: "11:30",
    endTime: "12:30",
    reason: "Reunión con proveedor",
    isActive: true,
    createdAt: "2025-06-10T08:00:00Z",
  },
  {
    id: "mb-2",
    date: "2025-06-18",
    startTime: "13:00",
    endTime: "14:00",
    reason: "Consulta personal",
    isActive: true,
    createdAt: "2025-06-10T08:00:00Z",
  },
];

export const defaultClosedDays: ClosedDay[] = [
  {
    id: "cd-1",
    date: "2025-06-21",
    reason: "Descanso",
    isActive: true,
    createdAt: "2025-06-10T08:00:00Z",
  },
];
