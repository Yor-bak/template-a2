"use client";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { whatsappLink } from "@/lib/utils";
import { MapPin, Phone, Mail, Clock, Car, MessageCircle, Navigation } from "lucide-react";

export default function LocationPage() {
  const { config } = useClinicConfig();

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
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest mb-3">¿Dónde estamos?</p>
          <h1 className="text-4xl font-extrabold text-white mb-4">Nuestra ubicación</h1>
          <p className="text-white/60 text-base max-w-md mx-auto">
            Encuéntranos fácilmente. Estamos aquí para atenderte.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Info */}
          <div className="space-y-4">
            {/* Dirección */}
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                </div>
                Dirección
              </h2>
              <p className="text-[var(--color-muted-text)] text-sm leading-relaxed mb-3">{config.address}</p>
              {config.locationReferences && (
                <p className="text-[var(--color-muted-text)] text-xs bg-[var(--color-background)] rounded-xl p-3 border border-[var(--color-border)]">{config.locationReferences}</p>
              )}
              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 bg-[var(--color-primary)] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Cómo llegar
              </a>
            </div>

            {/* Horarios */}
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                </div>
                Horarios de atención
              </h2>
              <div className="space-y-1">
                {config.openingHours
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((h) => (
                    <div key={h.dayOfWeek} className="flex justify-between items-center text-sm py-1.5 border-b border-[var(--color-border)] last:border-0">
                      <span className={`font-medium ${h.isOpen ? "text-[var(--color-text)]" : "text-[var(--color-muted-text)]"}`}>
                        {h.dayLabel}
                      </span>
                      <span className="text-[var(--color-muted-text)] text-xs">
                        {h.isOpen
                          ? h.blocks.map((b) => `${b.startTime}–${b.endTime}`).join(" / ")
                          : "Cerrado"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-[var(--color-text)] mb-4 text-sm uppercase tracking-wide">Contacto</h2>
              <div className="space-y-3">
                <a
                  href={whatsappLink(config.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[var(--color-muted-text)] hover:text-green-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </div>
                  {config.phone} (WhatsApp)
                </a>
                <a
                  href={`tel:${config.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-sm text-[var(--color-muted-text)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[var(--color-primary)]" />
                  </div>
                  {config.phone}
                </a>
                <a
                  href={`mailto:${config.email}`}
                  className="flex items-center gap-3 text-sm text-[var(--color-muted-text)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[var(--color-primary)]" />
                  </div>
                  {config.email}
                </a>
              </div>
            </div>

            {/* Parking */}
            {config.parkingAvailable && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
                <Car className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-800 text-sm">Estacionamiento disponible</p>
                  {config.parkingDetails && (
                    <p className="text-green-600 text-xs mt-0.5">{config.parkingDetails}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mapa */}
          <div>
            <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-sm h-80 md:h-full min-h-72 sticky top-20">
              {config.googleMapsEmbedUrl ? (
                <iframe
                  src={config.googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "288px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación del consultorio"
                />
              ) : (
                <div className="w-full h-full bg-[var(--color-primary)]/5 flex items-center justify-center p-8 text-center">
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-[var(--color-primary)]" />
                    </div>
                    <p className="text-[var(--color-text)] font-bold mb-1">{config.clinicName}</p>
                    <p className="text-[var(--color-muted-text)] text-xs mb-6">{config.address}</p>
                    <a
                      href={config.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      Ver en Google Maps
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
