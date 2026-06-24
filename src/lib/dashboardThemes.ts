import type { DashboardColorSet } from "@/types/profile";

export interface DashboardThemePreset {
  id: string;
  name: string;
  previewColors: [string, string, string]; // [primary, accent, bg]
  light: DashboardColorSet;
  dark: DashboardColorSet;
}

export const DASHBOARD_THEME_PRESETS: DashboardThemePreset[] = [
  {
    id: "marfil",
    name: "Marfil",
    previewColors: ["#173B45", "#70D6C7", "#f8f9fa"],
    light: {
      background: "#f8f9fa", surface: "#ffffff", surfaceMuted: "#f1f3f4",
      primary: "#173B45", primaryForeground: "#ffffff", accent: "#70D6C7",
      text: "#102A33", textMuted: "#5F737C", border: "#E8ECEF",
    },
    dark: {
      background: "#0f1117", surface: "#1a1d27", surfaceMuted: "#252836",
      primary: "#70D6C7", primaryForeground: "#0f1117", accent: "#4ec9bc",
      text: "#e8ecef", textMuted: "#8a9aaa", border: "#2a2f3e",
    },
  },
  {
    id: "marino",
    name: "Marino",
    previewColors: ["#1e3a5f", "#4a90d9", "#f0f4f8"],
    light: {
      background: "#f0f4f8", surface: "#ffffff", surfaceMuted: "#e8eef4",
      primary: "#1e3a5f", primaryForeground: "#ffffff", accent: "#4a90d9",
      text: "#0f2035", textMuted: "#4a6080", border: "#d0dce8",
    },
    dark: {
      background: "#0a1628", surface: "#111f35", surfaceMuted: "#1a2f4a",
      primary: "#4a90d9", primaryForeground: "#0a1628", accent: "#6aaae8",
      text: "#d8e8f4", textMuted: "#7090b0", border: "#1e3050",
    },
  },
  {
    id: "verde",
    name: "Verde",
    previewColors: ["#1a5c3a", "#3db87a", "#f0f7f4"],
    light: {
      background: "#f0f7f4", surface: "#ffffff", surfaceMuted: "#e4f2ec",
      primary: "#1a5c3a", primaryForeground: "#ffffff", accent: "#3db87a",
      text: "#0d3020", textMuted: "#3d6050", border: "#cce5d8",
    },
    dark: {
      background: "#0a1f14", surface: "#102a1c", surfaceMuted: "#183a28",
      primary: "#3db87a", primaryForeground: "#0a1f14", accent: "#5ecf94",
      text: "#d0ecde", textMuted: "#6a9e80", border: "#1a3a28",
    },
  },
  {
    id: "rosa",
    name: "Rosa",
    previewColors: ["#8b2252", "#e879a0", "#fdf2f7"],
    light: {
      background: "#fdf2f7", surface: "#ffffff", surfaceMuted: "#fae6f0",
      primary: "#8b2252", primaryForeground: "#ffffff", accent: "#e879a0",
      text: "#4a0a28", textMuted: "#904070", border: "#f0c8dc",
    },
    dark: {
      background: "#1f0a14", surface: "#2e1020", surfaceMuted: "#3e1830",
      primary: "#e879a0", primaryForeground: "#1f0a14", accent: "#f09ab8",
      text: "#f5d0e4", textMuted: "#c06090", border: "#4a1530",
    },
  },
  {
    id: "grafito",
    name: "Grafito",
    previewColors: ["#27272a", "#71717a", "#f4f4f5"],
    light: {
      background: "#f4f4f5", surface: "#ffffff", surfaceMuted: "#e4e4e7",
      primary: "#27272a", primaryForeground: "#ffffff", accent: "#71717a",
      text: "#09090b", textMuted: "#52525b", border: "#d4d4d8",
    },
    dark: {
      background: "#09090b", surface: "#18181b", surfaceMuted: "#27272a",
      primary: "#a1a1aa", primaryForeground: "#09090b", accent: "#71717a",
      text: "#fafafa", textMuted: "#a1a1aa", border: "#3f3f46",
    },
  },
  {
    id: "arena",
    name: "Arena",
    previewColors: ["#7c5c3a", "#d4a57a", "#faf7f2"],
    light: {
      background: "#faf7f2", surface: "#ffffff", surfaceMuted: "#f5ede0",
      primary: "#7c5c3a", primaryForeground: "#ffffff", accent: "#d4a57a",
      text: "#3a2810", textMuted: "#8a6848", border: "#e8d8c0",
    },
    dark: {
      background: "#1c1510", surface: "#2a1e14", surfaceMuted: "#3a2a1c",
      primary: "#d4a57a", primaryForeground: "#1c1510", accent: "#e8c09a",
      text: "#f5e8d0", textMuted: "#b08060", border: "#4a3520",
    },
  },
];

export const DEFAULT_THEME_ID = "marfil";

export function getThemePreset(id: string): DashboardThemePreset {
  return DASHBOARD_THEME_PRESETS.find((t) => t.id === id) ?? DASHBOARD_THEME_PRESETS[0];
}
