"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useExtraProfile } from "@/contexts/ExtraProfileContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu } from "lucide-react";
import type { DashboardColorSet } from "@/types/profile";

function applyDashboardColors(el: HTMLElement, colors: DashboardColorSet) {
  // Prefix --ds-* for clean separation from public template vars
  el.style.setProperty("--ds-bg", colors.background);
  el.style.setProperty("--ds-surface", colors.surface);
  el.style.setProperty("--ds-surface-muted", colors.surfaceMuted);
  el.style.setProperty("--ds-primary", colors.primary);
  el.style.setProperty("--ds-primary-fg", colors.primaryForeground);
  el.style.setProperty("--ds-accent", colors.accent);
  el.style.setProperty("--ds-text", colors.text);
  el.style.setProperty("--ds-text-muted", colors.textMuted);
  el.style.setProperty("--ds-border", colors.border);
  // Alias to --color-* so existing components pick them up without changes
  el.style.setProperty("--color-background", colors.background);
  el.style.setProperty("--color-card", colors.surface);
  el.style.setProperty("--color-primary", colors.primary);
  el.style.setProperty("--color-primary-dark", colors.primary);
  el.style.setProperty("--color-accent", colors.accent);
  el.style.setProperty("--color-accent-soft", colors.accent + "44");
  el.style.setProperty("--color-text", colors.text);
  el.style.setProperty("--color-muted-text", colors.textMuted);
  el.style.setProperty("--color-border", colors.border);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const { dashboardTheme } = useExtraProfile();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const { mode, lightColors, darkColors } = dashboardTheme;

    function apply(colors: DashboardColorSet) {
      applyDashboardColors(el!, colors);
    }

    if (mode === "dark") {
      apply(darkColors);
    } else if (mode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches ? darkColors : lightColors);
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? darkColors : lightColors);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      apply(lightColors);
    }
  }, [dashboardTheme]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[var(--color-accent-soft)] border-t-[var(--color-primary)] rounded-full animate-spin" />
          <p className="text-[var(--color-muted-text)] text-xs font-medium">Cargando panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} data-dashboard-root className="flex h-screen bg-[var(--color-background)] overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-[var(--color-border)] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-[var(--color-muted-text)] hover:bg-[var(--color-background)] transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--color-accent)] rounded-md flex items-center justify-center">
              <span className="text-[var(--color-primary-dark)] text-[10px] font-extrabold">DS</span>
            </div>
            <p className="font-bold text-[var(--color-text)] text-sm">Panel dental</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
