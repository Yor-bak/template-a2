"use client";
import { appointments } from "@/data/appointments";
import { patients } from "@/data/patients";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency, formatShortDate, formatTime } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, PAYMENT_COLORS, PAYMENT_LABELS, DEMO_TODAY } from "@/lib/constants";
import Link from "next/link";
import {
  CalendarDays, CheckCircle2, Clock, XCircle, TrendingUp,
  DollarSign, Users, AlertCircle, BarChart3, Globe, PenLine, Bot, Zap, Plus,
} from "lucide-react";
import { SetupChecklist } from "@/modules/especialista/components/SetupChecklist";

const GRID_PATTERN = {
  backgroundImage: "linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
};

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

  const monthApts = appointments;
  const monthCompleted = monthApts.filter((a) => a.status === "completed");
  const monthCancelled = monthApts.filter((a) => ["cancelled", "rejected"].includes(a.status));
  const monthNoShow = monthApts.filter((a) => a.status === "no_show");
  const monthIncome = appointments
    .filter((a) => a.paymentStatus === "paid")
    .reduce((s, a) => s + (a.chargedAmount || 0), 0);

  const byWeb = appointments.filter((a) => a.source === "public_web").length;
  const byManual = appointments.filter((a) => a.source === "manual").length;
  const byAI = appointments.filter((a) => a.source === "ai_whatsapp").length;

  const serviceCount: Record<string, number> = {};
  monthApts.forEach((a) => {
    serviceCount[a.serviceName] = (serviceCount[a.serviceName] || 0) + 1;
  });
  const topServices = Object.entries(serviceCount).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const recentApts = appointments.slice(0, 5);
  const { config } = useClinicConfig();
  const isManualPlan = !config.automationEnabled;

  const dateStr = new Date(DEMO_TODAY + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── Saludo hero ──────────────────────────────────────────── */}
      <div className="bg-[var(--ds-primary)] rounded-2xl p-6 mb-7 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={GRID_PATTERN} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[var(--ds-accent)] text-xs font-bold uppercase tracking-widest mb-1.5">Panel de gestión</p>
            <h1 className="text-2xl font-extrabold text-white mb-1">
              Buenos días, {config.dentistName}
            </h1>
            <p className="text-white/50 text-sm">
              Gestiona tus citas, clientes e ingresos desde un solo lugar.
            </p>
            <p className="text-white/30 text-xs mt-2 capitalize">{dateStr}</p>
          </div>
          <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 flex-shrink-0">
            {/* Plan badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              isManualPlan
                ? "bg-white/10 text-white/70 border-white/15"
                : "bg-[var(--ds-accent)]/20 text-[var(--ds-accent)] border-[var(--color-accent)]/30"
            }`}>
              {isManualPlan ? <PenLine className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              {isManualPlan ? "Agenda Manual" : "Agenda Inteligente"}
            </div>
            <Link
              href="/dashboard/citas"
              className="inline-flex items-center gap-2 bg-[var(--ds-accent)] text-[var(--color-primary-dark)] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[var(--ds-surface-muted)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva cita
            </Link>
          </div>
        </div>
      </div>

      <SetupChecklist />

      {/* ── Hoy ───────────────────────────────────────────────────── */}
      <div className="mb-5">
        <SectionLabel>Hoy</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Citas hoy"    value={todayApts.length} icon={CalendarDays} color="blue" />
          <StatCard label="Pendientes"   value={pending.length}   icon={Clock}        color="amber" />
          <StatCard label="Confirmadas"  value={confirmed.length} icon={CheckCircle2} color="teal" />
          <StatCard label="Canceladas"   value={cancelled.length} icon={XCircle}      color="red" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <StatCard label="Ingresos estimados" value={formatCurrency(todayEstimated)} icon={TrendingUp} color="blue" sub="Suma de citas del día" />
          <StatCard label="Cobros de hoy"      value={formatCurrency(todayConfirmedIncome)} icon={DollarSign} color="green" sub="Pagos recibidos hoy" />
        </div>
      </div>

      {/* ── Este mes ─────────────────────────────────────────────── */}
      <div className="mb-6">
        <SectionLabel>Este mes</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard label="Total citas"  value={monthApts.length}      icon={CalendarDays} color="blue" />
          <StatCard label="Finalizadas"  value={monthCompleted.length} icon={CheckCircle2} color="green" />
          <StatCard label="Canceladas"   value={monthCancelled.length} icon={XCircle}      color="red" />
          <StatCard label="No asistió"   value={monthNoShow.length}    icon={AlertCircle}  color="amber" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Ingresos registrados" value={formatCurrency(monthIncome)} icon={DollarSign} color="green" sub="Pagos marcados como pagados" />
          <StatCard label="Clientes" value={patients.length} icon={Users} color="purple" />

          {/* Origen de citas */}
          <div className="bg-[var(--ds-surface)] rounded-2xl border border-[var(--ds-border)] shadow-sm p-5">
            <p className="text-xs text-[var(--ds-text-muted)] font-bold uppercase tracking-widest mb-3">Por origen</p>
            <div className="space-y-2.5">
              <OriginRow icon={Globe} label="Web" value={byWeb} color="text-[var(--ds-primary)]" bg="bg-[var(--ds-surface-muted)]" />
              <OriginRow icon={PenLine} label="Manual" value={byManual} color="text-[var(--ds-text)]" bg="bg-[var(--ds-surface-muted)]" />
              <OriginRow icon={Bot} label="IA WhatsApp" value={byAI} color="text-[var(--ds-accent)]" bg="bg-[var(--ds-accent)]/10" />
            </div>
          </div>

          {/* Servicios top */}
          <div className="bg-[var(--ds-surface)] rounded-2xl border border-[var(--ds-border)] shadow-sm p-5">
            <p className="text-xs text-[var(--ds-text-muted)] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Servicios top
            </p>
            <div className="space-y-2.5">
              {topServices.map(([name, count]) => (
                <div key={name} className="flex justify-between items-center text-xs">
                  <span className="text-[var(--ds-text-muted)] truncate">{name}</span>
                  <span className="font-bold text-[var(--ds-primary)] ml-2 flex-shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Insight mensual ───────────────────────────────────────── */}
      <div className="bg-[var(--ds-surface-muted)]/50 border border-[var(--color-accent)]/30 rounded-2xl p-5 mb-6 text-sm text-[var(--ds-primary)]">
        Este mes tuviste <strong>{monthCompleted.length} citas finalizadas</strong>,{" "}
        {monthCancelled.length} canceladas y{" "}
        <strong>{formatCurrency(monthIncome)}</strong> registrados en ingresos.
        {byAI > 0 && <span> <strong>{byAI} citas</strong> fueron creadas automáticamente por WhatsApp IA.</span>}
      </div>

      {/* ── Upgrade — solo plan manual ─────────────────────────────── */}
      {isManualPlan && (
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-base">Agenda Inteligente con WhatsApp</p>
              <p className="text-white/70 text-sm mt-0.5">
                Permite que una IA responda a tus clientes, recopile sus datos y cree citas automáticamente en tu panel.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/configuracion"
            className="flex-shrink-0 bg-[var(--ds-surface)] text-[var(--ds-accent)] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--ds-accent)]/10 transition-colors whitespace-nowrap"
          >
            Conocer plan Pro
          </Link>
        </div>
      )}

      {/* ── Citas recientes ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Citas recientes</SectionLabel>
          <Link href="/dashboard/citas" className="text-xs text-[var(--ds-primary)] hover:text-[var(--ds-accent)] font-semibold transition-colors">
            Ver todas →
          </Link>
        </div>
        <div className="bg-[var(--ds-surface)] rounded-2xl border border-[var(--ds-border)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-[var(--ds-bg)] border-b border-[var(--ds-border)] text-xs text-[var(--ds-text-muted)] uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-semibold">Cliente</th>
                  <th className="text-left px-5 py-3 font-semibold">Servicio</th>
                  <th className="text-left px-5 py-3 font-semibold">Fecha</th>
                  <th className="text-left px-5 py-3 font-semibold">Estado</th>
                  <th className="text-left px-5 py-3 font-semibold">Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ds-border)]">
                {recentApts.map((apt) => (
                  <tr key={apt.id} className="hover:bg-[var(--ds-bg)] transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/citas/${apt.id}`} className="font-semibold text-[var(--ds-text)] hover:text-[var(--ds-primary)] transition-colors">
                        {apt.patientName}
                      </Link>
                      <p className="text-xs text-[var(--ds-text-muted)]/70">{apt.patientPhone}</p>
                    </td>
                    <td className="px-5 py-3 text-[var(--ds-text-muted)] text-xs">{apt.serviceName}</td>
                    <td className="px-5 py-3 text-[var(--ds-text-muted)] text-xs whitespace-nowrap">
                      {formatShortDate(apt.desiredDate)} · {formatTime(apt.desiredTime)}
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-[var(--ds-text-muted)] uppercase tracking-widest mb-3">{children}</p>
  );
}

function OriginRow({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType; label: string; value: number; color: string; bg: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className={`flex items-center gap-1.5 font-medium ${color}`}>
        <span className={`w-5 h-5 rounded-md flex items-center justify-center ${bg}`}>
          <Icon className="w-3 h-3" />
        </span>
        {label}
      </span>
      <span className="font-bold text-[var(--ds-text)]">{value}</span>
    </div>
  );
}
