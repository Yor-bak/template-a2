"use client";
import { appointments } from "@/data/appointments";
import { patients } from "@/data/patients";
import { formatCurrency } from "@/lib/utils";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { hasFeature } from "@/utils/planUtils";
import { BarChart2, TrendingUp, Users, DollarSign, CalendarDays, Star, Lock } from "lucide-react";

function MetricCard({ label, value, sub, icon: Icon }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[var(--color-primary)]" />
        </div>
        <p className="text-xs font-bold text-[var(--color-muted-text)] uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-2xl font-extrabold text-[var(--color-text)]">{value}</p>
      {sub && <p className="text-xs text-[var(--color-muted-text)] mt-1">{sub}</p>}
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
        <h1 className="text-2xl font-extrabold text-[var(--color-text)]">Reportes</h1>
        <p className="text-[var(--color-muted-text)] text-sm">Métricas generales del consultorio.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Ingresos totales" value={formatCurrency(totalIncome)} icon={DollarSign} sub="Pagos recibidos" />
        <MetricCard label="Citas finalizadas" value={completedApts} icon={CalendarDays} />
        <MetricCard label="Canceladas" value={cancelledApts} icon={CalendarDays} />
        <MetricCard label="Pacientes" value={patients.length} icon={Users} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Servicios más solicitados */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-[var(--color-primary)]" />
            <h2 className="font-bold text-sm text-[var(--color-text)]">Servicios más solicitados</h2>
          </div>
          <div className="space-y-3">
            {topServices.map(([name, data], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-primary)] text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{name}</p>
                  <p className="text-xs text-[var(--color-muted-text)]">{data.count} citas · {formatCurrency(data.income)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de asistencia */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[var(--color-primary)]" />
            <h2 className="font-bold text-sm text-[var(--color-text)]">Resumen de asistencia</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "Finalizadas", value: completedApts, color: "bg-green-100 text-green-700" },
              { label: "Canceladas", value: cancelledApts, color: "bg-red-100 text-red-700" },
              { label: "No asistió", value: noShows, color: "bg-amber-100 text-amber-700" },
              { label: "Total citas", value: appointments.length, color: "bg-[var(--color-accent-soft)] text-[var(--color-primary)]" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] last:border-0">
                <span className="text-sm text-[var(--color-muted-text)]">{label}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gate de plan avanzado */}
      {!hasAdvanced && (
        <div className="border border-dashed border-[var(--color-border)] rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <h3 className="font-bold text-[var(--color-text)] mb-2 flex items-center justify-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Reportes avanzados — Plan Premium
          </h3>
          <p className="text-sm text-[var(--color-muted-text)] max-w-sm mx-auto">
            Accede a gráficas por período, exportes avanzados, comparativa de meses, métricas de retención de pacientes y más.
          </p>
        </div>
      )}
    </div>
  );
}
