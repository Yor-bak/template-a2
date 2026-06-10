import type { Appointment } from "@/types";
import { DEMO_TODAY } from "@/lib/constants";

function weekStart(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split("T")[0];
}

function sameMonth(a: string, b: string) {
  return a.slice(0, 7) === b.slice(0, 7);
}

export interface IncomeSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  byService: { name: string; count: number; total: number }[];
  paid: number;
  unpaid: number;
  partial: number;
  courtesy: number;
  paidCount: number;
  unpaidCount: number;
  partialCount: number;
  courtesyCount: number;
}

export function calculateIncomeSummary(appointments: Appointment[]): IncomeSummary {
  const ws = weekStart(DEMO_TODAY);

  const paid = appointments.filter((a) => a.paymentStatus === "paid");
  const partial = appointments.filter((a) => a.paymentStatus === "partial");
  const unpaid = appointments.filter((a) => a.paymentStatus === "unpaid");
  const courtesy = appointments.filter((a) => a.paymentStatus === "courtesy");

  const sum = (list: Appointment[], getter: (a: Appointment) => number) =>
    list.reduce((acc, a) => acc + getter(a), 0);

  const byServiceMap: Record<string, { count: number; total: number }> = {};
  paid.forEach((a) => {
    if (!byServiceMap[a.serviceName]) byServiceMap[a.serviceName] = { count: 0, total: 0 };
    byServiceMap[a.serviceName].count++;
    byServiceMap[a.serviceName].total += a.chargedAmount || 0;
  });

  return {
    today: sum(
      paid.filter((a) => a.paidAt === DEMO_TODAY),
      (a) => a.chargedAmount || 0
    ),
    thisWeek: sum(
      paid.filter((a) => a.paidAt && a.paidAt >= ws && a.paidAt <= DEMO_TODAY),
      (a) => a.chargedAmount || 0
    ),
    thisMonth: sum(
      paid.filter((a) => a.paidAt && sameMonth(a.paidAt, DEMO_TODAY)),
      (a) => a.chargedAmount || 0
    ),
    byService: Object.entries(byServiceMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total),
    paid: sum(paid, (a) => a.chargedAmount || 0),
    partial: sum(partial, (a) => a.chargedAmount || 0),
    unpaid: sum(unpaid, (a) => a.estimatedAmount || 0),
    courtesy: 0,
    paidCount: paid.length,
    unpaidCount: unpaid.length,
    partialCount: partial.length,
    courtesyCount: courtesy.length,
  };
}
