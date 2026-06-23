"use client";
import { useState, useMemo } from "react";
import { useAdminStore } from "@/store/adminStore";
import {
  S, Th, BadgeEl, PlanBadge,
  CLIENT_META, fmtDate,
} from "./adminUi";

type ContractFilter = "all" | "active" | "expiring" | "expired" | "cancelled";

const FILTER_OPTS: { key: ContractFilter; label: string }[] = [
  { key: "all",      label: "Todos"           },
  { key: "active",   label: "Vigentes"        },
  { key: "expiring", label: "Vencen en 30 días" },
  { key: "expired",  label: "Vencidos"        },
  { key: "cancelled", label: "Cancelados"     },
];

export function ContractsOverview({ onOpenClient }: { onOpenClient: (id: string) => void }) {
  const { clients } = useAdminStore();
  const [filter, setFilter] = useState<ContractFilter>("all");
  const [search, setSearch] = useState("");

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const in30 = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 30);
    return d;
  }, [today]);

  const filtered = useMemo(() => {
    let result = clients;
    if (filter !== "all") {
      result = result.filter((c) => {
        const end = new Date(c.contractEndDate + "T00:00:00");
        if (filter === "active")    return end >= today && c.clientStatus === "active";
        if (filter === "expiring")  return end >= today && end <= in30 && c.clientStatus === "active";
        if (filter === "expired")   return end < today && c.clientStatus !== "cancelled";
        if (filter === "cancelled") return c.clientStatus === "cancelled";
        return true;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.business.name.toLowerCase().includes(q) ||
        c.clientNumber.toLowerCase().includes(q) ||
        c.specialist.publicName.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => a.contractEndDate.localeCompare(b.contractEndDate));
  }, [clients, filter, search, today, in30]);

  // Summary counts
  const total     = clients.length;
  const expiring  = clients.filter((c) => { const e = new Date(c.contractEndDate + "T00:00:00"); return e >= today && e <= in30 && c.clientStatus === "active"; }).length;
  const expired   = clients.filter((c) => { const e = new Date(c.contractEndDate + "T00:00:00"); return e < today && c.clientStatus !== "cancelled"; }).length;
  const cancelled = clients.filter((c) => c.clientStatus === "cancelled").length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[var(--text-primary)] font-semibold text-base">Contratos</h2>
          <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
            Vigencia de contratos de clientes
          </p>
        </div>
        <div className="flex gap-3 text-[11px] text-[var(--text-muted)] shrink-0">
          <span>{total} total</span>
          {expiring > 0 && <span className="text-[var(--accent)] font-medium">{expiring} por vencer</span>}
          {expired  > 0 && <span className="text-[var(--danger)] font-medium">{expired} vencidos</span>}
          {cancelled > 0 && <span>{cancelled} cancelados</span>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          className={`${S.input} max-w-xs`}
          placeholder="Buscar negocio o N° cliente…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_OPTS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border-[0.5px] transition-colors ${
                filter === f.key
                  ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        {(filter !== "all" || search.trim()) && (
          <button
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            onClick={() => { setFilter("all"); setSearch(""); }}>
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)]">
        <div className="px-5 py-3 border-b-[0.5px] border-[var(--border)]">
          <p className="text-[11px] text-[var(--text-muted)]">
            {filtered.length} {filtered.length === 1 ? "contrato" : "contratos"}
            {filter !== "all" ? " · filtrados" : ""}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-[0.5px] border-[var(--border)]">
                <Th>N°</Th>
                <Th>Negocio</Th>
                <Th>Especialista</Th>
                <Th>Plan</Th>
                <Th>Tipo contrato</Th>
                <Th>Activación</Th>
                <Th>Vencimiento</Th>
                <Th>Estado cliente</Th>
                <Th>Vigencia</Th>
                <Th>{""}</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-[var(--text-muted)] text-sm">
                    Sin resultados
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const end = new Date(c.contractEndDate + "T00:00:00");
                const isExpired  = end < today;
                const isExpiring = !isExpired && end <= in30 && c.clientStatus === "active";
                const daysLeft   = Math.ceil((end.getTime() - today.getTime()) / 86400000);

                return (
                  <tr
                    key={c.id}
                    className="group border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                    onClick={() => onOpenClient(c.id)}>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">{c.clientNumber}</span>
                    </td>
                    <td className="px-5 py-3.5 min-w-[160px]">
                      <p className="text-xs font-medium text-[var(--text-primary)] leading-snug">{c.business.name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-[var(--text-primary)]">{c.specialist.publicName}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <PlanBadge plan={c.plan} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {c.contractType === "one_year" ? "1 año" : "6 meses"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] text-[var(--text-muted)]">{fmtDate(c.activationDate)}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-[11px] font-medium ${isExpired ? "text-[var(--danger)]" : isExpiring ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                        {fmtDate(c.contractEndDate)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <BadgeEl meta={CLIENT_META[c.clientStatus]} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {isExpired ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border-[0.5px] bg-[var(--bg-elevated)] text-[var(--danger)] border-[var(--danger)]">
                          Vencido
                        </span>
                      ) : isExpiring ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border-[0.5px] bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]">
                          {daysLeft === 0 ? "Vence hoy" : `${daysLeft} día${daysLeft !== 1 ? "s" : ""}`}
                        </span>
                      ) : c.clientStatus === "cancelled" ? (
                        <span className="text-[10px] text-[var(--text-muted)]">Cancelado</span>
                      ) : (
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {daysLeft > 0 ? `${daysLeft} días` : "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-[var(--accent)]">Ver →</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
