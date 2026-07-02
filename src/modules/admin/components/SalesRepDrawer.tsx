"use client";
import { useState } from "react";
import type { SalesRep } from "@/types/user";
import { useAdminStore, PRE_CLIENT_STATUS_LABELS } from "@/store/adminStore";
import { S, SectionTitle, Divider, fmtDate, TabBar, TabButton, StatGrid, StatCell } from "./adminUi";

type DrawerTab = "resumen" | "preclientes" | "ventas";

const DRAWER_TABS: { key: DrawerTab; label: string }[] = [
  { key: "resumen",     label: "Resumen"     },
  { key: "preclientes", label: "Preclientes" },
  { key: "ventas",      label: "Ventas"      },
];

export function SalesRepDrawer({ repId, onClose }: { repId: string; onClose: () => void }) {
  const store = useAdminStore();
  const rep = store.salesReps.find((r) => r.id === repId);

  const [activeTab, setActiveTab] = useState<DrawerTab>("resumen");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Pick<SalesRep, "name" | "phone" | "bankName" | "accountNumber" | "fixedCommissionAmount"> | null>(null);

  if (!rep) return null;

  const repTransfers  = store.transfers.filter((t) => t.sellerId === repId);
  const repClients    = store.clients.filter((c) => c.salesRepId === repId);
  const repPreClients = store.preClients.filter((p) => p.sellerId === repId);

  // Simple aggregates (no fortnight logic)
  const repCommissions    = store.commissions.filter((c) => c.salesRepId === repId);
  const totalAuthorized   = repCommissions.filter((c) => c.status === "authorized").reduce((a, c) => a + c.amount, 0);
  const totalPaid         = repCommissions.filter((c) => c.status === "paid").reduce((a, c) => a + c.amount, 0);
  const verifiedOpenings  = repTransfers.filter((t) => t.type === "opening" && t.status === "verified");

  function startEdit() {
    setForm({
      name: rep!.name,
      phone: rep!.phone ?? "",
      bankName: rep!.bankName ?? "",
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
      bankName: form.bankName || undefined,
      accountNumber: form.accountNumber || undefined,
    });
    setEditing(false);
    setForm(null);
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--bg-surface)] border-l-[0.5px] border-[var(--border)] shadow-[0_1px_3px_rgba(0,0,0,.35)] flex flex-col h-full">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b-[0.5px] border-[var(--border)] shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[11px] text-[var(--accent)]">{rep.sellerNumber}</span>
                <span className={`text-[10px] font-medium ${rep.active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                  {rep.active ? "Activo" : "Inactivo"}
                </span>
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
        <TabBar className="shrink-0 px-1">
          {DRAWER_TABS.map((t) => (
            <TabButton key={t.key} active={activeTab === t.key} onClick={() => setActiveTab(t.key)} className="px-3 py-2.5 mr-1 shrink-0">
              {t.label}
            </TabButton>
          ))}
        </TabBar>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto adm-scroll px-5 py-5 space-y-5">

          {/* Edit / toggle actions */}
          <div className="flex gap-2 flex-wrap">
            <button className={S.btnGhost} onClick={startEdit}>Editar</button>
            <button
              className={rep.active ? S.btnDanger : S.btnSecondary}
              onClick={() => store.toggleSalesRep(repId)}>
              {rep.active ? "Desactivar" : "Activar"}
            </button>
          </div>

          {editing && form && (
            <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] p-4 space-y-3">
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
                <div>
                  <label className={S.label}>Banco</label>
                  <input className={S.input} value={form.bankName ?? ""}
                    onChange={(e) => setForm((f) => f && { ...f, bankName: e.target.value })}
                    placeholder="BBVA" />
                </div>
                <div>
                  <label className={S.label}>Número de cuenta</label>
                  <input className={S.input} value={form.accountNumber ?? ""}
                    onChange={(e) => setForm((f) => f && { ...f, accountNumber: e.target.value })}
                    placeholder="0000 0000 0000 0000" />
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
              {/* Summary cards */}
              <section>
                <SectionTitle>Resumen general</SectionTitle>
                <StatGrid cols={2}>
                  {[
                    { label: "Aperturas verificadas", value: verifiedOpenings.length },
                    { label: "Clientes generados",    value: repClients.length },
                    { label: "Com. autorizada",        value: totalAuthorized > 0 ? `$${totalAuthorized.toLocaleString("es-MX")}` : "—" },
                    { label: "Com. pagada",            value: totalPaid > 0 ? `$${totalPaid.toLocaleString("es-MX")}` : "—" },
                  ].map((s) => (
                    <StatCell key={s.label} label={s.label} value={s.value} />
                  ))}
                </StatGrid>
                <p className="text-[10px] text-[var(--text-muted)] mt-2">
                  La gestión de pagos por quincena estará disponible próximamente.
                </p>
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
                  {(rep.bankName || rep.accountNumber) && (
                    <Row label="Cuenta">
                      <span className="font-mono text-[var(--text-muted)]">
                        {[rep.bankName, rep.accountNumber].filter(Boolean).join(" · ")}
                      </span>
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
                    <div key={p.id} className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-control)] px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-mono text-[var(--accent)]">{p.preClientNumber}</p>
                          <p className="text-xs font-medium text-[var(--text-primary)] truncate">{p.specialistName}</p>
                          {p.businessName && (
                            <p className="text-[10px] text-[var(--text-muted)] truncate">{p.businessName}</p>
                          )}
                        </div>
                        <span className={`text-[10px] font-medium shrink-0 ${
                          p.status === "converted"
                            ? "text-[var(--accent)]"
                            : p.status === "discarded"
                            ? "text-[var(--danger)]"
                            : "text-[var(--text-muted)]"
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
                        <div key={t.id} className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-control)] px-3 py-2.5">
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
                        <div key={c.id} className="flex items-center justify-between bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-control)] px-3 py-2">
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

        </div>
      </div>
    </div>
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
