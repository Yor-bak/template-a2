"use client";
import { useState } from "react";
import { clinic } from "@/data/clinic";
import type { ClinicPlan } from "@/types";
import { CheckCircle2, Bot, PenLine, Zap, Globe, Shield, DollarSign, BarChart3 } from "lucide-react";

const PLAN_FEATURES = {
  manual: [
    { icon: PenLine, text: "Registro manual de citas desde el dashboard" },
    { icon: CheckCircle2, text: "Gestión completa de estados (confirmar, finalizar, cancelar)" },
    { icon: DollarSign, text: "Control de pagos y montos" },
    { icon: BarChart3, text: "Reportes de ingresos y resumen mensual" },
    { icon: Globe, text: "Formulario público para solicitudes de pacientes" },
  ],
  ai_whatsapp: [
    { icon: PenLine, text: "Todo lo del Plan Agenda Manual" },
    { icon: Bot, text: "Creación automática de citas por WhatsApp con IA" },
    { icon: Zap, text: "Conversación asistida por IA para recopilación de datos" },
    { icon: Shield, text: "Resumen de conversación y metadata de IA" },
    { icon: Globe, text: "Integración con n8n para automatizaciones avanzadas" },
  ],
};

export default function ConfiguracionPage() {
  const [plan, setPlan] = useState<ClinicPlan>(clinic.plan);
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
        <p className="text-gray-500 text-sm">Edita la información y gestiona tu plan.</p>
      </div>

      {/* ── SECCIÓN DE PLAN ─────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-1 text-sm uppercase tracking-wide">Plan actual</h2>
        <p className="text-xs text-gray-400 mb-4">Cambia el plan para habilitar o deshabilitar funcionalidades.</p>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {/* Plan Manual */}
          <button
            type="button"
            onClick={() => setPlan("manual")}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              plan === "manual"
                ? "border-sky-500 bg-sky-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${plan === "manual" ? "bg-sky-100" : "bg-gray-100"}`}>
                <PenLine className={`w-3.5 h-3.5 ${plan === "manual" ? "text-sky-600" : "text-gray-500"}`} />
              </div>
              <span className={`font-bold text-sm ${plan === "manual" ? "text-sky-700" : "text-gray-700"}`}>
                Agenda Manual
              </span>
              {plan === "manual" && (
                <span className="ml-auto text-[10px] bg-sky-600 text-white px-2 py-0.5 rounded-full font-bold">Activo</span>
              )}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Registra citas manualmente. Ideal para dentistas que reciben pacientes por llamada o WhatsApp directo.
            </p>
          </button>

          {/* Plan IA WhatsApp */}
          <button
            type="button"
            onClick={() => setPlan("ai_whatsapp")}
            className={`text-left p-4 rounded-xl border-2 transition-all relative overflow-hidden ${
              plan === "ai_whatsapp"
                ? "border-violet-500 bg-violet-50"
                : "border-gray-200 hover:border-violet-200 bg-white"
            }`}
          >
            {plan !== "ai_whatsapp" && (
              <div className="absolute top-2 right-2 text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">Pro</div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${plan === "ai_whatsapp" ? "bg-violet-100" : "bg-gray-100"}`}>
                <Bot className={`w-3.5 h-3.5 ${plan === "ai_whatsapp" ? "text-violet-600" : "text-gray-500"}`} />
              </div>
              <span className={`font-bold text-sm ${plan === "ai_whatsapp" ? "text-violet-700" : "text-gray-700"}`}>
                Agenda Inteligente
              </span>
              {plan === "ai_whatsapp" && (
                <span className="ml-auto text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded-full font-bold">Activo</span>
              )}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Una IA conversa con tus pacientes por WhatsApp y crea citas automáticamente en tu panel.
            </p>
          </button>
        </div>

        {/* Características del plan seleccionado */}
        <div className={`rounded-xl p-4 ${plan === "ai_whatsapp" ? "bg-violet-50 border border-violet-100" : "bg-gray-50 border border-gray-100"}`}>
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan === "ai_whatsapp" ? "text-violet-600" : "text-gray-500"}`}>
            Incluye en tu plan
          </p>
          <ul className="space-y-2">
            {PLAN_FEATURES[plan].map((feat, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                <feat.icon className={`w-3.5 h-3.5 flex-shrink-0 ${plan === "ai_whatsapp" ? "text-violet-500" : "text-sky-500"}`} />
                {feat.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── FORMULARIO ─────────────────────────────────────────── */}
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
            {plan === "ai_whatsapp" && " Con el plan Agenda Inteligente, n8n también puede crear citas mediante el endpoint de IA."}
          </p>
          {plan === "ai_whatsapp" && (
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
              <p className="text-xs text-violet-700 font-semibold mb-1">Endpoint para IA WhatsApp</p>
              <code className="text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded">
                POST /api/integrations/whatsapp-ai/appointments
              </code>
              <p className="text-xs text-violet-500 mt-1">
                n8n puede enviar citas a este endpoint y aparecerán automáticamente en tu dashboard.
              </p>
            </div>
          )}
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
