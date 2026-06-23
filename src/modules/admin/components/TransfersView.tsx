"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import type { TransferType, TransferStatus } from "@/types/user";
import {
  useAdminStore,
  TRANSFER_TYPE_LABELS, TRANSFER_STATUS_LABELS, BUSINESS_TYPE_LABELS,
} from "@/store/adminStore";
import {
  S, Th, BadgeEl, TRANSFER_STATUS_META, TRANSFER_TYPE_META, fmtDate, fmtDateTime,
} from "./adminUi";

// ── Add Transfer Modal ────────────────────────────────────────────────────────

// ── PreClient inline searcher ─────────────────────────────────────────────────

function PreClientSearcher({
  value,
  onSelect,
  onClear,
}: {
  value: string | null;
  onSelect: (id: string, name: string, phone: string, business: string, sellerId: string) => void;
  onClear: () => void;
}) {
  const { preClients, salesReps } = useAdminStore();
  const [query, setQuery] = useState("");
  const [open, setOpen]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const eligible = useMemo(
    () => preClients.filter((p) => p.status !== "converted" && p.status !== "discarded"),
    [preClients]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return eligible;
    return eligible.filter(
      (p) =>
        p.preClientNumber.toLowerCase().includes(q) ||
        p.specialistName.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.businessName ?? "").toLowerCase().includes(q)
    );
  }, [eligible, query]);

  const selected = value ? preClients.find((p) => p.id === value) : null;

  if (selected) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-lg border-[0.5px] border-[var(--accent)] bg-[var(--accent-muted)] px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[var(--accent)]">{selected.preClientNumber}</span>
            {selected.businessType && (
              <span className="text-[10px] text-[var(--text-muted)]">
                {BUSINESS_TYPE_LABELS[selected.businessType]}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{selected.specialistName}</p>
          {selected.businessName && (
            <p className="text-[11px] text-[var(--text-muted)]">{selected.businessName}</p>
          )}
          <p className="text-[11px] text-[var(--text-muted)] font-mono">{selected.phone}</p>
          {selected.sellerId && (
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Vendedor: {salesReps.find((r) => r.id === selected.sellerId)?.name ?? selected.sellerNumber}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-[var(--text-muted)] hover:text-[var(--danger)] text-lg leading-none transition-colors"
          title="Quitar precliente"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <input
        className={S.input}
        placeholder="Buscar por nombre, teléfono o N° de precliente…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-40 rounded-lg border-[0.5px] border-[var(--border)] shadow-xl overflow-hidden max-h-56 overflow-y-auto"
          style={{ background: "var(--bg-elevated)" }}
        >
          {eligible.length === 0 && (
            <p className="px-3 py-3 text-xs text-[var(--text-muted)]">No hay preclientes disponibles.</p>
          )}
          {filtered.length === 0 && eligible.length > 0 && (
            <p className="px-3 py-3 text-xs text-[var(--text-muted)]">Sin coincidencias.</p>
          )}
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              className="w-full text-left px-3 py-2.5 hover:bg-[var(--bg-surface)] transition-colors border-b-[0.5px] border-[var(--border)] last:border-b-0"
              onClick={() => {
                onSelect(p.id, p.specialistName, p.phone, p.businessName ?? "", p.sellerId ?? "");
                setQuery("");
                setOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[var(--accent)]">{p.preClientNumber}</span>
                {p.businessType && (
                  <span className="text-[10px] text-[var(--text-muted)]">{BUSINESS_TYPE_LABELS[p.businessType]}</span>
                )}
              </div>
              <p className="text-xs font-medium text-[var(--text-primary)]">{p.specialistName}</p>
              {p.businessName && <p className="text-[11px] text-[var(--text-muted)]">{p.businessName}</p>}
              <p className="text-[11px] text-[var(--text-muted)] font-mono">{p.phone}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Add Transfer Modal ────────────────────────────────────────────────────────

function AddTransferModal({ onClose }: { onClose: () => void }) {
  const store = useAdminStore();
  const [type, setType] = useState<TransferType>("opening");
  const [ref, setRef] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  // Opening fields
  const [preClientId, setPreClientId]         = useState<string | null>(null);
  const [sellerId, setSellerId]               = useState("");
  const [prospectName, setProspectName]       = useState("");
  const [prospectPhone, setProspectPhone]     = useState("");
  const [prospectBusiness, setProspectBusiness] = useState("");

  // Monthly fields
  const [specialistId, setSpecialistId] = useState("");
  const [paymentMonth, setPaymentMonth] = useState("");

  const [error, setError] = useState("");

  const selectedRep    = store.salesReps.find((r) => r.id === sellerId);
  const selectedClient = store.clients.find((c) => c.id === specialistId);
  const availableMonths = useMemo(() => {
    if (!selectedClient) return [];
    return selectedClient.paymentHistory.filter((p) => p.status !== "paid");
  }, [selectedClient]);

  function handleSelectPreClient(id: string, name: string, phone: string, business: string, repId: string) {
    setPreClientId(id);
    setProspectName(name);
    setProspectPhone(phone);
    setProspectBusiness(business);
    if (repId) setSellerId(repId);
  }

  function handleClearPreClient() {
    setPreClientId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!ref.trim()) { setError("La referencia bancaria es obligatoria."); return; }
    if (!date) { setError("La fecha de transferencia es obligatoria."); return; }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) { setError("El monto debe ser mayor a 0."); return; }

    if (type === "opening") {
      if (!sellerId) { setError("Selecciona un vendedor."); return; }
      if (!prospectName.trim()) { setError("El nombre del prospecto es obligatorio."); return; }
      if (!prospectBusiness.trim()) { setError("El nombre del negocio es obligatorio."); return; }
    }
    if (type === "monthly") {
      if (!specialistId) { setError("Selecciona un especialista."); return; }
      if (!paymentMonth) { setError("Selecciona el mes a pagar."); return; }
    }

    const id = store.addTransfer({
      referenceNumber: ref.trim(),
      transferDate: date,
      amount: amountNum,
      type,
      internalNotes: notes.trim() || undefined,
      // Opening
      ...(type === "opening" && {
        preClientId:          preClientId ?? undefined,
        sellerId,
        sellerNumber:         selectedRep?.sellerNumber,
        sellerName:           selectedRep?.name,
        fixedCommissionAmount: selectedRep?.fixedCommissionAmount,
        prospectName:         prospectName.trim(),
        prospectPhone:        prospectPhone.trim() || undefined,
        prospectiveBusinessName: prospectBusiness.trim(),
      }),
      // Monthly
      ...(type === "monthly" && {
        specialistId,
        clientNumber: selectedClient?.clientNumber,
        paymentMonth,
      }),
    });

    if (id === null) {
      setError("Ya existe una transferencia con esa referencia bancaria.");
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-2xl flex flex-col max-h-[94vh]">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b-[0.5px] border-[var(--border)] shrink-0">
          <div>
            <h2 className="text-[var(--text-primary)] font-semibold">Registrar transferencia</h2>
            <p className="text-[var(--text-muted)] text-xs mt-0.5">La transferencia es el origen del flujo</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors text-lg">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto adm-scroll px-6 py-5 space-y-5">

          {/* Type selector */}
          <div>
            <label className={S.label}>Tipo de transferencia</label>
            <div className="flex gap-2">
              {(["opening", "monthly"] as TransferType[]).map((t) => (
                <button key={t} type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-[0.5px] transition-colors ${
                    type === t
                      ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                      : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
                  }`}>
                  {TRANSFER_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
              {type === "opening"
                ? "Apertura: genera un nuevo cliente y una comisión fija para el vendedor."
                : "Mensualidad: marca un mes específico de un especialista como pagado."}
            </p>
          </div>

          {/* Common fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={S.label}>Referencia bancaria *</label>
              <input className={S.input} value={ref} onChange={(e) => setRef(e.target.value)}
                placeholder="TRF-2026-100" />
            </div>
            <div>
              <label className={S.label}>Fecha de transferencia *</label>
              <input type="date" className={S.input} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className={S.label}>Monto (MXN) *</label>
              <input type="number" min="1" step="0.01" className={S.input}
                value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="599" />
            </div>
          </div>

          {/* Opening-specific fields */}
          {type === "opening" && (
            <div className="space-y-4 border-t-[0.5px] border-[var(--border)] pt-4">
              <p className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wide">Datos de apertura</p>

              {/* PreClient selector */}
              <div>
                <label className={S.label}>
                  Precliente
                  <span className="ml-1 font-normal lowercase tracking-normal text-[var(--text-muted)]">
                    — selecciona uno para cargar sus datos automáticamente
                  </span>
                </label>
                <PreClientSearcher
                  value={preClientId}
                  onSelect={handleSelectPreClient}
                  onClear={handleClearPreClient}
                />
              </div>

              <div>
                <label className={S.label}>Vendedor *</label>
                <select className={S.select} value={sellerId} onChange={(e) => setSellerId(e.target.value)}>
                  <option value="">Seleccionar vendedor…</option>
                  {store.salesReps.filter((r) => r.active).map((r) => (
                    <option key={r.id} value={r.id}>{r.sellerNumber} — {r.name} (comisión: ${r.fixedCommissionAmount})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={S.label}>Nombre del prospecto *</label>
                  <input className={S.input} value={prospectName} onChange={(e) => setProspectName(e.target.value)}
                    placeholder="Dra. María Pérez" />
                </div>
                <div>
                  <label className={S.label}>Teléfono del prospecto</label>
                  <input className={S.input} value={prospectPhone} onChange={(e) => setProspectPhone(e.target.value)}
                    placeholder="5512345678" />
                </div>
              </div>
              <div>
                <label className={S.label}>Nombre del futuro negocio *</label>
                <input className={S.input} value={prospectBusiness} onChange={(e) => setProspectBusiness(e.target.value)}
                  placeholder="Dental Ejemplo" />
              </div>
            </div>
          )}

          {/* Monthly-specific fields */}
          {type === "monthly" && (
            <div className="space-y-4 border-t-[0.5px] border-[var(--border)] pt-4">
              <p className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wide">Datos de mensualidad</p>
              <div>
                <label className={S.label}>Especialista *</label>
                <select className={S.select} value={specialistId} onChange={(e) => { setSpecialistId(e.target.value); setPaymentMonth(""); }}>
                  <option value="">Seleccionar especialista…</option>
                  {store.clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.clientNumber} — {c.business.name}</option>
                  ))}
                </select>
              </div>
              {selectedClient && (
                <div>
                  <label className={S.label}>Mes a pagar *</label>
                  {availableMonths.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)]">No hay meses pendientes para este cliente.</p>
                  ) : (
                    <select className={S.select} value={paymentMonth} onChange={(e) => setPaymentMonth(e.target.value)}>
                      <option value="">Seleccionar mes…</option>
                      {availableMonths.map((p) => (
                        <option key={p.id} value={p.monthLabel}>
                          {p.monthLabel} — vence {fmtDate(p.dueDate)} ({p.status})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className={S.label}>Notas internas</label>
            <textarea className={`${S.input} min-h-[60px] resize-none`}
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Contexto adicional…" />
          </div>

          {error && (
            <p className="text-[var(--danger)] text-xs bg-[var(--bg-elevated)] border-[0.5px] border-[var(--danger)] rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </form>

        <div className="flex items-center gap-2 px-6 py-4 border-t-[0.5px] border-[var(--border)] shrink-0">
          <button type="button" onClick={handleSubmit as unknown as React.MouseEventHandler}
            className={S.btnPrimary}>
            Registrar transferencia
          </button>
          <button type="button" className={S.btnSecondary} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ── Transfer detail drawer ────────────────────────────────────────────────────

function TransferDetailDrawer({ transferId, onClose }: { transferId: string; onClose: () => void }) {
  const store = useAdminStore();
  const t = store.transfers.find((x) => x.id === transferId);
  if (!t) return null;

  const rep        = t.sellerId    ? store.salesReps.find((r) => r.id === t.sellerId)   : undefined;
  const client     = t.clientId   ? store.clients.find((c) => c.id === t.clientId)
    : t.specialistId              ? store.clients.find((c) => c.id === t.specialistId) : undefined;
  const commission = store.commissions.find((c) => c.transferId === transferId);
  const preClient  = t.preClientId ? store.preClients.find((p) => p.id === t.preClientId) : undefined;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--bg-base)] border-l-[0.5px] border-[var(--border)] flex flex-col h-full">

        <div className="px-5 pt-5 pb-4 border-b-[0.5px] border-[var(--border)] shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BadgeEl meta={TRANSFER_TYPE_META[t.type]} />
                <BadgeEl meta={TRANSFER_STATUS_META[t.status]} />
              </div>
              <h2 className="text-[var(--text-primary)] font-semibold font-mono">{t.referenceNumber}</h2>
              <p className="text-[var(--text-muted)] text-xs mt-0.5">{fmtDate(t.transferDate)} · ${t.amount.toLocaleString("es-MX")} MXN</p>
            </div>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors text-lg">
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto adm-scroll px-5 py-5 space-y-5">

          {/* Vendor info (opening) */}
          {t.type === "opening" && (
            <section>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Vendedor</p>
              <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-xl px-4 py-3 space-y-1">
                <p className="text-xs font-medium text-[var(--text-primary)]">{t.sellerName ?? rep?.name ?? "—"}</p>
                <p className="font-mono text-[11px] text-[var(--accent)]">{t.sellerNumber}</p>
                {t.fixedCommissionAmount !== undefined && (
                  <p className="text-[10px] text-[var(--text-muted)]">Comisión fija: ${t.fixedCommissionAmount}</p>
                )}
              </div>
            </section>
          )}

          {/* Prospect info (opening pending) */}
          {t.type === "opening" && !t.clientId && (
            <section>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Prospecto</p>
              <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-xl px-4 py-3 space-y-1">
                {preClient && (
                  <p className="font-mono text-[11px] text-[var(--accent)] mb-1">{preClient.preClientNumber}</p>
                )}
                <p className="text-xs font-medium text-[var(--text-primary)]">{t.prospectName}</p>
                {t.prospectPhone && <p className="text-[11px] text-[var(--text-muted)]">{t.prospectPhone}</p>}
                {t.prospectiveBusinessName && (
                  <p className="text-[11px] text-[var(--accent)]">{t.prospectiveBusinessName}</p>
                )}
                {preClient?.businessType && (
                  <p className="text-[10px] text-[var(--text-muted)]">{BUSINESS_TYPE_LABELS[preClient.businessType]}</p>
                )}
              </div>
            </section>
          )}

          {/* Client created (opening verified) */}
          {t.type === "opening" && client && (
            <section>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Cliente generado</p>
              <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-xl px-4 py-3 space-y-1">
                <p className="text-xs font-medium text-[var(--text-primary)]">{client.business.name}</p>
                <p className="font-mono text-[11px] text-[var(--accent)]">{client.clientNumber}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{client.specialist.publicName}</p>
              </div>
            </section>
          )}

          {/* Monthly info */}
          {t.type === "monthly" && (
            <section>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Especialista</p>
              <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-xl px-4 py-3 space-y-1">
                <p className="text-xs font-medium text-[var(--text-primary)]">{client?.business.name ?? "—"}</p>
                <p className="font-mono text-[11px] text-[var(--text-muted)]">{t.clientNumber}</p>
                {t.paymentMonth && <p className="text-[11px] text-[var(--accent)] capitalize">Mes: {t.paymentMonth}</p>}
              </div>
            </section>
          )}

          {/* Commission */}
          {commission && (
            <section>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Comisión generada</p>
              <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-xl px-4 py-3 space-y-1">
                <p className="text-lg font-bold text-[var(--accent)]">${commission.amount.toLocaleString("es-MX")}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{TRANSFER_STATUS_LABELS[t.status]}</p>
                {commission.paidTransferRef && (
                  <p className="text-[10px] font-mono text-[var(--text-muted)]">Ref. pago: {commission.paidTransferRef}</p>
                )}
              </div>
            </section>
          )}

          {/* Timestamps */}
          <section>
            <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Fechas</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">Registrada</span>
                <span className="text-[var(--text-primary)]">{fmtDateTime(t.createdAt)}</span>
              </div>
              {t.verifiedAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Verificada</span>
                  <span className="text-[var(--text-primary)]">{fmtDateTime(t.verifiedAt)}</span>
                </div>
              )}
              {t.rejectedAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Rechazada</span>
                  <span className="text-[var(--danger)]">{fmtDateTime(t.rejectedAt)}</span>
                </div>
              )}
            </div>
          </section>

          {t.internalNotes && (
            <section>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Notas</p>
              <p className="text-xs text-[var(--text-primary)] whitespace-pre-wrap">{t.internalNotes}</p>
            </section>
          )}

          {/* Actions */}
          {t.status === "pending" && (
            <section>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Acciones</p>
              <div className="flex flex-col gap-2">
                <button
                  className={S.btnPrimary}
                  onClick={() => {
                    if (t.type === "opening") store.verifyOpeningTransfer(t.id);
                    else store.verifyMonthlyTransfer(t.id);
                    onClose();
                  }}>
                  ✓ Confirmar transferencia
                </button>
                <button
                  className={S.btnDanger}
                  onClick={() => { store.rejectTransfer(t.id); onClose(); }}>
                  ✕ Rechazar transferencia
                </button>
              </div>
              {t.type === "opening" && !t.clientId && (
                <p className="text-[10px] text-[var(--text-muted)] mt-2">
                  Al confirmar: se creará el cliente, el negocio y la comisión fija del vendedor.
                </p>
              )}
            </section>
          )}

          {(t.status === "verified" || t.status === "rejected") && (
            <section>
              <button
                className={S.btnDanger}
                onClick={() => { store.refundTransfer(t.id); onClose(); }}>
                Marcar como reembolsada
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function TransfersView() {
  const store = useAdminStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<TransferType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TransferStatus | "all">("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [search, setSearch] = useState("");

  // Derive available months from transfer dates
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    for (const t of store.transfers) {
      const d = new Date(t.transferDate + "T00:00:00");
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [store.transfers]);

  const filtered = useMemo(() => {
    return store.transfers.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterMonth !== "all") {
        const d = new Date(t.transferDate + "T00:00:00");
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (m !== filterMonth) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !t.referenceNumber.toLowerCase().includes(q) &&
          !(t.sellerNumber ?? "").toLowerCase().includes(q) &&
          !(t.clientNumber ?? "").toLowerCase().includes(q) &&
          !(t.prospectName ?? "").toLowerCase().includes(q) &&
          !(t.prospectiveBusinessName ?? "").toLowerCase().includes(q)
        ) return false;
      }
      return true;
    }).sort((a, b) => b.transferDate.localeCompare(a.transferDate));
  }, [store.transfers, filterType, filterStatus, filterMonth, search]);

  // Summary stats
  const totalAmount   = filtered.reduce((s, t) => s + t.amount, 0);
  const pendingCount  = filtered.filter((t) => t.status === "pending").length;
  const verifiedCount = filtered.filter((t) => t.status === "verified").length;
  const openingTotal  = filtered.filter((t) => t.type === "opening" && t.status === "verified").reduce((s, t) => s + t.amount, 0);
  const monthlyTotal  = filtered.filter((t) => t.type === "monthly" && t.status === "verified").reduce((s, t) => s + t.amount, 0);

  const hasFilters = filterType !== "all" || filterStatus !== "all" || filterMonth !== "all" || search.trim();

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[var(--text-primary)] font-semibold text-base">Transferencias</h2>
          <p className="text-[var(--text-muted)] text-xs mt-0.5">
            {store.transfers.length} total · {store.transfers.filter((t) => t.status === "pending").length} pendientes
          </p>
        </div>
        <button className={S.btnPrimary} onClick={() => setShowAdd(true)}>+ Registrar transferencia</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Monto total",    value: `$${totalAmount.toLocaleString("es-MX")}`, sub: `${filtered.length} transferencias` },
          { label: "Pendientes",     value: pendingCount,          sub: "por verificar" },
          { label: "Verificadas",    value: verifiedCount,         sub: "confirmadas" },
          { label: "Total aperturas", value: `$${openingTotal.toLocaleString("es-MX")}`, sub: "verificadas" },
          { label: "Total mensual",  value: `$${monthlyTotal.toLocaleString("es-MX")}`, sub: "verificadas" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl px-4 py-4 relative overflow-hidden bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)]">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-[var(--accent)]" />
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{s.value}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className={S.label}>Tipo</label>
          <select className={`${S.select} w-36`} value={filterType}
            onChange={(e) => setFilterType(e.target.value as TransferType | "all")}>
            <option value="all">Todos</option>
            {(Object.entries(TRANSFER_TYPE_LABELS) as [TransferType, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={S.label}>Estado</label>
          <select className={`${S.select} w-36`} value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TransferStatus | "all")}>
            <option value="all">Todos</option>
            {(Object.entries(TRANSFER_STATUS_LABELS) as [TransferStatus, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={S.label}>Mes</label>
          <select className={`${S.select} w-44`} value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="all">Todos</option>
            {availableMonths.map((m) => {
              const [y, mo] = m.split("-");
              const label = new Date(`${y}-${mo}-01T00:00:00`).toLocaleDateString("es-MX", { month: "long", year: "numeric" });
              return <option key={m} value={m}>{label}</option>;
            })}
          </select>
        </div>
        <div>
          <label className={S.label}>Buscar</label>
          <input className={`${S.input} w-64`} placeholder="Referencia, vendedor, cliente…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {hasFilters && (
          <button className="self-end pb-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            onClick={() => { setFilterType("all"); setFilterStatus("all"); setFilterMonth("all"); setSearch(""); }}>
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)]">
        <div className="px-5 py-3.5 border-b-[0.5px] border-[var(--border)]">
          <p className="text-[11px] text-[var(--text-muted)]">{filtered.length} transferencias</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-[0.5px] border-[var(--border)]">
                <Th>Fecha</Th>
                <Th>Referencia</Th>
                <Th>Tipo</Th>
                <Th right>Monto</Th>
                <Th>Estado</Th>
                <Th>Vendedor</Th>
                <Th>Cliente / Prospecto</Th>
                <Th>Mes pagado</Th>
                <Th right>Comisión</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-[var(--text-muted)] text-sm">
                    Sin transferencias con esos filtros
                  </td>
                </tr>
              )}
              {filtered.map((t) => {
                const commission = store.commissions.find((c) => c.transferId === t.id);
                const clientName = t.clientId
                  ? store.clients.find((c) => c.id === t.clientId)?.business.name
                  : t.specialistId
                  ? store.clients.find((c) => c.id === t.specialistId)?.business.name
                  : t.prospectiveBusinessName;
                return (
                  <tr key={t.id}
                    className="border-b-[0.5px] border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                    onClick={() => setSelectedId(t.id)}>
                    <td className="px-5 py-3">
                      <span className="text-[11px] text-[var(--text-muted)]">{fmtDate(t.transferDate)}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-[11px] text-[var(--accent)]">{t.referenceNumber}</span>
                    </td>
                    <td className="px-5 py-3">
                      <BadgeEl meta={TRANSFER_TYPE_META[t.type]} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-xs font-semibold text-[var(--text-primary)] tabular-nums">
                        ${t.amount.toLocaleString("es-MX")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <BadgeEl meta={TRANSFER_STATUS_META[t.status]} />
                    </td>
                    <td className="px-5 py-3">
                      {t.sellerNumber ? (
                        <div>
                          <p className="font-mono text-[11px] text-[var(--accent)]">{t.sellerNumber}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{t.sellerName ?? "—"}</p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[var(--border)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 min-w-[140px]">
                      <div>
                        <p className="text-xs text-[var(--text-primary)] truncate max-w-[160px]">
                          {clientName ?? "—"}
                        </p>
                        {(t.clientNumber) && (
                          <p className="font-mono text-[10px] text-[var(--text-muted)]">{t.clientNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {t.paymentMonth ? (
                        <span className="text-[11px] text-[var(--text-muted)] capitalize">{t.paymentMonth}</span>
                      ) : (
                        <span className="text-[11px] text-[var(--border)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {commission ? (
                        <span className="text-xs font-semibold text-[var(--accent)] tabular-nums">
                          ${commission.amount.toLocaleString("es-MX")}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--border)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {t.status === "pending" ? (
                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button className={S.btnPrimary + " !px-2 !py-1 !text-[11px]"}
                            onClick={() => {
                              if (t.type === "opening") store.verifyOpeningTransfer(t.id);
                              else store.verifyMonthlyTransfer(t.id);
                            }}>
                            Confirmar
                          </button>
                          <button className="px-2 py-1 rounded text-[11px] text-[var(--danger)] border-[0.5px] border-[var(--danger)] hover:bg-[var(--danger)] hover:text-[var(--bg-base)] transition-colors"
                            onClick={() => store.rejectTransfer(t.id)}>
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[var(--text-muted)]">Ver →</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd    && <AddTransferModal onClose={() => setShowAdd(false)} />}
      {selectedId && <TransferDetailDrawer transferId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
