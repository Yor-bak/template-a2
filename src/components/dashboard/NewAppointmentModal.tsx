"use client";
import { useState, useEffect } from "react";
import { X, CheckCircle2, PenLine } from "lucide-react";
import { services } from "@/data/services";
import type { Appointment, AppointmentStatus, PreferredContact } from "@/types";
import { DEMO_TODAY, TIME_SLOTS } from "@/lib/constants";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (apt: Appointment) => void;
}

type FormData = {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  serviceId: string;
  durationMinutes: string;
  desiredDate: string;
  desiredTime: string;
  reason: string;
  isEmergency: boolean;
  isFirstVisit: boolean;
  preferredContact: PreferredContact;
  estimatedAmount: string;
  initialStatus: "pending" | "confirmed";
  internalNotes: string;
};

const empty: FormData = {
  patientName: "",
  patientPhone: "",
  patientEmail: "",
  serviceId: "",
  durationMinutes: "",
  desiredDate: "",
  desiredTime: "",
  reason: "",
  isEmergency: false,
  isFirstVisit: true,
  preferredContact: "whatsapp",
  estimatedAmount: "",
  initialStatus: "pending",
  internalNotes: "",
};

export function NewAppointmentModal({ open, onClose, onAdd }: Props) {
  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [done, setDone] = useState(false);

  // Autocompletar duración al elegir servicio
  useEffect(() => {
    if (!form.serviceId) return;
    const svc = services.find((s) => s.id === form.serviceId);
    if (svc) {
      setForm((f) => ({
        ...f,
        durationMinutes: String(svc.durationMinutes),
        isEmergency: svc.isEmergency,
        estimatedAmount: f.estimatedAmount || String(svc.estimatedPrice ?? ""),
      }));
    }
  }, [form.serviceId]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.patientName.trim()) e.patientName = "Requerido";
    if (!form.patientPhone.trim()) e.patientPhone = "Requerido";
    if (!form.serviceId) e.serviceId = "Selecciona un servicio";
    if (!form.desiredDate) e.desiredDate = "Requerido";
    if (!form.desiredTime) e.desiredTime = "Requerido";
    if (!form.reason.trim()) e.reason = "Requerido";
    const dur = Number(form.durationMinutes);
    if (isNaN(dur) || dur <= 0) e.durationMinutes = "Debe ser mayor a 0";
    if (form.estimatedAmount && Number(form.estimatedAmount) < 0) e.estimatedAmount = "No puede ser negativo";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const svc = services.find((s) => s.id === form.serviceId)!;
    const now = new Date().toISOString();
    const newApt: Appointment = {
      id: `manual_${Date.now()}`,
      patientId: `pat_${form.patientPhone.replace(/\s/g, "")}`,
      patientName: form.patientName.trim(),
      patientPhone: form.patientPhone.trim(),
      patientEmail: form.patientEmail.trim(),
      serviceId: form.serviceId,
      serviceName: svc.name,
      durationMinutes: Number(form.durationMinutes),
      desiredDate: form.desiredDate,
      desiredTime: form.desiredTime,
      reason: form.reason.trim(),
      isEmergency: form.isEmergency,
      isFirstVisit: form.isFirstVisit,
      preferredContact: form.preferredContact,
      status: form.initialStatus as AppointmentStatus,
      paymentStatus: "unpaid",
      estimatedAmount: form.estimatedAmount ? Number(form.estimatedAmount) : undefined,
      internalNotes: form.internalNotes.trim(),
      statusHistory:
        form.initialStatus === "confirmed"
          ? [
              {
                id: `sh_${Date.now()}`,
                oldStatus: "pending",
                newStatus: "confirmed",
                changedBy: "Dra. Mariana López",
                note: "Confirmada al registrar manualmente",
                createdAt: now,
              },
            ]
          : [],
      createdAt: now,
      source: "manual",
      createdBy: "dentist",
    };

    onAdd(newApt);
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setForm(empty);
      setErrors({});
      onClose();
    }, 1200);
  }

  function handleClose() {
    setForm(empty);
    setErrors({});
    setDone(false);
    onClose();
  }

  if (!open) return null;

  const selectedService = services.find((s) => s.id === form.serviceId);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Drawer / panel */}
      <div className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center">
              <PenLine className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Agregar cita manual</h2>
              <p className="text-xs text-gray-400">Registrada por el dentista</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Éxito */}
        {done && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center gap-3 z-10">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <p className="font-bold text-gray-800">¡Cita registrada!</p>
            <p className="text-sm text-gray-500">Cerrando formulario...</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Paciente */}
          <FormSection title="Datos del paciente">
            <Field label="Nombre completo" required error={errors.patientName}>
              <input value={form.patientName} onChange={(e) => set("patientName", e.target.value)} placeholder="Ej. María López" className={inp(!!errors.patientName)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Teléfono / WhatsApp" required error={errors.patientPhone}>
                <input value={form.patientPhone} onChange={(e) => set("patientPhone", e.target.value)} placeholder="55 1234 5678" className={inp(!!errors.patientPhone)} />
              </Field>
              <Field label="Correo (opcional)">
                <input type="email" value={form.patientEmail} onChange={(e) => set("patientEmail", e.target.value)} placeholder="correo@email.com" className={inp(false)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contacto preferido">
                <select value={form.preferredContact} onChange={(e) => set("preferredContact", e.target.value as PreferredContact)} className={inp(false)}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="call">Llamada</option>
                  <option value="email">Correo</option>
                </select>
              </Field>
              <div className="flex flex-col justify-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={form.isFirstVisit} onChange={(e) => set("isFirstVisit", e.target.checked)} className="w-4 h-4 accent-sky-500" />
                  Primera visita
                </label>
              </div>
            </div>
          </FormSection>

          {/* Cita */}
          <FormSection title="Detalles de la cita">
            <Field label="Servicio" required error={errors.serviceId}>
              <select value={form.serviceId} onChange={(e) => set("serviceId", e.target.value)} className={inp(!!errors.serviceId)}>
                <option value="">Selecciona un servicio</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
            {selectedService && (
              <p className="text-xs text-gray-400 -mt-2">
                Duración estimada: {selectedService.durationMinutes} min — {selectedService.isEmergency ? "🚨 Urgencia" : "Rutina"}
              </p>
            )}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Fecha" required error={errors.desiredDate}>
                <input type="date" value={form.desiredDate} onChange={(e) => set("desiredDate", e.target.value)} className={inp(!!errors.desiredDate)} />
              </Field>
              <Field label="Hora" required error={errors.desiredTime}>
                <select value={form.desiredTime} onChange={(e) => set("desiredTime", e.target.value)} className={inp(!!errors.desiredTime)}>
                  <option value="">—</option>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Duración (min)" error={errors.durationMinutes}>
                <input type="number" min={1} value={form.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} placeholder="45" className={inp(!!errors.durationMinutes)} />
              </Field>
            </div>
            <Field label="Motivo de consulta" required error={errors.reason}>
              <textarea value={form.reason} onChange={(e) => set("reason", e.target.value)} placeholder="Describe el motivo brevemente..." rows={2} className={inp(!!errors.reason)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Monto estimado (MXN)" error={errors.estimatedAmount}>
                <input type="number" min={0} value={form.estimatedAmount} onChange={(e) => set("estimatedAmount", e.target.value)} placeholder="0" className={inp(!!errors.estimatedAmount)} />
              </Field>
              <Field label="Estado inicial">
                <select value={form.initialStatus} onChange={(e) => set("initialStatus", e.target.value as "pending" | "confirmed")} className={inp(false)}>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                </select>
              </Field>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={form.isEmergency} onChange={(e) => set("isEmergency", e.target.checked)} className="w-4 h-4 accent-red-500" />
              <span className="text-red-600 font-medium">¿Es urgencia?</span>
            </label>
          </FormSection>

          {/* Notas internas */}
          <FormSection title="Notas internas">
            <Field label="Notas (no visibles para el paciente)">
              <textarea value={form.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} placeholder="Ej. Paciente llamó a las 9am, requiere anestesia especial..." rows={2} className={inp(false)} />
            </Field>
          </FormSection>
        </form>

        {/* Footer fijo */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3 bg-white">
          <button type="button" onClick={handleClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="flex-1 bg-sky-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-sky-700 transition-colors">
            Registrar cita
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-sky-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

function inp(hasError: boolean) {
  return `w-full border ${hasError ? "border-red-300 bg-red-50" : "border-gray-200"} rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-colors bg-white`;
}
