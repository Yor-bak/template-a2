import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "blue" | "green" | "amber" | "red" | "purple" | "teal";
  sub?: string;
}

const colorMap = {
  blue:   { bg: "bg-[var(--color-accent-soft)]",      icon: "text-[var(--color-primary)]", value: "text-[var(--color-text)]" },
  teal:   { bg: "bg-[var(--color-accent)]/20",   icon: "text-[var(--color-primary-dark)]", value: "text-[var(--color-primary-dark)]" },
  green:  { bg: "bg-emerald-50",     icon: "text-emerald-600", value: "text-emerald-700" },
  amber:  { bg: "bg-amber-50",       icon: "text-amber-600",   value: "text-amber-700" },
  red:    { bg: "bg-red-50",         icon: "text-red-600",     value: "text-red-700" },
  purple: { bg: "bg-violet-50",      icon: "text-violet-600",  value: "text-violet-700" },
};

export function StatCard({ label, value, icon: Icon, color = "blue", sub }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-5 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", c.bg)}>
        <Icon className={cn("w-6 h-6", c.icon)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-muted-text)] font-medium uppercase tracking-wide truncate">{label}</p>
        <p className={cn("text-2xl font-bold leading-tight", c.value)}>{value}</p>
        {sub && <p className="text-xs text-[var(--color-muted-text)]/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
