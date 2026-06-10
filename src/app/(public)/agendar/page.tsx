"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useServices } from "@/contexts/ServicesContext";
import { CheckCircle2, ChevronLeft, Clock, CalendarDays, AlertCircle, Info } from "lucide-react";
import { PublicDatePicker } from "@/components/calendar/PublicDatePicker";
import { PublicTimeSlotPicker } from "@/components/calendar/PublicTimeSlotPicker";

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


function AgendarForm() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("servicio");
  const { getPublicServices } = useServices();
  const services = getPublicServices();

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
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[var(--color-background)]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[var(--color-border)] shadow-lg p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--color-text)] mb-3">¡Solicitud recibida!</h2>
          <p className="text-[var(--color-muted-text)] text-sm leading-relaxed mb-2">
            Hola <strong className="text-[var(--color-text)]">{form.name}</strong>, recibimos tu solicitud de cita para{" "}
            <strong className="text-[var(--color-text)]">{selectedService?.name}</strong> el día{" "}
            <strong className="text-[var(--color-text)]">{form.date}</strong> a las{" "}
            <strong className="text-[var(--color-text)]">{form.time}</strong>.
          </p>
          <p className="text-[var(--color-muted-text)] text-sm mb-8">
            Te confirmaremos la disponibilidad por WhatsApp en breve.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Volver al inicio
            </Link>
            <button
              onClick={() => { setSubmitted(false); setForm(initialForm); }}
              className="border border-[var(--color-border)] text-[var(--color-muted-text)] py-3 rounded-xl font-semibold text-sm hover:bg-[var(--color-background)] transition-colors"
            >
              Hacer otra solicitud
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-start gap-3 bg-[var(--color-accent-soft)]/50 border border-[var(--color-accent)]/30 rounded-2xl p-4 mb-8">
          <Info className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[var(--color-primary)]">
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
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="w-4 h-4 text-[var(--color-primary)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)]">{selectedService.name}</p>
                    <p className="text-xs text-[var(--color-muted-text)] flex items-center gap-1">
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

              {selectedService ? (
                <div className="space-y-4">
                  <Field label="Fecha deseada" required error={errors.date}>
                    <PublicDatePicker
                      selectedDate={form.date}
                      onSelectDate={(d) => {
                        set("date", d);
                        set("time", "");
                      }}
                    />
                  </Field>

                  {form.date && (
                    <Field label="Hora deseada" required error={errors.time}>
                      <PublicTimeSlotPicker
                        date={form.date}
                        durationMin={selectedService.durationMinutes}
                        selectedTime={form.time}
                        onSelectTime={(t) => set("time", t)}
                      />
                    </Field>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-4 text-sm text-[var(--color-muted-text)]">
                  <CalendarDays className="w-4 h-4 text-[var(--color-muted-text)]/50 flex-shrink-0" />
                  Selecciona un servicio para ver los horarios disponibles.
                </div>
              )}

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
                  className="w-4 h-4 rounded border-[var(--color-border)] accent-red-500"
                />
                <span className="text-sm text-[var(--color-muted-text)] group-hover:text-[var(--color-text)] transition-colors font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  ¿Es una urgencia dental?
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.isFirstVisit}
                  onChange={(e) => set("isFirstVisit", e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-muted-text)] group-hover:text-[var(--color-text)] transition-colors font-medium">
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
            className="w-full bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold text-base hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg shadow-[var(--color-primary)]/20"
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
      <div className="w-6 h-6 rounded-full bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
        <span className="text-[var(--color-primary-dark)] text-xs font-extrabold">{step}</span>
      </div>
      <h2 className="font-bold text-[var(--color-text)] text-sm uppercase tracking-wider">{title}</h2>
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
      <label className="block text-sm font-medium text-[var(--color-muted-text)] mb-1.5">
        {label}{required && <span className="text-[var(--color-accent)] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full border ${hasError ? "border-red-300 bg-red-50 focus:ring-red-200" : "border-[var(--color-border)] bg-white focus:ring-[var(--color-accent-soft)]"} rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted-text)]/50 focus:outline-none focus:ring-2 focus:border-[var(--color-accent)] transition-colors`;
}

export default function AgendarPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-[var(--color-muted-text)]">Cargando...</div>}>
      <AgendarForm />
    </Suspense>
  );
}
