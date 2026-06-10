import { clinic } from "@/data/clinic";
import { whatsappLink } from "@/lib/utils";
import { MapPin, Phone, Mail, Clock, Car, MessageCircle, Navigation } from "lucide-react";

export default function LocationPage() {
  return (
    <div className="bg-[#FAFAF7]">
      {/* Header */}
      <div className="bg-[#173B45] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(#70D6C7 1px, transparent 1px), linear-gradient(90deg, #70D6C7 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-[#70D6C7] text-xs font-bold uppercase tracking-widest mb-3">¿Dónde estamos?</p>
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
            <div className="bg-white border border-[#E8ECEF] rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-[#102A33] mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <div className="w-7 h-7 rounded-lg bg-[#BFEAF5] flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-[#173B45]" />
                </div>
                Dirección
              </h2>
              <p className="text-[#5F737C] text-sm leading-relaxed mb-3">{clinic.address}</p>
              {clinic.locationReferences && (
                <p className="text-[#5F737C] text-xs bg-[#FAFAF7] rounded-xl p-3 border border-[#E8ECEF]">{clinic.locationReferences}</p>
              )}
              <a
                href={clinic.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 bg-[#173B45] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0E2F3A] transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Cómo llegar
              </a>
            </div>

            {/* Horarios */}
            <div className="bg-white border border-[#E8ECEF] rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-[#102A33] mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <div className="w-7 h-7 rounded-lg bg-[#BFEAF5] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-[#173B45]" />
                </div>
                Horarios
              </h2>
              <div className="space-y-2">
                {clinic.openingHours.map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-[#E8ECEF] last:border-0">
                    <span className="font-medium text-[#102A33]">{h.days}</span>
                    <span className="text-[#5F737C] text-xs">{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-white border border-[#E8ECEF] rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-[#102A33] mb-4 text-sm uppercase tracking-wide">Contacto</h2>
              <div className="space-y-3">
                <a
                  href={whatsappLink(clinic.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[#5F737C] hover:text-green-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </div>
                  {clinic.phone} (WhatsApp)
                </a>
                <a
                  href={`tel:${clinic.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-sm text-[#5F737C] hover:text-[#173B45] transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#BFEAF5] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#173B45]" />
                  </div>
                  {clinic.phone}
                </a>
                <a
                  href={`mailto:${clinic.email}`}
                  className="flex items-center gap-3 text-sm text-[#5F737C] hover:text-[#173B45] transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#BFEAF5] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#173B45]" />
                  </div>
                  {clinic.email}
                </a>
              </div>
            </div>

            {/* Parking */}
            {clinic.parkingAvailable && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
                <Car className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-800 text-sm">Estacionamiento disponible</p>
                  {clinic.parkingNotes && (
                    <p className="text-green-600 text-xs mt-0.5">{clinic.parkingNotes}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mapa placeholder */}
          <div>
            <div className="rounded-2xl overflow-hidden border border-[#E8ECEF] shadow-sm h-80 md:h-full min-h-72 bg-[#173B45]/5 flex items-center justify-center sticky top-20">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#BFEAF5] flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-[#173B45]" />
                </div>
                <p className="text-[#102A33] font-bold mb-1">{clinic.name}</p>
                <p className="text-[#5F737C] text-xs mb-6">{clinic.address}</p>
                <a
                  href={clinic.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#173B45] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#0E2F3A] transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Ver en Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
