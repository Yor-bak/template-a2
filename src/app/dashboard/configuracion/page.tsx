"use client";
import { useState } from "react";
import { clinic } from "@/data/clinic";
import { CheckCircle2 } from "lucide-react";

export default function ConfiguracionPage() {
  const [form, setForm] = useState({
    dentistName: clinic.dentistName,
    professionalLicense: clinic.professionalLicense,
    clinicName: clinic.name,
    address: clinic.address,
    phone: clinic.phone,
    whatsapp: clinic.whatsapp,
    email: clinic.email,
    googleMapsUrl: clinic.googleMapsUrl,
    welcomeMessage: clinic.welcomeMessage,
    showPrices: clinic.showPrices,
    n8nWebhookUrl: "",
  });
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Configuración del consultorio</h1>
        <p className="text-gray-500 text-sm">Edita la información que se muestra en tu página pública.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Section title="Datos del dentista">
          <Field label="Nombre del dentista">
            <input value={form.dentistName} onChange={(e) => set("dentistName", e.target.value)} className={inp} />
          </Field>
          <Field label="Cédula profesional">
            <input value={form.professionalLicense} onChange={(e) => set("professionalLicense", e.target.value)} className={inp} />
          </Field>
        </Section>

        <Section title="Consultorio">
          <Field label="Nombre del consultorio">
            <input value={form.clinicName} onChange={(e) => set("clinicName", e.target.value)} className={inp} />
          </Field>
          <Field label="Dirección">
            <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inp} />
          </Field>
          <Field label="Mensaje de bienvenida">
            <textarea value={form.welcomeMessage} onChange={(e) => set("welcomeMessage", e.target.value)} rows={3} className={inp} />
          </Field>
          <Field label="URL de Google Maps">
            <input value={form.googleMapsUrl} onChange={(e) => set("googleMapsUrl", e.target.value)} className={inp} />
          </Field>
        </Section>

        <Section title="Contacto">
          <Field label="Teléfono">
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inp} />
          </Field>
          <Field label="WhatsApp (solo números)">
            <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inp} />
          </Field>
          <Field label="Correo electrónico">
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inp} />
          </Field>
        </Section>

        <Section title="Preferencias">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showPrices"
              checked={form.showPrices}
              onChange={(e) => set("showPrices", e.target.checked)}
              className="w-4 h-4 accent-sky-500"
            />
            <label htmlFor="showPrices" className="text-sm text-gray-700 font-medium">
              Mostrar precios en la página pública
            </label>
          </div>
        </Section>

        <Section title="Automatizaciones (n8n)">
          <Field label="URL del webhook de n8n (opcional)">
            <input
              value={form.n8nWebhookUrl}
              onChange={(e) => set("n8nWebhookUrl", e.target.value)}
              placeholder="https://tu-n8n.com/webhook/xxx"
              className={inp}
            />
          </Field>
          <p className="text-xs text-gray-400">
            Si se configura, el sistema enviará eventos de citas a n8n para automatizar mensajes de WhatsApp.
          </p>
        </Section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="bg-sky-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-sky-700 transition-colors"
          >
            Guardar cambios
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Cambios guardados
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

const inp =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
