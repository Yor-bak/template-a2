"use client";
import { useState, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { appointments as initialData } from "@/data/appointments";
import type { AppointmentStatus, PaymentStatus } from "@/types";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, PAYMENT_COLORS, PAYMENT_LABELS, DEMO_TODAY } from "@/lib/constants";
import { SourceBadge, SOURCE_DESCRIPTIONS } from "@/components/dashboard/SourceBadge";
import { ChevronLeft, AlertCircle, CheckCircle2, Bot } from "lucide-react";
import {
  triggerAutomationEvent,
  buildAppointmentPayload,
  AUTOMATION_EVENTS,
} from "@/services/automationService";

export default function CitaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const original = initialData.find((a) => a.id === id);
  if (!original) notFound();

  const [apt, setApt] = useState(original);
  const [notes, setNotes] = useState(apt.internalNotes || "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [chargedAmount, setChargedAmount] = useState(String(apt.chargedAmount || apt.estimatedAmount || ""));

  function updateStatus(status: AppointmentStatus) {
    setApt((a) => {
      const updated = {
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
      };
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
      return updated;
    });
  }

  function updatePayment(paymentStatus: PaymentStatus) {
    setApt((a) => {
      const updated = {
        ...a,
        paymentStatus,
        chargedAmount: Number(chargedAmount) || a.estimatedAmount,
        paidAt: paymentStatus === "paid" ? DEMO_TODAY : a.paidAt,
      };
      const ev = paymentStatus === "paid"
        ? AUTOMATION_EVENTS.PAYMENT_MARKED_PAID
        : paymentStatus === "partial"
        ? AUTOMATION_EVENTS.PAYMENT_MARKED_PARTIAL
        : null;
      if (ev) void triggerAutomationEvent(ev, buildAppointmentPayload(updated));
      return updated;
    });
  }

  function saveNotes() {
    setApt((a) => ({ ...a, internalNotes: notes }));
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/citas" className="inline-flex items-center gap-1 text-sm text-sky-600 hover:underline mb-3">
          <ChevronLeft className="w-4 h-4" />
          Volver a citas
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold text-gray-900">{apt.patientName}</h1>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[apt.status]}`}>
            {STATUS_LABELS[apt.status]}
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PAYMENT_COLORS[apt.paymentStatus]}`}>
            {PAYMENT_LABELS[apt.paymentStatus]}
          </span>
          {apt.isEmergency && (
            <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Urgencia
            </span>
          )}
          <SourceBadge source={apt.source} size="sm" />
        </div>
      </div>

      {/* Banner de origen */}
      <div className={`rounded-xl p-3 mb-5 text-xs font-medium flex items-center gap-2 ${
        apt.source === "ai_whatsapp"
          ? "bg-violet-50 border border-violet-100 text-violet-700"
          : apt.source === "manual"
          ? "bg-gray-50 border border-gray-200 text-gray-600"
          : "bg-blue-50 border border-blue-100 text-blue-700"
      }`}>
        {apt.source === "ai_whatsapp" && <Bot className="w-4 h-4 flex-shrink-0" />}
        {SOURCE_DESCRIPTIONS[apt.source]}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="md:col-span-2 space-y-5">
          {/* Datos del paciente */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Datos del paciente</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Info label="Nombre" value={apt.patientName} />
              <Info label="Teléfono" value={apt.patientPhone} />
              {apt.patientEmail && <Info label="Correo" value={apt.patientEmail} />}
              <Info label="Contacto preferido" value={apt.preferredContact === "whatsapp" ? "WhatsApp" : apt.preferredContact === "call" ? "Llamada" : "Correo"} />
              <Info label="Primera vez" value={apt.isFirstVisit ? "Sí" : "No"} />
            </div>
          </div>

          {/* Detalles de la cita */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Detalles de la cita</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Info label="Servicio" value={apt.serviceName} />
              <Info label="Fecha" value={formatDate(apt.desiredDate)} />
              <Info label="Hora" value={formatTime(apt.desiredTime)} />
              {apt.durationMinutes && <Info label="Duración" value={`${apt.durationMinutes} min`} />}
              <Info label="Motivo" value={apt.reason} />
              {apt.additionalComments && (
                <Info label="Comentarios" value={apt.additionalComments} />
              )}
            </div>
          </div>

          {/* Resumen IA (solo si es ai_whatsapp) */}
          {apt.source === "ai_whatsapp" && apt.aiMetadata && (
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-violet-800 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Metadata de IA WhatsApp
              </h2>
              <div className="space-y-2 text-sm">
                {apt.aiMetadata.summary && (
                  <div>
                    <p className="text-xs text-violet-500 mb-1">Resumen de conversación</p>
                    <p className="text-violet-800 leading-relaxed">&ldquo;{apt.aiMetadata.summary}&rdquo;</p>
                  </div>
                )}
                {apt.aiMetadata.confidence !== undefined && (
                  <p className="text-xs text-violet-500">
                    Confianza del modelo: <strong className="text-violet-700">{Math.round(apt.aiMetadata.confidence * 100)}%</strong>
                  </p>
                )}
                {apt.aiMetadata.conversationId && (
                  <p className="text-xs text-violet-400">ID conversación: {apt.aiMetadata.conversationId}</p>
                )}
              </div>
            </div>
          )}

          {/* Notas internas */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Notas internas</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Agrega notas internas (no visibles para el paciente)..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={saveNotes}
                className="bg-sky-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-sky-700 transition-colors"
              >
                Guardar notas
              </button>
              {notesSaved && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Guardado
                </span>
              )}
            </div>
          </div>

          {/* Historial de estados */}
          {apt.statusHistory.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Historial de estados</h2>
              <div className="space-y-3">
                {apt.statusHistory.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500">
                        {STATUS_LABELS[entry.oldStatus]} → <strong className="text-gray-800">{STATUS_LABELS[entry.newStatus]}</strong>
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Por {entry.changedBy} · {new Date(entry.createdAt).toLocaleString("es-MX")}
                      </p>
                      {entry.note && <p className="text-xs text-gray-500 italic mt-0.5">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar acciones */}
        <div className="space-y-4">
          {/* Cambiar estado */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3 text-sm">Cambiar estado</h2>
            <div className="space-y-2">
              {apt.status === "pending" && (
                <>
                  <ActionBtn color="green" onClick={() => updateStatus("confirmed")}>Confirmar cita</ActionBtn>
                  <ActionBtn color="red" onClick={() => updateStatus("rejected")}>Rechazar cita</ActionBtn>
                  <ActionBtn color="purple" onClick={() => updateStatus("rescheduled")}>Reagendar</ActionBtn>
                </>
              )}
              {apt.status === "confirmed" && (
                <>
                  <ActionBtn color="teal" onClick={() => updateStatus("completed")}>Marcar finalizada</ActionBtn>
                  <ActionBtn color="orange" onClick={() => updateStatus("no_show")}>No asistió</ActionBtn>
                  <ActionBtn color="gray" onClick={() => updateStatus("cancelled")}>Cancelar</ActionBtn>
                  <ActionBtn color="purple" onClick={() => updateStatus("rescheduled")}>Reagendar</ActionBtn>
                </>
              )}
              {["completed", "cancelled", "rejected", "no_show"].includes(apt.status) && (
                <p className="text-xs text-gray-400 italic">La cita ya fue procesada.</p>
              )}
            </div>
          </div>

          {/* Pago */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3 text-sm">Pago</h2>
            <div className="space-y-3 text-sm">
              <Info label="Monto estimado" value={apt.estimatedAmount ? formatCurrency(apt.estimatedAmount) : "—"} />
              <div>
                <label className="text-xs text-gray-500 block mb-1">Monto cobrado</label>
                <input
                  type="number"
                  value={chargedAmount}
                  onChange={(e) => setChargedAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              {apt.paidAt && <Info label="Pagado el" value={apt.paidAt} />}
            </div>
            <div className="mt-4 space-y-2">
              <ActionBtn color="green" onClick={() => updatePayment("paid")}>Marcar pagado</ActionBtn>
              <ActionBtn color="yellow" onClick={() => updatePayment("partial")}>Pago parcial</ActionBtn>
              <ActionBtn color="purple" onClick={() => updatePayment("courtesy")}>Cortesía</ActionBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}

function ActionBtn({
  children, onClick, color,
}: {
  children: React.ReactNode;
  onClick: () => void;
  color: string;
}) {
  const colors: Record<string, string> = {
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
    <button
      onClick={onClick}
      className={`w-full text-xs px-3 py-2 rounded-lg font-medium transition-colors text-left ${colors[color] || colors.gray}`}
    >
      {children}
    </button>
  );
}
