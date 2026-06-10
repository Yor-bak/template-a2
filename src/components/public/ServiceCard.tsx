import Link from "next/link";
import { Clock, ChevronRight, CalendarDays, Zap } from "lucide-react";
import { priceLabel } from "@/lib/utils";
import type { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
  compact?: boolean;
}

const ICON_MAP: Record<string, string> = {
  "limpieza-dental": "✦",
  "resinas": "◈",
  "extracciones": "⊗",
  "endodoncia": "⊕",
  "ortodoncia": "⋈",
  "blanqueamiento-dental": "✦",
  "implantes-dentales": "⊞",
  "protesis-dentales": "◉",
  "odontopediatria": "✿",
  "valoracion-general": "◎",
  "urgencias-dentales": "⚡",
};

export function ServiceCard({ service, compact = false }: ServiceCardProps) {
  const icon = ICON_MAP[service.slug] ?? "◆";

  if (service.isEmergency) {
    return (
      <div className="bg-[#173B45] rounded-2xl p-6 flex flex-col border border-[#70D6C7]/30 relative overflow-hidden group hover:shadow-xl transition-shadow">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#70D6C7]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 text-xl">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xs bg-red-500 text-white font-bold px-2.5 py-1 rounded-full">
            Urgencias
          </span>
        </div>
        <h3 className="font-bold text-white text-base mb-2">{service.name}</h3>
        <p className="text-sm text-white/60 leading-relaxed mb-4 flex-1">{service.shortDescription}</p>
        <div className="flex items-center justify-between text-xs text-white/40 mb-5">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {service.durationMinutes} min
          </span>
          <span className="text-[#70D6C7] font-semibold text-sm">
            {priceLabel(service.priceType, service.estimatedPrice)}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/servicios/${service.slug}`}
            className="flex-1 text-center text-xs border border-white/20 text-white/70 py-2.5 rounded-xl hover:bg-white/10 transition-colors font-medium"
          >
            Ver más
          </Link>
          <Link
            href={`/agendar?servicio=${service.slug}`}
            className="flex-1 text-center text-xs bg-[#70D6C7] text-[#0E2F3A] py-2.5 rounded-xl hover:bg-[#a0e8de] transition-colors font-bold"
          >
            Agendar urgencia
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E8ECEF] p-6 flex flex-col group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-[#BFEAF5] flex items-center justify-center text-[#173B45] font-bold text-lg">
          {icon}
        </div>
        <span className="text-xs text-[#70D6C7] font-bold uppercase tracking-wider">
          Dental
        </span>
      </div>
      <h3 className="font-bold text-[#102A33] text-base mb-2">{service.name}</h3>
      <p className="text-sm text-[#5F737C] leading-relaxed mb-4 flex-1">{service.shortDescription}</p>
      <div className="flex items-center justify-between text-xs text-[#5F737C] mb-5 pt-3 border-t border-[#E8ECEF]">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {service.durationMinutes} min
        </span>
        <span className="font-bold text-[#173B45]">
          {priceLabel(service.priceType, service.estimatedPrice)}
        </span>
      </div>
      <div className="flex gap-2">
        <Link
          href={`/servicios/${service.slug}`}
          className="flex items-center justify-center gap-1 flex-1 text-center text-xs border border-[#E8ECEF] text-[#5F737C] py-2.5 rounded-xl hover:border-[#70D6C7] hover:text-[#173B45] transition-colors font-medium"
        >
          Ver más
          <ChevronRight className="w-3 h-3" />
        </Link>
        <Link
          href={`/agendar?servicio=${service.slug}`}
          className="flex items-center justify-center gap-1 flex-1 text-center text-xs bg-[#173B45] text-white py-2.5 rounded-xl hover:bg-[#0E2F3A] transition-colors font-semibold"
        >
          <CalendarDays className="w-3 h-3" />
          Agendar
        </Link>
      </div>
    </div>
  );
}
