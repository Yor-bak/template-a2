import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "blue" | "green" | "amber" | "red" | "purple" | "teal";
  sub?: string;
}

// All colors now use semantic ds-* tokens so they adapt to any theme / dark mode
const colorMap: Record<string, { bg: string; icon: string; value: string }> = {
  blue:   { bg: "bg-[var(--ds-accent)]/12",   icon: "text-[var(--ds-accent)]",   value: "text-[var(--ds-text)]" },
  teal:   { bg: "bg-[var(--ds-accent)]/12",   icon: "text-[var(--ds-accent)]",   value: "text-[var(--ds-text)]" },
  green:  { bg: "bg-[var(--ds-success)]/12",  icon: "text-[var(--ds-success)]",  value: "text-[var(--ds-success)]" },
  amber:  { bg: "bg-[var(--ds-warning)]/12",  icon: "text-[var(--ds-warning)]",  value: "text-[var(--ds-warning)]" },
  red:    { bg: "bg-[var(--ds-error)]/12",    icon: "text-[var(--ds-error)]",    value: "text-[var(--ds-error)]" },
  purple: { bg: "bg-[var(--ds-surface-muted)]", icon: "text-[var(--ds-text-muted)]", value: "text-[var(--ds-text)]" },
};

export function StatCard({ label, value, icon: Icon, color = "blue", sub }: StatCardProps) {
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <div className="bg-[var(--ds-surface)] rounded-2xl border border-[var(--ds-border)] p-5 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", c.bg)}>
        <Icon className={cn("w-6 h-6", c.icon)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--ds-text-muted)] font-medium uppercase tracking-wide truncate">{label}</p>
        <p className={cn("text-2xl font-bold leading-tight", c.value)}>{value}</p>
        {sub && <p className="text-xs text-[var(--ds-text-muted)]/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
