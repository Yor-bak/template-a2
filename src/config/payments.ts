import type { PaymentMethod } from "@/types/clinic";

export interface PaymentMethodMeta {
  value: PaymentMethod;
  label: string;
  icon: string;
}

export const PAYMENT_METHODS: PaymentMethodMeta[] = [
  { value: "cash", label: "Efectivo", icon: "💵" },
  { value: "card", label: "Tarjeta (débito/crédito)", icon: "💳" },
  { value: "transfer", label: "Transferencia bancaria", icon: "🏦" },
  { value: "credit_card", label: "Tarjeta de crédito", icon: "💳" },
  { value: "debit_card", label: "Tarjeta de débito", icon: "💳" },
  { value: "months_without_interest", label: "Meses sin intereses", icon: "📅" },
  { value: "insurance", label: "Seguro médico", icon: "🏥" },
  { value: "other", label: "Otro", icon: "🔧" },
];
