"use client";
import { Clock } from "lucide-react";
import { useCalendar } from "@/contexts/CalendarContext";
import { appointments } from "@/data/appointments";

interface Props {
  date: string;
  durationMin: number;
  selectedTime: string;
  onSelectTime: (time: string) => void;
}

export function PublicTimeSlotPicker({ date, durationMin, selectedTime, onSelectTime }: Props) {
  const { getAvailableSlots } = useCalendar();
  const slots = getAvailableSlots(date, durationMin, appointments);

  if (slots.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
        <Clock className="w-5 h-5 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-amber-800">Sin horarios disponibles</p>
        <p className="text-xs text-amber-600 mt-0.5">No hay horarios libres para esta fecha. Elige otro día.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-bold text-[var(--color-muted-text)]/70 uppercase tracking-wider mb-2.5">
        Elige un horario — {slots.length} disponible{slots.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => onSelectTime(slot)}
            className={[
              "py-2.5 rounded-xl text-sm font-semibold border transition-all",
              selectedTime === slot
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                : "bg-white border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-accent-soft)]/50 hover:border-[var(--color-accent)]",
            ].join(" ")}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
}
