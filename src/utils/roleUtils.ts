export type UserRole = "owner" | "dentist" | "receptionist" | "admin";

export const ROLE_LABELS: Record<UserRole, string> = {
  owner:        "Propietario",
  dentist:      "Dentista",
  receptionist: "Recepcionista",
  admin:        "Administrador del sistema",
};

export function canAccessClinicalHistory(role: UserRole | string): boolean {
  return ["owner", "dentist", "admin"].includes(role);
}

export function canManageServices(role: UserRole | string): boolean {
  return ["owner", "admin", "dentist"].includes(role);
}

export function canViewIncome(role: UserRole | string): boolean {
  return ["owner", "admin"].includes(role);
}

export function canManageSettings(role: UserRole | string): boolean {
  return ["owner", "admin"].includes(role);
}

export function canManagePatients(role: UserRole | string): boolean {
  return ["owner", "dentist", "admin", "receptionist"].includes(role);
}
