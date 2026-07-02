"use client";
import { useState, useMemo } from "react";
import type { CommissionStatus } from "@/types/user";
import { useAdminStore, COMMISSION_STATUS_LABELS } from "@/store/adminStore";
import { S, Th, BadgeEl, COMMISSION_META, fmtDate, StatGrid, StatCell } from "./adminUi";

export function CommissionsView() {
  const store = useAdminStore();
  const [filterRep, setFilterRep]           = useState("all");
  const [filterStatus, setFilterStatus]     = useState<CommissionStatus | "all">("all");
  const [filterFortnight, setFilterFortnight] = useState("all");
  const [payModal, setPayModal] = useState<{ commId: string; ref: string; date: string } | null>(null);

  const fortnightOptions = useMemo(() => {
    const ids = new Set(store.commissions.map((c) => c.fortnightId));
    return Array.from(ids)
      .map((id) => ({ id, label: store.fortnights.find((f) => f.id === id)?.label ?? id }))
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [store.commissions, store.fortnights]);

  const filtered = useMemo(() => {
    return store.commissions.filter((c) => {
      if (filterRep !== "all" && c.salesRepId !== filterRep) return false;
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterFortnight !== "all" && c.fortnightId !== filterFortnight) return false;
      return true;
    }).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  }, [store.commissions, filterRep, filterStatus, filterFortnight]);

  const totalComm       = filtered.reduce((a, c) => a + c.amount, 0);
  const pendingTotal    = filtered.filter((c) => c.status === "pending").reduce((a, c) => a + c.amount, 0);
  const authorizedTotal = filtered.filter((c) => c.status === "authorized").reduce((a, c) => a + c.amount, 0);
  const paidTotal       = filtered.filter((c) => c.status === "paid").reduce((a, c) => a + c.amount, 0);

  function submitPay() {
    if (!payModal) return;
    store.markCommissionPaid(payModal.commId, payModal.ref || undefined, payModal.date || undefined);
    setPayModal(null);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[var(--text-primary)] font-semibold text-base">Comisiones</h2>
        <p className="text-[var(--text-muted)] text-xs mt-0.5">{store.commissions.length} registros totales · comisiones fijas</p>
      </div>

      {/* Summary cards */}
      <StatGrid cols={4} className="mb-6">
        {[
          { label: "Total comisiones", value: `$${totalComm.toLocaleString("es-MX")}`,       sub: `${filtered.length} registros` },
          { label: "Pendientes",       value: `$${pendingTotal.toLocaleString("es-MX")}`,    sub: `${filtered.filter((c) => c.status === "pending").length} comisiones` },
          { label: "Autorizadas",      value: `$${authorizedTotal.toLocaleString("es-MX")}`, sub: `${filtered.filter((c) => c.status === "authorized").length} comisiones` },
          { label: "Pagadas",          value: `$${paidTotal.toLocaleString("es-MX")}`,       sub: `${filtered.filter((c) => c.status === "paid").length} comisiones` },
        ].map((s) => (
          <StatCell key={s.label} label={s.label} value={s.value} sub={s.sub} />
        ))}
      </StatGrid>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className={S.label}>Vendedor</label>
          <select className={`${S.select} w-44`} value={filterRep} onChange={(e) => setFilterRep(e.target.value)}>
            <option value="all">Todos</option>
            {store.salesReps.map((r) => (
              <option key={r.id} value={r.id}>{r.sellerNumber} — {r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={S.label}>Estado</label>
          <select className={`${S.select} w-36`} value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as CommissionStatus | "all")}>
            <option value="all">Todos</option>
            {(Object.entries(COMMISSION_STATUS_LABELS) as [CommissionStatus, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={S.label}>Quincena</label>
          <select className={`${S.select} w-56`} value={filterFortnight} onChange={(e) => setFilterFortnight(e.target.value)}>
            <option value="all">Todas</option>
            {fortnightOptions.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
        {(filterRep !== "all" || filterStatus !== "all" || filterFortnight !== "all") && (
          <button className="self-end text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors pb-1"
            onClick={() => { setFilterRep("all"); setFilterStatus("all"); setFilterFortnight("all"); }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-none overflow-hidden bg-[var(--bg-base)] border-[0.5px] border-[var(--border)]">
        <div className="px-5 py-3.5 border-b-[0.5px] border-[var(--border)]">
          <p className="text-[11px] text-[var(--text-muted)]">{filtered.length} registros</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-[0.5px] border-[var(--border)]">
                <Th>Vendedor</Th>
                <Th>Cliente</Th>
                <Th>Negocio</Th>
                <Th>Quincena</Th>
                <Th>Fecha</Th>
                <Th right>Comisión fija</Th>
                <Th>Estado</Th>
                <Th>Ref. pago</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-[var(--text-muted)] text-sm">
                    Sin comisiones con esos filtros
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const fortnight = store.fortnights.find((f) => f.id === c.fortnightId);
                const isClosed = fortnight?.closed ?? false;
                return (
                  <tr key={c.id} className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-mono text-[11px] text-[var(--accent)]">{c.sellerNumber}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {store.salesReps.find((r) => r.id === c.salesRepId)?.name ?? "—"}
                      </p>
                      {(() => {
                        const acct = store.salesReps.find((r) => r.id === c.salesRepId)?.accountNumber;
                        return acct ? (
                          <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">{acct}</p>
                        ) : null;
                      })()}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">{c.clientNumber}</span>
                    </td>
                    <td className="px-5 py-3 min-w-[140px]">
                      <p className="text-xs text-[var(--text-primary)] truncate max-w-[140px]">{c.businessName}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[10px] text-[var(--text-muted)] capitalize max-w-[140px]">
                        {fortnight?.label ?? c.fortnightId}
                      </p>
                      {isClosed && (
                        <span className="text-[9px] text-[var(--text-muted)] border-[0.5px] border-[var(--border)] rounded px-1">
                          Cerrada
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] text-[var(--text-muted)]">{fmtDate(c.generatedAt)}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-xs font-semibold text-[var(--accent)] tabular-nums">
                        ${c.amount.toLocaleString("es-MX")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <BadgeEl meta={COMMISSION_META[c.status]} />
                    </td>
                    <td className="px-5 py-3">
                      {c.paidTransferRef ? (
                        <div>
                          <p className="text-[11px] font-mono text-[var(--text-muted)]">{c.paidTransferRef}</p>
                          {c.paidTransferDate && <p className="text-[10px] text-[var(--text-muted)]">{fmtDate(c.paidTransferDate)}</p>}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[var(--border)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        {c.status === "pending" && (
                          <>
                            <button className={S.btnGhost} onClick={() => store.authorizeCommission(c.id)}>Autorizar</button>
                            <button className="px-2 py-1 rounded text-[11px] text-[var(--danger)] border-[0.5px] border-[var(--danger)] hover:bg-[var(--danger)] hover:text-[var(--bg-base)] transition-colors"
                              onClick={() => store.cancelCommission(c.id)}>✕</button>
                          </>
                        )}
                        {c.status === "authorized" && (
                          <>
                            <button className={S.btnPrimary + " !px-2.5 !py-1 !text-[11px]"}
                              onClick={() => setPayModal({ commId: c.id, ref: "", date: new Date().toISOString().split("T")[0] })}>
                              Pagar
                            </button>
                            <button className="px-2 py-1 rounded text-[11px] text-[var(--danger)] border-[0.5px] border-[var(--danger)] hover:bg-[var(--danger)] hover:text-[var(--bg-base)] transition-colors"
                              onClick={() => store.cancelCommission(c.id)}>✕</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] shadow-[0_1px_3px_rgba(0,0,0,.35)] p-6 space-y-4">
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Registrar pago de comisión</h3>
            <div>
              <label className={S.label}>Referencia de transferencia</label>
              <input className={S.input} value={payModal.ref}
                onChange={(e) => setPayModal((m) => m && { ...m, ref: e.target.value })}
                placeholder="TRF-2026-001" />
            </div>
            <div>
              <label className={S.label}>Fecha de transferencia</label>
              <input type="date" className={S.input} value={payModal.date}
                onChange={(e) => setPayModal((m) => m && { ...m, date: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button className={S.btnPrimary} onClick={submitPay}>Confirmar pago</button>
              <button className={S.btnSecondary} onClick={() => setPayModal(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
