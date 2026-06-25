"use client";
import Link from "next/link";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { useServices } from "@/contexts/ServicesContext";
import { useCalendar } from "@/contexts/CalendarContext";
import { getSetupChecklistStatus } from "@/lib/setupChecklist";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";

export function SetupChecklist() {
  const { config } = useClinicConfig();
  const { services } = useServices();
  const { availabilityRules } = useCalendar();

  const items = getSetupChecklistStatus(config, services, availabilityRules);
  const completed = items.filter((i) => i.completed).length;
  const pct = Math.round((completed / items.length) * 100);

  if (pct === 100) return null;

  return (
    <div className="bg-[var(--ds-surface-elevated)] border border-[var(--ds-border)] rounded-2xl shadow-sm p-5 mb-7">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-[var(--ds-text)] text-sm">Configura tu consultorio</h2>
          <p className="text-xs text-[var(--ds-text-muted)] mt-0.5">{completed} de {items.length} pasos completados</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--ds-accent)] rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[var(--ds-primary)] tabular-nums">{pct}%</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {items.filter((i) => !i.completed).slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--ds-bg)] transition-colors group">
            <Circle className="w-4 h-4 text-[var(--ds-text-muted)]/30 flex-shrink-0" />
            <span className="text-sm text-[var(--ds-text-muted)] flex-1">{item.label}</span>
            {item.actionHref && (
              <Link
                href={item.actionHref + (item.tab ? `?tab=${item.tab}` : "")}
                className="text-xs font-semibold text-[var(--ds-primary)] flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {item.actionLabel ?? "Ir"} <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
        {items.filter((i) => i.completed).slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl opacity-50">
            <CheckCircle2 className="w-4 h-4 text-[var(--ds-accent)] flex-shrink-0" />
            <span className="text-sm text-[var(--ds-text-muted)] line-through">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
