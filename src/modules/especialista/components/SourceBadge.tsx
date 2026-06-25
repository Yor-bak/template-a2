import type { CSSProperties } from "react";
import type { AppointmentSource } from "@/types";
import { Globe, PenLine, Bot } from "lucide-react";

interface SourceBadgeProps {
  source: AppointmentSource;
  size?: "sm" | "xs";
}

const CONFIG: Record<AppointmentSource, { label: string; icon: React.FC<{ className?: string }>; style: CSSProperties }> = {
  public_web: {
    label: "Web",
    icon: Globe,
    style: {
      background: "color-mix(in srgb, var(--ds-accent) 12%, transparent)",
      color: "var(--ds-accent)",
      borderColor: "color-mix(in srgb, var(--ds-accent) 28%, transparent)",
    },
  },
  manual: {
    label: "Manual",
    icon: PenLine,
    style: {
      background: "var(--ds-surface-muted)",
      color: "var(--ds-text-muted)",
      borderColor: "var(--ds-border)",
    },
  },
  ai_whatsapp: {
    label: "IA WhatsApp",
    icon: Bot,
    style: {
      background: "color-mix(in srgb, var(--ds-success) 12%, transparent)",
      color: "var(--ds-success)",
      borderColor: "color-mix(in srgb, var(--ds-success) 28%, transparent)",
    },
  },
};

export function SourceBadge({ source, size = "xs" }: SourceBadgeProps) {
  const { label, icon: Icon, style } = CONFIG[source];
  const padding = size === "sm" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]";
  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${padding}`}
    >
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
