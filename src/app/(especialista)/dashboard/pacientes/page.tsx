"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { appointments } from "@/data/appointments";
import { formatShortDate } from "@/lib/utils";
import { exportToCSV } from "@/lib/exportUtils";
import { useClientData } from "@/contexts/ClientDataContext";
import { DEFAULT_TAGS } from "@/types/clientData";
import { Users, Search, Phone, CalendarDays, Download, Plus, Tag, ChevronDown, ArrowUpDown } from "lucide-react";
import { NewClientModal } from "@/modules/especialista/components/NewClientModal";

type SortKey = "name" | "activity";

export default function ClientesPage() {
  const { clients, carePlans, payments } = useClientData();
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("name");
  const [showNew, setShowNew] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const allTags = useMemo(() => {
    const set = new Set<string>(DEFAULT_TAGS);
    clients.forEach((c) => c.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [clients]);

  const enriched = useMemo(() => {
    return clients
      .map((c) => {
        const apts = appointments.filter((a) => a.patientId === c.id);
        const nextApt = apts
          .filter((a) => a.desiredDate >= new Date().toISOString().slice(0, 10) && a.status !== "cancelled" && a.status !== "rejected")
          .sort((a, b) => a.desiredDate.localeCompare(b.desiredDate))[0];
        const lastApt = apts.sort((a, b) => b.desiredDate.localeCompare(a.desiredDate))[0];
        const clientPayments = payments.filter((p) => p.clientId === c.id);
        const pendingBalance = clientPayments.filter((p) => p.status === "pending" || p.status === "partial").reduce((s, p) => s + p.amount, 0);
        const planBalance = carePlans.filter((p) => p.clientId === c.id && p.status === "in_progress").reduce((s, p) => s + p.pendingAmount, 0);
        return { ...c, apts, nextApt, lastApt, pendingBalance: pendingBalance + planBalance };
      })
      .filter((c) => {
        if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
        if (tagFilter && !c.tags.includes(tagFilter)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        const dateA = a.lastApt?.desiredDate ?? a.firstVisitAt;
        const dateB = b.lastApt?.desiredDate ?? b.firstVisitAt;
        return dateB.localeCompare(dateA);
      });
  }, [clients, appointments, payments, carePlans, search, tagFilter, sort]);

  function handleExport() {
    exportToCSV("clientes", [
      ["Nombre", "Teléfono", "Fecha nacimiento", "Alta", "Última atención", "Etiquetas"],
      ...enriched.map((c) => [
        c.name,
        c.phone,
        c.dateOfBirth ?? "",
        c.firstVisitAt,
        c.lastApt?.desiredDate ?? "",
        c.tags.join(", "),
      ]),
    ]);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--ds-text)]">Clientes</h1>
          <p className="text-[var(--ds-text-muted)] text-sm">{clients.length} clientes registrados</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-3 py-2 rounded-xl text-sm font-medium hover:bg-[var(--ds-bg)] transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 bg-[var(--ds-primary)] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo cliente
          </button>
        </div>
      </div>

      <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm overflow-hidden">
        {/* Filters row */}
        <div className="p-4 border-b border-[var(--ds-border)] flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-text-muted)]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="w-full pl-9 pr-4 py-2.5 border border-[var(--ds-border)] rounded-xl text-sm text-[var(--ds-text)] placeholder:text-[var(--ds-text-muted)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--ds-ring)]/40 bg-[var(--ds-bg)]"
            />
          </div>

          {/* Tag filter */}
          <div className="relative">
            <button
              onClick={() => { setShowTagMenu((v) => !v); setShowSortMenu(false); }}
              className="inline-flex items-center gap-2 border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-3 py-2 rounded-xl text-sm font-medium hover:bg-[var(--ds-bg)] transition-colors"
            >
              <Tag className="w-4 h-4" />
              {tagFilter ?? "Etiqueta"}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showTagMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--ds-surface-elevated)] border border-[var(--ds-border)] rounded-xl shadow-lg z-20 py-1">
                <button
                  onClick={() => { setTagFilter(null); setShowTagMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--ds-text-muted)] hover:bg-[var(--ds-bg)] transition-colors"
                >
                  Todas
                </button>
                {allTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTagFilter(t); setShowTagMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${tagFilter === t ? "text-[var(--ds-primary)] font-semibold" : "text-[var(--ds-text)] hover:bg-[var(--ds-bg)]"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => { setShowSortMenu((v) => !v); setShowTagMenu(false); }}
              className="inline-flex items-center gap-2 border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-3 py-2 rounded-xl text-sm font-medium hover:bg-[var(--ds-bg)] transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sort === "name" ? "Nombre" : "Actividad"}
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--ds-surface-elevated)] border border-[var(--ds-border)] rounded-xl shadow-lg z-20 py-1">
                {(["name", "activity"] as SortKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => { setSort(k); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${sort === k ? "text-[var(--ds-primary)] font-semibold" : "text-[var(--ds-text)] hover:bg-[var(--ds-bg)]"}`}
                  >
                    {k === "name" ? "Nombre" : "Última actividad"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="divide-y divide-[var(--ds-border)]">
          {enriched.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/pacientes/${c.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--ds-bg)] transition-colors group"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--ds-surface-muted)] flex items-center justify-center text-[var(--ds-primary)] font-bold text-sm flex-shrink-0 border border-[var(--ds-border)]">
                {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-[var(--ds-text)] group-hover:text-[var(--ds-primary)] transition-colors">{c.name}</p>
                  {c.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--ds-surface-muted)] text-[var(--ds-text-muted)]">{t}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  <span className="text-xs text-[var(--ds-text-muted)] flex items-center gap-1">
                    <Phone className="w-3 h-3" />{c.phone}
                  </span>
                  {c.dateOfBirth && (
                    <span className="text-xs text-[var(--ds-text-muted)]">Nac: {formatShortDate(c.dateOfBirth)}</span>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0 hidden sm:block space-y-0.5">
                {c.lastApt && (
                  <p className="text-xs text-[var(--ds-text-muted)]">Últ: {formatShortDate(c.lastApt.desiredDate)}</p>
                )}
                {c.nextApt && (
                  <p className="text-xs text-[var(--ds-success)] font-medium">Prox: {formatShortDate(c.nextApt.desiredDate)}</p>
                )}
                {c.pendingBalance > 0 && (
                  <p className="text-xs font-bold text-[var(--ds-warning)]">Saldo: ${c.pendingBalance.toLocaleString()}</p>
                )}
              </div>

              <div className="text-right flex-shrink-0 hidden md:block">
                <div className="inline-flex items-center gap-1 text-xs text-[var(--ds-text-muted)]">
                  <CalendarDays className="w-3 h-3" />
                  {c.apts.length} cita{c.apts.length !== 1 ? "s" : ""}
                </div>
                <p className="text-xs text-[var(--ds-text-muted)]/70 mt-0.5">Desde {formatShortDate(c.firstVisitAt)}</p>
              </div>

              <div className="text-[var(--ds-text-muted)]/30 group-hover:text-[var(--ds-accent)] transition-colors hidden sm:block">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {enriched.length === 0 && (
          <div className="py-16 text-center text-[var(--ds-text-muted)]">
            <Users className="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
            <p className="font-semibold text-sm">
              {clients.length === 0 ? "Aún no tienes clientes registrados." : "No se encontraron clientes"}
            </p>
            {clients.length === 0 && (
              <button
                onClick={() => setShowNew(true)}
                className="mt-4 inline-flex items-center gap-2 bg-[var(--ds-primary)] text-white px-4 py-2 rounded-xl text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Registrar primer cliente
              </button>
            )}
          </div>
        )}
      </div>

      <NewClientModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  );
}
