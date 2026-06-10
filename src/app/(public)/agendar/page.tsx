"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { services } from "@/data/services";
import { CheckCircle2, ChevronLeft, Clock, CalendarDays, AlertCircle, Info } from "lucide-react";

type FormData = {
  name: string;
  phone: string;
  serviceId: string;
  date: string;
  time: string;
  reason: string;
  isEmergency: boolean;
  isFirstVisit: boolean;
  comments: string;
};

const initialForm: FormData = {
  name: "",
  phone: "",
  serviceId: "",
  date: "",
  time: "",
  reason: "",
  isEmergency: false,
  isFirstVisit: true,
  comments: "",
};

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
];

function AgendarForm() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("servicio");

  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (preselected) {
      const svc = services.find((s) => s.slug === preselected);
      if (svc) {
        setForm((f) => ({ ...f, serviceId: svc.id, isEmergency: svc.isEmergency }));
      }
    }
  }, [preselected]);

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.phone.trim()) e.phone = "El teléfono es requerido";
    if (!form.serviceId) e.serviceId = "Selecciona un servicio";
    if (!form.date) e.date = "Selecciona una fecha";
    if (!form.time) e.time = "Selecciona una hora";
    if (!form.reason.trim()) e.reason = "Describe brevemente el motivo";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  }

  function set(field: keyof FormData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  }

  const selectedService = services.find((s) => s.id === form.serviceId);

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#FAFAF7]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8ECEF] shadow-lg p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-[#BFEAF5] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[#173B45]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#102A33] mb-3">¡Solicitud recibida!</h2>
          <p className="text-[#5F737C] text-sm leading-relaxed mb-2">
            Hola <strong className="text-[#102A33]">{form.name}</strong>, recibimos tu solicitud de cita para{" "}
            <strong className="text-[#102A33]">{selectedService?.name}</strong> el día{" "}
            <strong className="text-[#102A33]">{form.date}</strong> a las{" "}
            <strong className="text-[#102A33]">{form.time}</strong>.
          </p>
          <p className="text-[#5F737C] text-sm mb-8">
            Te confirmaremos la disponibilidad por WhatsApp en breve.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="bg-[#173B45] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#0E2F3A] transition-colors"
            >
              Volver al inicio
            </Link>
            <button
              onClick={() => { setSubmitted(false); setForm(initialForm); }}
              className="border border-[#E8ECEF] text-[#5F737C] py-3 rounded-xl font-semibold text-sm hover:bg-[#FAFAF7] transition-colors"
            >
              Hacer otra solicitud
            </button>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

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
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/servicios" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Volver a servicios
          </Link>
          <h1 className="text-3xl font-extrabold text-white mb-2">Solicitar cita</h1>
          <p className="text-white/60">Completa el formulario y te confirmaremos tu cita en breve.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Aviso */}
        <div className="flex items-start gap-3 bg-[#BFEAF5]/50 border border-[#70D6C7]/30 rounded-2xl p-4 mb-8">
          <Info className="w-4 h-4 text-[#173B45] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#173B45]">
            <strong>Importante:</strong> Al enviar este formulario no queda confirmada automáticamente tu cita. Te enviaremos confirmación por WhatsApp en un plazo breve.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Datos personales */}
          <section>
            <SectionHeader step={1} title="Datos personales" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nombre completo" required error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Ej. Ana García"
                  className={inputCls(!!errors.name)}
                />
              </Field>
              <Field label="Teléfono / WhatsApp" required error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="55 1234 5678"
                  className={inputCls(!!errors.phone)}
                />
              </Field>
            </div>
          </section>

          {/* Detalles de la cita */}
          <section>
            <SectionHeader step={2} title="Detalles de la cita" />
            <div className="space-y-4">
              <Field label="Servicio" required error={errors.serviceId}>
                <select
                  value={form.serviceId}
                  onChange={(e) => set("serviceId", e.target.value)}
                  className={inputCls(!!errors.serviceId)}
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </Field>

              {/* Vista previa del servicio */}
              {selectedService && (
                <div className="bg-white border border-[#E8ECEF] rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#BFEAF5] flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="w-4 h-4 text-[#173B45]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#102A33]">{selectedService.name}</p>
                    <p className="text-xs text-[#5F737C] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedService.durationMinutes} min aprox.
                    </p>
                  </div>
                  {selectedService.isEmergency && (
                    <span className="ml-auto text-xs bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                      Urgencia
                    </span>
                  )}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Fecha deseada" required error={errors.date}>
                  <input
                    type="date"
                    value={form.date}
                    min={today}
                    onChange={(e) => set("date", e.target.value)}
                    className={inputCls(!!errors.date)}
                  />
                </Field>
                <Field label="Hora deseada" required error={errors.time}>
                  <select
                    value={form.time}
                    onChange={(e) => set("time", e.target.value)}
                    className={inputCls(!!errors.time)}
                  >
                    <option value="">Selecciona una hora</option>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Motivo de consulta" required error={errors.reason}>
                <textarea
                  value={form.reason}
                  onChange={(e) => set("reason", e.target.value)}
                  placeholder="Describe brevemente el motivo de tu visita..."
                  rows={3}
                  className={inputCls(!!errors.reason)}
                />
              </Field>
            </div>
          </section>

          {/* Info adicional */}
          <section>
            <SectionHeader step={3} title="Información adicional" />
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.isEmergency}
                  onChange={(e) => set("isEmergency", e.target.checked)}
                  className="w-4 h-4 rounded border-[#E8ECEF] accent-red-500"
                />
                <span className="text-sm text-[#5F737C] group-hover:text-[#102A33] transition-colors font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  ¿Es una urgencia dental?
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.isFirstVisit}
                  onChange={(e) => set("isFirstVisit", e.target.checked)}
                  className="w-4 h-4 rounded border-[#E8ECEF] accent-[#173B45]"
                />
                <span className="text-sm text-[#5F737C] group-hover:text-[#102A33] transition-colors font-medium">
                  Primera vez en la clínica
                </span>
              </label>
              <Field label="Comentarios adicionales (opcional)">
                <textarea
                  value={form.comments}
                  onChange={(e) => set("comments", e.target.value)}
                  placeholder="¿Algo más que debamos saber antes de tu cita?"
                  rows={2}
                  className={inputCls(false)}
                />
              </Field>
            </div>
          </section>

          <button
            type="submit"
            className="w-full bg-[#173B45] text-white py-4 rounded-xl font-bold text-base hover:bg-[#0E2F3A] transition-colors shadow-lg shadow-[#173B45]/20"
          >
            Enviar solicitud de cita
          </button>
        </form>
      </div>
    </div>
  );
}

function SectionHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded-full bg-[#70D6C7] flex items-center justify-center flex-shrink-0">
        <span className="text-[#0E2F3A] text-xs font-extrabold">{step}</span>
      </div>
      <h2 className="font-bold text-[#102A33] text-sm uppercase tracking-wider">{title}</h2>
    </div>
  );
}

function Field({
  label, required, error, children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#5F737C] mb-1.5">
        {label}{required && <span className="text-[#70D6C7] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full border ${hasError ? "border-red-300 bg-red-50 focus:ring-red-200" : "border-[#E8ECEF] bg-white focus:ring-[#BFEAF5]"} rounded-xl px-4 py-2.5 text-sm text-[#102A33] placeholder:text-[#5F737C]/50 focus:outline-none focus:ring-2 focus:border-[#70D6C7] transition-colors`;
}

export default function AgendarPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-[#5F737C]">Cargando...</div>}>
      <AgendarForm />
    </Suspense>
  );
}
