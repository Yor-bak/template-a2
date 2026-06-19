import { PAYMENT_LABELS, PAYMENT_COLORS } from "@/lib/constants";
import type { PaymentStatus } from "@/types";

interface Props {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_COLORS[status]}`}>
      {PAYMENT_LABELS[status]}
    </span>
  );
}
