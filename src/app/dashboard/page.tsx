import { appointments } from "@/data/appointments";
import { patients } from "@/data/patients";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency, formatShortDate, formatTime } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, PAYMENT_COLORS, PAYMENT_LABELS, DEMO_TODAY } from "@/lib/constants";
import Link from "next/link";
import {
  CalendarDays, CheckCircle2, Clock, XCircle, TrendingUp,
  DollarSign, Users, AlertCircle, BarChart3
} from "lucide-react";

export default function DashboardPage() {
  const todayApts = appointments.filter((a) => a.desiredDate === DEMO_TODAY);
  const pending = todayApts.filter((a) => a.status === "pending");
  const confirmed = todayApts.filter((a) => a.status === "confirmed");
  const completed = todayApts.filter((a) => a.status === "completed");
  const cancelled = todayApts.filter((a) => ["cancelled", "rejected"].includes(a.status));

  const todayEstimated = todayApts.reduce((s, a) => s + (a.estimatedAmount || 0), 0);
  const todayConfirmedIncome = appointments
    .filter((a) => a.paymentStatus === "paid" && a.paidAt === DEMO_TODAY)
    .reduce((s, a) => s + (a.chargedAmount || 0), 0);

  const monthApts = appointments; // All are from June 2025
  const monthCompleted = monthApts.filter((a) => a.status === "completed");
  const monthCancelled = monthApts.filter((a) => ["cancelled", "rejected"].includes(a.status));
  const monthNoShow = monthApts.filter((a) => a.status === "no_show");
  const monthIncome = appointments
    .filter((a) => a.paymentStatus === "paid")
    .reduce((s, a) => s + (a.chargedAmount || 0), 0);

  const serviceCount: Record<string, number> = {};
  monthApts.forEach((a) => {
    serviceCount[a.serviceName] = (serviceCount[a.serviceName] || 0) + 1;
  });
  const topServices = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const recentApts = appointments.slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Resumen del día — {new Date(DEMO_TODAY + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* Stats del día */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Hoy</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Citas hoy" value={todayApts.length} icon={CalendarDays} color="blue" />
          <StatCard label="Pendientes" value={pending.length} icon={Clock} color="amber" />
          <StatCard label="Confirmadas" value={confirmed.length} icon={CheckCircle2} color="green" />
          <StatCard label="Canceladas" value={cancelled.length} icon={XCircle} color="red" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <StatCard label="Ingresos estimados" value={formatCurrency(todayEstimated)} icon={TrendingUp} color="teal" sub="Suma de citas del día" />
          <StatCard label="Ingresos confirmados" value={formatCurrency(todayConfirmedIncome)} icon={DollarSign} color="green" sub="Pagos recibidos hoy" />
        </div>
      </div>

      {/* Stats del mes */}
      <div className="mb-7">
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Este mes</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard label="Total citas" value={monthApts.length} icon={CalendarDays} color="blue" />
          <StatCard label="Finalizadas" value={monthCompleted.length} icon={CheckCircle2} color="green" />
          <StatCard label="Canceladas" value={monthCancelled.length} icon={XCircle} color="red" />
          <StatCard label="No asistió" value={monthNoShow.length} icon={AlertCircle} color="amber" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Ingresos registrados" value={formatCurrency(monthIncome)} icon={DollarSign} color="green" sub="Pagos marcados como pagados" />
          <StatCard label="Pacientes" value={patients.length} icon={Users} color="purple" />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> Servicios más solicitados
            </p>
            <div className="space-y-2">
              {topServices.map(([name, count]) => (
                <div key={name} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 truncate">{name}</span>
                  <span className="font-bold text-sky-700 ml-2">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen textual */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 mb-7 text-sm text-sky-800">
        Este mes tuviste <strong>{monthCompleted.length} citas finalizadas</strong>,{" "}
        {monthCancelled.length} canceladas y{" "}
        <strong>{formatCurrency(monthIncome)}</strong> registrados en ingresos.
      </div>

      {/* Citas recientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Citas recientes</h2>
          <Link href="/dashboard/citas" className="text-xs text-sky-600 hover:underline font-medium">
            Ver todas
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-semibold">Paciente</th>
                  <th className="text-left px-5 py-3 font-semibold">Servicio</th>
                  <th className="text-left px-5 py-3 font-semibold">Fecha</th>
                  <th className="text-left px-5 py-3 font-semibold">Estado</th>
                  <th className="text-left px-5 py-3 font-semibold">Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentApts.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/citas/${apt.id}`} className="font-medium text-gray-800 hover:text-sky-600">
                        {apt.patientName}
                      </Link>
                      <p className="text-xs text-gray-400">{apt.patientPhone}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{apt.serviceName}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {formatShortDate(apt.desiredDate)} {formatTime(apt.desiredTime)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[apt.status]}`}>
                        {STATUS_LABELS[apt.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_COLORS[apt.paymentStatus]}`}>
                        {PAYMENT_LABELS[apt.paymentStatus]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
