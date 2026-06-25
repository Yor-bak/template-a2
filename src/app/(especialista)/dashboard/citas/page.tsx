"use client";
import { useState } from "react";
import Link from "next/link";
import { appointments as seed } from "@/data/appointments";
import type { Appointment, AppointmentStatus, PaymentStatus } from "@/types";
import { formatShortDate, formatTime, formatCurrency } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, PAYMENT_COLORS, PAYMENT_LABELS, DEMO_TODAY } from "@/lib/constants";
import { filterAppointments, hasAppointmentPassed, type StatusFilter } from "@/modules/especialista/appointments/utils/filters";
import { NewAppointmentModal } from "@/modules/especialista/components/NewAppointmentModal";
import { SourceBadge } from "@/modules/especialista/components/SourceBadge";
import { Search, Filter, AlertCircle, CalendarDays, Plus, Download, Globe, PenLine, Bot, Phone, DollarSign } from "lucide-react";
import { exportToCSV } from "@/lib/exportUtils";
import {
  triggerAutomationEvent,
  buildAppointmentPayload,
  AUTOMATION_EVENTS,
} from "@/services/automationService";

const filterTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "today", label: "Hoy" },
  { value: "this_week", label: "Esta semana" },
  { value: "this_month", label: "Este mes" },
  { value: "pending", label: "Pendientes" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "completed", label: "Finalizadas" },
  { value: "cancelled", label: "Canceladas" },
  { value: "no_show", label: "No asistió" },
  { value: "paid", label: "Pagadas" },
  { value: "unpaid", label: "Sin pagar" },
];

const sourceTabs: { value: StatusFilter; label: string; icon: React.ElementType }[] = [
  { value: "source_web",    label: "Web",        icon: Globe   },
  { value: "source_manual", label: "Manual",     icon: PenLine },
  { value: "source_ai",     label: "IA WhatsApp", icon: Bot    },
];

export default function CitasPage() {
  const [apts, setApts] = useState<Appointment[]>(seed);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    id: string;
    status: AppointmentStatus;
    message: string;
  } | null>(null);

  const list = filterAppointments(apts, filter, search);

  function applyStatus(id: string, status: AppointmentStatus) {
    setApts((prev) => {
      const next = prev.map((a) =>
        a.id !== id
          ? a
          : {
              ...a,
              status,
              statusHistory: [
                ...a.statusHistory,
                {
                  id: `sh_${Date.now()}`,
                  oldStatus: a.status,
                  newStatus: status,
                  changedBy: "Dra. Mariana López",
                  createdAt: new Date().toISOString(),
                },
              ],
            }
      );
      const updated = next.find((a) => a.id === id);
      if (updated) {
        const eventMap: Partial<Record<AppointmentStatus, string>> = {
          confirmed: AUTOMATION_EVENTS.APPOINTMENT_CONFIRMED,
          rejected: AUTOMATION_EVENTS.APPOINTMENT_REJECTED,
          cancelled: AUTOMATION_EVENTS.APPOINTMENT_CANCELLED,
          rescheduled: AUTOMATION_EVENTS.APPOINTMENT_RESCHEDULED,
          completed: AUTOMATION_EVENTS.APPOINTMENT_COMPLETED,
          no_show: AUTOMATION_EVENTS.APPOINTMENT_NO_SHOW,
        };
        const ev = eventMap[status];
        if (ev) void triggerAutomationEvent(ev as Parameters<typeof triggerAutomationEvent>[0], buildAppointmentPayload(updated));
      }
      return next;
    });
  }

  function requestStatus(apt: Appointment, status: AppointmentStatus) {
    if (status === "completed" && !hasAppointmentPassed(apt.desiredDate, apt.desiredTime)) {
      setConfirmModal({
        id: apt.id,
        status,
        message: `Esta cita está programada para el ${formatShortDate(apt.desiredDate)} a las ${formatTime(apt.desiredTime)} y aún no ha pasado. ¿Seguro que deseas marcarla como finalizada?`,
      });
      return;
    }
    applyStatus(apt.id, status);
  }

  function updatePayment(id: string, paymentStatus: PaymentStatus) {
    setApts((prev) => {
      const next = prev.map((a) =>
        a.id !== id
          ? a
          : { ...a, paymentStatus, paidAt: paymentStatus === "paid" ? DEMO_TODAY : a.paidAt }
      );
      const updated = next.find((a) => a.id === id);
      if (updated) {
        const ev = paymentStatus === "paid"
          ? AUTOMATION_EVENTS.PAYMENT_MARKED_PAID
          : paymentStatus === "partial"
          ? AUTOMATION_EVENTS.PAYMENT_MARKED_PARTIAL
          : null;
        if (ev) void triggerAutomationEvent(ev, buildAppointmentPayload(updated));
      }
      return next;
    });
  }

  function handleAddAppointment(apt: Appointment) {
    setApts((prev) => [apt, ...prev]);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--ds-text)]">Citas</h1>
          <p className="text-[var(--ds-text-muted)] text-sm">Organiza tu agenda diaria y da seguimiento a cada cliente.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV("citas", [
              ["Cliente", "Servicio", "Fecha", "Hora", "Estado", "Pago", "Monto"],
              ...apts.map((a) => [a.patientName, a.serviceName, a.desiredDate, a.desiredTime, STATUS_LABELS[a.status], PAYMENT_LABELS[a.paymentStatus], a.chargedAmount ?? a.estimatedAmount ?? 0]),
            ])}
            className="inline-flex items-center gap-2 border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--ds-bg)] transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[var(--ds-primary)] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--ds-primary)] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar cita
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-[var(--ds-surface)] rounded-2xl border border-[var(--ds-border)] shadow-sm p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-text-muted)]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente, servicio o teléfono..."
              className="w-full pl-9 pr-4 py-2.5 border border-[var(--ds-border)] rounded-xl text-sm text-[var(--ds-text)] placeholder:text-[var(--ds-text-muted)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--ds-ring)]/40 focus:border-[var(--ds-ring)] bg-[var(--ds-bg)] transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 text-sm text-[var(--ds-text-muted)] flex-shrink-0">
            <Filter className="w-4 h-4" />
            <span>{list.length} resultado{list.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Filtros de estado */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {filterTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === t.value
                  ? "bg-[var(--ds-primary)] text-white"
                  : "bg-[#F0F4F5] text-[var(--ds-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--ds-text)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filtros de origen */}
        <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-[var(--ds-border)]">
          <span className="text-[11px] text-[var(--ds-text-muted)]/60 font-medium self-center mr-1">Por origen:</span>
          {sourceTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(filter === t.value ? "all" : t.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                filter === t.value
                  ? "bg-[var(--ds-primary)] text-white"
                  : "bg-[var(--ds-bg)] border border-[var(--ds-border)] text-[var(--ds-text-muted)] hover:bg-[#F0F4F5]"
              }`}
            >
              <t.icon className="w-3 h-3" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <CalendarDays className="w-10 h-10 mb-3 opacity-30" strokeWidth={1.5} />
          <p className="font-medium text-sm">Sin citas para este filtro</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((apt) => (
            <div
              key={apt.id}
              className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm p-5 hover:shadow-md hover:border-[var(--color-accent)]/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Link
                      href={`/dashboard/citas/${apt.id}`}
                      className="font-bold text-gray-900 hover:text-sky-600 transition-colors"
                    >
                      {apt.patientName}
                    </Link>
                    {apt.isEmergency && (
                      <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Urgencia
                      </span>
                    )}
                    {apt.isFirstVisit && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        Primera vez
                      </span>
                    )}
                    <SourceBadge source={apt.source} />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{apt.serviceName}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatShortDate(apt.desiredDate)} · {formatTime(apt.desiredTime)}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{apt.patientPhone}</span>
                    {apt.estimatedAmount && (
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatCurrency(apt.estimatedAmount)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[apt.status]}`}>
                    {STATUS_LABELS[apt.status]}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PAYMENT_COLORS[apt.paymentStatus]}`}>
                    {PAYMENT_LABELS[apt.paymentStatus]}
                  </span>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="mt-4 pt-3 border-t border-gray-50 flex flex-wrap gap-2">
                {apt.status === "pending" && (
                  <>
                    <Btn color="green" onClick={() => applyStatus(apt.id, "confirmed")}>Confirmar</Btn>
                    <Btn color="red" onClick={() => applyStatus(apt.id, "rejected")}>Rechazar</Btn>
                  </>
                )}
                {apt.status === "confirmed" && (
                  <>
                    <Btn color="teal" onClick={() => requestStatus(apt, "completed")}>Finalizar</Btn>
                    <Btn color="orange" onClick={() => applyStatus(apt.id, "no_show")}>No asistió</Btn>
                    <Btn color="gray" onClick={() => applyStatus(apt.id, "cancelled")}>Cancelar</Btn>
                  </>
                )}
                {apt.paymentStatus === "unpaid" && ["confirmed", "completed"].includes(apt.status) && (
                  <>
                    <Btn color="blue" onClick={() => updatePayment(apt.id, "paid")}>Marcar pagado</Btn>
                    <Btn color="yellow" onClick={() => updatePayment(apt.id, "partial")}>Pago parcial</Btn>
                    <Btn color="purple" onClick={() => updatePayment(apt.id, "courtesy")}>Cortesía</Btn>
                  </>
                )}
                <Link
                  href={`/dashboard/citas/${apt.id}`}
                  className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Ver detalle
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal advertencia tiempo */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-[var(--ds-surface)] rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900 text-center mb-2">¿Confirmar acción?</h2>
            <p className="text-sm text-gray-600 text-center mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  applyStatus(confirmModal.id, confirmModal.status);
                  setConfirmModal(null);
                }}
                className="flex-1 bg-amber-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
              >
                Sí, finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva cita manual */}
      <NewAppointmentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddAppointment}
      />
    </div>
  );
}

function Btn({
  children, onClick, color,
}: {
  children: React.ReactNode;
  onClick: () => void;
  color: "green" | "red" | "teal" | "orange" | "gray" | "blue" | "purple" | "yellow";
}) {
  const colors = {
    green: "bg-green-100 text-green-700 hover:bg-green-200",
    red: "bg-red-100 text-red-700 hover:bg-red-200",
    teal: "bg-teal-100 text-teal-700 hover:bg-teal-200",
    orange: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    gray: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    purple: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    yellow: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  };
  return (
    <button onClick={onClick} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${colors[color]}`}>
      {children}
    </button>
  );
}
