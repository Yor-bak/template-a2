"use client";
import { useState } from "react";
import Link from "next/link";
import { patients } from "@/data/patients";
import { appointments } from "@/data/appointments";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { exportToCSV } from "@/lib/exportUtils";
import { Users, Search, Phone, CalendarDays, Download, Plus } from "lucide-react";
import { NewClientModal } from "@/modules/especialista/components/NewClientModal";

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);

  const enriched = patients
    .map((p) => {
      const apts = appointments.filter((a) => a.patientId === p.id);
      const lastApt = apts.sort((a, b) => b.desiredDate.localeCompare(a.desiredDate))[0];
      return { ...p, apts, lastApt };
    })
    .filter((p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
    );

  function handleExport() {
    exportToCSV("clientes", [
      ["Nombre", "Teléfono", "Citas", "Total gastado", "Primera visita"],
      ...patients.map((p) => [p.name, p.phone, appointments.filter((a) => a.patientId === p.id).length, p.totalSpent, p.firstVisitAt]),
    ]);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text)]">Clientes</h1>
          <p className="text-[var(--color-muted-text)] text-sm">{patients.length} clientes registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 border border-[var(--color-border)] text-[var(--color-muted-text)] px-3 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-background)] transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo cliente
          </button>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-[#F0F4F5]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-text)]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente por nombre o teléfono..."
              className="w-full pl-9 pr-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted-text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] bg-[var(--color-background)] transition-colors"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="divide-y divide-[#F0F4F5]">
          {enriched.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/pacientes/${p.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--color-background)] transition-colors group"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-primary)] font-bold text-sm flex-shrink-0 border border-[var(--color-accent)]/20">
                {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{p.name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  <span className="text-xs text-[var(--color-muted-text)] flex items-center gap-1">
                    <Phone className="w-3 h-3" />{p.phone}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 hidden sm:block">
                <div className="inline-flex items-center gap-1 text-xs text-[var(--color-muted-text)] mb-0.5">
                  <CalendarDays className="w-3 h-3" />
                  {p.apts.length} cita{p.apts.length !== 1 ? "s" : ""}
                </div>
                <p className="text-sm font-bold text-[var(--color-primary)]">{formatCurrency(p.totalSpent)}</p>
              </div>

              <div className="text-right flex-shrink-0 hidden md:block">
                <p className="text-xs text-[var(--color-muted-text)]">Desde {formatShortDate(p.firstVisitAt)}</p>
                {p.lastApt && (
                  <p className="text-xs text-[var(--color-muted-text)]/70">Último: {formatShortDate(p.lastApt.desiredDate)}</p>
                )}
              </div>

              <div className="text-[var(--color-muted-text)]/30 group-hover:text-[var(--color-accent)] transition-colors hidden sm:block">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {enriched.length === 0 && (
          <div className="py-16 text-center text-[var(--color-muted-text)]">
            <Users className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
            <p className="font-semibold text-sm">No se encontraron clientes</p>
            <p className="text-xs mt-1 opacity-60">Agrega clientes manualmente con el botón "Nuevo cliente"</p>
          </div>
        )}
      </div>

      <NewClientModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  );
}
