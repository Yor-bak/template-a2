"use client";
import { notFound } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import { priceLabel } from "@/lib/utils";
import { Clock, CheckCircle2, ChevronRight, CalendarDays, AlertTriangle } from "lucide-react";
import { WhatsAppCTA } from "@/modules/cliente/components/WhatsAppCTA";
import { useServices } from "@/contexts/ServicesContext";

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { services, isLoading } = useServices();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const otherServices = services.filter((s) => s.slug !== service.slug && !s.isEmergency).slice(0, 3);

  return (
    <div className="bg-[var(--color-background)]">
      {/* Breadcrumb */}
      <div className="bg-[var(--color-primary)] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-white/50">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/servicios" className="hover:text-white transition-colors">Servicios</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">{service.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="md:col-span-2">
            {service.isEmergency && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-3 py-2 rounded-xl mb-4 w-fit uppercase tracking-wide">
                <AlertTriangle className="w-3.5 h-3.5" />
                Servicio de urgencia
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-text)] mb-4 leading-tight">{service.name}</h1>
            <p className="text-[var(--color-muted-text)] text-base leading-relaxed mb-8">{service.fullDescription}</p>

            {service.whenRecommended && (
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 mb-5">
                <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wide mb-2">¿Cuándo se recomienda?</h2>
                <p className="text-[var(--color-muted-text)] text-sm leading-relaxed">{service.whenRecommended}</p>
              </div>
            )}

            {service.includes && service.includes.length > 0 && (
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 mb-5">
                <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wide mb-3">¿Qué incluye?</h2>
                <ul className="space-y-2">
                  {service.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-muted-text)]">
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.recommendations && service.recommendations.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h2 className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-2">Recomendaciones previas</h2>
                <ul className="space-y-1.5">
                  {service.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                      <span className="mt-1 font-bold">·</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Pricing card */}
            <div className="bg-[var(--color-primary)] rounded-2xl p-6 sticky top-20">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                  <span className="text-white/60">Duración</span>
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    {service.durationMinutes} min
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Precio</span>
                  <span className="font-bold text-[var(--color-accent)] text-base">
                    {priceLabel(service.priceType, service.estimatedPrice)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href={`/agendar?servicio=${service.slug}`}
                  className="flex items-center justify-center gap-2 w-full bg-[var(--color-accent)] text-[var(--color-primary-dark)] py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-accent-soft)] transition-colors"
                >
                  <CalendarDays className="w-4 h-4" />
                  Agendar este servicio
                </Link>
                <WhatsAppCTA
                  serviceName={service.name}
                  className="flex items-center justify-center gap-2 w-full bg-white/10 border border-white/20 text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/15 transition-colors"
                  label="Preguntar por WhatsApp"
                />
              </div>
            </div>

            {/* Nota precios */}
            <div className="bg-white rounded-2xl p-4 border border-[var(--color-border)] text-sm text-[var(--color-muted-text)]">
              <p className="font-semibold text-[var(--color-text)] mb-1 text-xs uppercase tracking-wide">Nota sobre precios</p>
              <p className="leading-relaxed text-xs">
                Los precios mostrados son orientativos. El costo final puede variar según las condiciones de tu caso. En servicios complejos se requiere valoración previa.
              </p>
            </div>

            {/* Otros servicios */}
            {otherServices.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-[var(--color-border)]">
                <p className="font-semibold text-[var(--color-text)] mb-3 text-xs uppercase tracking-wide">Ver también</p>
                <div className="space-y-2">
                  {otherServices.map((s) => (
                    <Link key={s.id} href={`/servicios/${s.slug}`} className="flex items-center justify-between text-sm text-[var(--color-muted-text)] hover:text-[var(--color-primary)] py-1 group">
                      <span>{s.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
