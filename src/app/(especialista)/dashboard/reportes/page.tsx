"use client";
import { appointments } from "@/data/appointments";
import { patients } from "@/data/patients";
import { formatCurrency } from "@/lib/utils";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { hasFeature } from "@/lib/planUtils";
import { BarChart2, TrendingUp, Users, DollarSign, CalendarDays, Star, Lock } from "lucide-react";

function MetricCard({ label, value, sub, icon: Icon }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--ds-surface-muted)] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[var(--ds-primary)]" />
        </div>
        <p className="text-xs font-bold text-[var(--ds-text-muted)] uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-2xl font-extrabold text-[var(--ds-text)]">{value}</p>
      {sub && <p className="text-xs text-[var(--ds-text-muted)] mt-1">{sub}</p>}
    </div>
  );
}

export default function ReportesPage() {
  const { config } = useClinicConfig();
  const hasAdvanced = hasFeature(config.plan, "advanced_reports");

  const totalIncome = appointments
    .filter((a) => a.paymentStatus === "paid")
    .reduce((s, a) => s + (a.chargedAmount ?? 0), 0);
  const completedApts = appointments.filter((a) => a.status === "completed").length;
  const cancelledApts = appointments.filter((a) => ["cancelled", "rejected"].includes(a.status)).length;
  const noShows = appointments.filter((a) => a.status === "no_show").length;

  const serviceCount: Record<string, { count: number; income: number }> = {};
  appointments.forEach((a) => {
    if (!serviceCount[a.serviceName]) serviceCount[a.serviceName] = { count: 0, income: 0 };
    serviceCount[a.serviceName].count += 1;
    if (a.paymentStatus === "paid") serviceCount[a.serviceName].income += a.chargedAmount ?? 0;
  });
  const topServices = Object.entries(serviceCount)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--ds-text)]">Reportes</h1>
        <p className="text-[var(--ds-text-muted)] text-sm">Métricas generales del consultorio.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Ingresos totales" value={formatCurrency(totalIncome)} icon={DollarSign} sub="Pagos recibidos" />
        <MetricCard label="Citas finalizadas" value={completedApts} icon={CalendarDays} />
        <MetricCard label="Canceladas" value={cancelledApts} icon={CalendarDays} />
        <MetricCard label="Clientes" value={patients.length} icon={Users} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Servicios más solicitados */}
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-[var(--ds-primary)]" />
            <h2 className="font-bold text-sm text-[var(--ds-text)]">Servicios más solicitados</h2>
          </div>
          <div className="space-y-3">
            {topServices.map(([name, data], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--ds-surface-muted)] text-[var(--ds-primary)] text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--ds-text)] truncate">{name}</p>
                  <p className="text-xs text-[var(--ds-text-muted)]">{data.count} citas · {formatCurrency(data.income)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de asistencia */}
        <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[var(--ds-primary)]" />
            <h2 className="font-bold text-sm text-[var(--ds-text)]">Resumen de asistencia</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "Finalizadas", value: completedApts, color: "bg-[var(--ds-success)]/12 text-[var(--ds-success)]" },
              { label: "Canceladas", value: cancelledApts, color: "bg-[var(--ds-error)]/12 text-red-700" },
              { label: "No asistió", value: noShows, color: "bg-[var(--ds-warning)]/12 text-[var(--ds-warning)]" },
              { label: "Total citas", value: appointments.length, color: "bg-[var(--ds-surface-muted)] text-[var(--ds-primary)]" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-[var(--ds-border)] last:border-0">
                <span className="text-sm text-[var(--ds-text-muted)]">{label}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gate de plan avanzado */}
      {!hasAdvanced && (
        <div className="border border-dashed border-[var(--ds-border)] rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--ds-surface-muted)] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-[var(--ds-primary)]" />
          </div>
          <h3 className="font-bold text-[var(--ds-text)] mb-2 flex items-center justify-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Reportes avanzados — Plan Premium
          </h3>
          <p className="text-sm text-[var(--ds-text-muted)] max-w-sm mx-auto">
            Accede a gráficas por período, exportes avanzados, comparativa de meses, métricas de retención de clientes y más.
          </p>
        </div>
      )}
    </div>
  );
}
