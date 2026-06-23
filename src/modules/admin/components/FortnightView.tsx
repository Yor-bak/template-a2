"use client";
import { useState, useMemo } from "react";
import type { Fortnight } from "@/types/user";
import {
  useAdminStore,
  getLastDayOfMonth,
  getCurrentFortnight,
  getFortnightDebt,
  getVisibleFortnights,
  getHistoricalFortnights,
} from "@/store/adminStore";
import { S, fmtDate, fmtDateTime } from "./adminUi";

type ViewMode = "main" | "history";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function FortnightView() {
  const store = useAdminStore();
  const [viewMode, setViewMode] = useState<ViewMode>("main");
  const [filterYear, setFilterYear]   = useState<number | "all">("all");
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  const [confirmClose, setConfirmClose] = useState<string | null>(null);

  // Ensure derived fortnights from transfers exist in the store
  useMemo(() => {
    for (const t of store.transfers) {
      const d = new Date(t.transferDate + "T00:00:00");
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const half = d.getDate() <= 15 ? 1 : 2;
      store.ensureFortnight(`${y}-${String(m).padStart(2, "0")}-${half}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.transfers]);

  const currentFortnightId = getCurrentFortnight();

  // IDs to show in main view: current + previous with debt
  const mainFortnightIds = useMemo(
    () => getVisibleFortnights(store.fortnights, store.commissions),
    [store.fortnights, store.commissions]
  );

  // All IDs for history view, with optional year/month filter
  const historyFortnightIds = useMemo(() => {
    const all = getHistoricalFortnights(store.fortnights);
    return all.filter((id) => {
      const f = store.fortnights.find((fn) => fn.id === id);
      if (!f) return false;
      if (filterYear !== "all" && f.year !== filterYear) return false;
      if (filterMonth !== "all" && f.month !== filterMonth) return false;
      return true;
    });
  }, [store.fortnights, filterYear, filterMonth]);

  const years = useMemo(() => {
    const ys = new Set(store.fortnights.map((f) => f.year));
    return Array.from(ys).sort((a, b) => b - a);
  }, [store.fortnights]);

  const activeIds = viewMode === "main" ? mainFortnightIds : historyFortnightIds;
  const activeFortnights = activeIds
    .map((id) => store.fortnights.find((f) => f.id === id))
    .filter(Boolean) as Fortnight[];

  function getFortnightStats(f: Fortnight) {
    const transfers = store.transfers.filter((t) => {
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
    const debt           = getFortnightDebt(f.id, store.commissions);

    return { transfers, openings, monthlyTrs, verifiedTrs, commissions, totalReceived, authorizedComm, paidComm, pendingComm, debt };
  }

  function getFortnightDayRange(f: Fortnight) {
    const lastDay = getLastDayOfMonth(f.year, f.month);
    return f.half === 1 ? "1–15" : `16–${lastDay}`;
  }

  // Vendors with authorized debt in a fortnight (for account number display)
  function getDebtByRep(f: Fortnight) {
    const authorizedComms = store.commissions.filter(
      (c) => c.fortnightId === f.id && c.status === "authorized"
    );
    const byRep = new Map<string, { repId: string; sellerNumber: string; name: string; accountNumber?: string; amount: number }>();
    for (const c of authorizedComms) {
      const rep = store.salesReps.find((r) => r.id === c.salesRepId);
      const existing = byRep.get(c.salesRepId);
      if (existing) {
        existing.amount += c.amount;
      } else {
        byRep.set(c.salesRepId, {
          repId: c.salesRepId,
          sellerNumber: c.sellerNumber,
          name: rep?.name ?? "—",
          accountNumber: rep?.accountNumber,
          amount: c.amount,
        });
      }
    }
    return Array.from(byRep.values());
  }

  function renderFortnightCard(f: Fortnight) {
    const stats = getFortnightStats(f);
    const range = getFortnightDayRange(f);
    const isCurrent = f.id === currentFortnightId;
    const debtByRep = getDebtByRep(f);

    return (
      <div key={f.id}
        className={`rounded-xl border-[0.5px] overflow-hidden ${
          isCurrent
            ? "border-[var(--accent)] bg-[var(--bg-elevated)]"
            : f.closed
            ? "border-[var(--border)] bg-[var(--bg-surface)]"
            : "border-[var(--border)] bg-[var(--bg-elevated)]"
        }`}>

        <div className="flex items-center justify-between px-5 py-4 border-b-[0.5px] border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {isCurrent && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded border-[0.5px] bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]">
                  Actual
                </span>
              )}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border-[0.5px] ${
                f.closed
                  ? "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]"
                  : "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]"
              }`}>
                {f.closed ? "Cerrada" : "Abierta"}
              </span>
              {stats.debt > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded border-[0.5px] bg-[var(--bg-elevated)] text-[var(--danger)] border-[var(--danger)]">
                  Deuda ${stats.debt.toLocaleString("es-MX")}
                </span>
              )}
            </div>
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
            { label: "Aperturas",      value: stats.openings.length },
            { label: "Mensualidades",  value: stats.monthlyTrs.length },
            { label: "Total recibido", value: `$${stats.totalReceived.toLocaleString("es-MX")}` },
            { label: "Comisiones",     value: stats.commissions.length },
            { label: "Com. pendiente", value: stats.pendingComm > 0 ? `$${stats.pendingComm.toLocaleString("es-MX")}` : "—" },
            { label: "Com. autorizada", value: stats.authorizedComm > 0 ? `$${stats.authorizedComm.toLocaleString("es-MX")}` : "—" },
            { label: "Com. pagada",    value: stats.paidComm > 0 ? `$${stats.paidComm.toLocaleString("es-MX")}` : "—" },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3">
              <p className="text-[10px] text-[var(--text-muted)]">{s.label}</p>
              <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Debt by vendor */}
        {debtByRep.length > 0 && (
          <div className="border-t-[0.5px] border-[var(--border)] px-5 py-3">
            <p className="text-[10px] text-[var(--danger)] font-medium mb-2">Comisiones por pagar</p>
            <div className="space-y-2">
              {debtByRep.map((r) => (
                <div key={r.repId} className="flex items-center gap-4 text-[11px]">
                  <span className="font-mono text-[var(--accent)] shrink-0">{r.sellerNumber}</span>
                  <span className="text-[var(--text-primary)]">{r.name}</span>
                  {r.accountNumber && (
                    <span className="font-mono text-[var(--text-muted)] text-[10px]">{r.accountNumber}</span>
                  )}
                  <span className="ml-auto font-semibold text-[var(--danger)] tabular-nums">
                    ${r.amount.toLocaleString("es-MX")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
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

      {/* Tab selector */}
      <div className="flex gap-1 mb-6 bg-[var(--bg-elevated)] rounded-lg p-1 w-fit border-[0.5px] border-[var(--border)]">
        {(["main", "history"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
              viewMode === mode
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] border-[0.5px] border-[var(--border)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}>
            {mode === "main" ? "Vista principal" : "Historial"}
          </button>
        ))}
      </div>

      {/* History filters */}
      {viewMode === "history" && (
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
      )}

      {/* Main view description */}
      {viewMode === "main" && (
        <p className="text-[var(--text-muted)] text-xs mb-4">
          Quincena actual + quincenas anteriores con comisiones autorizadas pendientes de pago.
        </p>
      )}

      {activeFortnights.length === 0 && (
        <p className="text-[var(--text-muted)] text-sm">Sin quincenas{viewMode === "history" ? " con esos filtros" : ""}.</p>
      )}

      <div className="space-y-4">
        {activeFortnights.map((f) => renderFortnightCard(f))}
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
