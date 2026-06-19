"use client";
import { useState } from "react";
import type {
  ClientStatus, ContractType, MonthlyPaymentStatus,
  OnboardingChecklist, PaymentStatus, PublicPageStatus, UserPlan,
} from "@/types/user";
import {
  useAdminStore, CONTRACT_TYPE_LABELS, CLIENT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS, DOC_TYPE_LABELS,
} from "@/store/adminStore";
import {
  S, C, BadgeEl, PlanBadge, AccessBadge, SectionTitle, Divider, DRow,
  PAYMENT_META, CLIENT_META, MONTH_META, ONBOARDING_META, PAGE_META,
  fmtDate, fmtDateTime,
} from "./adminUi";

type Tab = "general" | "datos" | "pagos" | "config";

const TABS: { key: Tab; label: string }[] = [
  { key: "general", label: "General"              },
  { key: "datos",   label: "Especialista y Clínica" },
  { key: "pagos",   label: "Pagos"                },
  { key: "config",  label: "Config"               },
];

const CHECKLIST_LABELS: Record<keyof OnboardingChecklist, string> = {
  basicData:         "Datos básicos",
  services:          "Servicios",
  address:           "Dirección",
  paymentMethods:    "Métodos de pago",
  templateSelected:  "Template seleccionado",
  colorsSelected:    "Colores configurados",
  testimonials:      "Testimonios",
};

function DataRow({ label, value }: { label: string; value?: string | number }) {
  if (!value && value !== 0) return null;
  return <DRow label={label}>{String(value)}</DRow>;
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <SectionTitle>{title}</SectionTitle>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

export function ClientDrawer({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const store = useAdminStore();
  const client = store.clients.find((c) => c.id === clientId);
  const [tab, setTab] = useState<Tab>("general");
  const [notesEdit, setNotesEdit] = useState<string | null>(null);
  const [slugEdit, setSlugEdit] = useState<string | null>(null);
  const [renewType, setRenewType] = useState<ContractType>("six_months");

  if (!client) return null;
  const c = client;

  // ── Tab: General ────────────────────────────────────────────────────────────

  function GeneralTab() {
    return (
      <div className="space-y-5">
        <section>
          <SectionTitle>Acciones rápidas</SectionTitle>
          <div className="flex flex-wrap gap-2">
            <button className={c.accessActive ? S.btnDanger : S.btnGreen}
              onClick={() => store.setAccess(c.id, !c.accessActive)}>
              {c.accessActive ? "Bloquear acceso" : "Activar acceso"}
            </button>
            <button className={S.btnSecondary}
              onClick={() => store.setPublicPageStatus(c.id, c.publicPageStatus === "published" ? "hidden" : "published")}>
              {c.publicPageStatus === "published" ? "Ocultar página" : "Publicar página"}
            </button>
            <button className={S.btnRose} onClick={() => store.togglePro(c.id)}>
              {c.isPro ? "Quitar Pro" : "↑ Pro"}
            </button>
          </div>
        </section>

        <Divider />

        <section>
          <SectionTitle>Estado y plan</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={S.label}>Estado</label>
              <select className={S.select} value={c.clientStatus}
                onChange={(e) => store.setClientStatus(c.id, e.target.value as ClientStatus)}>
                {(Object.entries(CLIENT_STATUS_LABELS) as [ClientStatus, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={S.label}>Plan</label>
              <select className={S.select} value={c.plan}
                onChange={(e) => store.setPlan(c.id, e.target.value as UserPlan)}>
                <option value="standard">Standard</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          </div>
        </section>

        <Divider />

        <section>
          <SectionTitle>Vendedor</SectionTitle>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--text-primary)]">{c.salesRepName || "—"}</span>
            <select className={`${S.select} w-44 text-xs`} value={c.salesRepId ?? ""}
              onChange={(e) => {
                const rep = store.salesReps.find((r) => r.id === e.target.value);
                store.assignSalesRep(c.id, e.target.value, rep?.name ?? "");
              }}>
              <option value="">Sin asignar</option>
              {store.salesReps.filter((r) => r.active).map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </section>

        <Divider />

        <section>
          <SectionTitle>Página pública</SectionTitle>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <BadgeEl meta={PAGE_META[c.publicPageStatus]} />
              <p className="font-mono text-[10px] text-[var(--text-muted)] mt-1">{c.subdomain}</p>
            </div>
            <select className={`${S.select} w-32`} value={c.publicPageStatus}
              onChange={(e) => store.setPublicPageStatus(c.id, e.target.value as PublicPageStatus)}>
              <option value="published">Publicada</option>
              <option value="hidden">Oculta</option>
            </select>
          </div>
        </section>

        <Divider />

        <section>
          <SectionTitle>Subdominio</SectionTitle>
          {slugEdit === null ? (
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-[var(--accent)]">{c.subdomain}</span>
              <button className={S.btnGhost} onClick={() => setSlugEdit(c.slug)}>Editar</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input className={S.input} value={slugEdit} onChange={(e) => setSlugEdit(e.target.value)} />
              <button className={S.btnPrimary} onClick={() => { store.setSlug(c.id, slugEdit); setSlugEdit(null); }}>OK</button>
              <button className={S.btnSecondary} onClick={() => setSlugEdit(null)}>✕</button>
            </div>
          )}
        </section>

        <Divider />

        <FieldGroup title="Metadatos">
          <DataRow label="N° de cliente" value={c.clientNumber} />
          <DataRow label="Creado"        value={fmtDate(c.createdAt)} />
          {c.updatedAt        && <DataRow label="Actualizado"  value={fmtDateTime(c.updatedAt)} />}
          {c.lastPaymentAt    && <DataRow label="Último pago"  value={fmtDate(c.lastPaymentAt)} />}
          {c.nextPaymentDueAt && <DataRow label="Próximo pago" value={fmtDate(c.nextPaymentDueAt)} />}
        </FieldGroup>
      </div>
    );
  }

  // ── Tab: Datos ──────────────────────────────────────────────────────────────

  function DatosTab() {
    const s  = c.specialist;
    const cl = c.clinic;
    return (
      <div className="space-y-6">
        <section>
          <SectionTitle>Especialista</SectionTitle>
          <div className="space-y-1.5">
            <DataRow label="Nombre"
              value={`${s.firstName} ${s.lastNamePaternal}${s.lastNameMaternal ? " " + s.lastNameMaternal : ""}`} />
            <DataRow label="Nombre público" value={s.publicName} />
          </div>
        </section>
        <Divider />
        <FieldGroup title="Contacto del especialista">
          {s.phone && (
            <DRow label="Teléfono">
              <a href={`tel:${s.phone}`} className="text-[var(--accent)] hover:underline">{s.phone}</a>
            </DRow>
          )}
          {s.whatsapp && (
            <DRow label="WhatsApp">
              <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline">{s.whatsapp}</a>
            </DRow>
          )}
          {s.email && (
            <DRow label="Correo">
              <a href={`mailto:${s.email}`} className="text-[var(--accent)] hover:underline">{s.email}</a>
            </DRow>
          )}
        </FieldGroup>
        {(s.shortDescription || s.bio) && (
          <>
            <Divider />
            <FieldGroup title="Perfil público">
              {s.shortDescription && <DataRow label="Descripción" value={s.shortDescription} />}
              {s.bio && (
                <div>
                  <span className="text-[var(--text-muted)] text-xs">Biografía</span>
                  <p className="text-xs text-[var(--text-primary)] mt-1 leading-relaxed">{s.bio}</p>
                </div>
              )}
            </FieldGroup>
          </>
        )}
        <Divider />
        <section>
          <SectionTitle>Clínica / Consultorio</SectionTitle>
          <div className="space-y-1.5">
            <DataRow label="Nombre" value={cl.name} />
            {cl.commercialName && <DataRow label="Nombre comercial" value={cl.commercialName} />}
          </div>
        </section>
        <FieldGroup title="Dirección">
          {cl.street && (
            <DataRow label="Calle"
              value={`${cl.street}${cl.exteriorNumber ? " " + cl.exteriorNumber : ""}${cl.interiorNumber ? " int. " + cl.interiorNumber : ""}`} />
          )}
          {cl.colony      && <DataRow label="Colonia"             value={cl.colony} />}
          {cl.municipality && <DataRow label="Alcaldía / Municipio" value={cl.municipality} />}
          {cl.city        && <DataRow label="Ciudad"              value={`${cl.city}${cl.state ? ", " + cl.state : ""}`} />}
          {cl.postalCode  && <DataRow label="CP"                  value={cl.postalCode} />}
          {cl.googleMapsUrl && (
            <DRow label="Maps">
              <a href={cl.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline text-xs">Ver en Maps</a>
            </DRow>
          )}
        </FieldGroup>
        <FieldGroup title="Contacto del consultorio">
          {cl.phone && (
            <DRow label="Teléfono">
              <a href={`tel:${cl.phone}`} className="text-[var(--accent)] hover:underline">{cl.phone}</a>
            </DRow>
          )}
          {cl.whatsapp && (
            <DRow label="WhatsApp">
              <a href={`https://wa.me/${cl.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline">{cl.whatsapp}</a>
            </DRow>
          )}
        </FieldGroup>
      </div>
    );
  }

  // ── Tab: Pagos ──────────────────────────────────────────────────────────────

  function PagosTab() {
    const [editActiv, setEditActiv] = useState(c.activationDate);
    const [editType, setEditType]   = useState<ContractType>(c.contractType);
    const paidCount  = c.paymentHistory.filter((p) => p.status === "paid").length;
    const totalMonths = c.paymentHistory.length;
    const isExpired  = new Date(c.contractEndDate) < new Date();

    return (
      <div className="space-y-5">
        <FieldGroup title="Contrato">
          <DataRow label="Tipo"   value={CONTRACT_TYPE_LABELS[c.contractType]} />
          <DataRow label="Inicio" value={fmtDate(c.activationDate)} />
          <DRow label="Vencimiento">
            <span className={isExpired ? "text-[var(--danger)]" : "text-[var(--accent)]"}>
              {fmtDate(c.contractEndDate)}
            </span>
          </DRow>
          {c.monthlyAmount !== undefined && (
            <DataRow label="Monto mensual" value={`$${c.monthlyAmount.toLocaleString("es-MX")} MXN`} />
          )}
        </FieldGroup>

        <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-xl p-4 space-y-3">
          <p className="text-[var(--text-muted)] text-xs font-medium">Renovar contrato desde hoy</p>
          <div className="flex gap-2">
            <select className={`${S.select} flex-1`} value={renewType}
              onChange={(e) => setRenewType(e.target.value as ContractType)}>
              {(Object.entries(CONTRACT_TYPE_LABELS) as [ContractType, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <button className={S.btnRose} onClick={() => store.renewContract(c.id, renewType)}>Renovar</button>
          </div>
        </div>

        <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-xl p-4 space-y-3">
          <p className="text-[var(--text-muted)] text-xs font-medium">Ajustar fechas del contrato</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={S.label}>Inicio</label>
              <input type="date" className={S.input} value={editActiv}
                onChange={(e) => setEditActiv(e.target.value)} />
            </div>
            <div>
              <label className={S.label}>Tipo</label>
              <select className={S.select} value={editType}
                onChange={(e) => setEditType(e.target.value as ContractType)}>
                {(Object.entries(CONTRACT_TYPE_LABELS) as [ContractType, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <button className={S.btnSecondary}
            onClick={() => store.regenerateHistory(c.id, editActiv, editType)}>
            Aplicar y regenerar historial
          </button>
        </div>

        <Divider />

        <section>
          <SectionTitle>Estado de pago</SectionTitle>
          <div className="flex items-center justify-between mb-3">
            <BadgeEl meta={PAYMENT_META[c.paymentStatus]} />
            <select className={`${S.select} w-40`} value={c.paymentStatus}
              onChange={(e) => store.setPaymentStatus(c.id, e.target.value as PaymentStatus)}>
              {(Object.entries(PAYMENT_STATUS_LABELS) as [PaymentStatus, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all"
              style={{ width: `${totalMonths ? (paidCount / totalMonths) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">{paidCount}/{totalMonths} meses pagados</p>
        </section>

        <section>
          <SectionTitle>Historial mensual</SectionTitle>
          <div className="space-y-0">
            {c.paymentHistory.map((p) => (
              <div key={p.id}
                className="flex items-center justify-between gap-2 py-2 border-b-[0.5px] border-[var(--border)] last:border-b-0">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--text-primary)] capitalize">{p.monthLabel}</p>
                  {p.paidAt && <p className="text-[10px] text-[var(--text-muted)]">Pagado: {fmtDate(p.paidAt)}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.amount !== undefined && (
                    <span className="text-[10px] text-[var(--text-muted)]">${p.amount.toLocaleString("es-MX")}</span>
                  )}
                  <select
                    className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded text-[11px] text-[var(--text-primary)] px-2 py-1 focus:outline-none focus:border-[var(--accent)]"
                    value={p.status}
                    onChange={(e) => store.setMonthStatus(c.id, p.id, e.target.value as MonthlyPaymentStatus)}>
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

  // ── Tab: Config ─────────────────────────────────────────────────────────────

  function ConfigTab() {
    const items     = Object.entries(CHECKLIST_LABELS) as [keyof OnboardingChecklist, string][];
    const doneCount = items.filter(([k]) => c.onboardingChecklist[k]).length;
    return (
      <div className="space-y-5">
        <section>
          <div className="flex items-center justify-between mb-2">
            <SectionTitle>Onboarding</SectionTitle>
            <BadgeEl meta={ONBOARDING_META[c.onboardingStatus]} />
          </div>
          <div className="h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[var(--accent)] rounded-full transition-all"
              style={{ width: `${(doneCount / items.length) * 100}%` }} />
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mb-3">{doneCount}/{items.length} completados</p>
          <div className="space-y-2">
            {items.map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={c.onboardingChecklist[key]}
                  onChange={(e) => store.updateOnboardingChecklist(c.id, { [key]: e.target.checked })}
                  className="w-4 h-4 rounded accent-[var(--accent)]" />
                <span className={`text-sm ${c.onboardingChecklist[key]
                  ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </section>

        <Divider />

        <section>
          <SectionTitle>Documentos</SectionTitle>
          {c.documents.length === 0 ? (
            <p className="text-[var(--text-muted)] text-xs">Sin documentos adjuntos.</p>
          ) : (
            <div className="space-y-2">
              {c.documents.map((doc) => (
                <div key={doc.id}
                  className="flex items-center justify-between bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs text-[var(--text-primary)]">{doc.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {DOC_TYPE_LABELS[doc.type]}{doc.uploadedAt && ` · ${fmtDate(doc.uploadedAt)}`}
                    </p>
                  </div>
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className={S.btnGhost}>Ver</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <Divider />

        <section>
          <SectionTitle>Notas internas</SectionTitle>
          {notesEdit === null ? (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-primary)] whitespace-pre-wrap min-h-[1.5rem]">
                {c.internalNotes || <span className="text-[var(--text-muted)]">Sin notas.</span>}
              </p>
              <button className={S.btnGhost} onClick={() => setNotesEdit(c.internalNotes ?? "")}>Editar</button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea className={`${S.input} min-h-[90px] resize-none`}
                value={notesEdit} onChange={(e) => setNotesEdit(e.target.value)} />
              <div className="flex gap-2">
                <button className={S.btnPrimary}
                  onClick={() => { store.setNotes(c.id, notesEdit); setNotesEdit(null); }}>Guardar</button>
                <button className={S.btnSecondary} onClick={() => setNotesEdit(null)}>Cancelar</button>
              </div>
            </div>
          )}
        </section>

        <Divider />

        <section>
          <SectionTitle>Actividad reciente</SectionTitle>
          {c.activityLog.length === 0 ? (
            <p className="text-[var(--text-muted)] text-xs">Sin actividad registrada.</p>
          ) : (
            <div>
              {c.activityLog.slice(0, 10).map((log, i) => (
                <div key={log.id} className="flex gap-3 pb-4 relative">
                  {i < Math.min(c.activityLog.length - 1, 9) && (
                    <div className="absolute left-[7px] top-5 bottom-0 w-px bg-[var(--border)]" />
                  )}
                  <div className="w-3.5 h-3.5 rounded-full bg-[var(--bg-elevated)] border-[0.5px] border-[var(--accent)] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--text-primary)]">{log.action}</p>
                    {log.detail && <p className="text-[11px] text-[var(--accent)] mt-0.5">{log.detail}</p>}
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {fmtDateTime(log.date)}{log.actor && ` · ${log.actor}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const initials = [c.specialist.firstName[0], c.specialist.lastNamePaternal[0]]
    .filter(Boolean).join("").toUpperCase();

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--bg-base)] border-l-[0.5px] border-[var(--border)] flex flex-col h-full">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b-[0.5px] border-[var(--border)] shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--bg-base)] text-sm font-bold shrink-0 bg-[var(--accent)]">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-mono text-[var(--text-muted)]">{c.clientNumber}</span>
                {c.salesRepName && (
                  <>
                    <span className="text-[var(--border)]">·</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{c.salesRepName}</span>
                  </>
                )}
              </div>
              <h2 className="text-[var(--text-primary)] font-semibold text-sm leading-tight truncate">{c.clinic.name}</h2>
              <p className="text-[var(--text-muted)] text-xs mt-0.5">{c.specialist.publicName}</p>
            </div>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors text-lg shrink-0">
              ×
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <PlanBadge plan={c.plan} />
            <AccessBadge active={c.accessActive} />
            <BadgeEl meta={PAYMENT_META[c.paymentStatus]} />
            <BadgeEl meta={CLIENT_META[c.clientStatus]} />
            <BadgeEl meta={ONBOARDING_META[c.onboardingStatus]} />
            <BadgeEl meta={PAGE_META[c.publicPageStatus]} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b-[0.5px] border-[var(--border)] shrink-0 px-1 bg-[var(--bg-surface)]">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-3 text-[11px] font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                tab === t.key
                  ? "text-[var(--accent)] border-[var(--accent)]"
                  : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto adm-scroll px-5 py-5">
          {tab === "general" && <GeneralTab />}
          {tab === "datos"   && <DatosTab   />}
          {tab === "pagos"   && <PagosTab   />}
          {tab === "config"  && <ConfigTab  />}
        </div>
      </div>
    </div>
  );
}
