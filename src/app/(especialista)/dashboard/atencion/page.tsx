"use client";
import { useEffect, useState } from "react";
import { Phone, MessageCircle, HeadsetIcon } from "lucide-react";
import { loadGlobalSettings, normalizePhone } from "@/lib/globalSettings";

export default function AtencionClientePage() {
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const settings = loadGlobalSettings();
    setPhone(settings.customerSupport.phone);
  }, []);

  const cleanPhone = normalizePhone(phone);
  const hasPhone = cleanPhone.length > 0;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center">
            <HeadsetIcon className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text)]">Atención a cliente</h1>
        </div>
        <p className="text-[var(--color-muted-text)] text-sm ml-13">Soporte directo del equipo de Template A2</p>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <p className="font-semibold text-[var(--color-text)] mb-1">¿Tienes alguna duda o sugerencia?</p>
          <p className="text-sm text-[var(--color-muted-text)]">
            Comunícate con nuestro equipo de atención a cliente. Estamos disponibles para ayudarte con dudas, sugerencias, problemas técnicos o cualquier solicitud relacionada con tu plataforma.
          </p>
        </div>

        {hasPhone ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide">Número de contacto</p>
            <p className="text-xl font-bold text-[var(--color-text)]">{phone}</p>
            <div className="flex gap-3">
              <a
                href={`tel:${cleanPhone}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white py-3 rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                <Phone className="w-4 h-4" />
                Llamar
              </a>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] p-5 text-center">
            <p className="text-sm text-[var(--color-muted-text)]">El número de contacto no está disponible en este momento.</p>
            <p className="text-xs text-[var(--color-muted-text)]/60 mt-1">El administrador debe configurarlo desde el panel de administración.</p>
          </div>
        )}
      </div>
    </div>
  );
}
