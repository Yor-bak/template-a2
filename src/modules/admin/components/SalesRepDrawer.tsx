"use client";
import { useState } from "react";
import type { SalesRep } from "@/types/user";
import { useAdminStore, COMMISSION_STATUS_LABELS } from "@/store/adminStore";
import {
  S, SectionTitle, Divider, BadgeEl, COMMISSION_META, fmtDate,
} from "./adminUi";

export function SalesRepDrawer({ repId, onClose }: { repId: string; onClose: () => void }) {
  const store = useAdminStore();
  const rep = store.salesReps.find((r) => r.id === repId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Pick<SalesRep, "name" | "phone" | "fixedCommissionAmount"> | null>(null);
  const [payModal, setPayModal] = useState<{ commId: string; ref: string; date: string } | null>(null);

  if (!rep) return null;

  const repCommissions = store.commissions.filter((c) => c.salesRepId === repId);
  const repTransfers   = store.transfers.filter((t) => t.sellerId === repId);
  const repClients     = store.clients.filter((c) => c.salesRepId === repId);

  const totalReceived  = repTransfers.filter((t) => t.status === "verified").reduce((a, t) => a + t.amount, 0);
  const authorizedComm = repCommissions.filter((c) => c.status === "authorized").reduce((a, c) => a + c.amount, 0);
  const paidComm       = repCommissions.filter((c) => c.status === "paid").reduce((a, c) => a + c.amount, 0);
  const pendingComm    = repCommissions.filter((c) => c.status === "pending").reduce((a, c) => a + c.amount, 0);

  function startEdit() {
    setForm({ name: rep!.name, phone: rep!.phone ?? "", fixedCommissionAmount: rep!.fixedCommissionAmount });
    setEditing(true);
  }

  function saveEdit() {
    if (!form) return;
    store.updateSalesRep(repId, { ...form, phone: form.phone || undefined });
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
                <p className="text-[var(--text-muted)] text-xs mt-0.5">Comisión fija: ${rep.fixedCommissionAmount.toLocaleString("es-MX")}</p>
              </div>
              <button onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors text-lg">
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto adm-scroll px-5 py-5 space-y-5">

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
                </div>
                <div className="flex gap-2">
                  <button className={S.btnPrimary} onClick={saveEdit}>Guardar</button>
                  <button className={S.btnSecondary} onClick={() => setEditing(false)}>Cancelar</button>
                </div>
              </div>
            )}

            <Divider />

            <section>
              <SectionTitle>Resumen</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Aperturas",       value: repTransfers.filter((t) => t.type === "opening").length },
                  { label: "Clientes",         value: repClients.length },
                  { label: "Total recibido",   value: `$${totalReceived.toLocaleString("es-MX")}` },
                  { label: "Com. autorizada",  value: `$${authorizedComm.toLocaleString("es-MX")}` },
                  { label: "Com. pendiente",   value: `$${pendingComm.toLocaleString("es-MX")}` },
                  { label: "Com. pagada",      value: `$${paidComm.toLocaleString("es-MX")}` },
                ].map((s) => (
                  <div key={s.label} className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-[var(--text-muted)]">{s.label}</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">{s.value}</p>
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
                <Row label="Creado">{fmtDate(rep.createdAt)}</Row>
                <Row label="N° vendedor"><span className="font-mono">{rep.sellerNumber}</span></Row>
              </div>
            </section>

            <Divider />

            {/* Commissions */}
            <section>
              <SectionTitle>Comisiones</SectionTitle>
              {repCommissions.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">Sin comisiones generadas.</p>
              ) : (
                <div className="space-y-3">
                  {repCommissions.map((comm) => (
                    <div key={comm.id} className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-[var(--text-primary)]">{comm.businessName}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-mono">{comm.clientNumber} · {fmtDate(comm.generatedAt)}</p>
                        </div>
                        <BadgeEl meta={COMMISSION_META[comm.status]} />
                      </div>
                      <p className="text-lg font-bold text-[var(--accent)] tabular-nums">${comm.amount.toLocaleString("es-MX")}</p>
                      {comm.paidTransferRef && (
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">Ref: {comm.paidTransferRef}</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        {comm.status === "authorized" && (
                          <>
                            <button className={S.btnPrimary + " !px-2.5 !py-1 !text-[11px]"}
                              onClick={() => setPayModal({ commId: comm.id, ref: "", date: new Date().toISOString().split("T")[0] })}>
                              Marcar pagada
                            </button>
                            <button className={S.btnDanger + " !px-2 !py-1 !text-[11px]"}
                              onClick={() => store.cancelCommission(comm.id)}>✕</button>
                          </>
                        )}
                        {comm.status === "pending" && (
                          <>
                            <button className={S.btnGhost} onClick={() => store.authorizeCommission(comm.id)}>Autorizar</button>
                            <button className={S.btnDanger + " !px-2 !py-1 !text-[11px]"}
                              onClick={() => store.cancelCommission(comm.id)}>✕</button>
                          </>
                        )}
                        {comm.status === "paid" && (
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {COMMISSION_STATUS_LABELS["paid"]} {comm.paidAt && `· ${fmtDate(comm.paidAt)}`}
                          </span>
                        )}
                        {comm.status === "cancelled" && (
                          <span className="text-[10px] text-[var(--danger)]">Comisión cancelada</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Opening transfers */}
            {repTransfers.filter((t) => t.type === "opening").length > 0 && (
              <>
                <Divider />
                <section>
                  <SectionTitle>Aperturas</SectionTitle>
                  <div className="space-y-2">
                    {repTransfers.filter((t) => t.type === "opening").map((t) => {
                      const client = t.clientId ? store.clients.find((c) => c.id === t.clientId) : undefined;
                      return (
                        <div key={t.id} className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-lg px-3 py-2.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-[var(--text-primary)]">
                                {client?.business.name ?? t.prospectiveBusinessName ?? "—"}
                              </p>
                              <p className="text-[10px] font-mono text-[var(--text-muted)]">{t.referenceNumber} · {fmtDate(t.transferDate)}</p>
                            </div>
                            <span className="text-xs font-semibold text-[var(--accent)] tabular-nums">
                              ${t.amount.toLocaleString("es-MX")}
                            </span>
                          </div>
                          <p className={`text-[10px] mt-1 ${t.status === "verified" ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                            {t.status === "pending" ? "Pendiente" : t.status === "verified" ? "Verificada" : t.status === "rejected" ? "Rechazada" : "Reembolsada"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

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
          </div>
        </div>
      </div>

      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-2xl p-6 space-y-4">
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Registrar pago de comisión</h3>
            <div>
              <label className={S.label}>Referencia de transferencia</label>
              <input className={S.input} value={payModal.ref}
                onChange={(e) => setPayModal((m) => m && { ...m, ref: e.target.value })}
                placeholder="TRF-2026-001" />
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
