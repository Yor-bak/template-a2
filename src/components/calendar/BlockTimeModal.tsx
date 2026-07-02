"use client";
import { useState } from "react";
import { X, Clock } from "lucide-react";
import { useCalendar } from "@/contexts/CalendarContext";

interface Props {
  defaultDate?: string;
  onClose: () => void;
}

export function BlockTimeModal({ defaultDate = "", onClose }: Props) {
  const { addManualBlock } = useCalendar();
  const [form, setForm] = useState({
    date: defaultDate,
    startTime: "09:00",
    endTime: "10:00",
    reason: "",
  });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date) return setError("Selecciona una fecha");
    if (form.startTime >= form.endTime)
      return setError("La hora de fin debe ser mayor a la de inicio");
    addManualBlock({
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      reason: form.reason.trim() || undefined,
      isActive: true,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="font-bold text-[var(--color-text)] text-sm">Bloquear horario</h2>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted-text)] mb-1">Desde</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className={inp}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted-text)] mb-1">Hasta</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className={inp}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted-text)] mb-1">
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Ej. Comida, reunión, descanso..."
              className={inp}
            />
          </div>
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
              className="flex-1 bg-[var(--color-primary)] text-[var(--ds-primary-fg)] py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Bloquear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inp =
  "w-full border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] bg-white transition-colors";
