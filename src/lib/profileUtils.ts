import type { Address, PublicPaymentMethod, PublicPriceType } from "@/types/profile";

export function formatFullAddress(a: Address): string {
  const line1 = [a.street, a.exteriorNumber, a.interiorNumber ? `Int. ${a.interiorNumber}` : undefined]
    .filter(Boolean).join(" ");
  const line2 = [a.neighborhood, a.municipality].filter(Boolean).join(", ");
  const line3 = [a.city, a.postalCode ? `CP ${a.postalCode}` : undefined, a.state]
    .filter(Boolean).join(", ");
  return [line1, line2, line3, a.country].filter(Boolean).join(", ");
}

export function formatShortAddress(a: Address): string {
  return [a.neighborhood || a.city, a.city, a.state].filter(Boolean).join(", ");
}

export function formatStreetLine(a: Address): string {
  return [a.street, a.exteriorNumber, a.interiorNumber ? `Int. ${a.interiorNumber}` : undefined]
    .filter(Boolean).join(" ");
}

export function getSocialHandle(url?: string): string {
  if (!url) return "";
  const m = url.match(/(?:instagram\.com|facebook\.com|tiktok\.com|linkedin\.com|twitter\.com|x\.com)\/@?([\w.]+)/);
  return m ? `@${m[1]}` : "";
}

export function formatWhatsAppUrl(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  const number = digits.startsWith("52") ? digits : `52${digits}`;
  return `https://wa.me/${number}`;
}

export function formatTelUrl(phone: string): string {
  return `tel:+52${phone.replace(/\D/g, "")}`;
}

export function formatPrice(priceType: PublicPriceType, estimatedPrice?: number): string {
  if (priceType === "hidden") return "";
  if (priceType === "assessment_required") return "Requiere valoración";
  if (!estimatedPrice) return "";
  const n = new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", minimumFractionDigits: 0,
  }).format(estimatedPrice);
  return priceType === "from" ? `Desde ${n}` : n;
}

export function formatPriceString(priceType: PublicPriceType, estimatedPrice?: number): string {
  if (priceType === "hidden") return "";
  if (priceType === "assessment_required") return "Requiere valoración";
  if (!estimatedPrice) return "";
  return `$${estimatedPrice.toLocaleString("es-MX")}`;
}

export const PRICE_TYPE_LABEL: Record<PublicPriceType, string> = {
  fixed: "Precio fijo",
  from: "Desde",
  assessment_required: "Previa valoración",
  hidden: "",
};

export const PAYMENT_METHOD_LABEL: Record<PublicPaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta (débito/crédito)",
  credit_card: "Tarjeta de crédito",
  debit_card: "Tarjeta de débito",
  transfer: "Transferencia bancaria",
  months_without_interest: "Meses sin intereses",
  insurance: "Seguro médico",
  other: "Otro",
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function scheduleFromOpeningHours(
  hours: { dayOfWeek: number; dayLabel: string; isOpen: boolean; blocks: { startTime: string; endTime: string }[] }[]
): { day: string; hours: string }[] {
  return hours.map((h) => ({
    day: h.dayLabel,
    hours: h.isOpen
      ? h.blocks.map((b) => `${b.startTime} – ${b.endTime}`).join(" / ")
      : "Cerrado",
  }));
}
