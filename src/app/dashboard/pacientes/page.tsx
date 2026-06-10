import Link from "next/link";
import { patients } from "@/data/patients";
import { appointments } from "@/data/appointments";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { Users, Search } from "lucide-react";

export default function PacientesPage() {
  const enriched = patients.map((p) => {
    const apts = appointments.filter((a) => a.patientId === p.id);
    const lastApt = apts.sort((a, b) => b.desiredDate.localeCompare(a.desiredDate))[0];
    return { ...p, appointments: apts, lastApt };
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Pacientes</h1>
          <p className="text-gray-500 text-sm">{patients.length} pacientes registrados</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-gray-50"
              readOnly
            />
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {enriched.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/pacientes/${p.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm flex-shrink-0">
                {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-400">{p.phone} · {p.email}</p>
              </div>
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-xs text-gray-500">{p.appointments.length} cita{p.appointments.length !== 1 ? "s" : ""}</p>
                <p className="text-xs font-semibold text-sky-700">{formatCurrency(p.totalSpent)}</p>
              </div>
              <div className="text-right flex-shrink-0 hidden md:block">
                <p className="text-xs text-gray-400">Desde {formatShortDate(p.firstVisitAt)}</p>
                {p.lastApt && (
                  <p className="text-xs text-gray-400">Último: {formatShortDate(p.lastApt.desiredDate)}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
