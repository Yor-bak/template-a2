/**
 * adminPermissions.ts
 *
 * Central source of truth for admin roles and permissions.
 * All role/permission checks must go through hasPermission() —
 * never scatter `if (role === "xxx")` across components.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Administrative roles within the J2EC back-office.
 * "support" and "readonly" are kept in the type for backwards compatibility
 * with users created before the role simplification, but are no longer
 * selectable in the UI. Users with those roles are normalised to "accountant"
 * at login time.
 */
export type AdminRole = "superadmin" | "admin" | "accountant" | "support" | "readonly";

/** Roles shown in the UI (select inputs, labels). */
export const ADMIN_ROLE_LABELS: Record<string, string> = {
  superadmin: "Superadmin",
  admin:      "Admin",
  accountant: "Contador",
  // support and readonly are intentionally omitted — users with those roles
  // are normalised to "accountant" on login.
};

/** Roles available for selection when creating / editing admin users. */
export const SELECTABLE_ROLES: Extract<AdminRole, "admin" | "accountant">[] = ["admin", "accountant"];

/**
 * Granular permissions. Keep names in `resource.action` form.
 * Add new ones here; grant them in ROLE_PERMISSIONS below.
 */
export type Permission =
  | "clients.view"
  | "clients.create"
  | "clients.edit"
  | "clients.delete"
  | "clients.activate"
  | "clients.block"
  | "clients.archive"
  | "clients.resetPassword"
  | "clients.editSubdomain"
  | "transfers.view"
  | "transfers.create"
  | "transfers.classify"
  | "transfers.confirm"
  | "transfers.reject"
  | "finance.view"
  | "finance.edit"
  | "finance.income.create"
  | "finance.income.edit"
  | "finance.expenses.create"
  | "finance.expenses.edit"
  | "finance.commissions.view"
  | "finance.commissions.pay"
  | "finance.bankSettings.edit"
  | "commissions.view"
  | "commissions.pay"
  | "vendors.view"
  | "vendors.edit"
  | "preclients.view"
  | "preclients.create"
  | "preclients.edit"
  | "preclients.cancel"
  | "preclients.convert"
  | "settings.view"
  | "settings.edit"
  | "settings.bank.edit"
  | "roles.manage"
  | "audit.view"
  // Admin users management
  | "adminUsers.view"
  | "adminUsers.create"
  | "adminUsers.edit"
  | "adminUsers.deactivate"
  | "adminUsers.permissions.manage"
  | "adminUsers.password.reset"
  // Access & credentials
  | "client.access.view"
  | "client.access.edit"
  | "client.password.reset"
  | "client.sessions.revoke"
  | "client.subdomain.edit";

// ── Permission matrix ─────────────────────────────────────────────────────────

// All permissions list for matrix UI
export const ALL_PERMISSIONS: Permission[] = [
  "clients.view", "clients.create", "clients.edit", "clients.delete",
  "clients.activate", "clients.block", "clients.archive",
  "clients.resetPassword", "clients.editSubdomain",
  "transfers.view", "transfers.create", "transfers.classify",
  "transfers.confirm", "transfers.reject",
  "finance.view", "finance.edit",
  "finance.income.create", "finance.income.edit",
  "finance.expenses.create", "finance.expenses.edit",
  "finance.commissions.view", "finance.commissions.pay", "finance.bankSettings.edit",
  "commissions.view", "commissions.pay",
  "vendors.view", "vendors.edit",
  "preclients.view", "preclients.create", "preclients.edit",
  "preclients.cancel", "preclients.convert",
  "settings.view", "settings.edit", "settings.bank.edit",
  "roles.manage", "audit.view",
  "adminUsers.view", "adminUsers.create", "adminUsers.edit",
  "adminUsers.deactivate", "adminUsers.permissions.manage", "adminUsers.password.reset",
  "client.access.view", "client.access.edit",
  "client.password.reset", "client.sessions.revoke", "client.subdomain.edit",
];

// Module grouping for matrix UI
export const PERMISSION_MODULES: { label: string; permissions: Permission[] }[] = [
  { label: "Clientes",          permissions: ["clients.view","clients.create","clients.edit","clients.delete","clients.activate","clients.block","clients.archive","clients.resetPassword","clients.editSubdomain"] },
  { label: "Preclientes",       permissions: ["preclients.view","preclients.create","preclients.edit","preclients.cancel","preclients.convert"] },
  { label: "Transferencias",    permissions: ["transfers.view","transfers.create","transfers.classify","transfers.confirm","transfers.reject"] },
  { label: "Finanzas",          permissions: ["finance.view","finance.edit","finance.income.create","finance.income.edit","finance.expenses.create","finance.expenses.edit","finance.commissions.view","finance.commissions.pay","finance.bankSettings.edit"] },
  { label: "Vendedores",        permissions: ["vendors.view","vendors.edit"] },
  { label: "Usuarios admin",    permissions: ["adminUsers.view","adminUsers.create","adminUsers.edit","adminUsers.deactivate","adminUsers.permissions.manage","adminUsers.password.reset"] },
  { label: "Acceso cliente",    permissions: ["client.access.view","client.access.edit","client.password.reset","client.sessions.revoke","client.subdomain.edit"] },
  { label: "Config/Auditoría",  permissions: ["settings.view","settings.edit","settings.bank.edit","roles.manage","audit.view"] },
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "clients.view": "Ver", "clients.create": "Crear", "clients.edit": "Editar",
  "clients.delete": "Eliminar", "clients.activate": "Activar", "clients.block": "Bloquear",
  "clients.archive": "Archivar", "clients.resetPassword": "Resetear contraseña",
  "clients.editSubdomain": "Editar subdominio",
  "transfers.view": "Ver", "transfers.create": "Crear", "transfers.classify": "Clasificar",
  "transfers.confirm": "Confirmar", "transfers.reject": "Rechazar",
  "finance.view": "Ver", "finance.edit": "Editar",
  "finance.income.create": "Crear ingresos", "finance.income.edit": "Editar ingresos",
  "finance.expenses.create": "Crear gastos", "finance.expenses.edit": "Editar gastos",
  "finance.commissions.view": "Ver comisiones", "finance.commissions.pay": "Pagar comisiones",
  "finance.bankSettings.edit": "Config. bancaria",
  "commissions.view": "Ver comisiones", "commissions.pay": "Pagar comisiones",
  "vendors.view": "Ver", "vendors.edit": "Editar",
  "preclients.view": "Ver", "preclients.create": "Crear", "preclients.edit": "Editar",
  "preclients.cancel": "Cancelar", "preclients.convert": "Convertir",
  "settings.view": "Ver", "settings.edit": "Editar", "settings.bank.edit": "Config. bancaria",
  "roles.manage": "Gestionar roles", "audit.view": "Ver auditoría",
  "adminUsers.view": "Ver", "adminUsers.create": "Crear", "adminUsers.edit": "Editar",
  "adminUsers.deactivate": "Desactivar", "adminUsers.permissions.manage": "Gestionar permisos",
  "adminUsers.password.reset": "Resetear contraseña",
  "client.access.view": "Ver acceso", "client.access.edit": "Editar acceso",
  "client.password.reset": "Resetear contraseña", "client.sessions.revoke": "Revocar sesiones",
  "client.subdomain.edit": "Editar subdominio",
};

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  superadmin: ALL_PERMISSIONS, // superadmin always has everything
  admin: [
    "clients.view", "clients.create", "clients.edit", "clients.activate",
    "transfers.view", "transfers.create", "transfers.classify", "transfers.confirm",
    "finance.view", "finance.income.create", "finance.income.edit",
    "finance.expenses.create", "finance.expenses.edit",
    "finance.commissions.view", "finance.commissions.pay",
    "commissions.view", "commissions.pay",
    "vendors.view", "vendors.edit",
    "preclients.view", "preclients.create", "preclients.edit", "preclients.convert",
    // "settings.view" and "adminUsers.*" intentionally excluded:
    // Admin cannot access Configuración nor Usuarios administrativos.
    "audit.view",
    "client.access.view", "client.access.edit", "client.subdomain.edit",
  ],
  accountant: [
    "clients.view",
    "transfers.view",
    "finance.view", "finance.edit",
    "finance.commissions.view",
    "commissions.view",
    "vendors.view",
    "preclients.view",
    "settings.view",
    "audit.view",
    "client.access.view",
  ],
  support: [
    "clients.view",
    "transfers.view",
    "preclients.view",
    "settings.view",
    "client.access.view",
  ],
  readonly: [
    "clients.view",
    "transfers.view",
    "finance.view",
    "commissions.view",
    "vendors.view",
    "preclients.view",
    "settings.view",
    "audit.view",
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Single gate for all permission checks. Supports per-user overrides. */
export function hasPermission(
  role: AdminRole,
  permission: Permission,
  overrides?: { granted?: Permission[]; revoked?: Permission[] },
): boolean {
  // Superadmin always has all permissions — no overrides can remove them
  if (role === "superadmin") return true;
  // Fallback for deprecated roles (support/readonly) not in active matrix
  const base = (ROLE_PERMISSIONS[role] ?? []).includes(permission);
  if (!overrides) return base;
  if (overrides.revoked?.includes(permission)) return false;
  if (overrides.granted?.includes(permission)) return true;
  return base;
}

/** Returns effective permission set for a user. */
export function effectivePermissions(
  role: AdminRole,
  overrides?: { granted?: Permission[]; revoked?: Permission[] },
): Permission[] {
  if (role === "superadmin") return ALL_PERMISSIONS;
  const base = new Set(ROLE_PERMISSIONS[role]);
  overrides?.granted?.forEach((p) => base.add(p));
  overrides?.revoked?.forEach((p) => base.delete(p));
  return Array.from(base);
}

/** Returns permissions that the role grants by default. */
export function roleBasePermissions(role: AdminRole): Permission[] {
  return role === "superadmin" ? ALL_PERMISSIONS : (ROLE_PERMISSIONS[role] ?? []);
}

/**
 * Resolve which product vertical a businessType belongs to.
 * Centralises all vertical logic — never check raw businessType strings in components.
 */
export function getBusinessVertical(
  businessType?: string,
): "especialistas" | "gimnasios" | "otro" {
  if (!businessType) return "otro";
  if (businessType === "gym") return "gimnasios";
  const specialistTypes = new Set([
    "dentist", "doctor", "physiotherapist",
    "nutritionist", "psychologist", "veterinarian",
  ]);
  if (specialistTypes.has(businessType)) return "especialistas";
  return "otro";
}
