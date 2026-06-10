import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { AppointmentStatus } from "@/types";

interface Props {
  status: AppointmentStatus;
}

export function AppointmentStatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
