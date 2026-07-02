import type { SalesRep, AdminClient } from "@/types/user";
import { normalizePhoneNumber, phoneLastDigits } from "@/lib/phoneUtils";

export const RESERVED_SLUGS = [
  "admin", "api", "www", "app", "soporte", "support", "login", "dashboard",
  "panel", "auth", "static", "cdn", "mail", "smtp", "ftp",
  "ayuda", "blog", "tienda", "demo", "configuracion", "settings",
];

// ── Business-type → slug prefix map ──────────────────────────────────────────

export const BUSINESS_TYPE_SLUG_MAP: Record<string, string> = {
  dentist:         "dentista",
  doctor:          "medico",
  physiotherapist: "fisioterapeuta",
  nutritionist:    "nutriologo",
  psychologist:    "psicologo",
  veterinarian:    "veterinario",
  gym:             "gimnasio",
  other:           "negocio",
};

// ── Subdomain helpers ─────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "n")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Generate the suggested subdomain following the rule:
 *   giro-primerNombre-primerApellido-últimos4Teléfono
 *
 * Example: dentista-mariana-lopez-5678
 *
 * The result is always auto-generated (a suggestion). Admin may override it manually.
 */
export function generateSuggestedSubdomain({
  businessType,
  firstName,
  lastName,
  phone,
}: {
  businessType: string;
  firstName: string;
  lastName: string;
  phone: string;
}): string {
  const giro = slugify(BUSINESS_TYPE_SLUG_MAP[businessType] ?? "negocio");
  const first = slugify(firstName.split(" ")[0] ?? "");
  const last = slugify(lastName.split(" ")[0] ?? "");
  const last4 = phoneLastDigits(phone, 4) || "0000";

  const parts = [giro, first, last, last4].filter(Boolean);
  return parts.join("-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 63);
}

/** Normalize a raw subdomain value entered by the user */
export function normalizeSubdomain(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);
}

/** Validate a subdomain string */
export function validateSubdomain(value: string): { valid: boolean; message: string } {
  if (!value) return { valid: false, message: "El subdominio es obligatorio." };
  if (value.length < 3) return { valid: false, message: "Mínimo 3 caracteres." };
  if (value.length > 63) return { valid: false, message: "Máximo 63 caracteres." };
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value) && !/^[a-z0-9]$/.test(value))
    return { valid: false, message: "Solo minúsculas, números y guiones. No puede empezar ni terminar con guion." };
  if (isSlugReserved(value)) return { valid: false, message: `"${value}" es una palabra reservada.` };
  return { valid: true, message: "" };
}

/** Check availability against local client list (⚠️ local-only, no backend) */
export function checkSubdomainAvailability(
  value: string,
  clients: AdminClient[],
  excludeId?: string,
): { available: boolean; message: string } {
  const { valid, message } = validateSubdomain(value);
  if (!valid) return { available: false, message };
  if (!isSlugAvailable(value, clients, excludeId))
    return { available: false, message: "Este subdominio ya está en uso." };
  return { available: true, message: "Disponible (validación local — confirmar con backend en producción)." };
}

export interface TransferClassification {
  type: "opening" | "monthly" | "unidentified";
  sellerId?: string;
  sellerNumber?: string;
  sellerName?: string;
  clientId?: string;
  clientNumber?: string;
  clientName?: string;
}

export interface ReferenceValidation {
  valid: boolean;
  format: "seller" | "client" | "unknown";
  hint: string;
}

export const TRANSFER_REFERENCE_RULES = {
  sellerPrefix: "VEN-",
  clientPrefix: "TA2-",
  sellerExample: "VEN-0001-5678",
  clientExample: "TA2-0028",
  hints: {
    opening:       "Apertura: referencia = número de vendedor + últimos 4 dígitos del teléfono del vendedor (ej. VEN-0001-5678)",
    monthly:       "Mensualidad: referencia = número de cliente (ej. TA2-0001)",
    unidentified:  "Sin identificar: la referencia no coincide con vendedor ni cliente registrado",
  },
} as const;

/** Generate the payment reference a seller should use for opening transfers. */
export function generateSellerPaymentReference(rep: SalesRep): string {
  const last4 = rep.phone ? phoneLastDigits(rep.phone, 4) : "0000";
  return `${rep.sellerNumber}-${last4 || "0000"}`;
}

export function classifyTransferReference(
  reference: string,
  salesReps: SalesRep[],
  clients: AdminClient[],
): TransferClassification {
  const ref = reference.trim().toUpperCase();
  if (!ref) return { type: "unidentified" };

  // New format: VEN-XXXX-YYYY (sellerNumber + last 4 phone digits)
  // Also accept legacy format VEN-XXXX for backward compatibility
  const venMatch = ref.match(/^(VEN-\d+)(?:-(\d{4}))?$/);
  if (venMatch) {
    const sellerNum = venMatch[1];
    const last4Ref  = venMatch[2] ?? null;
    const rep = salesReps.find((r) => r.sellerNumber.toUpperCase() === sellerNum);
    if (rep) {
      if (last4Ref !== null && rep.phone) {
        const repLast4 = phoneLastDigits(rep.phone, 4);
        if (repLast4 !== last4Ref) return { type: "unidentified" };
      }
      return { type: "opening", sellerId: rep.id, sellerNumber: rep.sellerNumber, sellerName: rep.name };
    }
  }

  const client = clients.find((c) => c.clientNumber.toUpperCase() === ref);
  if (client) {
    return {
      type: "monthly",
      clientId: client.id,
      clientNumber: client.clientNumber,
      clientName: client.business.name,
    };
  }

  return { type: "unidentified" };
}

export function validateTransferReference(reference: string): ReferenceValidation {
  const ref = reference.trim().toUpperCase();
  if (!ref) return { valid: false, format: "unknown", hint: "La referencia es obligatoria." };

  if (ref.startsWith("VEN-")) {
    return { valid: true, format: "seller", hint: "Formato de apertura detectado (número de vendedor)." };
  }
  if (ref.startsWith("TA2-") || ref.startsWith("ESP-")) {
    return { valid: true, format: "client", hint: "Formato de mensualidad detectado (número de cliente)." };
  }
  return {
    valid: true,
    format: "unknown",
    hint: "Referencia libre — se clasificará manualmente.",
  };
}

/** @deprecated Use generateSuggestedSubdomain instead */
export function generateSubdomain(businessName: string): string {
  return normalizeSubdomain(businessName);
}

export function isSlugReserved(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}

export function isSlugAvailable(
  slug: string,
  clients: AdminClient[],
  excludeId?: string,
): boolean {
  if (!slug || isSlugReserved(slug)) return false;
  return !clients.some((c) => c.slug === slug && c.id !== excludeId);
}
