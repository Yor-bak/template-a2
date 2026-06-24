"use client";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Trash2,
  Calendar,
  BanIcon,
  CalendarX,
  RotateCcw,
  User,
  AlertCircle,
} from "lucide-react";
import { useCalendar } from "@/contexts/CalendarContext";
import { appointments as seedApts } from "@/data/appointments";
import {
  getMonthGrid,
  MONTH_NAMES,
  DAY_LABELS,
  getWorkingHoursForDay,
  getDayOfWeek,
} from "@/services/calendarService";
import { DEMO_TODAY, STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { formatTime } from "@/lib/utils";
import { BlockTimeModal } from "@/components/calendar/BlockTimeModal";
import { CloseDayModal } from "@/components/calendar/CloseDayModal";

const FULL_DAY_NAMES = [
  "Domingo", "Lunes", "Martes", "Miércoles",
  "Jueves", "Viernes", "Sábado",
];
const MONTH_NAMES_GEN = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export default function CalendarioPage() {
  const [calYear, setCalYear] = useState(2025);
  const [calMonth, setCalMonth] = useState(5); // Junio
  const [selectedDate, setSelectedDate] = useState(DEMO_TODAY);
  const [tab] = useState<"agenda">("agenda");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const {
    availabilityRules,
    isDateClosed,
    getBlocksForDate,
    getClosedDay,
    removeManualBlock,
    reopenDay,
  } = useCalendar();

  const cells = getMonthGrid(calYear, calMonth);

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }

  const dow = getDayOfWeek(selectedDate);
  const workingRules = getWorkingHoursForDay(dow, availabilityRules);
  const dayBlocks = getBlocksForDate(selectedDate);
  const closedDay = getClosedDay(selectedDate);
  const dayApts = seedApts.filter((a) => a.desiredDate === selectedDate);

  const [selY, selM, selD] = selectedDate.split("-").map(Number);
  const dateLabel = `${FULL_DAY_NAMES[dow]}, ${selD} de ${MONTH_NAMES_GEN[selM - 1]} ${selY}`;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--color-text)]">Calendario</h1>
        <p className="text-[var(--color-muted-text)] text-sm">
          Gestiona tus horarios de atención, bloqueos y días no laborables.
        </p>
      </div>

      <div className="grid lg:grid-cols-[272px_1fr] gap-6 items-start">
        {/* ── PANEL IZQUIERDO ───────────────────────────────────── */}
        <div className="space-y-4">
          {/* Mini calendario */}
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-[var(--color-accent-soft)]/50 text-[var(--color-muted-text)] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-[var(--color-text)]">
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-[var(--color-accent-soft)]/50 text-[var(--color-muted-text)] transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cabecera días */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map((l) => (
                <div
                  key={l}
                  className="text-center text-[9px] font-bold text-[var(--color-muted-text)]/50 py-0.5"
                >
                  {l[0]}
                </div>
              ))}
            </div>

            {/* Cuadrícula */}
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((cell) => {
                const isSelected = cell.date === selectedDate;
                const isToday = cell.date === DEMO_TODAY;
                const isClosed = isDateClosed(cell.date);
                const hasApts = seedApts.some((a) => a.desiredDate === cell.date);

                return (
                  <button
                    key={cell.date}
                    onClick={() => setSelectedDate(cell.date)}
                    className={[
                      "aspect-square flex items-center justify-center rounded-lg text-[11px] transition-all relative",
                      !cell.isCurrentMonth ? "opacity-20 text-[var(--color-muted-text)]" : "",
                      isSelected
                        ? "bg-[var(--color-primary)] text-white font-bold"
                        : isToday
                        ? "ring-1 ring-[var(--color-accent)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-accent-soft)]/40"
                        : isClosed && cell.isCurrentMonth
                        ? "text-red-400 hover:bg-red-50/50 line-through"
                        : cell.isCurrentMonth
                        ? "text-[var(--color-text)] hover:bg-[var(--color-accent-soft)]/40"
                        : "",
                    ].join(" ")}
                  >
                    {cell.dayNumber}
                    {hasApts && !isSelected && cell.isCurrentMonth && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="space-y-2">
            <button
              onClick={() => setShowBlockModal(true)}
              className="w-full flex items-center gap-2.5 bg-white border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 rounded-xl text-sm font-semibold hover:bg-amber-50 hover:border-amber-200 transition-all shadow-sm"
            >
              <BanIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
              Bloquear horario
            </button>
            <button
              onClick={() => setShowCloseModal(true)}
              className="w-full flex items-center gap-2.5 bg-white border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 rounded-xl text-sm font-semibold hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
            >
              <CalendarX className="w-4 h-4 text-red-500 flex-shrink-0" />
              Cerrar día completo
            </button>
          </div>

          {/* Leyenda */}
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-[var(--color-muted-text)] uppercase tracking-wider mb-2.5">
              Leyenda
            </p>
            <div className="space-y-1.5 text-xs text-[var(--color-muted-text)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] flex-shrink-0" />
                Día con citas
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                Día cerrado
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border border-[var(--color-accent)] flex-shrink-0" />
                Hoy ({DEMO_TODAY})
              </div>
            </div>
          </div>
        </div>

        {/* ── PANEL DERECHO ─────────────────────────────────────── */}
        <div>

          {/* ── AGENDA DEL DÍA ──────────────────────────────────── */}
          {tab === "agenda" && (
            <div className="space-y-4">
              {/* Cabecera del día */}
              <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-[var(--color-text)] capitalize">
                      {dateLabel}
                    </h2>
                    <p className="text-xs text-[var(--color-muted-text)] mt-0.5">
                      {dayApts.length} cita{dayApts.length !== 1 ? "s" : ""} · {dayBlocks.length} bloqueo{dayBlocks.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {closedDay ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">
                        <CalendarX className="w-3.5 h-3.5" />
                        Cerrado{closedDay.reason ? ` — ${closedDay.reason}` : ""}
                      </span>
                      <button
                        onClick={() => reopenDay(selectedDate)}
                        className="flex items-center gap-1 text-xs text-[var(--color-muted-text)] hover:text-[var(--color-primary)] font-semibold transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reabrir
                      </button>
                    </div>
                  ) : workingRules.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {workingRules.map((r) => (
                        <span
                          key={r.id}
                          className="flex items-center gap-1 bg-[var(--color-accent-soft)] text-[var(--color-primary)] text-xs font-semibold px-2.5 py-1 rounded-full"
                        >
                          <Clock className="w-3 h-3" />
                          {r.startTime} – {r.endTime}
                          {r.blockLabel ? ` (${r.blockLabel})` : ""}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--color-muted-text)] bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                      Sin horario configurado
                    </span>
                  )}
                </div>
              </div>

              {/* Citas */}
              {dayApts.length > 0 && (
                <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-[#F0F4F5] flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[var(--color-primary)]" />
                    <h3 className="text-sm font-bold text-[var(--color-text)]">Citas del día</h3>
                    <span className="ml-auto text-xs text-[var(--color-muted-text)]">{dayApts.length}</span>
                  </div>
                  <div className="divide-y divide-[#F0F4F5]">
                    {dayApts
                      .slice()
                      .sort((a, b) => a.desiredTime.localeCompare(b.desiredTime))
                      .map((apt) => (
                        <div key={apt.id} className="px-5 py-3.5 flex items-center gap-4">
                          <div className="text-center flex-shrink-0 w-12">
                            <p className="text-sm font-bold text-[var(--color-primary)]">
                              {formatTime(apt.desiredTime)}
                            </p>
                            <p className="text-[10px] text-[var(--color-muted-text)]">
                              {apt.durationMinutes ?? 30}min
                            </p>
                          </div>
                          <div className="w-px h-8 bg-[var(--color-border)] flex-shrink-0" />
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0">
                              <User className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                                {apt.patientName}
                              </p>
                              <p className="text-xs text-[var(--color-muted-text)] truncate">{apt.serviceName}</p>
                            </div>
                          </div>
                          {apt.isEmergency && (
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[apt.status]}`}
                          >
                            {STATUS_LABELS[apt.status]}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Bloqueos manuales */}
              {dayBlocks.length > 0 && (
                <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-[#F0F4F5] flex items-center gap-2">
                    <BanIcon className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-[var(--color-text)]">Horarios bloqueados</h3>
                    <span className="ml-auto text-xs text-[var(--color-muted-text)]">{dayBlocks.length}</span>
                  </div>
                  <div className="divide-y divide-[#F0F4F5]">
                    {dayBlocks.map((block) => (
                      <div key={block.id} className="px-5 py-3.5 flex items-center gap-4">
                        <div className="w-28 flex-shrink-0">
                          <p className="text-sm font-bold text-amber-600">
                            {block.startTime} – {block.endTime}
                          </p>
                        </div>
                        <p className="flex-1 text-sm text-[var(--color-muted-text)]">
                          {block.reason ?? "Sin motivo"}
                        </p>
                        <button
                          onClick={() => removeManualBlock(block.id)}
                          title="Eliminar bloqueo"
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estado vacío */}
              {dayApts.length === 0 && dayBlocks.length === 0 && !closedDay && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-accent-soft)]/50 flex items-center justify-center mb-4">
                    <Calendar
                      className="w-7 h-7 text-[var(--color-primary)]/30"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="font-bold text-[var(--color-muted-text)] mb-1">Sin eventos para este día</p>
                  <p className="text-sm text-[var(--color-muted-text)]/60">
                    No hay citas, bloqueos ni restricciones configuradas.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modales */}
      {showBlockModal && (
        <BlockTimeModal
          defaultDate={selectedDate}
          onClose={() => setShowBlockModal(false)}
        />
      )}
      {showCloseModal && (
        <CloseDayModal
          defaultDate={selectedDate}
          onClose={() => setShowCloseModal(false)}
        />
      )}
    </div>
  );
}
