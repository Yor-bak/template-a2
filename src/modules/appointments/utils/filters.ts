import type { Appointment, AppointmentStatus, AppointmentSource } from "@/types";
import { DEMO_TODAY } from "@/lib/constants";

export type StatusFilter =
  | AppointmentStatus
  | "all"
  | "today"
  | "this_week"
  | "this_month"
  | "paid"
  | "unpaid"
  | "source_web"
  | "source_manual"
  | "source_ai";

/** Returns the Monday of the week containing dateStr (YYYY-MM-DD) */
function weekStart(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split("T")[0];
}

function sameMonth(a: string, b: string) {
  return a.slice(0, 7) === b.slice(0, 7);
}

const SOURCE_FILTER_MAP: Record<string, AppointmentSource> = {
  source_web: "public_web",
  source_manual: "manual",
  source_ai: "ai_whatsapp",
};

export function filterAppointments(
  appointments: Appointment[],
  filter: StatusFilter,
  search: string
): Appointment[] {
  let list = [...appointments];

  switch (filter) {
    case "today":
      list = list.filter((a) => a.desiredDate === DEMO_TODAY);
      break;
    case "this_week": {
      const ws = weekStart(DEMO_TODAY);
      list = list.filter((a) => a.desiredDate >= ws && a.desiredDate <= DEMO_TODAY);
      break;
    }
    case "this_month":
      list = list.filter((a) => sameMonth(a.desiredDate, DEMO_TODAY));
      break;
    case "paid":
      list = list.filter((a) => a.paymentStatus === "paid");
      break;
    case "unpaid":
      list = list.filter((a) => a.paymentStatus === "unpaid");
      break;
    case "source_web":
    case "source_manual":
    case "source_ai":
      list = list.filter((a) => a.source === SOURCE_FILTER_MAP[filter]);
      break;
    case "all":
      break;
    default:
      list = list.filter((a) => a.status === filter);
  }

  if (search.trim()) {
    const s = search.toLowerCase();
    list = list.filter(
      (a) =>
        a.patientName.toLowerCase().includes(s) ||
        a.serviceName.toLowerCase().includes(s) ||
        a.patientPhone.includes(s)
    );
  }

  return list.sort((a, b) => a.desiredDate.localeCompare(b.desiredDate));
}

/** True if the appointment datetime has already passed */
export function hasAppointmentPassed(date: string, time: string): boolean {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  const aptDate = new Date(y, m - 1, d, h, min);
  const [ty, tm, td] = DEMO_TODAY.split("-").map(Number);
  const now = new Date(ty, tm - 1, td, 23, 59);
  return aptDate <= now;
}
