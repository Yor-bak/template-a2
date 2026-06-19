// Stub de validadores. Expandir según se necesiten.
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isPhone(value: string): boolean {
  return /^\+?[\d\s\-().]{7,20}$/.test(value);
}

export function isRequired(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined;
}
