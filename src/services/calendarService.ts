import type { AvailabilityRule, ManualBlock, ClosedDay } from "@/types/calendar";
import type { Appointment, AppointmentStatus } from "@/types";

export const SLOT_INTERVAL_MIN = 30;

const BLOCKING_STATUSES: AppointmentStatus[] = ["pending", "confirmed", "rescheduled"];

// ── Time helpers ──────────────────────────────────────────────────────────────

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function doesOverlap(s1: number, e1: number, s2: number, e2: number): boolean {
  return s1 < e2 && s2 < e1;
}

export function getDayOfWeek(dateStr: string): number {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(y, mo - 1, d).getDay();
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Core availability ─────────────────────────────────────────────────────────

export function isDateClosed(date: string, closedDays: ClosedDay[]): boolean {
  return closedDays.some((cd) => cd.date === date && cd.isActive);
}

export function getWorkingHoursForDay(
  dayOfWeek: number,
  rules: AvailabilityRule[]
): AvailabilityRule[] {
  return rules.filter((r) => r.dayOfWeek === dayOfWeek && r.isActive);
}

export function getBlocksForDate(date: string, blocks: ManualBlock[]): ManualBlock[] {
  return blocks.filter((b) => b.date === date && b.isActive);
}

export function isDayAvailableForBooking(
  date: string,
  rules: AvailabilityRule[],
  closedDays: ClosedDay[]
): boolean {
  if (isDateClosed(date, closedDays)) return false;
  return getWorkingHoursForDay(getDayOfWeek(date), rules).length > 0;
}

export function getAvailableSlots(
  date: string,
  durationMin: number,
  rules: AvailabilityRule[],
  blocks: ManualBlock[],
  closedDays: ClosedDay[],
  appointments: Appointment[]
): string[] {
  if (isDateClosed(date, closedDays)) return [];
  const dayRules = getWorkingHoursForDay(getDayOfWeek(date), rules);
  if (dayRules.length === 0) return [];

  const dateBlocks = getBlocksForDate(date, blocks);
  const dateApts = appointments.filter(
    (a) => a.desiredDate === date && BLOCKING_STATUSES.includes(a.status)
  );

  const available: string[] = [];
  for (const rule of dayRules) {
    let current = timeToMinutes(rule.startTime);
    const end = timeToMinutes(rule.endTime);
    while (current + durationMin <= end) {
      const slotEnd = current + durationMin;
      const blocked =
        dateApts.some((a) =>
          doesOverlap(
            current,
            slotEnd,
            timeToMinutes(a.desiredTime),
            timeToMinutes(a.desiredTime) + (a.durationMinutes ?? 30)
          )
        ) ||
        dateBlocks.some((b) =>
          doesOverlap(current, slotEnd, timeToMinutes(b.startTime), timeToMinutes(b.endTime))
        );
      if (!blocked) available.push(minutesToTime(current));
      current += SLOT_INTERVAL_MIN;
    }
  }
  return available;
}

// ── Calendar grid ─────────────────────────────────────────────────────────────

export interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
  dayNumber: number;
}

export function getMonthGrid(year: number, month: number): CalendarDay[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDow = first.getDay(); // 0=Sun
  const paddingBefore = startDow === 0 ? 6 : startDow - 1; // weeks start Monday

  const cells: CalendarDay[] = [];
  for (let i = paddingBefore; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    cells.push({ date: toDateStr(d), isCurrentMonth: false, dayNumber: d.getDate() });
  }
  for (let i = 1; i <= last.getDate(); i++) {
    const d = new Date(year, month, i);
    cells.push({ date: toDateStr(d), isCurrentMonth: true, dayNumber: i });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    cells.push({ date: toDateStr(d), isCurrentMonth: false, dayNumber: i });
  }
  return cells;
}

export function isPastDate(dateStr: string, today: string): boolean {
  return dateStr < today;
}

export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
