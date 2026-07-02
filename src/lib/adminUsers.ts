"use client";
/**
 * adminUsers.ts
 *
 * Mock admin-user store backed by localStorage.
 * ⚠️ Passwords stored with btoa obfuscation — NOT production-secure.
 *    Replace with server-side bcrypt/argon2 before going live.
 */
import type { AdminRole, Permission } from "@/lib/adminPermissions";
import { roleBasePermissions } from "@/lib/adminPermissions";
import { normalizePhoneNumber } from "@/lib/phoneUtils";

export type AdminUserStatus = "active" | "inactive" | "blocked" | "pending_first_access";

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;         // normalized digits, used for login
  email?: string;
  role: AdminRole;
  status: AdminUserStatus;
  mustChangePassword: boolean;
  permissions?: {
    granted?: Permission[];
    revoked?: Permission[];
  };
  createdAt: string;
  updatedAt: string;
  lastAccessAt?: string;
  createdBy?: string;   // displayName of creator
}

// ── Internal stored record (with obfuscated password) ────────────────────────

interface AdminUserRecord extends AdminUser {
  _pwd: string; // btoa(encodeURIComponent(password))
}

const STORAGE_KEY = "j2ec-admin-users-v1";
const SUPERADMIN_ID = "superadmin-root";
// Bootstrap accounts for the two operational roles. Hidden from the UI (no
// credentials shown anywhere) but required so Admin/Contador can log in
// before there is a real backend to create users through.
const ADMIN_BOOTSTRAP_ID = "admin-bootstrap";
const ACCOUNTANT_BOOTSTRAP_ID = "accountant-bootstrap";
// Bump this when the seed changes so old demo users are purged from localStorage.
const SEED_VERSION_KEY = "j2ec-admin-seed-v";
const SEED_VERSION = "3";

// ── Seed data ─────────────────────────────────────────────────────────────────

function buildSeed(): AdminUserRecord[] {
  return [
    {
      id: SUPERADMIN_ID,
      firstName: "Super",
      lastName: "Admin",
      phone: normalizePhoneNumber("5200000001"),
      email: "super@j2ec.com",
      role: "superadmin",
      status: "active",
      mustChangePassword: false,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      createdBy: "Sistema",
      _pwd: btoa(encodeURIComponent("super123")),
    },
    {
      id: ADMIN_BOOTSTRAP_ID,
      firstName: "Admin",
      lastName: "J2EC",
      phone: normalizePhoneNumber("5200000002"),
      email: "admin@j2ec.com",
      role: "admin",
      status: "active",
      mustChangePassword: false,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      createdBy: "Sistema",
      _pwd: btoa(encodeURIComponent("admin123")),
    },
    {
      id: ACCOUNTANT_BOOTSTRAP_ID,
      firstName: "Contador",
      lastName: "J2EC",
      phone: normalizePhoneNumber("5200000003"),
      email: "contador@j2ec.com",
      role: "accountant",
      status: "active",
      mustChangePassword: false,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      createdBy: "Sistema",
      _pwd: btoa(encodeURIComponent("conta123")),
    },
  ];
}

// ── Storage helpers ───────────────────────────────────────────────────────────

function loadRecords(): AdminUserRecord[] {
  try {
    // Seed-version migration: purge demo users created before this seed version
    const storedSeedVersion = localStorage.getItem(SEED_VERSION_KEY);
    if (storedSeedVersion !== SEED_VERSION) {
      const existing = (() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as AdminUserRecord[]; }
        catch { return [] as AdminUserRecord[]; }
      })();
      // Keep only the bootstrap accounts (superadmin, admin, accountant); discard
      // all other legacy/custom seed users. Bootstrap accounts keep any local
      // edits (e.g. password resets) instead of being reset to seed defaults.
      const bootstrapIds = new Set([SUPERADMIN_ID, ADMIN_BOOTSTRAP_ID, ACCOUNTANT_BOOTSTRAP_ID]);
      const kept = existing.filter((r) => bootstrapIds.has(r.id));
      const seed = buildSeed();
      const merged = seed.map((s) => kept.find((k) => k.id === s.id) ?? s);
      saveRecords(merged);
      localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
      return merged;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeed();
    const parsed = JSON.parse(raw) as AdminUserRecord[];
    // Migrate un-normalized phones (seed data written before normalization was applied)
    let dirty = false;
    for (const r of parsed) {
      const norm = normalizePhoneNumber(r.phone);
      if (norm && norm !== r.phone) { r.phone = norm; dirty = true; }
    }
    if (dirty) saveRecords(parsed);
    // Ensure superadmin always exists
    if (!parsed.find((u) => u.id === SUPERADMIN_ID)) {
      const seed = buildSeed();
      const merged = [...parsed, seed[0]];
      saveRecords(merged);
      return merged;
    }
    return parsed;
  } catch {
    return buildSeed();
  }
}

function saveRecords(records: AdminUserRecord[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch { /* ignore */ }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getAdminUsers(): AdminUser[] {
  return loadRecords().map(({ _pwd: _, ...u }) => u);
}

export function loginAdminUser(
  phone: string,
  password: string,
): { user: AdminUser; isSuperadmin: boolean } | null {
  const normalized = normalizePhoneNumber(phone);
  const records = loadRecords();
  const record = records.find(
    (r) => r.phone === normalized && r._pwd === btoa(encodeURIComponent(password)),
  );
  if (!record) return null;
  if (record.status === "inactive" || record.status === "blocked") return null;
  // Normalise deprecated roles (support/readonly) to accountant (most restrictive active role).
  // This handles users created before the role simplification without granting extra access.
  if (record.role === "support" || record.role === "readonly") {
    record.role = "accountant";
    saveRecords(records);
  }
  // Update lastAccessAt
  record.lastAccessAt = new Date().toISOString();
  saveRecords(records);
  const { _pwd: _, ...user } = record;
  return { user, isSuperadmin: record.role === "superadmin" };
}

export function createAdminUser(
  input: {
    firstName: string; lastName: string; phone: string; email?: string;
    role: AdminRole; initialPassword: string; mustChangePassword?: boolean;
  },
  createdBy: string,
): { success: boolean; message: string; user?: AdminUser } {
  const records = loadRecords();
  const normalized = normalizePhoneNumber(input.phone);
  if (!normalized) return { success: false, message: "Teléfono inválido." };
  if (records.find((r) => r.phone === normalized)) {
    return { success: false, message: "Este número de teléfono ya está registrado." };
  }
  // Prevent creating another superadmin
  if (input.role === "superadmin") {
    return { success: false, message: "No es posible crear otro Superadmin desde la interfaz." };
  }
  const now = new Date().toISOString();
  const newRecord: AdminUserRecord = {
    id: `admin-${Date.now()}`,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: normalized,
    email: input.email,
    role: input.role,
    status: input.mustChangePassword ? "pending_first_access" : "active",
    mustChangePassword: input.mustChangePassword ?? false,
    createdAt: now,
    updatedAt: now,
    createdBy,
    _pwd: btoa(encodeURIComponent(input.initialPassword)),
  };
  records.push(newRecord);
  saveRecords(records);
  const { _pwd: _, ...user } = newRecord;
  return { success: true, message: "Usuario creado.", user };
}

export function updateAdminUser(
  id: string,
  changes: Partial<Pick<AdminUser, "firstName" | "lastName" | "phone" | "email" | "role" | "status" | "mustChangePassword" | "permissions">>,
  actorRole: AdminRole,
): { success: boolean; message: string } {
  if (id === SUPERADMIN_ID) {
    return { success: false, message: "El Superadmin no puede ser modificado." };
  }
  // Only superadmin can manage other admins' roles
  if (changes.role === "superadmin") {
    return { success: false, message: "No se puede asignar el rol Superadmin." };
  }
  if (actorRole !== "superadmin" && changes.permissions) {
    return { success: false, message: "Solo el Superadmin puede modificar permisos." };
  }
  const records = loadRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return { success: false, message: "Usuario no encontrado." };
  if (changes.phone) {
    const normalized = normalizePhoneNumber(changes.phone);
    if (records.find((r) => r.phone === normalized && r.id !== id)) {
      return { success: false, message: "Teléfono ya en uso por otro usuario." };
    }
    changes = { ...changes, phone: normalized };
  }
  records[idx] = { ...records[idx], ...changes, updatedAt: new Date().toISOString() };
  saveRecords(records);
  return { success: true, message: "Usuario actualizado." };
}

export function resetAdminPassword(
  id: string,
  newPassword: string,
  actorRole: AdminRole,
): { success: boolean; message: string } {
  if (id === SUPERADMIN_ID && actorRole !== "superadmin") {
    return { success: false, message: "No puedes restablecer la contraseña del Superadmin." };
  }
  const records = loadRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return { success: false, message: "Usuario no encontrado." };
  records[idx]._pwd = btoa(encodeURIComponent(newPassword));
  records[idx].mustChangePassword = true;
  records[idx].status = "pending_first_access";
  records[idx].updatedAt = new Date().toISOString();
  saveRecords(records);
  return { success: true, message: "Contraseña restablecida." };
}

export function generateAdminTempPassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function getAdminUserById(id: string): AdminUser | null {
  const record = loadRecords().find((r) => r.id === id);
  if (!record) return null;
  const { _pwd: _, ...user } = record;
  return user;
}

export const SUPERADMIN_ID_CONST = SUPERADMIN_ID;

// Returns default permissions for a role (for the matrix UI)
export function defaultPermissionsForRole(role: AdminRole): Permission[] {
  return roleBasePermissions(role);
}
