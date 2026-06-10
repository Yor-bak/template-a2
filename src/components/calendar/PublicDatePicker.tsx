"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getMonthGrid,
  isPastDate,
  MONTH_NAMES,
  DAY_LABELS,
} from "@/services/calendarService";
import { DEMO_TODAY } from "@/lib/constants";
import { useCalendar } from "@/contexts/CalendarContext";

interface Props {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function PublicDatePicker({ selectedDate, onSelectDate }: Props) {
  const today = DEMO_TODAY;
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(5); // Junio 2025
  const { isDayAvailableForBooking } = useCalendar();

  const cells = getMonthGrid(year, month);

  function prevMonth() {
    if (year === 2025 && month === 5) return; // no retroceder antes de hoy
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const canGoPrev = !(year === 2025 && month === 5);

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4">
      {/* Navegación de mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="p-1.5 rounded-lg hover:bg-[var(--color-accent-soft)]/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[var(--color-muted-text)]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-[var(--color-text)]">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-[var(--color-accent-soft)]/50 transition-colors text-[var(--color-muted-text)]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Encabezado de días */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-[var(--color-muted-text)]/60 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Cuadrícula */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell) => {
          const past = isPastDate(cell.date, today);
          const unavailable = !isDayAvailableForBooking(cell.date);
          const disabled = past || unavailable || !cell.isCurrentMonth;
          const selected = cell.date === selectedDate;
          const isToday = cell.date === today;

          return (
            <button
              key={cell.date}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(cell.date)}
              className={[
                "aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all",
                !cell.isCurrentMonth ? "opacity-25 pointer-events-none" : "",
                disabled && cell.isCurrentMonth
                  ? "opacity-30 cursor-not-allowed text-[var(--color-muted-text)]"
                  : selected
                  ? "bg-[var(--color-primary)] text-white font-bold shadow-sm"
                  : isToday
                  ? "ring-1 ring-[var(--color-accent)] text-[var(--color-text)] hover:bg-[var(--color-accent-soft)]/60"
                  : "text-[var(--color-text)] hover:bg-[var(--color-accent-soft)]/50",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {cell.dayNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
