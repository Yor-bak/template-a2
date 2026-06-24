export interface GlobalPlatformSettings {
  customerSupport: {
    phone: string;
  };
}

const STORAGE_KEY = "template-a2-global-settings";

const DEFAULT_SETTINGS: GlobalPlatformSettings = {
  customerSupport: { phone: "" },
};

export function loadGlobalSettings(): GlobalPlatformSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveGlobalSettings(settings: GlobalPlatformSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}
