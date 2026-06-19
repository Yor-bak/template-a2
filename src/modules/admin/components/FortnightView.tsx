"use client";
import { useState, useMemo } from "react";
import type { Fortnight } from "@/types/user";
import { useAdminStore, getLastDayOfMonth } from "@/store/adminStore";
import { S, BadgeEl, COMMISSION_META, fmtDate, fmtDateTime, TRANSFER_TYPE_META, TRANSFER_STATUS_META } from "./adminUi";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function FortnightView() {
  const store = useAdminStore();
  const [filterYear, setFilterYear]   = useState<number | "all">("all");
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  const [confirmClose, setConfirmClose] = useState<string | null>(null);

  // Derive all fortnights from transfer dates + existing store fortnights
  const derivedFortnightIds = useMemo(() => {
    const ids = new Set<string>();
    for (const t of store.transfers) {
      const d = new Date(t.transferDate + "T00:00:00");
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const half = d.getDate() <= 15 ? 1 : 2;
      ids.add(`${y}-${String(m).padStart(2, "0")}-${half}`);
    }
    return ids;
  }, [store.transfers]);

  // Ensure derived fortnights exist in the store
  useMemo(() => {
    for (const id of derivedFortnightIds) {
      store.ensureFortnight(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedFortnightIds]);

  const years = useMemo(() => {
    const ys = new Set(store.fortnights.map((f) => f.year));
    return Array.from(ys).sort((a, b) => b - a);
  }, [store.fortnights]);

  const filtered = useMemo(() => {
    return store.fortnights
      .filter((f) => {
        if (filterYear !== "all" && f.year !== filterYear) return false;
        if (filterMonth !== "all" && f.month !== filterMonth) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        if (a.month !== b.month) return b.month - a.month;
        return b.half - a.half;
      });
  }, [store.fortnights, filterYear, filterMonth]);

  function getFortnightStats(f: Fortnight) {
    const transfers   = store.transfers.filter((t) => {
      const d = new Date(t.transferDate + "T00:00:00");
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const half = d.getDate() <= 15 ? 1 : 2;
      return `${y}-${String(m).padStart(2, "0")}-${half}` === f.id;
    });
    const commissions = store.commissions.filter((c) => c.fortnightId === f.id);

    const openings      = transfers.filter((t) => t.type === "opening");
    const monthlyTrs    = transfers.filter((t) => t.type === "monthly");
    const verifiedTrs   = transfers.filter((t) => t.status === "verified");
    const totalReceived = verifiedTrs.reduce((a, t) => a + t.amount, 0);
    const authorizedComm = commissions.filter((c) => c.status === "authorized").reduce((a, c) => a + c.amount, 0);
    const paidComm       = commissions.filter((c) => c.status === "paid").reduce((a, c) => a + c.amount, 0);
    const pendingComm    = commissions.filter((c) => c.status === "pending").reduce((a, c) => a + c.amount, 0);

    return { transfers, openings, monthlyTrs, verifiedTrs, commissions, totalReceived, authorizedComm, paidComm, pendingComm };
  }

  function getFortnightDayRange(f: Fortnight) {
    const lastDay = getLastDayOfMonth(f.year, f.month);
    return f.half === 1 ? "1–15" : `16–${lastDay}`;
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[var(--text-primary)] font-semibold text-base">Quincenas</h2>
          <p className="text-[var(--text-muted)] text-xs mt-0.5">
            {store.fortnights.filter((f) => !f.closed).length} abiertas · {store.fortnights.filter((f) => f.closed).length} cerradas
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div>
          <label className={S.label}>Año</label>
          <select className={`${S.select} w-32`} value={filterYear}
            onChange={(e) => setFilterYear(e.target.value === "all" ? "all" : parseInt(e.target.value))}>
            <option value="all">Todos</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className={S.label}>Mes</label>
          <select className={`${S.select} w-40`} value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value === "all" ? "all" : parseInt(e.target.value))}>
            <option value="all">Todos</option>
            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-[var(--text-muted)] text-sm">Sin quincenas con esos filtros.</p>
      )}

      <div className="space-y-4">
        {filtered.map((f) => {
          const stats = getFortnightStats(f);
          const range = getFortnightDayRange(f);
          return (
            <div key={f.id}
              className={`rounded-xl border-[0.5px] border-[var(--border)] overflow-hidden ${f.closed ? "bg-[var(--bg-surface)]" : "bg-[var(--bg-elevated)]"}`}>

              <div className="flex items-center justify-between px-5 py-4 border-b-[0.5px] border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border-[0.5px] ${
                    f.closed
                      ? "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]"
                      : "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]"
                  }`}>
                    {f.closed ? "Cerrada" : "Abierta"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)] capitalize">{f.label}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Días {range} · {stats.transfers.length} transferencias
                    </p>
                    {f.closed && f.closedAt && (
                      <p className="text-[10px] text-[var(--text-muted)]">
                        Cerrada {fmtDateTime(f.closedAt)}{f.closedBy ? ` por ${f.closedBy}` : ""}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!f.closed && (
                    <button className={S.btnDanger} onClick={() => setConfirmClose(f.id)}>
                      Cerrar quincena
                    </button>
                  )}
                  {f.closed && (
                    <button className={S.btnGhost} onClick={() => store.reopenFortnight(f.id)}>
                      Reabrir
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 md:grid-cols-7 divide-x-[0.5px] divide-[var(--border)]">
                {[
                  { label: "Aperturas",    value: stats.openings.length },
                  { label: "Mensualidades", value: stats.monthlyTrs.length },
                  { label: "Total recibido", value: `$${stats.totalReceived.toLocaleString("es-MX")}` },
                  { label: "Comisiones",   value: stats.commissions.length },
                  { label: "Com. pendiente", value: stats.pendingComm > 0 ? `$${stats.pendingComm.toLocaleString("es-MX")}` : "—" },
                  { label: "Com. autorizada", value: stats.authorizedComm > 0 ? `$${stats.authorizedComm.toLocaleString("es-MX")}` : "—" },
                  { label: "Com. pagada",  value: stats.paidComm > 0 ? `$${stats.paidComm.toLocaleString("es-MX")}` : "—" },
                ].map((s) => (
                  <div key={s.label} className="px-4 py-3">
                    <p className="text-[10px] text-[var(--text-muted)]">{s.label}</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Transfers in this fortnight */}
              {stats.transfers.length > 0 && (
                <div className="border-t-[0.5px] border-[var(--border)] px-5 py-3">
                  <div className="space-y-2">
                    {stats.transfers.map((t) => {
                      const client = t.clientId
                        ? store.clients.find((c) => c.id === t.clientId)
                        : t.specialistId
                        ? store.clients.find((c) => c.id === t.specialistId)
                        : undefined;
                      const commission = store.commissions.find((c) => c.transferId === t.id);
                      return (
                        <div key={t.id} className="flex items-center justify-between gap-3 text-[11px]">
                          <div className="flex items-center gap-3 min-w-0">
                            <BadgeEl meta={TRANSFER_TYPE_META[t.type]} />
                            <span className="font-mono text-[var(--text-muted)] shrink-0">{t.referenceNumber}</span>
                            <span className="text-[var(--text-primary)] truncate">
                              {client?.business.name ?? t.prospectiveBusinessName ?? "—"}
                            </span>
                            {t.sellerNumber && (
                              <span className="font-mono text-[var(--accent)] shrink-0">{t.sellerNumber}</span>
                            )}
                            <span className="text-[var(--text-muted)] shrink-0">{fmtDate(t.transferDate)}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[var(--text-primary)] tabular-nums">${t.amount.toLocaleString("es-MX")}</span>
                            <BadgeEl meta={TRANSFER_STATUS_META[t.status]} />
                            {commission && (
                              <>
                                <span className="text-[var(--accent)] font-mono tabular-nums">${commission.amount.toLocaleString("es-MX")}</span>
                                <BadgeEl meta={COMMISSION_META[commission.status]} />
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-2xl p-6 space-y-4">
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Cerrar quincena</h3>
            <p className="text-[var(--text-muted)] text-xs">
              Al cerrar esta quincena no podrá modificarse accidentalmente. Solo el admin puede reabrirla.
              ¿Confirmas el cierre de{" "}
              <span className="text-[var(--text-primary)]">
                {store.fortnights.find((f) => f.id === confirmClose)?.label}
              </span>?
            </p>
            <div className="flex gap-2">
              <button className={S.btnDanger} onClick={() => { store.closeFortnight(confirmClose); setConfirmClose(null); }}>
                Cerrar quincena
              </button>
              <button className={S.btnSecondary} onClick={() => setConfirmClose(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Suppresses unused import warning
void fmtDate;
