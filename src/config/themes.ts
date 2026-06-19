export type ThemePaletteKey =
  | "dental_premium"
  | "beige_boutique"
  | "soft_rose"
  | "luxury_navy"
  | "fresh_sky";

export interface PaletteColors {
  primary: string;
  primaryDark: string;
  accent: string;
  accentSoft: string;
  background: string;
  card: string;
  border: string;
  text: string;
  mutedText: string;
}

export interface ThemePalette {
  key: ThemePaletteKey;
  name: string;
  description: string;
  colors: PaletteColors;
}

export const THEME_PALETTES: Record<ThemePaletteKey, ThemePalette> = {
  dental_premium: {
    key: "dental_premium",
    name: "Dental Premium",
    description: "Moderna, limpia y confiable. Ideal para clínicas dentales profesionales.",
    colors: {
      primary: "#173B45",
      primaryDark: "#0E2F3A",
      accent: "#70D6C7",
      accentSoft: "#BFEAF5",
      background: "#FAFAF7",
      card: "#FFFFFF",
      border: "#E8ECEF",
      text: "#102A33",
      mutedText: "#5F737C",
    },
  },
  beige_boutique: {
    key: "beige_boutique",
    name: "Beige Boutique",
    description: "Cálida, elegante y cercana. Ideal para consultorios con estilo boutique.",
    colors: {
      primary: "#7A5C45",
      primaryDark: "#4E3729",
      accent: "#D8B892",
      accentSoft: "#F1E2CF",
      background: "#FBF7F0",
      card: "#FFFFFF",
      border: "#E7D8C7",
      text: "#2F2721",
      mutedText: "#7B6A5D",
    },
  },
  soft_rose: {
    key: "soft_rose",
    name: "Soft Rose",
    description: "Suave, estética y delicada. Ideal para odontología estética y clínicas wellness.",
    colors: {
      primary: "#8A4F5E",
      primaryDark: "#5F3440",
      accent: "#E8A7B5",
      accentSoft: "#F8DDE4",
      background: "#FFF8F8",
      card: "#FFFFFF",
      border: "#EED3DA",
      text: "#34232A",
      mutedText: "#7C626A",
    },
  },
  luxury_navy: {
    key: "luxury_navy",
    name: "Luxury Navy",
    description: "Premium, sobria y elegante. Ideal para clínicas de alto nivel y tratamientos estéticos.",
    colors: {
      primary: "#13263A",
      primaryDark: "#0B1724",
      accent: "#C8A96A",
      accentSoft: "#EFE4C8",
      background: "#F7F8FA",
      card: "#FFFFFF",
      border: "#DDE2E8",
      text: "#111827",
      mutedText: "#64748B",
    },
  },
  fresh_sky: {
    key: "fresh_sky",
    name: "Fresh Sky",
    description: "Fresca, limpia y familiar. Ideal para consultorios accesibles, modernos y amigables.",
    colors: {
      primary: "#256D85",
      primaryDark: "#174A5B",
      accent: "#5FD3C6",
      accentSoft: "#D6F7F4",
      background: "#F5FBFC",
      card: "#FFFFFF",
      border: "#D9EEF2",
      text: "#12313A",
      mutedText: "#5D7880",
    },
  },
};

export const PALETTE_LIST: ThemePalette[] = Object.values(THEME_PALETTES);

export function getThemePalette(key: ThemePaletteKey): ThemePalette {
  return THEME_PALETTES[key] ?? THEME_PALETTES.dental_premium;
}

export function applyThemePalette(key: ThemePaletteKey): void {
  if (typeof document === "undefined") return;
  const { colors } = getThemePalette(key);
  const root = document.documentElement;
  root.style.setProperty("--color-primary", colors.primary);
  root.style.setProperty("--color-primary-dark", colors.primaryDark);
  root.style.setProperty("--color-accent", colors.accent);
  root.style.setProperty("--color-accent-soft", colors.accentSoft);
  root.style.setProperty("--color-background", colors.background);
  root.style.setProperty("--color-card", colors.card);
  root.style.setProperty("--color-border", colors.border);
  root.style.setProperty("--color-text", colors.text);
  root.style.setProperty("--color-muted-text", colors.mutedText);
}
