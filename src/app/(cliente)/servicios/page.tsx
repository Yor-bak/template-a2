"use client";
import Link from "next/link";
import { useServices } from "@/contexts/ServicesContext";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { whatsappLink } from "@/lib/utils";
import { SectionTitle } from "@/modules/cliente/components/SectionTitle";
import { ServiceCard } from "@/modules/cliente/components/ServiceCard";
import { MessageCircle, CalendarDays } from "lucide-react";

export default function ServicesPage() {
  const { config } = useClinicConfig();
  const { getPublicServices, isLoading } = useServices();
  const publicServices = getPublicServices();

  const emergency = publicServices.find((s) => s.isEmergency);
  const regular = publicServices.filter((s) => !s.isEmergency);

  return (
    <div className="bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest mb-3">Catálogo completo</p>
          <h1 className="text-4xl font-extrabold text-white mb-4">Nuestros servicios</h1>
          <p className="text-white/60 max-w-xl mx-auto text-base">
            Tratamientos dentales completos con atención personalizada y tecnología moderna.
          </p>
          <p className="text-white/30 text-xs mt-4">
            * Los precios son orientativos. Algunos tratamientos requieren valoración previa.
          </p>

          {emergency && (
            <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
              <p className="text-white/70 text-sm font-medium">¿Dolor intenso o fractura dental?</p>
              <div className="flex gap-2">
                <a
                  href={whatsappLink(config.whatsapp, "Hola, tengo una urgencia dental")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
                <Link
                  href={`/agendar?servicio=${emergency.slug}`}
                  className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  Urgencia
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid de servicios */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {isLoading ? (
          <div className="text-center py-16 text-[var(--color-muted-text)]">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm">Cargando servicios...</p>
          </div>
        ) : publicServices.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-muted-text)]">
            <p className="text-lg font-semibold mb-2">No hay servicios disponibles</p>
            <p className="text-sm">Vuelve pronto — estamos actualizando nuestro catálogo.</p>
          </div>
        ) : (
          <>
            <SectionTitle
              eyebrow="Tratamientos"
              title="Todo lo que necesitas para tu sonrisa"
              subtitle="Desde revisiones de rutina hasta tratamientos avanzados. Nos adaptamos a tus necesidades."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergency && <ServiceCard service={emergency} />}
              {regular.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA bottom */}
      <div className="border-t border-[var(--color-border)] bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-2xl font-extrabold text-[var(--color-text)] mb-3">¿No encontraste lo que buscas?</h2>
          <p className="text-[var(--color-muted-text)] mb-6">Contáctanos y con gusto te orientamos sobre el tratamiento más adecuado.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={whatsappLink(config.whatsapp, "Hola, tengo una consulta sobre tratamientos")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Consultar por WhatsApp
            </a>
            <Link
              href="/agendar"
              className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              Agendar valoración
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
