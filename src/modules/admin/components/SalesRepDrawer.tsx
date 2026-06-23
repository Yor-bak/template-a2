"use client";
import { useState, useMemo } from "react";
import type { Fortnight, SalesRep } from "@/types/user";
import {
  useAdminStore,
  COMMISSION_STATUS_LABELS,
  PRE_CLIENT_STATUS_LABELS,
  MONTH_NAMES,
  getCurrentFortnight,
  getFortnightId,
  getFortnightRange,
  getLastDayOfMonth,
  getSellerFortnightCommissions,
  getSellerFortnightDebt,
  getVisibleSellerFortnights,
  getSellerFortnightHistory,
} from "@/store/adminStore";
import {
  S, SectionTitle, Divider, BadgeEl, COMMISSION_META, fmtDate,
} from "./adminUi";

// Suppress unused import warning
void COMMISSION_STATUS_LABELS;

type DrawerTab = "resumen" | "preclientes" | "ventas" | "comisiones" | "historial";

const DRAWER_TABS: { key: DrawerTab; label: string }[] = [
  { key: "resumen",     label: "Resumen"     },
  { key: "preclientes", label: "Preclientes" },
  { key: "ventas",      label: "Ventas"      },
  { key: "comisiones",  label: "Comisiones"  },
  { key: "historial",   label: "Historial"   },
];

function ftLabel(id: string, fortnights: Fortnight[]): string {
  const found = fortnights.find((f) => f.id === id);
  if (found) return found.label;
  const [y, m, h] = id.split("-").map(Number);
  const monthName = new Date(y, m - 1, 1).toLocaleDateString("es-MX", { month: "long" });
  const lastDay = getLastDayOfMonth(y, m);
  const range = h === 1 ? "1–15" : `16–${lastDay}`;
  return `${h === 1 ? "1a" : "2a"} quincena de ${monthName} ${y} (${range})`;
}

function ftRangeShort(id: string): string {
  const { start, end } = getFortnightRange(id);
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const mo = s.toLocaleDateString("es-MX", { month: "short" });
  return `${s.getDate()}–${e.getDate()} ${mo} ${s.getFullYear()}`;
}

export function SalesRepDrawer({ repId, onClose }: { repId: string; onClose: () => void }) {
  const store = useAdminStore();
  const rep = store.salesReps.find((r) => r.id === repId);

  const [activeTab, setActiveTab] = useState<DrawerTab>("resumen");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Pick<SalesRep, "name" | "phone" | "accountNumber" | "fixedCommissionAmount"> | null>(null);
  const [payModal, setPayModal] = useState<{ commId: string; ref: string; date: string } | null>(null);

  // Historial filters
  const [histYear,  setHistYear]  = useState<number>(() => new Date().getFullYear());
  const [histMonth, setHistMonth] = useState<number | null>(null);
  const [histHalf,  setHistHalf]  = useState<1 | 2 | null>(null);

  if (!rep) return null;

  const repCommissions = store.commissions.filter((c) => c.salesRepId === repId);
  const repTransfers   = store.transfers.filter((t) => t.sellerId === repId);
  const repClients     = store.clients.filter((c) => c.salesRepId === repId);
  const repPreClients  = store.preClients.filter((p) => p.sellerId === repId);

  const currentFt      = getCurrentFortnight();
  const visibleFts     = getVisibleSellerFortnights(repId, store.commissions);
  const historyFts     = getSellerFortnightHistory(repId, store.commissions);

  const totalAuthorized = repCommissions.filter((c) => c.status === "authorized").reduce((a, c) => a + c.amount, 0);
  const totalPaid       = repCommissions.filter((c) => c.status === "paid").reduce((a, c) => a + c.amount, 0);
  const currentDebt     = getSellerFortnightDebt(repId, currentFt, store.commissions);
  const previousDebt    = visibleFts
    .filter((fid) => fid !== currentFt)
    .reduce((sum, fid) => sum + getSellerFortnightDebt(repId, fid, store.commissions), 0);

  // Aperturas verificadas en la quincena actual (via transferencias)
  const currentFtOpeningTransfers = repTransfers.filter(
    (t) => t.type === "opening" && t.status === "verified" && getFortnightId(t.transferDate) === currentFt
  );
  const currentOpenings = currentFtOpeningTransfers.length;
  const currentFtTotalReceived = currentFtOpeningTransfers.reduce((s, t) => s + t.amount, 0);

  // Comisiones de la quincena actual
  const currentFtComms = getSellerFortnightCommissions(repId, currentFt, store.commissions);
  const currentFtAuthorized = currentFtComms.filter((c) => c.status === "authorized").reduce((s, c) => s + c.amount, 0);
  const currentFtPaid       = currentFtComms.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);

  // Available years from this seller's commission history
  const availableYears = useMemo(() => {
    const years = new Set(historyFts.map((fid) => parseInt(fid.split("-")[0])));
    if (years.size === 0) years.add(new Date().getFullYear());
    return [...years].sort((a, b) => b - a);
  }, [historyFts]);

  function startEdit() {
    setForm({
      name: rep!.name,
      phone: rep!.phone ?? "",
      accountNumber: rep!.accountNumber ?? "",
      fixedCommissionAmount: rep!.fixedCommissionAmount,
    });
    setEditing(true);
  }

  function saveEdit() {
    if (!form) return;
    store.updateSalesRep(repId, {
      ...form,
      phone: form.phone || undefined,
      accountNumber: form.accountNumber || undefined,
    });
    setEditing(false);
    setForm(null);
  }

  function submitPay() {
    if (!payModal) return;
    store.markCommissionPaid(payModal.commId, payModal.ref || undefined, payModal.date || undefined);
    setPayModal(null);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative w-full max-w-md bg-[var(--bg-base)] border-l-[0.5px] border-[var(--border)] flex flex-col h-full">

          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b-[0.5px] border-[var(--border)] shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] text-[var(--accent)]">{rep.sellerNumber}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border-[0.5px] font-medium ${
                    rep.active
                      ? "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]"
                      : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]"
                  }`}>{rep.active ? "Activo" : "Inactivo"}</span>
                </div>
                <h2 className="text-[var(--text-primary)] font-semibold">{rep.name}</h2>
                <p className="text-[var(--text-muted)] text-xs mt-0.5">
                  Com. fija: ${rep.fixedCommissionAmount.toLocaleString("es-MX")}
                </p>
              </div>
              <button onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors text-lg">
                ×
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b-[0.5px] border-[var(--border)] shrink-0">
            {DRAWER_TABS.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-3 py-2.5 text-[11px] font-medium transition-colors border-b-2 -mb-px whitespace-nowrap shrink-0 ${
                  activeTab === t.key
                    ? "text-[var(--accent)] border-[var(--accent)]"
                    : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto adm-scroll px-5 py-5 space-y-5">

            {/* Edit / toggle actions (always visible) */}
            <div className="flex gap-2 flex-wrap">
              <button className={S.btnGhost} onClick={startEdit}>Editar</button>
              <button
                className={rep.active ? S.btnDanger : S.btnSecondary}
                onClick={() => store.toggleSalesRep(repId)}>
                {rep.active ? "Desactivar" : "Activar"}
              </button>
            </div>

            {editing && form && (
              <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.14em]">Editar vendedor</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={S.label}>Nombre</label>
                    <input className={S.input} value={form.name}
                      onChange={(e) => setForm((f) => f && { ...f, name: e.target.value })} />
                  </div>
                  <div>
                    <label className={S.label}>Teléfono</label>
                    <input className={S.input} value={form.phone ?? ""}
                      onChange={(e) => setForm((f) => f && { ...f, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className={S.label}>Comisión fija (MXN)</label>
                    <input type="number" min="0" className={S.input}
                      value={form.fixedCommissionAmount}
                      onChange={(e) => setForm((f) => f && { ...f, fixedCommissionAmount: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="col-span-2">
                    <label className={S.label}>Número de cuenta</label>
                    <input className={S.input} value={form.accountNumber ?? ""}
                      onChange={(e) => setForm((f) => f && { ...f, accountNumber: e.target.value })}
                      placeholder="Banco 0000 0000 0000 0000" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className={S.btnPrimary} onClick={saveEdit}>Guardar</button>
                  <button className={S.btnSecondary} onClick={() => setEditing(false)}>Cancelar</button>
                </div>
              </div>
            )}

            {/* ── RESUMEN ── */}
            {activeTab === "resumen" && (
              <>
                {/* Quincena actual */}
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <SectionTitle>Quincena actual</SectionTitle>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border-[0.5px] ${
                      currentDebt > 0
                        ? "bg-[var(--bg-elevated)] text-[var(--danger)] border-[var(--danger)]"
                        : "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]"
                    }`}>
                      {currentDebt > 0 ? "Con deuda" : "Al corriente"}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mb-3 capitalize">
                    {ftLabel(currentFt, store.fortnights)} · {ftRangeShort(currentFt)}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Preclientes asignados",   value: repPreClients.length },
                      { label: "Aperturas verificadas",   value: currentOpenings },
                      { label: "Total recibido (aperturas)", value: currentFtTotalReceived > 0 ? `$${currentFtTotalReceived.toLocaleString("es-MX")}` : "—" },
                      { label: "Com. autorizada",         value: currentFtAuthorized > 0 ? `$${currentFtAuthorized.toLocaleString("es-MX")}` : "—" },
                      { label: "Com. pagada",             value: currentFtPaid > 0 ? `$${currentFtPaid.toLocaleString("es-MX")}` : "—" },
                      { label: "Deuda pendiente",         value: currentDebt > 0 ? `$${currentDebt.toLocaleString("es-MX")}` : "—",
                        danger: currentDebt > 0 },
                    ].map((s) => (
                      <div key={s.label} className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-lg px-3 py-2.5">
                        <p className="text-[10px] text-[var(--text-muted)]">{s.label}</p>
                        <p className={`text-sm font-semibold tabular-nums ${
                          "danger" in s && s.danger ? "text-[var(--danger)]" : "text-[var(--text-primary)]"
                        }`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <Divider />

                {/* Global summary */}
                <section>
                  <SectionTitle>Acumulado total</SectionTitle>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Com. autorizada total", value: `$${totalAuthorized.toLocaleString("es-MX")}` },
                      { label: "Com. pagada total",     value: `$${totalPaid.toLocaleString("es-MX")}` },
                      { label: "Deuda quincenas ant.",  value: previousDebt > 0 ? `$${previousDebt.toLocaleString("es-MX")}` : "—",
                        danger: previousDebt > 0 },
                    ].map((s) => (
                      <div key={s.label} className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-lg px-3 py-2.5">
                        <p className="text-[10px] text-[var(--text-muted)]">{s.label}</p>
                        <p className={`text-sm font-semibold tabular-nums ${
                          "danger" in s && s.danger ? "text-[var(--danger)]" : "text-[var(--text-primary)]"
                        }`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <Divider />
                <section>
                  <SectionTitle>Información</SectionTitle>
                  <div className="space-y-1.5">
                    {rep.phone && (
                      <Row label="Teléfono">
                        <a href={`tel:${rep.phone}`} className="text-[var(--accent)] hover:underline">{rep.phone}</a>
                      </Row>
                    )}
                    {rep.accountNumber && (
                      <Row label="Cuenta">
                        <span className="font-mono text-[var(--text-muted)]">{rep.accountNumber}</span>
                      </Row>
                    )}
                    <Row label="N° vendedor"><span className="font-mono">{rep.sellerNumber}</span></Row>
                    <Row label="Com. fija">${rep.fixedCommissionAmount.toLocaleString("es-MX")} MXN</Row>
                    <Row label="Clientes generados">{repClients.length}</Row>
                    <Row label="Aperturas totales">{repTransfers.filter((t) => t.type === "opening").length}</Row>
                    <Row label="Registrado">{fmtDate(rep.createdAt)}</Row>
                  </div>
                </section>
              </>
            )}

            {/* ── PRECLIENTES ── */}
            {activeTab === "preclientes" && (
              <section>
                <SectionTitle>Preclientes asignados</SectionTitle>
                {repPreClients.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">Sin preclientes asignados.</p>
                ) : (
                  <div className="space-y-2">
                    {repPreClients.map((p) => (
                      <div key={p.id} className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-lg px-3 py-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[11px] font-mono text-[var(--accent)]">{p.preClientNumber}</p>
                            <p className="text-xs font-medium text-[var(--text-primary)] truncate">{p.specialistName}</p>
                            {p.businessName && (
                              <p className="text-[10px] text-[var(--text-muted)] truncate">{p.businessName}</p>
                            )}
                          </div>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border-[0.5px] shrink-0 ${
                            p.status === "converted"
                              ? "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]"
                              : p.status === "discarded"
                              ? "bg-[var(--bg-elevated)] text-[var(--danger)] border-[var(--danger)]"
                              : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]"
                          }`}>
                            {PRE_CLIENT_STATUS_LABELS[p.status]}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">{fmtDate(p.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── VENTAS ── */}
            {activeTab === "ventas" && (
              <>
                <section>
                  <SectionTitle>Aperturas registradas</SectionTitle>
                  {repTransfers.filter((t) => t.type === "opening").length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)]">Sin aperturas registradas.</p>
                  ) : (
                    <div className="space-y-2">
                      {repTransfers.filter((t) => t.type === "opening").map((t) => {
                        const client = t.clientId ? store.clients.find((c) => c.id === t.clientId) : undefined;
                        return (
                          <div key={t.id} className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-lg px-3 py-2.5">
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0">
                                <p className="text-xs text-[var(--text-primary)] truncate">
                                  {client?.business.name ?? t.prospectiveBusinessName ?? "—"}
                                </p>
                                <p className="text-[10px] font-mono text-[var(--text-muted)]">{t.referenceNumber}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">
                                  {fmtDate(t.transferDate)}
                                  {t.verifiedAt ? ` · verificada ${fmtDate(t.verifiedAt.split("T")[0])}` : ""}
                                </p>
                                {client && (
                                  <p className="text-[10px] font-mono text-[var(--accent)] mt-0.5">{client.clientNumber}</p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-semibold text-[var(--accent)] tabular-nums block">
                                  ${t.amount.toLocaleString("es-MX")}
                                </span>
                                <span className={`text-[10px] ${t.status === "verified" ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                                  {t.status === "pending" ? "Pendiente"
                                    : t.status === "verified" ? "Verificada"
                                    : t.status === "rejected" ? "Rechazada"
                                    : "Reembolsada"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {repClients.length > 0 && (
                  <>
                    <Divider />
                    <section>
                      <SectionTitle>Clientes generados</SectionTitle>
                      <div className="space-y-1.5">
                        {repClients.map((c) => (
                          <div key={c.id} className="flex items-center justify-between bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-lg px-3 py-2">
                            <div>
                              <p className="text-xs text-[var(--text-primary)]">{c.business.name}</p>
                              <p className="text-[10px] text-[var(--text-muted)] font-mono">{c.clientNumber}</p>
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              ${(c.monthlyAmount ?? 0).toLocaleString("es-MX")}/mes
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                )}
              </>
            )}

            {/* ── COMISIONES ── */}
            {activeTab === "comisiones" && (
              <section>
                <SectionTitle>Comisiones por quincena</SectionTitle>
                <p className="text-[10px] text-[var(--text-muted)] mb-4">
                  Quincena actual · anteriores con deuda pendiente
                </p>
                <div className="space-y-4">
                  {visibleFts.map((fid) => {
                    const isCurrentFt = fid === currentFt;
                    const comms = getSellerFortnightCommissions(repId, fid, store.commissions);
                    const debt  = getSellerFortnightDebt(repId, fid, store.commissions);
                    const label = ftLabel(fid, store.fortnights);
                    const range = ftRangeShort(fid);

                    return (
                      <div key={fid} className={`rounded-xl border-[0.5px] overflow-hidden ${
                        isCurrentFt ? "border-[var(--accent)]" : "border-[var(--border)]"
                      }`}>
                        {/* Fortnight header */}
                        <div className={`px-3 py-2.5 border-b-[0.5px] border-[var(--border)] ${
                          isCurrentFt ? "bg-[var(--bg-elevated)]" : "bg-[var(--bg-surface)]"
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {isCurrentFt && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border-[0.5px] bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]">
                                    Actual
                                  </span>
                                )}
                                {debt > 0 && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border-[0.5px] bg-[var(--bg-elevated)] text-[var(--danger)] border-[var(--danger)]">
                                    Deuda
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-medium text-[var(--text-primary)] capitalize leading-snug">{label}</p>
                              <p className="text-[10px] text-[var(--text-muted)]">{range}</p>
                            </div>
                            {debt > 0 && (
                              <div className="text-right shrink-0">
                                <p className="text-[10px] text-[var(--text-muted)]">Deuda</p>
                                <p className="text-sm font-bold text-[var(--danger)] tabular-nums">
                                  ${debt.toLocaleString("es-MX")}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Commission rows */}
                        {comms.length === 0 ? (
                          <div className="px-3 py-3">
                            <p className="text-[10px] text-[var(--text-muted)]">Sin comisiones en esta quincena.</p>
                          </div>
                        ) : (
                          <div className="divide-y-[0.5px] divide-[var(--border)]">
                            {comms.map((comm) => {
                              const transfer = store.transfers.find((t) => t.id === comm.transferId);
                              return (
                                <div key={comm.id} className="px-3 py-3 space-y-1.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{comm.businessName}</p>
                                      <p className="text-[10px] font-mono text-[var(--text-muted)]">{comm.clientNumber}</p>
                                      {transfer && (
                                        <p className="text-[10px] text-[var(--text-muted)]">
                                          {transfer.referenceNumber}
                                          {transfer.verifiedAt
                                            ? ` · verificada ${fmtDate(transfer.verifiedAt.split("T")[0])}`
                                            : ""}
                                        </p>
                                      )}
                                    </div>
                                    <div className="shrink-0 text-right">
                                      <p className="text-sm font-bold text-[var(--accent)] tabular-nums">
                                        ${comm.amount.toLocaleString("es-MX")}
                                      </p>
                                      <BadgeEl meta={COMMISSION_META[comm.status]} />
                                    </div>
                                  </div>

                                  {comm.paidTransferRef && (
                                    <p className="text-[10px] text-[var(--text-muted)] font-mono">
                                      Ref: {comm.paidTransferRef}
                                      {comm.paidAt ? ` · ${fmtDate(comm.paidAt)}` : ""}
                                    </p>
                                  )}

                                  {/* Actions */}
                                  <div className="flex gap-1.5 pt-0.5">
                                    {comm.status === "pending" && (
                                      <>
                                        <button className={S.btnGhost}
                                          onClick={() => store.authorizeCommission(comm.id)}>
                                          Autorizar
                                        </button>
                                        <button className={S.btnDanger + " !px-2 !py-1 !text-[11px]"}
                                          onClick={() => store.cancelCommission(comm.id)}>✕</button>
                                      </>
                                    )}
                                    {comm.status === "authorized" && (
                                      <>
                                        <button
                                          className={S.btnPrimary + " !px-2.5 !py-1 !text-[11px]"}
                                          onClick={() => setPayModal({
                                            commId: comm.id,
                                            ref: "",
                                            date: new Date().toISOString().split("T")[0],
                                          })}>
                                          Marcar pagada
                                        </button>
                                        <button className={S.btnDanger + " !px-2 !py-1 !text-[11px]"}
                                          onClick={() => store.cancelCommission(comm.id)}>✕</button>
                                      </>
                                    )}
                                    {comm.status === "paid" && (
                                      <span className="text-[10px] text-[var(--text-muted)]">
                                        Pagada{comm.paidAt ? ` · ${fmtDate(comm.paidAt)}` : ""}
                                      </span>
                                    )}
                                    {comm.status === "cancelled" && (
                                      <span className="text-[10px] text-[var(--danger)]">Cancelada</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── HISTORIAL ── */}
            {activeTab === "historial" && (
              <section>
                <SectionTitle>Historial de quincenas</SectionTitle>

                {/* Filters */}
                <div className="space-y-2 mb-4 mt-2">
                  {/* Year selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wide w-10 shrink-0">Año</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {availableYears.map((y) => (
                        <button key={y}
                          onClick={() => { setHistYear(y); setHistMonth(null); setHistHalf(null); }}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border-[0.5px] transition-colors ${
                            histYear === y
                              ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                              : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)]"
                          }`}>{y}</button>
                      ))}
                    </div>
                  </div>
                  {/* Month selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wide w-10 shrink-0">Mes</span>
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => setHistMonth(null)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border-[0.5px] transition-colors ${
                          histMonth === null
                            ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                            : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)]"
                        }`}>Todos</button>
                      {MONTH_NAMES.map((mn, i) => {
                        const m = i + 1;
                        const hasFt = historyFts.some((fid) => {
                          const [fy, fm] = fid.split("-").map(Number);
                          return fy === histYear && fm === m;
                        });
                        if (!hasFt) return null;
                        return (
                          <button key={m}
                            onClick={() => setHistMonth(histMonth === m ? null : m)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border-[0.5px] transition-colors ${
                              histMonth === m
                                ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)]"
                            }`}>{mn.slice(0, 3)}</button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Half selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wide w-10 shrink-0">Q</span>
                    {([null, 1, 2] as (1 | 2 | null)[]).map((h) => (
                      <button key={String(h)}
                        onClick={() => setHistHalf(h)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border-[0.5px] transition-colors ${
                          histHalf === h
                            ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                            : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)]"
                        }`}>
                        {h === null ? "Todas" : h === 1 ? "1a quincena" : "2a quincena"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fortnight cards */}
                <div className="space-y-2">
                  {historyFts
                    .filter((fid) => {
                      const [fy, fm, fh] = fid.split("-").map(Number);
                      if (fy !== histYear) return false;
                      if (histMonth !== null && fm !== histMonth) return false;
                      if (histHalf !== null && fh !== histHalf) return false;
                      return true;
                    })
                    .map((fid) => {
                      const comms       = getSellerFortnightCommissions(repId, fid, store.commissions);
                      const debt        = getSellerFortnightDebt(repId, fid, store.commissions);
                      const authorized  = comms.filter((c) => c.status === "authorized").reduce((a, c) => a + c.amount, 0);
                      const paid        = comms.filter((c) => c.status === "paid").reduce((a, c) => a + c.amount, 0);
                      const openings    = comms.filter((c) => c.status !== "cancelled").length;
                      const label       = ftLabel(fid, store.fortnights);
                      const range       = ftRangeShort(fid);
                      const isCurrentFt = fid === currentFt;
                      const paidComms   = comms.filter((c) => c.status === "paid");

                      return (
                        <div key={fid} className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-xl p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {isCurrentFt && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border-[0.5px] bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]">
                                    Actual
                                  </span>
                                )}
                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border-[0.5px] ${
                                  debt > 0
                                    ? "bg-[var(--bg-elevated)] text-[var(--danger)] border-[var(--danger)]"
                                    : "bg-[var(--bg-elevated)] text-[var(--accent)] border-[var(--accent)]"
                                }`}>
                                  {debt > 0 ? "Con deuda" : "Al corriente"}
                                </span>
                              </div>
                              <p className="text-[11px] font-medium text-[var(--text-primary)] capitalize leading-snug">{label}</p>
                              <p className="text-[10px] text-[var(--text-muted)]">{range}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { l: "Aperturas",  v: openings },
                              { l: "Autorizada", v: authorized > 0 ? `$${authorized.toLocaleString("es-MX")}` : "—" },
                              { l: "Pagada",     v: paid > 0 ? `$${paid.toLocaleString("es-MX")}` : "—" },
                              { l: "Deuda",      v: debt > 0 ? `$${debt.toLocaleString("es-MX")}` : "—" },
                            ].map((s) => (
                              <div key={s.l}>
                                <p className="text-[9px] text-[var(--text-muted)]">{s.l}</p>
                                <p className="text-[11px] font-semibold text-[var(--text-primary)] tabular-nums">{s.v}</p>
                              </div>
                            ))}
                          </div>

                          {/* Paid commission references */}
                          {paidComms.length > 0 && (
                            <div className="pt-1 space-y-1 border-t-[0.5px] border-[var(--border)]">
                              {paidComms.map((c) => (
                                <div key={c.id} className="flex items-center justify-between gap-2 text-[10px]">
                                  <span className="text-[var(--text-muted)] truncate">{c.businessName}</span>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {c.paidTransferRef && (
                                      <span className="font-mono text-[var(--text-muted)]">{c.paidTransferRef}</span>
                                    )}
                                    {c.paidAt && (
                                      <span className="text-[var(--text-muted)]">{fmtDate(c.paidAt.split("T")[0])}</span>
                                    )}
                                    <span className="font-semibold text-[var(--accent)]">${c.amount.toLocaleString("es-MX")}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  {historyFts.filter((fid) => {
                    const [fy, fm, fh] = fid.split("-").map(Number);
                    if (fy !== histYear) return false;
                    if (histMonth !== null && fm !== histMonth) return false;
                    if (histHalf !== null && fh !== histHalf) return false;
                    return true;
                  }).length === 0 && (
                    <p className="text-xs text-[var(--text-muted)] py-3">Sin quincenas para los filtros seleccionados.</p>
                  )}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>

      {/* Pay modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-2xl p-6 space-y-4">
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Registrar pago de comisión</h3>
            {rep.accountNumber && (
              <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-lg px-3 py-2">
                <p className="text-[10px] text-[var(--text-muted)]">Cuenta del vendedor</p>
                <p className="text-xs font-mono text-[var(--text-primary)]">{rep.accountNumber}</p>
              </div>
            )}
            <div>
              <label className={S.label}>Referencia de transferencia</label>
              <input className={S.input} value={payModal.ref}
                onChange={(e) => setPayModal((m) => m && { ...m, ref: e.target.value })}
                placeholder="TRF-COM-001" />
            </div>
            <div>
              <label className={S.label}>Fecha</label>
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
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-[10px] text-[var(--text-muted)] shrink-0">{label}</span>
      <span className="text-xs text-[var(--text-primary)] text-right">{children}</span>
    </div>
  );
}
