"use client";
import { useState, useMemo } from "react";
import { useAdminStore, BUSINESS_TYPE_LABELS, PRE_CLIENT_STATUS_LABELS } from "@/store/adminStore";
import { S, C } from "@/modules/admin/components/adminUi";
import type { PreClient, PreClientStatus, BusinessType } from "@/types/user";

// ── Design token aliases (Midnight Ink system) ────────────────────────────────
// Only the three system variants are used — never improvised Tailwind colors.
const B_ACCENT = `bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]`;
const B_MUTED  = `bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]`;
const B_DANGER = `bg-[var(--bg-elevated)] text-[var(--danger)] border-[var(--danger)]`;
const BADGE    = `inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide border-[0.5px]`;

// Status → visual variant mapping
// new / contacted        → muted   (neutral, no commitment yet)
// interested / negotiating / awaiting_payment → accent (active pipeline)
// converted              → accent  (success)
// discarded              → danger  (lost)
const PC_META: Record<PreClientStatus, { label: string; cls: string }> = {
  new:              { label: "Nuevo",          cls: B_MUTED  },
  contacted:        { label: "Contactado",     cls: B_MUTED  },
  interested:       { label: "Interesado",     cls: B_ACCENT },
  negotiating:      { label: "Negociando",     cls: B_ACCENT },
  awaiting_payment: { label: "Esp. pago",      cls: B_ACCENT },
  converted:        { label: "Convertido",     cls: B_ACCENT },
  discarded:        { label: "Descartado",     cls: B_DANGER },
};

const ALL_STATUSES: PreClientStatus[] = [
  "new", "contacted", "interested", "negotiating", "awaiting_payment", "converted", "discarded",
];

const ALL_BUSINESS_TYPES: BusinessType[] = [
  "dentist", "doctor", "physiotherapist", "nutritionist", "psychologist", "veterinarian", "other",
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PreClientStatus }) {
  const m = PC_META[status];
  return <span className={`${BADGE} ${m.cls}`}>{m.label}</span>;
}

// ── Copy phone button ─────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      title="Copiar teléfono"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-[10px] px-1.5 py-0.5 rounded border-[0.5px] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
    >
      {copied ? "✓" : "Copiar"}
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="py-16 text-center text-[var(--text-muted)] text-sm">
      {filtered ? "Sin resultados con los filtros aplicados." : "No hay preclientes registrados aún."}
    </div>
  );
}

// ── Create / Edit modal ───────────────────────────────────────────────────────

interface PcFormState {
  specialistName: string;
  phone: string;
  businessName: string;
  businessType: BusinessType | "";
  sellerId: string;
  status: PreClientStatus;
  notes: string;
}

const EMPTY_FORM: PcFormState = {
  specialistName: "", phone: "", businessName: "", businessType: "",
  sellerId: "", status: "new", notes: "",
};

function formFromPc(pc: PreClient): PcFormState {
  return {
    specialistName: pc.specialistName,
    phone:          pc.phone,
    businessName:   pc.businessName ?? "",
    businessType:   pc.businessType ?? "",
    sellerId:       pc.sellerId ?? "",
    status:         pc.status,
    notes:          pc.notes ?? "",
  };
}

function PcModal({ editing, onClose }: { editing: PreClient | null; onClose: () => void }) {
  const { salesReps, addPreClient, updatePreClient } = useAdminStore();
  const [form, setForm] = useState<PcFormState>(editing ? formFromPc(editing) : EMPTY_FORM);
  const [error, setError] = useState("");

  function set<K extends keyof PcFormState>(k: K, v: PcFormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.specialistName.trim()) { setError("El nombre del especialista es requerido."); return; }
    if (!form.phone.trim())          { setError("El teléfono es requerido."); return; }

    const rep = salesReps.find((r) => r.id === form.sellerId);
    const payload: Omit<PreClient, "id" | "preClientNumber" | "createdAt"> = {
      specialistName: form.specialistName.trim(),
      phone:          form.phone.trim(),
      businessName:   form.businessName.trim() || undefined,
      businessType:   (form.businessType as BusinessType) || undefined,
      sellerId:       form.sellerId || undefined,
      sellerNumber:   rep?.sellerNumber,
      status:         form.status,
      notes:          form.notes.trim() || undefined,
    };

    if (editing) updatePreClient(editing.id, payload);
    else         addPreClient(payload);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="w-full max-w-lg rounded-2xl border-[0.5px] border-[var(--border)] p-6"
        style={{ background: C.bgSurface }}
      >
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-5">
          {editing ? "Editar precliente" : "Nuevo precliente"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={S.label}>Nombre del especialista *</label>
              <input className={S.input} value={form.specialistName}
                onChange={(e) => set("specialistName", e.target.value)}
                placeholder="Dr. Nombre Apellido" />
            </div>
            <div>
              <label className={S.label}>Teléfono *</label>
              <input className={S.input} value={form.phone} type="tel"
                onChange={(e) => set("phone", e.target.value)}
                placeholder="55XXXXXXXX" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={S.label}>Nombre del negocio</label>
              <input className={S.input} value={form.businessName}
                onChange={(e) => set("businessName", e.target.value)}
                placeholder="Opcional" />
            </div>
            <div>
              <label className={S.label}>Tipo de negocio</label>
              <select className={S.select} value={form.businessType}
                onChange={(e) => set("businessType", e.target.value as BusinessType | "")}>
                <option value="">— Seleccionar —</option>
                {ALL_BUSINESS_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{BUSINESS_TYPE_LABELS[bt]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={S.label}>Vendedor asignado</label>
              <select className={S.select} value={form.sellerId}
                onChange={(e) => set("sellerId", e.target.value)}>
                <option value="">— Sin asignar —</option>
                {salesReps.filter((r) => r.active).map((r) => (
                  <option key={r.id} value={r.id}>{r.sellerNumber} — {r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={S.label}>Estado</label>
              <select className={S.select} value={form.status}
                onChange={(e) => set("status", e.target.value as PreClientStatus)}
                disabled={editing?.status === "converted"}>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{PRE_CLIENT_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={S.label}>Notas internas</label>
            <textarea
              className={`${S.input} resize-none`}
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Observaciones, acuerdos, próximos pasos…"
            />
          </div>

          {error && (
            <p className="text-[var(--danger)] text-xs bg-[var(--bg-elevated)] border-[0.5px] border-[var(--danger)] rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" className={`${S.btnPrimary} flex-1`}>
              {editing ? "Guardar cambios" : "Registrar precliente"}
            </button>
            <button type="button" onClick={onClose} className={S.btnSecondary}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PreClientsView() {
  const { preClients, clients, setPreClientStatus } = useAdminStore();
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<PreClientStatus | "all">("all");
  const [typeFilter, setTypeFilter]     = useState<BusinessType | "all">("all");
  const [showModal, setShowModal]       = useState(false);
  const [editing, setEditing]           = useState<PreClient | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return preClients.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (typeFilter  !== "all" && p.businessType !== typeFilter) return false;
      if (!q) return true;
      return (
        p.specialistName.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.preClientNumber.toLowerCase().includes(q) ||
        (p.businessName ?? "").toLowerCase().includes(q)
      );
    });
  }, [preClients, search, statusFilter, typeFilter]);

  const counts = useMemo(() => {
    const c: Partial<Record<PreClientStatus | "all", number>> = { all: preClients.length };
    for (const s of ALL_STATUSES) c[s] = preClients.filter((p) => p.status === s).length;
    return c;
  }, [preClients]);

  function openCreate() { setEditing(null); setShowModal(true); }
  function openEdit(pc: PreClient) { setEditing(pc); setShowModal(true); }

  function getClientNumber(clientId?: string) {
    if (!clientId) return null;
    return clients.find((c) => c.id === clientId)?.clientNumber ?? null;
  }

  const thCls = "px-3 py-2.5 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.1em] whitespace-nowrap";
  const tdCls = "px-3 py-3 text-sm text-[var(--text-primary)] align-middle";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Preclientes</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {preClients.length} registros · {counts["converted"] ?? 0} convertidos ·{" "}
            <span className="text-[var(--accent)]">
              Para registrar la transferencia, ve a la pestaña Transferencias
            </span>
          </p>
        </div>
        <button onClick={openCreate} className={S.btnPrimary}>+ Nuevo precliente</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <input
          className={`${S.input} max-w-xs`}
          placeholder="Buscar por nombre, teléfono o N°…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={`${S.select} w-auto`}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PreClientStatus | "all")}
        >
          <option value="all">Todos los estados ({counts.all})</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PRE_CLIENT_STATUS_LABELS[s]} ({counts[s] ?? 0})
            </option>
          ))}
        </select>
        <select
          className={`${S.select} w-auto`}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as BusinessType | "all")}
        >
          <option value="all">Todos los tipos</option>
          {ALL_BUSINESS_TYPES.map((bt) => (
            <option key={bt} value={bt}>{BUSINESS_TYPE_LABELS[bt]}</option>
          ))}
        </select>
        {(search || statusFilter !== "all" || typeFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); }}
            className={S.btnGhost}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div
        className="rounded-xl border-[0.5px] border-[var(--border)] overflow-x-auto"
        style={{ background: C.bgSurface }}
      >
        {filtered.length === 0 ? (
          <EmptyState filtered={!!(search || statusFilter !== "all" || typeFilter !== "all")} />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-[0.5px] border-[var(--border)]">
                <th className={thCls}>N°</th>
                <th className={thCls}>Especialista</th>
                <th className={thCls}>Negocio / Tipo</th>
                <th className={thCls}>Contacto</th>
                <th className={thCls}>Vendedor</th>
                <th className={thCls}>Estado</th>
                <th className={thCls}>Registro</th>
                <th className={thCls}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pc, i) => {
                const clientNum = getClientNumber(pc.convertedClientId);
                const isLast = i === filtered.length - 1;
                return (
                  <tr
                    key={pc.id}
                    className={`hover:bg-[var(--bg-elevated)] transition-colors ${isLast ? "" : "border-b-[0.5px] border-[var(--border)]"}`}
                  >
                    {/* N° */}
                    <td className={tdCls}>
                      <span className="font-mono text-xs font-semibold text-[var(--accent)]">
                        {pc.preClientNumber}
                      </span>
                    </td>

                    {/* Especialista + notas */}
                    <td className={tdCls}>
                      <div className="font-medium text-sm">{pc.specialistName}</div>
                      {pc.notes && (
                        <div
                          className="text-[11px] text-[var(--text-muted)] mt-0.5 max-w-[200px] truncate"
                          title={pc.notes}
                        >
                          {pc.notes}
                        </div>
                      )}
                    </td>

                    {/* Negocio / Tipo */}
                    <td className={tdCls}>
                      {pc.businessName && (
                        <div className="text-sm">{pc.businessName}</div>
                      )}
                      {pc.businessType && (
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {BUSINESS_TYPE_LABELS[pc.businessType]}
                        </div>
                      )}
                      {!pc.businessName && !pc.businessType && (
                        <span className="text-[var(--border)] text-xs">—</span>
                      )}
                    </td>

                    {/* Contacto */}
                    <td className={tdCls}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs">{pc.phone}</span>
                        <CopyBtn text={pc.phone} />
                        <a
                          href={`https://wa.me/52${pc.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] px-1.5 py-0.5 rounded border-[0.5px] border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-muted)] transition-colors"
                          title="Abrir WhatsApp"
                        >
                          WA
                        </a>
                      </div>
                    </td>

                    {/* Vendedor */}
                    <td className={tdCls}>
                      {pc.sellerNumber ? (
                        <span className="font-mono text-xs text-[var(--accent)]">{pc.sellerNumber}</span>
                      ) : (
                        <span className="text-[var(--text-muted)] text-xs">Sin asignar</span>
                      )}
                    </td>

                    {/* Estado (dropdown) */}
                    <td className={tdCls}>
                      <div className="relative">
                        <button
                          onClick={() =>
                            pc.status !== "converted"
                              ? setStatusDropdown(statusDropdown === pc.id ? null : pc.id)
                              : undefined
                          }
                          className="text-left"
                          disabled={pc.status === "converted"}
                        >
                          <StatusBadge status={pc.status} />
                        </button>

                        {statusDropdown === pc.id && (
                          <div
                            className="absolute top-full left-0 mt-1 z-30 rounded-lg border-[0.5px] border-[var(--border)] shadow-xl min-w-[170px] overflow-hidden"
                            style={{ background: C.bgElevated }}
                          >
                            {ALL_STATUSES.filter((s) => s !== "converted").map((s) => (
                              <button
                                key={s}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors"
                                onClick={() => { setPreClientStatus(pc.id, s); setStatusDropdown(null); }}
                              >
                                {PRE_CLIENT_STATUS_LABELS[s]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {pc.status === "converted" && clientNum && (
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">→ {clientNum}</div>
                      )}
                    </td>

                    {/* Fecha */}
                    <td className={`${tdCls} text-xs text-[var(--text-muted)] whitespace-nowrap`}>
                      {fmtDate(pc.createdAt)}
                    </td>

                    {/* Acciones */}
                    <td className={tdCls}>
                      <button onClick={() => openEdit(pc)} className={S.btnGhost}>
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <PcModal
          editing={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}

      {/* Backdrop for status dropdown */}
      {statusDropdown && (
        <div className="fixed inset-0 z-20" onClick={() => setStatusDropdown(null)} />
      )}
    </div>
  );
}
