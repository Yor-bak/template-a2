"use client";
import { appointments } from "@/data/appointments";
import { calculateIncomeSummary } from "@/modules/especialista/income/utils/calculations";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { STATUS_LABELS, PAYMENT_COLORS, PAYMENT_LABELS } from "@/lib/constants";
import { StatCard } from "@/components/ui/StatCard";
import { DollarSign, TrendingUp, XCircle, Gift, Download } from "lucide-react";
import Link from "next/link";
import { exportToCSV } from "@/lib/exportUtils";

function exportCSV() {
  exportToCSV("ingresos", [
    ["Cliente", "Servicio", "Fecha", "Estado", "Pago", "Monto"],
    ...appointments.map((a) => [
      a.patientName,
      a.serviceName,
      a.desiredDate,
      STATUS_LABELS[a.status],
      PAYMENT_LABELS[a.paymentStatus],
      a.chargedAmount ?? a.estimatedAmount ?? 0,
    ]),
  ]);
}

export default function IngresosPage() {
  const summary = calculateIncomeSummary(appointments);

  const monthText = `Este mes tuviste ${
    appointments.filter((a) => a.status === "completed").length
  } citas finalizadas, ${
    appointments.filter((a) => ["cancelled", "rejected"].includes(a.status)).length
  } canceladas, ${
    appointments.filter((a) => a.status === "no_show").length
  } que no asistieron y ${formatCurrency(summary.thisMonth)} registrados en ingresos.`;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--ds-text)]">Ingresos</h1>
          <p className="text-[var(--ds-text-muted)] text-sm">Consulta tus ingresos registrados y el estado de pagos por cita.</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--ds-bg)] hover:border-[var(--color-primary)]/20 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Periodos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard label="Ingresos hoy"         value={formatCurrency(summary.today)}     icon={DollarSign} color="teal" />
        <StatCard label="Ingresos esta semana"  value={formatCurrency(summary.thisWeek)}  icon={TrendingUp} color="blue" />
        <StatCard label="Ingresos este mes"     value={formatCurrency(summary.thisMonth)} icon={DollarSign} color="green" />
      </div>

      {/* Estados de pago */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total cobrado"   value={formatCurrency(summary.paid)}    icon={DollarSign} color="green"  sub={`${summary.paidCount} citas`} />
        <StatCard label="Pago parcial"    value={formatCurrency(summary.partial)} icon={TrendingUp} color="amber"  sub={`${summary.partialCount} citas`} />
        <StatCard label="Por cobrar"      value={formatCurrency(summary.unpaid)}  icon={XCircle}    color="red"    sub={`${summary.unpaidCount} citas`} />
        <StatCard label="Cortesías"       value={summary.courtesyCount}           icon={Gift}       color="purple" sub="sin cargo" />
      </div>

      {/* Insight */}
      <div className="bg-[var(--ds-surface-muted)]/50 border border-[var(--color-accent)]/30 rounded-2xl p-4 mb-6 text-sm text-[var(--ds-primary)]">
        {monthText}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Por servicio */}
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-[var(--ds-text)] mb-4 text-sm uppercase tracking-wide">Ingresos por servicio</h2>
          {summary.byService.length === 0 ? (
            <p className="text-[var(--ds-text-muted)] text-sm">Sin datos registrados.</p>
          ) : (
            <div className="space-y-3">
              {summary.byService.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-[var(--ds-text)]">{s.name}</p>
                    <p className="text-xs text-[var(--ds-text-muted)]">
                      {s.count} cita{s.count !== 1 ? "s" : ""} pagada{s.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="font-bold text-[var(--ds-success)]">{formatCurrency(s.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen del mes */}
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-[var(--ds-text)] mb-4 text-sm uppercase tracking-wide">Resumen del mes</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: "Pagadas",    bg: "bg-[var(--ds-success)]/10", text: "text-[var(--ds-success)]", value: `${summary.paidCount} citas · ${formatCurrency(summary.paid)}` },
              { label: "Parciales",  bg: "bg-[var(--ds-warning)]/10",   text: "text-[var(--ds-warning)]",   value: `${summary.partialCount} citas · ${formatCurrency(summary.partial)}` },
              { label: "Sin pagar",  bg: "bg-[var(--ds-error)]/11",  text: "text-[var(--ds-error)]",  value: `${summary.unpaidCount} citas · ${formatCurrency(summary.unpaid)}` },
              { label: "Cortesías",  bg: "bg-[var(--ds-accent)]/10",  text: "text-[var(--ds-accent)]",  value: `${summary.courtesyCount} citas` },
            ].map((row) => (
              <div key={row.label} className={`flex justify-between items-center p-3 ${row.bg} rounded-xl`}>
                <span className={`${row.text} font-semibold text-xs`}>{row.label}</span>
                <span className={`font-bold text-xs ${row.text}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla detallada */}
      <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--ds-border)]">
          <h2 className="font-bold text-[var(--ds-text)] text-sm uppercase tracking-wide">Detalle de pagos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-[var(--ds-bg)] text-xs text-[var(--ds-text-muted)] uppercase tracking-wide border-b border-[var(--ds-border)]">
                <th className="text-left px-5 py-3 font-semibold">Cliente</th>
                <th className="text-left px-5 py-3 font-semibold">Servicio</th>
                <th className="text-left px-5 py-3 font-semibold">Fecha</th>
                <th className="text-left px-5 py-3 font-semibold">Estado cita</th>
                <th className="text-left px-5 py-3 font-semibold">Pago</th>
                <th className="text-right px-5 py-3 font-semibold">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ds-border)]">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-[var(--ds-bg)] transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/dashboard/citas/${apt.id}`} className="font-semibold text-[var(--ds-text)] hover:text-[var(--ds-primary)] transition-colors">
                      {apt.patientName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[var(--ds-text-muted)] text-xs">{apt.serviceName}</td>
                  <td className="px-5 py-3 text-[var(--ds-text-muted)] text-xs whitespace-nowrap">
                    {formatShortDate(apt.desiredDate)}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-[var(--ds-text-muted)]">{STATUS_LABELS[apt.status]}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PAYMENT_COLORS[apt.paymentStatus]}`}>
                      {PAYMENT_LABELS[apt.paymentStatus]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-[var(--ds-text)]">
                    {apt.chargedAmount
                      ? formatCurrency(apt.chargedAmount)
                      : apt.estimatedAmount
                      ? formatCurrency(apt.estimatedAmount)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
