import Link from "next/link";
import { clinic } from "@/data/clinic";
import { whatsappLink } from "@/lib/utils";
import { MapPin, Phone, Mail, Clock, CalendarDays } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0E2F3A] text-white/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-[#70D6C7] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-[#0E2F3A] text-sm font-extrabold">DS</span>
              </div>
              <div>
                <p className="text-white font-bold">{clinic.name}</p>
                <p className="text-[#70D6C7] text-xs opacity-80">{clinic.dentistName}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4 max-w-sm">{clinic.welcomeMessage}</p>
            <p className="text-xs text-white/40">Cédula profesional: {clinic.professionalLicense}</p>

            <Link
              href="/agendar"
              className="mt-5 inline-flex items-center gap-2 bg-[#70D6C7] text-[#0E2F3A] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#a0e8de] transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              Agendar cita
            </Link>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-[#70D6C7] mt-0.5 flex-shrink-0" />
                <span>{clinic.address}</span>
              </div>
              <a
                href={whatsappLink(clinic.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-[#70D6C7]" />
                {clinic.phone}
              </a>
              <a
                href={`mailto:${clinic.email}`}
                className="flex items-center gap-2.5 text-sm hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-[#70D6C7]" />
                {clinic.email}
              </a>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Horarios</h4>
            <div className="space-y-3">
              {clinic.openingHours.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <Clock className="w-4 h-4 text-[#70D6C7] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">{h.days}</span>
                    <br />
                    <span>{h.hours}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} {clinic.name}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-5">
            <Link href="/servicios" className="hover:text-white transition-colors">Servicios</Link>
            <Link href="/agendar" className="hover:text-white transition-colors">Agendar</Link>
            <Link href="/preguntas-frecuentes" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/ubicacion" className="hover:text-white transition-colors">Ubicación</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
