"use client";
import { useEffect, useRef } from "react";
import { EquipoProvider } from "@/contexts/EquipoContext";
import { useExtraProfile } from "@/contexts/ExtraProfileContext";
import type { DashboardColorSet } from "@/types/profile";
import { applyDashboardColors } from "@/lib/applyDashboardColors";

function ThemeApplier({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { dashboardTheme } = useExtraProfile();

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const { mode, lightColors, darkColors } = dashboardTheme;

    function apply(colors: DashboardColorSet) { applyDashboardColors(el!, colors); }

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

  return <div ref={rootRef} data-ds-theme-root style={{ minHeight: "100vh" }}>{children}</div>;
}

export default function TrabajadorLayout({ children }: { children: React.ReactNode }) {
  return (
    <EquipoProvider>
      <ThemeApplier>{children}</ThemeApplier>
    </EquipoProvider>
  );
}
