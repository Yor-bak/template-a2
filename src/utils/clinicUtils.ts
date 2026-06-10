import type { OpeningHour, PaymentMethod, ClinicConfig } from "@/types/clinic";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  credit_card: "Tarjeta de crédito",
  debit_card: "Tarjeta de débito",
  months_without_interest: "Meses sin intereses",
  insurance: "Seguro dental",
  other: "Otro",
};

export const ALL_PAYMENT_METHODS: PaymentMethod[] = Object.keys(
  PAYMENT_METHOD_LABELS
) as PaymentMethod[];

export function getPaymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method];
}

export function formatOpeningHours(openingHours: OpeningHour[]): string {
  const open = [...openingHours]
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .filter((h) => h.isOpen);
  if (open.length === 0) return "Sin horario configurado";
  const first = open[0];
  const last = open[open.length - 1];
  const timeStr =
    first.blocks.length > 0
      ? `${first.blocks[0].startTime}–${first.blocks[first.blocks.length - 1].endTime}`
      : "";
  if (first.dayOfWeek === last.dayOfWeek) return `${first.dayLabel} ${timeStr}`;
  return `${first.dayLabel}–${last.dayLabel} ${timeStr}`;
}

export function getShortHoursLabel(openingHours: OpeningHour[]): string {
  const weekdays = openingHours.filter(
    (h) => h.isOpen && h.dayOfWeek >= 1 && h.dayOfWeek <= 5
  );
  if (weekdays.length === 0) return "Ver horarios";
  const sorted = [...weekdays].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const timeRange =
    first.blocks.length > 0
      ? `${first.blocks[0].startTime}–${first.blocks[first.blocks.length - 1].endTime}`
      : "";
  const dayRange =
    first.dayOfWeek === last.dayOfWeek
      ? first.dayLabel.slice(0, 3)
      : `${first.dayLabel.slice(0, 3)}–${last.dayLabel.slice(0, 3)}`;
  return `${dayRange} ${timeRange}`;
}

export function getShortAddress(config: Pick<ClinicConfig, "neighborhood" | "city" | "address">): string {
  if (config.neighborhood && config.city) return `${config.neighborhood}, ${config.city}`;
  if (config.city) return config.city;
  return config.address;
}

export function getDentistInitials(name: string): string {
  return name
    .replace(/^(Dr\.|Dra\.)\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function sanitizePublicClinicConfig(
  config: ClinicConfig
): Omit<ClinicConfig, "n8nWebhookUrl" | "automationEnabled" | "automationMode"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { n8nWebhookUrl, automationEnabled, automationMode, ...pub } = config;
  return pub;
}

export function validateClinicConfig(
  config: Partial<ClinicConfig>
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!config.clinicName?.trim()) errors.clinicName = "El nombre del consultorio es requerido";
  if (!config.dentistName?.trim()) errors.dentistName = "El nombre del dentista es requerido";
  if (!config.professionalLicense?.trim()) errors.professionalLicense = "La cédula profesional es requerida";
  if (!config.specialty?.trim()) errors.specialty = "La especialidad es requerida";
  if (config.yearsExperience !== undefined && config.yearsExperience < 0)
    errors.yearsExperience = "Los años de experiencia no pueden ser negativos";
  if (config.patientsServed !== undefined && config.patientsServed < 0)
    errors.patientsServed = "Los pacientes atendidos no pueden ser negativos";
  if (!config.phone?.trim()) errors.phone = "El teléfono es requerido";
  if (!config.whatsapp?.trim()) errors.whatsapp = "El WhatsApp es requerido";
  if (config.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email))
    errors.email = "El correo no tiene un formato válido";
  if (!config.address?.trim()) errors.address = "La dirección es requerida";
  if (
    config.googleMapsUrl &&
    config.googleMapsUrl.trim() &&
    !config.googleMapsUrl.startsWith("http")
  )
    errors.googleMapsUrl = "La URL de Google Maps debe comenzar con http";
  return errors;
}
