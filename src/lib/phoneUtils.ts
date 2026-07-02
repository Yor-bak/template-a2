// Centralized phone normalization — single source of truth.
// Never duplicate this logic in components.

/**
 * Normalize a phone number to digits only.
 * If the stripped number has 10 digits (Mexico without country code), prepends 52.
 * Returns empty string if input is blank.
 *
 * ⚠️ Frontend-only validation — uniqueness must be enforced server-side in production.
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.length === 10) return "52" + digits;
  if (digits.length === 12 && digits.startsWith("52")) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  return digits;
}

/** Display-friendly format: +52 55 1234 5678 */
export function formatPhoneDisplay(phone: string): string {
  const norm = normalizePhoneNumber(phone);
  if (norm.startsWith("52") && norm.length === 12) {
    return `+52 ${norm.slice(2, 4)} ${norm.slice(4, 8)} ${norm.slice(8, 12)}`;
  }
  return phone;
}

/** Returns true if both phones normalize to the same number */
export function phonesMatch(a: string, b: string): boolean {
  return normalizePhoneNumber(a) === normalizePhoneNumber(b);
}

/** Basic validation — must produce at least 10 digits after normalization */
export function validatePhoneNumber(phone: string): { valid: boolean; message: string } {
  const norm = normalizePhoneNumber(phone);
  if (!norm || norm.length < 10) {
    return { valid: false, message: "El número debe tener al menos 10 dígitos." };
  }
  return { valid: true, message: "" };
}

/** Last N digits of normalized phone (used for subdomain suffix) */
export function phoneLastDigits(phone: string, n = 4): string {
  const norm = normalizePhoneNumber(phone);
  return norm.slice(-n) || "0000";
}
