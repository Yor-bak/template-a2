"use client";
import { useState } from "react";
import type {
  AdminClient,
  ClientStatus,
  ContractType,
  MonthlyPaymentStatus,
  OnboardingChecklist,
  PaymentStatus,
  PublicPageStatus,
  UserPlan,
} from "@/types/user";
import {
  useAdminStore,
  CONTRACT_TYPE_LABELS,
  CLIENT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ONBOARDING_STATUS_LABELS,
  DOC_TYPE_LABELS,
  CLIENT_TYPE_LABELS,
} from "@/store/adminStore";
import {
  S, BadgeEl, ProBadge, AccessBadge, SectionTitle, Divider, DRow,
  PAYMENT_META, CLIENT_META, MONTH_META, ONBOARDING_META, PAGE_META,
  CLIENT_TYPE_LABEL,
  fmtDate, fmtDateTime,
} from "./adminUi";

type Tab = "general" | "pagos" | "config" | "actividad";

const TABS: { key: Tab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "pagos", label: "Contrato y Pagos" },
  { key: "config", label: "Configuración" },
  { key: "actividad", label: "Actividad" },
];

const CHECKLIST_LABELS: Record<keyof OnboardingChecklist, string> = {
  basicData: "Datos básicos",
  services: "Servicios",
  address: "Dirección",
  paymentMethods: "Métodos de pago",
  templateSelected: "Template seleccionado",
  colorsSelected: "Colores configurados",
  testimonials: "Testimonios",
};

export function ClientDrawer({
  clientId,
  onClose,
}: {
  clientId: string;
  onClose: () => void;
}) {
  const store = useAdminStore();
  const client = store.clients.find((c) => c.id === clientId);
  const [tab, setTab] = useState<Tab>("general");
  const [notesEdit, setNotesEdit] = useState<string | null>(null);
  const [slugEdit, setSlugEdit] = useState<string | null>(null);
  const [renewType, setRenewType] = useState<ContractType>("six_months");

  if (!client) return null;

  const c = client;

  function saveNotes() {
    if (notesEdit !== null) {
      store.setNotes(c.id, notesEdit);
      setNotesEdit(null);
    }
  }

  function saveSlug() {
    if (slugEdit !== null && slugEdit.trim()) {
      store.setSlug(c.id, slugEdit.trim());
      setSlugEdit(null);
    }
  }

  // ── Tab: General ────────────────────────────────────────────────────────────

  function GeneralTab() {
    const [assignedEdit, setAssignedEdit] = useState<string | null>(null);
    return (
      <div className="space-y-5">
        {/* Quick actions */}
        <section>
          <SectionTitle>Acciones rápidas</SectionTitle>
          <div className="flex flex-wrap gap-2">
            <button
              className={c.accessActive ? S.btnDanger : S.btnGreen}
              onClick={() => store.setAccess(c.id, !c.accessActive)}
            >
              {c.accessActive ? "Bloquear acceso" : "Activar acceso"}
            </button>
            <button
              className={c.publicPageStatus === "published" ? S.btnSecondary : S.btnRose}
              onClick={() =>
                store.setPublicPageStatus(
                  c.id,
                  c.publicPageStatus === "published" ? "hidden" : "published"
                )
              }
            >
              {c.publicPageStatus === "published" ? "Ocultar página" : "Publicar página"}
            </button>
            <button
              className={c.isPro ? S.btnSecondary : S.btnRose}
              onClick={() => store.setPro(c.id, !c.isPro)}
            >
              {c.isPro ? "Quitar Pro" : "Activar Pro"}
            </button>
          </div>
        </section>

        <Divider />

        {/* Datos */}
        <section>
          <SectionTitle>Datos del consultorio</SectionTitle>
          <div className="space-y-1.5">
            <DRow label="Tipo">{CLIENT_TYPE_LABEL[c.clientType]}</DRow>
            <DRow label="Teléfono">
              <a href={`tel:${c.phone}`} className="text-[#9c6fd4] hover:underline">
                {c.phone}
              </a>
            </DRow>
            <DRow label="Dirección">{c.clinicAddress}</DRow>
            {c.googleMapsUrl && (
              <DRow label="Maps">
                <a href={c.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                  className="text-[#9c6fd4] hover:underline text-xs">
                  Ver en Maps
                </a>
              </DRow>
            )}
          </div>
        </section>

        <Divider />

        {/* Web */}
        <section>
          <SectionTitle>Subdominio</SectionTitle>
          {slugEdit === null ? (
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-[#9c6fd4]">{c.subdomain}</span>
              <button className={S.btnGhost} onClick={() => setSlugEdit(c.slug)}>
                Editar
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                className={S.input}
                value={slugEdit}
                onChange={(e) => setSlugEdit(e.target.value)}
              />
              <button className={S.btnPrimary} onClick={saveSlug}>Guardar</button>
              <button className={S.btnSecondary} onClick={() => setSlugEdit(null)}>✕</button>
            </div>
          )}
        </section>

        <Divider />

        {/* Estado y Plan */}
        <section>
          <SectionTitle>Estado y Plan</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={S.label}>Estado del cliente</label>
              <select
                className={S.select}
                value={c.clientStatus}
                onChange={(e) => store.setClientStatus(c.id, e.target.value as ClientStatus)}
              >
                {(Object.entries(CLIENT_STATUS_LABELS) as [ClientStatus, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={S.label}>Plan</label>
              <select
                className={S.select}
                value={c.plan}
                onChange={(e) => store.setPlan(c.id, e.target.value as UserPlan)}
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          </div>
        </section>

        <Divider />

        {/* Página pública */}
        <section>
          <SectionTitle>Página pública</SectionTitle>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <BadgeEl meta={PAGE_META[c.publicPageStatus]} />
              <p className="font-mono text-[11px] text-[#4a4260] mt-1">{c.subdomain}</p>
            </div>
            <select
              className={`${S.select} w-36`}
              value={c.publicPageStatus}
              onChange={(e) => store.setPublicPageStatus(c.id, e.target.value as PublicPageStatus)}
            >
              <option value="published">Publicada</option>
              <option value="hidden">Oculta</option>
            </select>
          </div>
        </section>

        <Divider />

        {/* Responsable */}
        <section>
          <SectionTitle>Responsable interno</SectionTitle>
          {assignedEdit === null ? (
            <div className="flex items-center justify-between">
              <span className="text-[#ede8f5] text-sm">{c.assignedTo || "—"}</span>
              <button className={S.btnGhost} onClick={() => setAssignedEdit(c.assignedTo ?? "")}>
                Editar
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                className={S.input}
                value={assignedEdit}
                onChange={(e) => setAssignedEdit(e.target.value)}
                placeholder="Pedro, Ventas, Soporte…"
              />
              <button
                className={S.btnPrimary}
                onClick={() => {
                  store.setAssignedTo(c.id, assignedEdit);
                  setAssignedEdit(null);
                }}
              >
                Guardar
              </button>
              <button className={S.btnSecondary} onClick={() => setAssignedEdit(null)}>✕</button>
            </div>
          )}
        </section>
      </div>
    );
  }

  // ── Tab: Pagos ───────────────────────────────────────────────────────────────

  function PagosTab() {
    const [editActiv, setEditActiv] = useState(c.activationDate);
    const [editType, setEditType] = useState<ContractType>(c.contractType);
    const paidCount = c.paymentHistory.filter((p) => p.status === "paid").length;
    const totalMonths = c.paymentHistory.length;

    return (
      <div className="space-y-5">
        {/* Resumen de contrato */}
        <section>
          <SectionTitle>Contrato</SectionTitle>
          <div className="space-y-1.5">
            <DRow label="Tipo">{CONTRACT_TYPE_LABELS[c.contractType]}</DRow>
            <DRow label="Inicio">{fmtDate(c.activationDate)}</DRow>
            <DRow label="Vencimiento">
              <span className={new Date(c.contractEndDate) < new Date() ? "text-[#a84040]" : "text-[#4a9e6e]"}>
                {fmtDate(c.contractEndDate)}
              </span>
            </DRow>
            <DRow label="Monto mensual">
              {c.monthlyAmount ? `$${c.monthlyAmount.toLocaleString("es-MX")} MXN` : "—"}
            </DRow>
          </div>
        </section>

        {/* Renovar contrato */}
        <section className="bg-[#16121f] border border-[#2a2240] rounded-lg p-4 space-y-3">
          <p className="text-[#8a80a0] text-xs font-medium">Renovar contrato (nueva fecha de hoy)</p>
          <div className="flex gap-2">
            <select
              className={`${S.select} flex-1`}
              value={renewType}
              onChange={(e) => setRenewType(e.target.value as ContractType)}
            >
              {(Object.entries(CONTRACT_TYPE_LABELS) as [ContractType, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <button
              className={S.btnRose}
              onClick={() => store.renewContract(c.id, renewType)}
            >
              Renovar
            </button>
          </div>
        </section>

        {/* Actualizar fechas */}
        <section className="bg-[#16121f] border border-[#2a2240] rounded-lg p-4 space-y-3">
          <p className="text-[#8a80a0] text-xs font-medium">Actualizar fechas del contrato</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={S.label}>Inicio</label>
              <input type="date" className={S.input} value={editActiv} onChange={(e) => setEditActiv(e.target.value)} />
            </div>
            <div>
              <label className={S.label}>Tipo</label>
              <select className={S.select} value={editType} onChange={(e) => setEditType(e.target.value as ContractType)}>
                {(Object.entries(CONTRACT_TYPE_LABELS) as [ContractType, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            className={S.btnSecondary}
            onClick={() => store.regenerateHistory(c.id, editActiv, editType)}
          >
            Aplicar y regenerar historial
          </button>
        </section>

        <Divider />

        {/* Estado de pago global */}
        <section>
          <SectionTitle>Estado de pago</SectionTitle>
          <div className="flex items-center justify-between mb-3">
            <BadgeEl meta={PAYMENT_META[c.paymentStatus]} />
            <select
              className={`${S.select} w-40`}
              value={c.paymentStatus}
              onChange={(e) => store.setPaymentStatus(c.id, e.target.value as PaymentStatus)}
            >
              {(Object.entries(PAYMENT_STATUS_LABELS) as [PaymentStatus, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          {/* Progress */}
          <div className="mb-1">
            <div className="h-1.5 bg-[#16121f] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4a9e6e] rounded-full transition-all"
                style={{ width: `${totalMonths ? (paidCount / totalMonths) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-[#4a4260] mt-1">
              {paidCount}/{totalMonths} meses pagados
            </p>
          </div>
        </section>

        {/* Historial mensual */}
        <section>
          <SectionTitle>Historial mensual</SectionTitle>
          <div className="space-y-1.5">
            {c.paymentHistory.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-[#1a1628] last:border-0">
                <div className="min-w-0">
                  <p className="text-xs text-[#ede8f5] capitalize">{p.monthLabel}</p>
                  {p.paidAt && (
                    <p className="text-[10px] text-[#4a4260]">Pagado: {fmtDate(p.paidAt)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.amount !== undefined && (
                    <span className="text-[11px] text-[#4a4260]">
                      ${p.amount.toLocaleString("es-MX")}
                    </span>
                  )}
                  <select
                    className="bg-[#16121f] border border-[#2a2240] rounded text-[11px] text-[#ede8f5] px-2 py-1 focus:outline-none"
                    value={p.status}
                    onChange={(e) =>
                      store.setMonthStatus(c.id, p.id, e.target.value as MonthlyPaymentStatus)
                    }
                  >
                    <option value="paid">Pagado</option>
                    <option value="pending">Pendiente</option>
                    <option value="overdue">Vencido</option>
                    <option value="unpaid">No pagado</option>
                  </select>
                  <BadgeEl meta={MONTH_META[p.status]} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ── Tab: Configuración ───────────────────────────────────────────────────────

  function ConfigTab() {
    const items = Object.entries(CHECKLIST_LABELS) as [keyof OnboardingChecklist, string][];
    const doneCount = items.filter(([k]) => c.onboardingChecklist[k]).length;

    return (
      <div className="space-y-5">
        {/* Onboarding checklist */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Checklist de onboarding</SectionTitle>
            <BadgeEl meta={ONBOARDING_META[c.onboardingStatus]} />
          </div>
          <p className="text-[#4a4260] text-xs mb-3">
            {doneCount}/{items.length} completados
          </p>
          <div className="h-1.5 bg-[#16121f] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-[#6b3fa8] rounded-full transition-all"
              style={{ width: `${(doneCount / items.length) * 100}%` }}
            />
          </div>
          <div className="space-y-2">
            {items.map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={c.onboardingChecklist[key]}
                  onChange={(e) =>
                    store.updateOnboardingChecklist(c.id, { [key]: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-[#2a2240] bg-[#16121f] accent-[#6b3fa8]"
                />
                <span
                  className={`text-sm transition-colors ${
                    c.onboardingChecklist[key]
                      ? "text-[#ede8f5] line-through text-[#4a4260]"
                      : "text-[#8a80a0]"
                  }`}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
        </section>

        <Divider />

        {/* Documentos */}
        <section>
          <SectionTitle>Documentos</SectionTitle>
          {c.documents.length === 0 ? (
            <p className="text-[#4a4260] text-xs">Sin documentos adjuntos.</p>
          ) : (
            <div className="space-y-2">
              {c.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between bg-[#16121f] border border-[#2a2240] rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="text-xs text-[#ede8f5]">{doc.name}</p>
                    <p className="text-[10px] text-[#4a4260]">
                      {DOC_TYPE_LABELS[doc.type]}
                      {doc.uploadedAt && ` · ${fmtDate(doc.uploadedAt)}`}
                    </p>
                  </div>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={S.btnGhost}
                    >
                      Ver
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-[#4a4260] mt-3">
            La carga de documentos estará disponible cuando se integre el backend.
          </p>
        </section>

        <Divider />

        {/* Notas internas */}
        <section>
          <SectionTitle>Notas internas</SectionTitle>
          {notesEdit === null ? (
            <div className="space-y-2">
              <p className="text-xs text-[#8a80a0] whitespace-pre-wrap min-h-[2rem]">
                {c.internalNotes || <span className="text-[#4a4260]">Sin notas.</span>}
              </p>
              <button className={S.btnGhost} onClick={() => setNotesEdit(c.internalNotes ?? "")}>
                Editar
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                className={`${S.input} min-h-[100px] resize-none`}
                value={notesEdit}
                onChange={(e) => setNotesEdit(e.target.value)}
              />
              <div className="flex gap-2">
                <button className={S.btnPrimary} onClick={saveNotes}>Guardar</button>
                <button className={S.btnSecondary} onClick={() => setNotesEdit(null)}>Cancelar</button>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  // ── Tab: Actividad ───────────────────────────────────────────────────────────

  function ActividadTab() {
    return (
      <div className="space-y-5">
        <section>
          <SectionTitle>Historial de actividad</SectionTitle>
          {c.activityLog.length === 0 ? (
            <p className="text-[#4a4260] text-xs">Sin actividad registrada.</p>
          ) : (
            <div className="space-y-0">
              {c.activityLog.map((log, i) => (
                <div key={log.id} className="flex gap-3 pb-4 relative">
                  {i < c.activityLog.length - 1 && (
                    <div className="absolute left-[7px] top-5 bottom-0 w-px bg-[#1e1830]" />
                  )}
                  <div className="w-3.5 h-3.5 rounded-full bg-[#2a2240] border border-[#3a3255] shrink-0 mt-1" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#ede8f5]">{log.action}</p>
                    {log.detail && (
                      <p className="text-[11px] text-[#6b3fa8] mt-0.5">{log.detail}</p>
                    )}
                    <p className="text-[10px] text-[#4a4260] mt-0.5">
                      {fmtDateTime(log.date)}
                      {log.actor && ` · ${log.actor}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <Divider />

        <section>
          <SectionTitle>Metadatos</SectionTitle>
          <div className="space-y-1.5">
            <DRow label="N° de cliente">{c.clientNumber}</DRow>
            <DRow label="Creado">{fmtDate(c.createdAt)}</DRow>
            {c.updatedAt && <DRow label="Actualizado">{fmtDateTime(c.updatedAt)}</DRow>}
            {c.lastPaymentAt && <DRow label="Último pago">{fmtDate(c.lastPaymentAt)}</DRow>}
            {c.nextPaymentDueAt && <DRow label="Próximo pago">{fmtDate(c.nextPaymentDueAt)}</DRow>}
          </div>
        </section>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0d0a16] border-l border-[#1e1830] flex flex-col h-full">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#1e1830] shrink-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-[#4a4260]">{c.clientNumber}</span>
                <span className="text-[10px] text-[#4a4260]">·</span>
                <span className="text-[11px] text-[#6a6080]">{CLIENT_TYPE_LABELS[c.clientType]}</span>
              </div>
              <h2 className="text-[#ede8f5] font-semibold text-base leading-tight truncate">
                {c.clinicName}
              </h2>
              <p className="text-[#6a6080] text-xs mt-0.5">{c.specialistName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#4a4260] hover:text-[#8a80a0] text-xl leading-none shrink-0"
            >
              ×
            </button>
          </div>
          <div className="flex items-center flex-wrap gap-1.5 mt-2">
            <ProBadge isPro={c.isPro} />
            <AccessBadge active={c.accessActive} />
            <BadgeEl meta={PAYMENT_META[c.paymentStatus]} />
            <BadgeEl meta={CLIENT_META[c.clientStatus]} />
            <BadgeEl meta={ONBOARDING_META[c.onboardingStatus]} />
            <BadgeEl meta={PAGE_META[c.publicPageStatus]} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1e1830] shrink-0 px-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-3 text-xs font-medium transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? "text-[#9c6fd4] border-[#7c4db5]"
                  : "text-[#4a4260] border-transparent hover:text-[#8a80a0]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "general" && <GeneralTab />}
          {tab === "pagos" && <PagosTab />}
          {tab === "config" && <ConfigTab />}
          {tab === "actividad" && <ActividadTab />}
        </div>
      </div>
    </div>
  );
}
