/**
 * clientAuth.ts — Mock client authentication service.
 *
 * ⚠️ LIMITATION: This is a frontend-only mock. Credentials are stored in
 * localStorage with basic obfuscation (NOT cryptographic hashing).
 * Do NOT use this as real security. Replace all functions here with API calls
 * when a backend with proper password hashing (bcrypt/argon2) is available.
 *
 * Architecture is designed for easy replacement: all credential operations
 * go through this module — no scattered auth logic in components.
 */

const AUTH_STORE_KEY = "j2ec-client-auth-v1";

/** Default temporary password assigned during activation. Centralized here — do NOT hardcode elsewhere. */
export const DEFAULT_TEMP_PASSWORD = "12345678";

/**
 * Single source of truth for the specialist demo account shown on the login
 * screen. DEMO_CREDS below is derived from this — do NOT hardcode these
 * values anywhere else (e.g. in the login UI).
 */
export const SPECIALIST_DEMO_ACCOUNT = {
  clientId: "demo-001",
  phone: "5512345678",
  password: "demo123",
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface StoredCredential {
  clientId: string;
  clientNumber: string;
  accessPhone: string;   // normalized digits only
  pw: string;            // obfuscated (btoa), NOT cryptographically secure
  mustChangePassword: boolean;
  lastAccessAt?: string;
  businessName: string;
  ownerName: string;
  plan: string;
  slug: string;
}

interface CredentialStore {
  v: 1;
  creds: StoredCredential[];
}

export interface ClientSession {
  clientId: string;
  clientNumber: string;
  accessPhone: string;
  mustChangePassword: boolean;
  businessName: string;
  ownerName: string;
  plan: string;
  slug: string;
  lastAccessAt?: string;
}

// ── Obfuscation (not security) ────────────────────────────────────────────────

function obfuscate(pw: string): string {
  try { return btoa(encodeURIComponent(pw)); } catch { return pw; }
}
function deobfuscate(s: string): string {
  try { return decodeURIComponent(atob(s)); } catch { return s; }
}

// ── Demo seed (always present) ────────────────────────────────────────────────

const DEMO_CREDS: StoredCredential[] = [
  {
    clientId: SPECIALIST_DEMO_ACCOUNT.clientId,
    clientNumber: "TA2-0001",
    accessPhone: SPECIALIST_DEMO_ACCOUNT.phone,
    pw: obfuscate(SPECIALIST_DEMO_ACCOUNT.password),
    mustChangePassword: false,
    businessName: "Consultorio Demo",
    ownerName: "Especialista Demo",
    plan: "standard",
    slug: "dentista-demo-demo-5678",
  },
];

// ── Storage helpers ───────────────────────────────────────────────────────────

function loadStore(): CredentialStore {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(AUTH_STORE_KEY) : null;
    if (!raw) return { v: 1, creds: [...DEMO_CREDS] };
    const parsed = JSON.parse(raw) as Partial<CredentialStore>;
    const creds = parsed.creds ?? [];
    for (const demo of DEMO_CREDS) {
      const existing = creds.find((c) => c.clientId === demo.clientId);
      if (!existing) {
        creds.push(demo);
      } else {
        // Reconcile: keep the demo entry's credentials in sync with the
        // canonical values so a stale localStorage entry (e.g. from an
        // earlier build) never drifts from what the login screen displays.
        // Real, admin-activated credentials are never touched here.
        existing.clientNumber = demo.clientNumber;
        existing.accessPhone = demo.accessPhone;
        existing.pw = demo.pw;
        existing.mustChangePassword = demo.mustChangePassword;
        existing.businessName = demo.businessName;
        existing.ownerName = demo.ownerName;
        existing.plan = demo.plan;
        existing.slug = demo.slug;
      }
    }
    return { v: 1, creds };
  } catch {
    return { v: 1, creds: [...DEMO_CREDS] };
  }
}

function saveStore(store: CredentialStore): void {
  try {
    if (typeof window !== "undefined") localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(store));
  } catch {}
}

function phoneMatches(stored: string, input: string): boolean {
  const clean = input.replace(/[^\d]/g, "");
  return stored === clean || stored.endsWith(clean.slice(-10));
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Log in a client using phone + password. Returns session or null. */
export function loginClient(phone: string, password: string): ClientSession | null {
  const store = loadStore();
  const cred = store.creds.find(
    (c) => phoneMatches(c.accessPhone, phone) && deobfuscate(c.pw) === password,
  );
  if (!cred) return null;
  cred.lastAccessAt = new Date().toISOString();
  saveStore(store);
  return credToSession(cred);
}

/** Register or update credentials when a client is activated. */
export function registerClientCredential(opts: {
  clientId: string;
  clientNumber: string;
  accessPhone: string;
  initialPassword: string;
  mustChangePassword?: boolean;
  businessName: string;
  ownerName: string;
  plan: string;
  slug: string;
}): void {
  const store = loadStore();
  store.creds = store.creds.filter(
    (c) => c.clientId !== opts.clientId && c.clientNumber !== opts.clientNumber,
  );
  store.creds.push({
    clientId: opts.clientId,
    clientNumber: opts.clientNumber,
    accessPhone: opts.accessPhone.replace(/[^\d]/g, ""),
    pw: obfuscate(opts.initialPassword),
    mustChangePassword: opts.mustChangePassword ?? true,
    businessName: opts.businessName,
    ownerName: opts.ownerName,
    plan: opts.plan,
    slug: opts.slug,
  });
  saveStore(store);
}

/** Change a client's own password. Requires current password. */
export function changeClientPassword(
  phone: string,
  currentPassword: string,
  newPassword: string,
): { success: boolean; message: string } {
  const store = loadStore();
  const cred = store.creds.find(
    (c) => phoneMatches(c.accessPhone, phone) && deobfuscate(c.pw) === currentPassword,
  );
  if (!cred) return { success: false, message: "La contraseña actual es incorrecta." };
  if (currentPassword === newPassword)
    return { success: false, message: "La nueva contraseña no puede ser igual a la actual." };
  cred.pw = obfuscate(newPassword);
  cred.mustChangePassword = false;
  saveStore(store);
  return { success: true, message: "Contraseña actualizada correctamente." };
}

/**
 * Admin resets a client password. Never sees the current password.
 * @param actorName  Display name of the admin performing the reset (for audit).
 */
export function adminResetClientPassword(
  clientId: string,
  newPassword: string,
  actorName: string,
): { success: boolean } {
  const store = loadStore();
  const cred = store.creds.find(
    (c) => c.clientId === clientId || c.clientNumber === clientId,
  );
  if (!cred) return { success: false };
  cred.pw = obfuscate(newPassword);
  cred.mustChangePassword = true;
  saveStore(store);
  // actorName would be sent to audit API in production
  void actorName;
  return { success: true };
}

/** Generate a random temporary password */
export function generateTempPassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/** Mark that a password change is no longer required */
export function clearMustChangePassword(clientId: string): void {
  const store = loadStore();
  const cred = store.creds.find((c) => c.clientId === clientId);
  if (cred) {
    cred.mustChangePassword = false;
    saveStore(store);
  }
}

/** Get credential info (without password) for display in Admin panel */
export function getClientCredentialInfo(clientId: string): {
  hasCredential: boolean;
  accessPhone?: string;
  mustChangePassword?: boolean;
  lastAccessAt?: string;
} {
  const store = loadStore();
  const cred = store.creds.find(
    (c) => c.clientId === clientId || c.clientNumber === clientId,
  );
  if (!cred) return { hasCredential: false };
  return {
    hasCredential: true,
    accessPhone: cred.accessPhone,
    mustChangePassword: cred.mustChangePassword,
    lastAccessAt: cred.lastAccessAt,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function credToSession(c: StoredCredential): ClientSession {
  return {
    clientId: c.clientId,
    clientNumber: c.clientNumber,
    accessPhone: c.accessPhone,
    mustChangePassword: c.mustChangePassword,
    businessName: c.businessName,
    ownerName: c.ownerName,
    plan: c.plan,
    slug: c.slug,
    lastAccessAt: c.lastAccessAt,
  };
}
