import type { AppointmentSource } from "@/types";
import { Globe, PenLine, Bot } from "lucide-react";

interface SourceBadgeProps {
  source: AppointmentSource;
  size?: "sm" | "xs";
}

const CONFIG = {
  public_web: {
    label: "Web",
    icon: Globe,
    cls: "bg-blue-50 text-blue-700 border-blue-100",
  },
  manual: {
    label: "Manual",
    icon: PenLine,
    cls: "bg-gray-100 text-gray-700 border-gray-200",
  },
  ai_whatsapp: {
    label: "IA WhatsApp",
    icon: Bot,
    cls: "bg-violet-50 text-violet-700 border-violet-100",
  },
} satisfies Record<AppointmentSource, { label: string; icon: React.FC<{ className?: string }>; cls: string }>;

export function SourceBadge({ source, size = "xs" }: SourceBadgeProps) {
  const { label, icon: Icon, cls } = CONFIG[source];
  const padding = size === "sm" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]";
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${padding} ${cls}`}>
      <Icon className={size === "sm" ? "w-3.5 h-3.5" : "w-3 h-3"} />
      {label}
    </span>
  );
}

export const SOURCE_LABELS: Record<AppointmentSource, string> = {
  public_web: "Formulario web",
  manual: "Registro manual",
  ai_whatsapp: "IA por WhatsApp",
};

export const SOURCE_DESCRIPTIONS: Record<AppointmentSource, string> = {
  public_web: "Esta cita fue solicitada desde la página web por el paciente.",
  manual: "Esta cita fue registrada manualmente por el dentista.",
  ai_whatsapp: "Esta cita fue creada automáticamente mediante WhatsApp con IA.",
};
