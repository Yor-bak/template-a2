import type { DashboardColorSet } from "@/types/profile";

/**
 * Single source of truth for turning a DashboardColorSet into CSS custom
 * properties on the dashboard/worker shell element. Shared by the Specialist
 * Dashboard layout and the Worker Panel layout so both panels always render
 * identical tokens for the same theme (see handoff/tokens/semantic-token-reference.md).
 */
export function applyDashboardColors(el: HTMLElement, colors: DashboardColorSet) {
  // Core ds-* tokens (legacy names — existing components read these)
  el.style.setProperty("--ds-bg",             colors.background);
  el.style.setProperty("--ds-surface",         colors.surface);
  el.style.setProperty("--ds-surface-muted",   colors.surfaceMuted);
  el.style.setProperty("--ds-surface-elevated",colors.surfaceElevated ?? colors.surface);
  el.style.setProperty("--ds-primary",         colors.primary);
  el.style.setProperty("--ds-primary-fg",      colors.primaryForeground);
  el.style.setProperty("--ds-accent",          colors.accent);
  el.style.setProperty("--ds-text",            colors.text);
  el.style.setProperty("--ds-text-muted",      colors.textMuted);
  el.style.setProperty("--ds-border",          colors.border);
  // Semantic state tokens
  el.style.setProperty("--ds-success",         colors.success         ?? "#2e7a4a");
  el.style.setProperty("--ds-success-fg",      colors.successForeground ?? "#d0eedd");
  el.style.setProperty("--ds-warning",         colors.warning         ?? "#9a6a10");
  el.style.setProperty("--ds-error",           colors.error           ?? "#b03030");
  el.style.setProperty("--ds-ring",            colors.ring            ?? colors.accent);
  // Alias --color-* so existing components without ds-* still work
  el.style.setProperty("--color-background",   colors.background);
  el.style.setProperty("--color-card",         colors.surface);
  el.style.setProperty("--color-primary",      colors.primary);
  el.style.setProperty("--color-primary-dark", colors.primary);
  el.style.setProperty("--color-accent",       colors.accent);
  // accent-soft: use a safe rgba instead of hex append
  el.style.setProperty("--color-accent-soft",  colors.surfaceMuted);
  el.style.setProperty("--color-text",         colors.text);
  el.style.setProperty("--color-muted-text",   colors.textMuted);
  el.style.setProperty("--color-border",       colors.border);

  // Extended tokens — same handoff naming as tokens/themes.css so any
  // component built against the handoff spec resolves the same values as
  // the legacy names above. Light presets don't define these, so every
  // fallback below reproduces today's visual behaviour exactly.
  el.style.setProperty("--ds-bg-base",              colors.background);
  el.style.setProperty("--ds-bg-surface",           colors.surface);
  el.style.setProperty("--ds-bg-surface-secondary", colors.surfaceMuted);
  el.style.setProperty("--ds-bg-elevated",          colors.surfaceElevated ?? colors.surface);
  el.style.setProperty("--ds-bg-hover",             colors.bgHover ?? colors.surfaceMuted);
  el.style.setProperty("--ds-bg-selected",          colors.bgSelected ?? colors.surfaceMuted);

  el.style.setProperty("--ds-text-primary",   colors.text);
  el.style.setProperty("--ds-text-secondary", colors.textSecondary ?? colors.textMuted);
  el.style.setProperty("--ds-text-disabled",  colors.textDisabled ?? colors.textMuted);

  el.style.setProperty("--ds-border-strong", colors.borderStrong ?? colors.border);
  el.style.setProperty("--ds-divider",       colors.divider ?? colors.border);

  el.style.setProperty("--ds-accent-hover",      colors.accentHover ?? colors.accent);
  el.style.setProperty("--ds-accent-soft",       colors.accentSoft ?? colors.surfaceMuted);
  el.style.setProperty("--ds-accent-foreground", colors.accentForeground ?? colors.primaryForeground);

  el.style.setProperty("--ds-success-soft", colors.successSoft ?? colors.surfaceMuted);
  el.style.setProperty("--ds-warning-soft", colors.warningSoft ?? colors.surfaceMuted);
  el.style.setProperty("--ds-danger",       colors.error ?? "#b03030");
  el.style.setProperty("--ds-danger-soft",  colors.errorSoft ?? colors.surfaceMuted);
  el.style.setProperty("--ds-info",         colors.info ?? colors.ring ?? colors.accent);
  el.style.setProperty("--ds-info-soft",    colors.infoSoft ?? colors.surfaceMuted);

  el.style.setProperty("--ds-focus-ring", colors.ring ?? colors.accent);
  el.style.setProperty("--ds-overlay",    colors.overlay ?? "rgba(0, 0, 0, 0.5)");
  if (colors.fontFamily) el.style.setProperty("--ds-font-family", colors.fontFamily);
}

export function applySidebarTokens(el: HTMLElement, colors: DashboardColorSet, isDark: boolean) {
  if (isDark) {
    el.style.setProperty("--ds-sidebar-bg",        colors.background);
    el.style.setProperty("--ds-sidebar-fg",        colors.text);
    el.style.setProperty("--ds-sidebar-muted",     colors.textMuted);
    el.style.setProperty("--ds-sidebar-accent",    colors.accent);
    el.style.setProperty("--ds-sidebar-active-bg", colors.surface);
    el.style.setProperty("--ds-sidebar-hover-bg",  colors.surfaceMuted);
    el.style.setProperty("--ds-sidebar-border",    colors.border);
  } else {
    el.style.setProperty("--ds-sidebar-bg",        colors.primary);
    el.style.setProperty("--ds-sidebar-fg",        colors.primaryForeground);
    el.style.setProperty("--ds-sidebar-muted",     colors.primaryForeground);
    el.style.setProperty("--ds-sidebar-accent",    colors.accent);
    el.style.setProperty("--ds-sidebar-active-bg", "rgba(255,255,255,0.10)");
    el.style.setProperty("--ds-sidebar-hover-bg",  "rgba(255,255,255,0.06)");
    el.style.setProperty("--ds-sidebar-border",    "rgba(255,255,255,0.08)");
  }
}
