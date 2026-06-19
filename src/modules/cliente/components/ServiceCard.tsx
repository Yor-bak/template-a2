import Link from "next/link";
import {
  Clock, ChevronRight, CalendarDays, Zap,
  Sparkles, Layers, Scissors, Activity, AlignCenter,
  Sun, Anchor, Shield, Heart, ClipboardList, Stethoscope,
} from "lucide-react";
import { priceLabel } from "@/lib/utils";
import type { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
  compact?: boolean;
}

type IconComponent = React.ElementType;

const ICON_MAP: Record<string, IconComponent> = {
  "limpieza-dental":      Sparkles,
  "resinas":              Layers,
  "extracciones":         Scissors,
  "endodoncia":           Activity,
  "ortodoncia":           AlignCenter,
  "blanqueamiento-dental": Sun,
  "implantes-dentales":   Anchor,
  "protesis-dentales":    Shield,
  "odontopediatria":      Heart,
  "valoracion-general":   ClipboardList,
  "urgencias-dentales":   Zap,
};

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon: IconComponent = ICON_MAP[service.slug] ?? Stethoscope;

  if (service.isEmergency) {
    return (
      <div className="bg-[var(--color-primary)] rounded-2xl p-6 flex flex-col border border-[var(--color-accent)]/20 relative overflow-hidden group hover:shadow-xl hover:border-[var(--color-accent)]/40 transition-all duration-200">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-accent)]/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative flex items-start justify-between mb-5">
          <div className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-[10px] bg-red-500 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Urgencia
          </span>
        </div>
        <h3 className="font-bold text-white text-base mb-2 relative">{service.name}</h3>
        <p className="text-sm text-white/55 leading-relaxed mb-5 flex-1 relative">{service.shortDescription}</p>
        <div className="relative flex items-center justify-between text-xs text-white/35 mb-5">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {service.durationMinutes} min
          </span>
          <span className="text-[var(--color-accent)] font-semibold">
            {priceLabel(service.priceType, service.estimatedPrice)}
          </span>
        </div>
        <div className="relative flex gap-2">
          <Link
            href={`/servicios/${service.slug}`}
            className="flex-1 text-center text-xs border border-white/15 text-white/60 py-2.5 rounded-xl hover:bg-white/8 hover:text-white/80 transition-colors font-medium"
          >
            Ver detalle
          </Link>
          <Link
            href={`/agendar?servicio=${service.slug}`}
            className="flex-1 text-center text-xs bg-[var(--color-accent)] text-[var(--color-primary-dark)] py-2.5 rounded-xl hover:opacity-90 transition-opacity font-bold"
          >
            Agendar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 flex flex-col group hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--color-accent)]/30 transition-all duration-200">
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center group-hover:bg-[var(--color-accent)]/20 transition-colors">
          <Icon className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <span className="text-[10px] text-[var(--color-accent)] font-bold uppercase tracking-widest bg-[var(--color-accent-soft)] px-2.5 py-1 rounded-full">
          Dental
        </span>
      </div>
      <h3 className="font-bold text-[var(--color-text)] text-base mb-2">{service.name}</h3>
      <p className="text-sm text-[var(--color-muted-text)] leading-relaxed mb-5 flex-1">{service.shortDescription}</p>
      <div className="flex items-center justify-between text-xs text-[var(--color-muted-text)] mb-5 pt-4 border-t border-[var(--color-border)]">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {service.durationMinutes} min
        </span>
        <span className="font-bold text-[var(--color-primary)]">
          {priceLabel(service.priceType, service.estimatedPrice)}
        </span>
      </div>
      <div className="flex gap-2">
        <Link
          href={`/servicios/${service.slug}`}
          className="flex items-center justify-center gap-1 flex-1 text-center text-xs border border-[var(--color-border)] text-[var(--color-muted-text)] py-2.5 rounded-xl hover:border-[var(--color-accent)]/50 hover:text-[var(--color-primary)] transition-all font-medium"
        >
          Ver detalle
          <ChevronRight className="w-3 h-3" />
        </Link>
        <Link
          href={`/agendar?servicio=${service.slug}`}
          className="flex items-center justify-center gap-1 flex-1 text-center text-xs bg-[var(--color-primary)] text-white py-2.5 rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors font-semibold"
        >
          <CalendarDays className="w-3 h-3" />
          Agendar
        </Link>
      </div>
    </div>
  );
}
