import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Icon className="w-10 h-10 mb-3 opacity-30" strokeWidth={1.5} />
      <p className="font-medium text-sm">{title}</p>
      {description && <p className="text-xs mt-1">{description}</p>}
    </div>
  );
}
