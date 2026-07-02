import type { DashboardColorSet } from "@/types/profile";

export interface DashboardThemePreset {
  id: string;
  name: string;
  previewColors: [string, string, string]; // [primary, accent, bg]
  light: DashboardColorSet;
}

export interface DashboardDarkThemePreset {
  id: string;
  name: string;
  previewColors: [string, string, string]; // [surface, accent, bg]
  colors: DashboardColorSet;
}

export const DASHBOARD_THEME_PRESETS: DashboardThemePreset[] = [
  // ── 01 MARFIL — Teal institucional, neutros cálidos ───────────────────────
  {
    id: "marfil",
    name: "Marfil",
    previewColors: ["#173B45", "#3fb8a8", "#f7f6f1"],
    light: {
      background:       "#f7f6f1",
      surface:          "#fdfcf9",
      surfaceMuted:     "#efeee9",
      surfaceElevated:  "#ffffff",
      primary:          "#173B45",
      primaryForeground:"#ffffff",
      accent:           "#3fb8a8",
      text:             "#102A33",
      textMuted:        "#5a6e76",
      border:           "#dddbd4",
      success:          "#2e6e48",
      successForeground:"#d6f0e2",
      warning:          "#8a5e14",
      error:            "#a83030",
      ring:             "#3fb8a8",
    },
  },

  // ── 02 MARINO — Azul oceánico, autoridad clínica ──────────────────────────
  {
    id: "marino",
    name: "Marino",
    previewColors: ["#1e3a5f", "#3a7ec4", "#f2f5f8"],
    light: {
      background:       "#f2f5f8",
      surface:          "#fafcfd",
      surfaceMuted:     "#e6edf4",
      surfaceElevated:  "#ffffff",
      primary:          "#1e3a5f",
      primaryForeground:"#ffffff",
      accent:           "#3a7ec4",
      text:             "#0f2035",
      textMuted:        "#426080",
      border:           "#ccd8e8",
      success:          "#256042",
      successForeground:"#d0eedd",
      warning:          "#8a6010",
      error:            "#a03030",
      ring:             "#3a7ec4",
    },
  },

  // ── 03 VERDE — Bosque orgánico, bienestar ─────────────────────────────────
  {
    id: "verde",
    name: "Verde",
    previewColors: ["#1a5c3a", "#2ea86a", "#f1f6f2"],
    light: {
      background:       "#f1f6f2",
      surface:          "#fafcfa",
      surfaceMuted:     "#e2ede6",
      surfaceElevated:  "#ffffff",
      primary:          "#1a5c3a",
      primaryForeground:"#ffffff",
      accent:           "#2ea86a",
      text:             "#0d3020",
      textMuted:        "#3a5e48",
      border:           "#c4daca",
      success:          "#1a6030",
      successForeground:"#ccecd8",
      warning:          "#7a6010",
      error:            "#9a2828",
      ring:             "#2ea86a",
    },
  },

  // ── 04 ROSA — Empolvado sobrio, estética y belleza ────────────────────────
  {
    id: "rosa",
    name: "Rosa",
    previewColors: ["#7a3050", "#c86890", "#f8f2f4"],
    light: {
      background:       "#f8f2f4",
      surface:          "#fdf8fa",
      surfaceMuted:     "#efe0e8",
      surfaceElevated:  "#ffffff",
      primary:          "#7a3050",
      primaryForeground:"#ffffff",
      accent:           "#c86890",
      text:             "#3a1020",
      textMuted:        "#7a4860",
      border:           "#e4c8d8",
      success:          "#2e6040",
      successForeground:"#cce8d8",
      warning:          "#8a6010",
      error:            "#a02828",
      ring:             "#c86890",
    },
  },

  // ── 05 GRAFITO — Monocromático azulado, máxima sobriedad ─────────────────
  {
    id: "grafito",
    name: "Grafito",
    previewColors: ["#27272a", "#52525b", "#f3f4f5"],
    light: {
      background:       "#f3f4f5",
      surface:          "#fafafa",
      surfaceMuted:     "#e6e8ea",
      surfaceElevated:  "#ffffff",
      primary:          "#27272a",
      primaryForeground:"#ffffff",
      accent:           "#52525b",
      text:             "#18181b",
      textMuted:        "#52525b",
      border:           "#d2d4d8",
      success:          "#286040",
      successForeground:"#cceadb",
      warning:          "#8a6010",
      error:            "#9a2828",
      ring:             "#52525b",
    },
  },

  // ── 06 ARENA — Ocres cálidos, spa y wellness ──────────────────────────────
  {
    id: "arena",
    name: "Arena",
    previewColors: ["#6a4c2e", "#c49060", "#f6f3ee"],
    light: {
      background:       "#f6f3ee",
      surface:          "#fdfbf7",
      surfaceMuted:     "#ede8de",
      surfaceElevated:  "#ffffff",
      primary:          "#6a4c2e",
      primaryForeground:"#ffffff",
      accent:           "#c49060",
      text:             "#2e1e0e",
      textMuted:        "#7a5e3a",
      border:           "#dfd0b8",
      success:          "#2e6040",
      successForeground:"#cceadb",
      warning:          "#8a5e10",
      error:            "#9a2828",
      ring:             "#c49060",
    },
  },
];

export const DEFAULT_THEME_ID = "marfil";

export function getThemePreset(id: string): DashboardThemePreset {
  return DASHBOARD_THEME_PRESETS.find((t) => t.id === id) ?? DASHBOARD_THEME_PRESETS[0];
}

/*
 * ── Dark palettes ──────────────────────────────────────────────────────────
 * Source: J2EC Specialist & Worker Dark Mode Themes Handoff v1.0.0 (2026-07-01)
 * Canonical IDs and names below must match the handoff exactly — see
 * handoff/README.md and handoff/tokens/themes.css / themes.json.
 * These replace the previous per-preset "dark" variants above. Both the
 * Specialist Dashboard and Worker Panel consume this single registry.
 */
export const DASHBOARD_DARK_THEME_PRESETS: DashboardDarkThemePreset[] = [
  // ── 1. GRAPHITE AQUA — Near-black + restrained aqua accent ────────────────
  {
    id: "graphite-aqua",
    name: "Graphite Aqua",
    previewColors: ["#161B22", "#3DBCAA", "#0D1117"],
    colors: {
      background:        "#0D1117",
      surface:            "#161B22",
      surfaceMuted:       "#1A2030",
      surfaceElevated:    "#21262D",
      bgHover:            "#262C36",
      bgSelected:         "color-mix(in srgb, #3DBCAA 12%, transparent)",
      primary:            "#3DBCAA",
      primaryForeground:  "#0D1117",
      accent:             "#3DBCAA",
      accentHover:        "#33A896",
      accentSoft:         "color-mix(in srgb, #3DBCAA 12%, transparent)",
      accentForeground:   "#0D1117",
      text:               "#E6EDF3",
      textSecondary:      "#9DA9B8",
      textMuted:          "#7D8590",
      textDisabled:       "#484F58",
      border:             "#21262D",
      borderStrong:       "#30363D",
      divider:            "#1A1F26",
      success:            "#58B05C",
      successForeground:  "#0D1117",
      successSoft:        "color-mix(in srgb, #58B05C 12%, transparent)",
      warning:            "#F0B429",
      warningSoft:        "color-mix(in srgb, #F0B429 12%, transparent)",
      error:              "#E5534B",
      errorSoft:          "color-mix(in srgb, #E5534B 12%, transparent)",
      info:               "#4B9CD3",
      infoSoft:           "color-mix(in srgb, #4B9CD3 12%, transparent)",
      ring:               "#3DBCAA",
      overlay:            "rgba(0, 0, 0, 0.65)",
      fontFamily:         "'Inter', system-ui, sans-serif",
    },
  },

  // ── 2. MIDNIGHT NAVY — Deep navy + steel-blue surfaces + blue accent ──────
  {
    id: "midnight-navy",
    name: "Midnight Navy",
    previewColors: ["#0F1629", "#4478E6", "#090D18"],
    colors: {
      background:        "#090D18",
      surface:            "#0F1629",
      surfaceMuted:       "#141D35",
      surfaceElevated:    "#1C2340",
      bgHover:            "#212A4A",
      bgSelected:         "color-mix(in srgb, #4478E6 15%, transparent)",
      primary:            "#4478E6",
      primaryForeground:  "#EEF2FF",
      accent:             "#4478E6",
      accentHover:        "#3366D4",
      accentSoft:         "color-mix(in srgb, #4478E6 15%, transparent)",
      accentForeground:   "#EEF2FF",
      text:               "#EEF2FF",
      textSecondary:      "#8FA4CC",
      textMuted:          "#5E6B94",
      textDisabled:       "#3A4460",
      border:             "#1C2340",
      borderStrong:       "#283060",
      divider:            "#131828",
      success:            "#4CAF75",
      successForeground:  "#090D18",
      successSoft:        "color-mix(in srgb, #4CAF75 12%, transparent)",
      warning:            "#D4A843",
      warningSoft:        "color-mix(in srgb, #D4A843 12%, transparent)",
      error:              "#E05252",
      errorSoft:          "color-mix(in srgb, #E05252 12%, transparent)",
      info:               "#5B9BD5",
      infoSoft:           "color-mix(in srgb, #5B9BD5 12%, transparent)",
      ring:               "#4478E6",
      overlay:            "rgba(4, 6, 18, 0.70)",
      fontFamily:         "'DM Sans', system-ui, sans-serif",
    },
  },

  // ── 3. ESPRESSO BRONZE — Warm espresso base + muted bronze accent ─────────
  {
    id: "espresso-bronze",
    name: "Espresso Bronze",
    previewColors: ["#1A120A", "#C4893A", "#0C0804"],
    colors: {
      background:        "#0C0804",
      surface:            "#1A120A",
      surfaceMuted:       "#211610",
      surfaceElevated:    "#2A1F14",
      bgHover:            "#31241A",
      bgSelected:         "color-mix(in srgb, #C4893A 12%, transparent)",
      primary:            "#C4893A",
      primaryForeground:  "#0C0804",
      accent:             "#C4893A",
      accentHover:        "#B07830",
      accentSoft:         "color-mix(in srgb, #C4893A 12%, transparent)",
      accentForeground:   "#0C0804",
      text:               "#F2E8D9",
      textSecondary:      "#C4A882",
      textMuted:          "#8A7060",
      textDisabled:       "#5C4E40",
      border:             "#2A1F14",
      borderStrong:       "#3D2E1E",
      divider:            "#1A1208",
      success:            "#5D9E6A",
      successForeground:  "#0C0804",
      successSoft:        "color-mix(in srgb, #5D9E6A 12%, transparent)",
      warning:            "#D4956A",
      warningSoft:        "color-mix(in srgb, #D4956A 12%, transparent)",
      error:              "#C45C5C",
      errorSoft:          "color-mix(in srgb, #C45C5C 12%, transparent)",
      info:               "#6A95B8",
      infoSoft:           "color-mix(in srgb, #6A95B8 12%, transparent)",
      ring:               "#C4893A",
      overlay:            "rgba(6, 4, 2, 0.70)",
      fontFamily:         "'Sora', system-ui, sans-serif",
    },
  },

  // ── 4. OBSIDIAN MONOCHROME — Pure black-to-white hierarchy ────────────────
  {
    id: "obsidian-mono",
    name: "Obsidian Monochrome",
    previewColors: ["#141414", "#F0F0F0", "#0A0A0A"],
    colors: {
      background:        "#0A0A0A",
      surface:            "#141414",
      surfaceMuted:       "#181818",
      surfaceElevated:    "#1E1E1E",
      bgHover:            "#242424",
      bgSelected:         "#1E1E1E",
      primary:            "#F0F0F0",
      primaryForeground:  "#0A0A0A",
      accent:             "#F0F0F0",
      accentHover:        "#FFFFFF",
      accentSoft:         "rgba(240, 240, 240, 0.08)",
      accentForeground:   "#0A0A0A",
      text:               "#F0F0F0",
      textSecondary:      "#CCCCCC",
      textMuted:          "#888888",
      textDisabled:       "#444444",
      border:             "#1E1E1E",
      borderStrong:       "#2A2A2A",
      divider:            "#161616",
      success:            "#4A9D6F",
      successForeground:  "#0A0A0A",
      successSoft:        "color-mix(in srgb, #4A9D6F 12%, transparent)",
      warning:            "#B8860B",
      warningSoft:        "color-mix(in srgb, #B8860B 12%, transparent)",
      error:              "#C0392B",
      errorSoft:          "color-mix(in srgb, #C0392B 12%, transparent)",
      info:               "#4A7FA5",
      infoSoft:           "color-mix(in srgb, #4A7FA5 12%, transparent)",
      ring:               "#F0F0F0",
      overlay:            "rgba(0, 0, 0, 0.75)",
      fontFamily:         "'Inter', system-ui, sans-serif",
    },
  },

  // ── 5. PETROLEUM SAGE — Dark forest + organic sage accent ─────────────────
  {
    id: "petroleum-sage",
    name: "Petroleum Sage",
    previewColors: ["#0D1A16", "#5B8C7E", "#070F0D"],
    colors: {
      background:        "#070F0D",
      surface:            "#0D1A16",
      surfaceMuted:       "#111E1A",
      surfaceElevated:    "#162420",
      bgHover:            "#1C2E28",
      bgSelected:         "color-mix(in srgb, #5B8C7E 14%, transparent)",
      primary:            "#5B8C7E",
      primaryForeground:  "#070F0D",
      accent:             "#5B8C7E",
      accentHover:        "#4E7A6D",
      accentSoft:         "color-mix(in srgb, #5B8C7E 14%, transparent)",
      accentForeground:   "#070F0D",
      text:               "#E8F0EE",
      textSecondary:      "#A8C8C0",
      textMuted:          "#4D7068",
      textDisabled:       "#2A4040",
      border:             "#162420",
      borderStrong:       "#1E3330",
      divider:            "#0E1C18",
      success:            "#5FAF7A",
      successForeground:  "#070F0D",
      successSoft:        "color-mix(in srgb, #5FAF7A 12%, transparent)",
      warning:            "#C49B5A",
      warningSoft:        "color-mix(in srgb, #C49B5A 12%, transparent)",
      error:              "#C45C5C",
      errorSoft:          "color-mix(in srgb, #C45C5C 12%, transparent)",
      info:               "#5B8CB8",
      infoSoft:           "color-mix(in srgb, #5B8CB8 12%, transparent)",
      ring:               "#5B8C7E",
      overlay:            "rgba(4, 8, 7, 0.70)",
      fontFamily:         "'DM Sans', system-ui, sans-serif",
    },
  },
];

export const DEFAULT_DARK_THEME_ID = "graphite-aqua";

export function getDarkThemePreset(id: string): DashboardDarkThemePreset {
  return (
    DASHBOARD_DARK_THEME_PRESETS.find((t) => t.id === id) ??
    DASHBOARD_DARK_THEME_PRESETS[0]
  );
}

/** Any dark theme id that existed before the 2026-07 dark-mode handoff. */
export const LEGACY_DARK_THEME_IDS = DASHBOARD_THEME_PRESETS.map((t) => t.id);
