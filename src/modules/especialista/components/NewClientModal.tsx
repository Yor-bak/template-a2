"use client";
import { useState } from "react";
import { X, CheckCircle2, User } from "lucide-react";
import { patients } from "@/data/patients";
import type { Patient } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const inp = "w-full border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] bg-white transition-colors placeholder:text-[var(--color-muted-text)]/40";

export function NewClientModal({ open, onClose }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", dateOfBirth: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone", string>>>({});
  const [done, setDone] = useState(false);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.phone.trim()) e.phone = "El teléfono es requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const newPatient: Patient = {
      id: `p${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      dateOfBirth: form.dateOfBirth || undefined,
      firstVisitAt: new Date().toISOString().slice(0, 10),
      notes: form.notes.trim() || undefined,
      totalAppointments: 0,
      totalSpent: 0,
    };
    // Add to in-memory list (page reload resets — no backend yet)
    patients.push(newPatient);
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setForm({ name: "", phone: "", dateOfBirth: "", notes: "" });
      setErrors({});
      onClose();
    }, 1200);
  }

  function handleClose() {
    if (done) return;
    setForm({ name: "", phone: "", dateOfBirth: "", notes: "" });
    setErrors({});
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center">
              <User className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Nuevo cliente</h2>
              <p className="text-xs text-gray-400">Completa el formulario para registrarlo</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Éxito */}
        {done && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center gap-3 z-10">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <p className="font-bold text-gray-800">¡Cliente registrado!</p>
          </div>
        )}

        {/* Formulario */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide block mb-1.5">
              Nombre completo <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej. María López"
              className={inp}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide block mb-1.5">
              Teléfono <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="55 1234 5678"
              className={inp}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide block mb-1.5">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
              className={inp}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-muted-text)] uppercase tracking-wide block mb-1.5">
              Notas internas
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Observaciones, alergias, preferencias..."
              className={`${inp} resize-none`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-[var(--color-primary)] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Guardar cliente
          </button>
        </div>
      </div>
    </div>
  );
}
