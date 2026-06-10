"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCalendar } from "@/contexts/CalendarContext";
import type { AvailabilityRule } from "@/types/calendar";

const DAY_META = [
  { dayOfWeek: 1, label: "Lunes" },
  { dayOfWeek: 2, label: "Martes" },
  { dayOfWeek: 3, label: "Miércoles" },
  { dayOfWeek: 4, label: "Jueves" },
  { dayOfWeek: 5, label: "Viernes" },
  { dayOfWeek: 6, label: "Sábado" },
  { dayOfWeek: 0, label: "Domingo" },
];

type DayRow = {
  dayOfWeek: number;
  label: string;
  isActive: boolean;
  block1Start: string;
  block1End: string;
  hasBlock2: boolean;
  block2Start: string;
  block2End: string;
};

function initRows(rules: AvailabilityRule[]): DayRow[] {
  return DAY_META.map(({ dayOfWeek, label }) => {
    const dayRules = rules.filter((r) => r.dayOfWeek === dayOfWeek && r.isActive);
    const r1 = dayRules[0];
    const r2 = dayRules[1];
    return {
      dayOfWeek,
      label,
      isActive: dayRules.length > 0,
      block1Start: r1?.startTime ?? "09:00",
      block1End: r1?.endTime ?? "14:00",
      hasBlock2: !!r2,
      block2Start: r2?.startTime ?? "16:00",
      block2End: r2?.endTime ?? "19:00",
    };
  });
}

function rowsToRules(rows: DayRow[]): AvailabilityRule[] {
  const result: AvailabilityRule[] = [];
  for (const row of rows) {
    if (!row.isActive) continue;
    result.push({
      id: `r-${row.dayOfWeek}-1`,
      dayOfWeek: row.dayOfWeek,
      isActive: true,
      startTime: row.block1Start,
      endTime: row.block1End,
      blockLabel: row.hasBlock2 ? "Mañana" : undefined,
    });
    if (row.hasBlock2) {
      result.push({
        id: `r-${row.dayOfWeek}-2`,
        dayOfWeek: row.dayOfWeek,
        isActive: true,
        startTime: row.block2Start,
        endTime: row.block2End,
        blockLabel: "Tarde",
      });
    }
  }
  return result;
}

export function WeeklyEditor() {
  const { availabilityRules, updateRules } = useCalendar();
  const [rows, setRows] = useState<DayRow[]>(() => initRows(availabilityRules));
  const [saved, setSaved] = useState(false);

  function update(idx: number, patch: Partial<DayRow>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function handleSave() {
    updateRules(rowsToRules(rows));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
        {rows.map((row, i) => (
          <div
            key={row.dayOfWeek}
            className={[
              "px-5 py-4 transition-colors",
              i < rows.length - 1 ? "border-b border-[#F0F4F5]" : "",
              !row.isActive ? "opacity-50" : "",
            ].join(" ")}
          >
            <div className="flex items-center gap-4 flex-wrap">
              {/* Toggle + Nombre del día */}
              <div className="flex items-center gap-3 w-32 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => update(i, { isActive: !row.isActive })}
                  className={[
                    "relative w-9 h-5 rounded-full transition-colors flex-shrink-0",
                    row.isActive ? "bg-[var(--color-accent)]" : "bg-gray-200",
                  ].join(" ")}
                  aria-label={row.isActive ? "Desactivar día" : "Activar día"}
                >
                  <span
                    className={[
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      row.isActive ? "translate-x-4" : "translate-x-0.5",
                    ].join(" ")}
                  />
                </button>
                <span className="text-sm font-semibold text-[var(--color-text)]">{row.label}</span>
              </div>

              {/* Bloques horarios */}
              {row.isActive && (
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  {/* Bloque 1 */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={row.block1Start}
                      onChange={(e) => update(i, { block1Start: e.target.value })}
                      className={timeInp}
                    />
                    <span className="text-[var(--color-muted-text)] text-xs">–</span>
                    <input
                      type="time"
                      value={row.block1End}
                      onChange={(e) => update(i, { block1End: e.target.value })}
                      className={timeInp}
                    />
                  </div>

                  {/* Bloque 2 o botón para añadirlo */}
                  {row.hasBlock2 ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--color-muted-text)] text-xs font-medium px-1">y</span>
                      <input
                        type="time"
                        value={row.block2Start}
                        onChange={(e) => update(i, { block2Start: e.target.value })}
                        className={timeInp}
                      />
                      <span className="text-[var(--color-muted-text)] text-xs">–</span>
                      <input
                        type="time"
                        value={row.block2End}
                        onChange={(e) => update(i, { block2End: e.target.value })}
                        className={timeInp}
                      />
                      <button
                        type="button"
                        onClick={() => update(i, { hasBlock2: false })}
                        className="text-sm text-red-400 hover:text-red-600 font-bold px-1 transition-colors"
                        title="Quitar turno tarde"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => update(i, { hasBlock2: true })}
                      className="text-xs text-[var(--color-accent)] font-semibold hover:text-[var(--color-primary)] transition-colors"
                    >
                      + Agregar turno tarde
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          className="bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm"
        >
          Guardar horarios
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Horarios guardados
          </span>
        )}
      </div>
    </div>
  );
}

const timeInp =
  "border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] bg-white transition-colors w-[5.5rem]";
