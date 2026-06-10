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
  blue: { bg: "bg-blue-50", icon: "text-blue-600", value: "text-blue-700" },
  green: { bg: "bg-green-50", icon: "text-green-600", value: "text-green-700" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", value: "text-amber-700" },
  red: { bg: "bg-red-50", icon: "text-red-600", value: "text-red-700" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", value: "text-purple-700" },
  teal: { bg: "bg-teal-50", icon: "text-teal-600", value: "text-teal-700" },
};

export function StatCard({ label, value, icon: Icon, color = "blue", sub }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", c.bg)}>
        <Icon className={cn("w-6 h-6", c.icon)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">{label}</p>
        <p className={cn("text-2xl font-bold leading-tight", c.value)}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
