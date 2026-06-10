"use client";
import { useState } from "react";
import { X, CalendarX } from "lucide-react";
import { useCalendar } from "@/contexts/CalendarContext";
import { appointments } from "@/data/appointments";

interface Props {
  defaultDate?: string;
  onClose: () => void;
}

export function CloseDayModal({ defaultDate = "", onClose }: Props) {
  const { closeDay } = useCalendar();
  const [form, setForm] = useState({ date: defaultDate, reason: "" });
  const [error, setError] = useState("");

  const hasBlockingApts = form.date
    ? appointments.some(
        (a) =>
          a.desiredDate === form.date &&
          ["pending", "confirmed", "rescheduled"].includes(a.status)
      )
    : false;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date) return setError("Selecciona una fecha");
    closeDay(form.date, form.reason.trim() || undefined);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <CalendarX className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="font-bold text-[var(--color-text)] text-sm">Cerrar día completo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted-text)] mb-1">Fecha</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className={inp}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted-text)] mb-1">
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Ej. Día festivo, vacaciones, emergencia..."
              className={inp}
            />
          </div>
          {hasBlockingApts && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <CalendarX className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Esta fecha tiene citas pendientes o confirmadas. Asegúrate de notificar a tus pacientes antes de cerrar el día.
              </p>
            </div>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[var(--color-border)] text-[var(--color-muted-text)] py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
            >
              Cerrar día
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inp =
  "w-full border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] bg-white transition-colors";
