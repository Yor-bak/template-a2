"use client";
import Link from "next/link";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { whatsappLink } from "@/lib/utils";
import { MapPin, Phone, Mail, CalendarDays, Stethoscope, MessageCircle } from "lucide-react";
import { getShortHoursLabel } from "@/utils/clinicUtils";

export function Footer() {
  const { config } = useClinicConfig();
  const openDays = config.openingHours.filter((h) => h.isOpen).sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <footer className="bg-[var(--color-primary-dark)] text-white/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Brand — 5 cols */}
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-3 mb-5 group w-fit">
              <div className="w-9 h-9 bg-[var(--color-accent)] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:opacity-90 transition-opacity">
                <Stethoscope className="w-4 h-4 text-[var(--color-primary-dark)]" />
              </div>
              <div>
                <p className="text-white font-bold leading-none">{config.clinicName}</p>
                <p className="text-[var(--color-accent)] text-xs opacity-75 mt-0.5">{config.dentistName}</p>
              </div>
            </Link>

            <p className="text-sm leading-relaxed mb-3 max-w-xs">{config.shortDescription}</p>
            <p className="text-xs text-white/30 mb-5">Cédula profesional: {config.professionalLicense}</p>

            <div className="flex gap-2">
              <Link
                href="/agendar"
                className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-primary-dark)] px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <CalendarDays className="w-4 h-4" />
                Agendar cita
              </Link>
              <a
                href={whatsappLink(config.whatsapp, "Hola, me gustaría solicitar información")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-white/70 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/12 hover:text-white transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Contact — 3 cols */}
          <div className="md:col-span-3">
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{config.address}</span>
              </div>
              <a
                href={whatsappLink(config.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                {config.phone}
              </a>
              {config.email && (
                <a
                  href={`mailto:${config.email}`}
                  className="flex items-center gap-2.5 text-sm hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                  {config.email}
                </a>
              )}
            </div>
          </div>

          {/* Hours — 4 cols */}
          <div className="md:col-span-4">
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Horarios</h4>
            <div className="space-y-1.5">
              {openDays.map((h) => (
                <div key={h.dayOfWeek} className="flex items-center justify-between text-sm">
                  <span className="text-white/70 font-medium">{h.dayLabel}</span>
                  <span className="text-white/40 text-xs">
                    {h.blocks.map((b) => `${b.startTime}–${b.endTime}`).join(" / ")}
                  </span>
                </div>
              ))}
              {openDays.length === 0 && (
                <p className="text-xs text-white/30">Horarios por configurar</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>© {new Date().getFullYear()} {config.clinicName}. Todos los derechos reservados.</p>
          <nav className="flex items-center gap-5">
            <Link href="/servicios" className="hover:text-white/70 transition-colors">Servicios</Link>
            <Link href="/ubicacion" className="hover:text-white/70 transition-colors">Ubicación</Link>
            <Link href="/preguntas-frecuentes" className="hover:text-white/70 transition-colors">FAQ</Link>
            <Link href="/agendar" className="hover:text-white/70 transition-colors">Agendar</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
