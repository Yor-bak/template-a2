"use client";
import { useState } from "react";
import type {
  ClientStatus, ContractType, MonthlyPaymentStatus,
  OnboardingChecklist, PaymentStatus, PublicPageStatus, UserPlan,
  BusinessType, MonthlyPaymentPeriod,
} from "@/types/user";
import {
  useAdminStore, CONTRACT_TYPE_LABELS, CLIENT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS, DOC_TYPE_LABELS, BUSINESS_TYPE_LABELS,
  FIRST_MONTHLY_COMMISSION_TYPE,
} from "@/store/adminStore";
import { getBusinessVertical, hasPermission } from "@/lib/adminPermissions";
import { useAdminAuth } from "@/store/adminStore";
import {
  S, BadgeEl, PlanBadge, AccessBadge, SectionTitle, Divider, DRow,
  PAYMENT_META, CLIENT_META, MONTH_META, ONBOARDING_META, PAGE_META,
  fmtDate, fmtDateTime, TabBar, TabButton,
} from "./adminUi";
import { ContractsTab } from "./ContractsTab";
import { adminResetClientPassword, generateTempPassword, getClientCredentialInfo } from "@/lib/clientAuth";
import { formatPhoneDisplay, validatePhoneNumber } from "@/lib/phoneUtils";
import { checkSubdomainAvailability, normalizeSubdomain } from "@/lib/transferRules";

type Tab = "general" | "datos" | "pagos" | "contratos" | "config" | "acceso";

const TABS: { key: Tab; label: string }[] = [
  { key: "general",   label: "General"          },
  { key: "datos",     label: "Negocio"          },
  { key: "pagos",     label: "Pagos"            },
  { key: "contratos", label: "Contratos"        },
  { key: "config",    label: "Config"           },
  { key: "acceso",    label: "Acceso"           },
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
                <option value="cowork">Cowork</option>
                <option value="intelligence">Intelligence</option>
              </select>
            </div>
          </div>
        </section>

        <Divider />

        <section>
          <SectionTitle>Vendedor</SectionTitle>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--text-primary)]">{c.salesRepName || "—"}</p>
              {c.sellerNumber && <p className="font-mono text-[10px] text-[var(--text-muted)]">{c.sellerNumber}</p>}
            </div>
            <select className={`${S.select} w-44 text-xs`} value={c.salesRepId ?? ""}
              onChange={(e) => {
                const rep = store.salesReps.find((r) => r.id === e.target.value);
                store.assignSalesRep(c.id, e.target.value, rep?.name ?? "", rep?.sellerNumber ?? "");
              }}>
              <option value="">Sin asignar</option>
              {store.salesReps.filter((r) => r.active).map((r) => (
                <option key={r.id} value={r.id}>{r.sellerNumber} — {r.name}</option>
              ))}
            </select>
          </div>
          {c.salesRepId && (() => {
            const fmComm = store.commissions.find(
              (x) =>
                x.commissionType === FIRST_MONTHLY_COMMISSION_TYPE &&
                x.clientId === c.id &&
                x.status !== "cancelled"
            );
            const isLocked = fmComm
              ? (["pending", "authorized", "paid"] as string[]).includes(fmComm.status)
              : false;
            return (
              <label className="flex items-start gap-2 cursor-pointer select-none mt-3">
                <input
                  type="checkbox"
                  checked={!!c.firstMonthlyPaymentGeneratesCommission}
                  onChange={(e) => {
                    if (e.target.checked) {
                      store.ensureFirstMonthlyCommission(c.id);
                    } else {
                      store.cancelWaitingFirstMonthlyCommission(c.id);
                    }
                  }}
                  className="mt-0.5 accent-[var(--accent)]"
                  disabled={isLocked}
                />
                <div>
                  <span className="text-xs text-[var(--text-primary)]">Comisión al pago de la 1ª mensualidad</span>
                  {fmComm?.status === "waiting_first_monthly_payment" && (
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Esperando primera mensualidad</p>
                  )}
                  {fmComm && fmComm.status !== "waiting_first_monthly_payment" && (
                    <p className="text-[10px] text-[var(--accent)] mt-0.5">✓ Comisión pendiente de pago</p>
                  )}
                </div>
              </label>
            );
          })()}
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

        <FieldGroup title="Fechas de pago">
          {c.lastPaymentAt    && <DataRow label="Último pago"        value={fmtDate(c.lastPaymentAt)} />}
          {c.nextPaymentDueAt && <DataRow label="Próximo vencimiento" value={fmtDate(c.nextPaymentDueAt)} />}
          <DataRow label="Activación"  value={fmtDate(c.activationDate)} />
          <DataRow label="Fin contrato" value={fmtDate(c.contractEndDate)} />
        </FieldGroup>

        <Divider />

        <FieldGroup title="Identificación y acceso">
          <DataRow label="N° de cliente" value={c.clientNumber} />
          <DRow label="Teléfono de acceso">
            <span className="font-mono text-[var(--text-primary)]">
              {c.accessPhone ? c.accessPhone : (c.specialist.phone ?? "—")}
            </span>
          </DRow>
          {c.specialist.email && <DataRow label="Correo de contacto" value={c.specialist.email} />}
        </FieldGroup>

        <Divider />

        <FieldGroup title="Metadatos">
          <DataRow label="Creado"        value={fmtDate(c.createdAt)} />
          {c.updatedAt && <DataRow label="Actualizado" value={fmtDateTime(c.updatedAt)} />}
        </FieldGroup>
      </div>
    );
  }

  // ── Tab: Datos (Negocio) ────────────────────────────────────────────────────

  function DatosTab() {
    const s  = c.specialist;
    const b  = c.business;
    const vertical = getBusinessVertical(c.businessType);
    return (
      <div className="space-y-6">
        {/* Tipo / vertical */}
        <section>
          <SectionTitle>Tipo de negocio</SectionTitle>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              {c.businessType ? BUSINESS_TYPE_LABELS[c.businessType as BusinessType] : "Sin definir"}
            </span>
            {vertical === "gimnasios" && (
              <span className="text-[10px] text-[var(--text-muted)] italic">
                Producto Gimnasios — pendiente de configuración
              </span>
            )}
          </div>
        </section>
        <Divider />
        <section>
          <SectionTitle>Responsable del negocio</SectionTitle>
          <div className="space-y-1.5">
            <DataRow label="Nombre"
              value={`${s.firstName} ${s.lastNamePaternal}${s.lastNameMaternal ? " " + s.lastNameMaternal : ""}`} />
            <DataRow label="Nombre público" value={s.publicName} />
          </div>
        </section>
        <Divider />
        <FieldGroup title="Contacto del responsable">
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
          <SectionTitle>Información del negocio</SectionTitle>
          <div className="space-y-1.5">
            <DataRow label="Nombre" value={b.name} />
            {b.commercialName && <DataRow label="Nombre comercial" value={b.commercialName} />}
          </div>
        </section>
        <FieldGroup title="Dirección">
          {b.street && (
            <DataRow label="Calle"
              value={`${b.street}${b.exteriorNumber ? " " + b.exteriorNumber : ""}${b.interiorNumber ? " int. " + b.interiorNumber : ""}`} />
          )}
          {b.colony       && <DataRow label="Colonia"              value={b.colony} />}
          {b.municipality && <DataRow label="Alcaldía / Municipio" value={b.municipality} />}
          {b.city         && <DataRow label="Ciudad"               value={`${b.city}${b.state ? ", " + b.state : ""}`} />}
          {b.postalCode   && <DataRow label="CP"                   value={b.postalCode} />}
          {b.googleMapsUrl && (
            <DRow label="Maps">
              <a href={b.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline text-xs">Ver en Maps</a>
            </DRow>
          )}
        </FieldGroup>
        <FieldGroup title="Contacto del negocio">
          {b.phone && (
            <DRow label="Teléfono">
              <a href={`tel:${b.phone}`} className="text-[var(--accent)] hover:underline">{b.phone}</a>
            </DRow>
          )}
          {b.whatsapp && (
            <DRow label="WhatsApp">
              <a href={`https://wa.me/${b.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline">{b.whatsapp}</a>
            </DRow>
          )}
        </FieldGroup>
      </div>
    );
  }

  // ── Partial payment periods section ────────────────────────────────────────

  function PeriodsSection({ clientId, expectedAmount }: { clientId: string; expectedAmount: number }) {
    const { monthlyPeriods } = useAdminStore();
    const periods: MonthlyPaymentPeriod[] = (monthlyPeriods ?? [])
      .filter((p) => p.clientId === clientId)
      .sort((a, b) => a.period.localeCompare(b.period));

    if (periods.length === 0) return null;

    const statusLabel: Record<MonthlyPaymentPeriod["status"], string> = {
      pending:  "Pendiente",
      partial:  "Pago parcial",
      paid:     "Pagado",
      overdue:  "Vencido",
    };
    const statusCls: Record<MonthlyPaymentPeriod["status"], string> = {
      pending: "text-[var(--text-muted)] font-medium",
      partial: "text-[var(--danger)] font-medium",
      paid:    "text-[var(--accent)] font-medium",
      overdue: "text-[var(--danger)] font-medium",
    };

    function periodLabel(key: string) {
      const NAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
      const [yr, mo] = key.split("-");
      return `${NAMES[parseInt(mo) - 1] ?? mo} ${yr}`;
    }

    return (
      <section>
        <SectionTitle>Abonos por periodo</SectionTitle>
        <div className="space-y-2">
          {periods.map((period) => (
            <div key={period.id} className="border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] overflow-hidden">
              {/* Period header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-elevated)]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[var(--text-primary)]">{periodLabel(period.period)}</span>
                  <span className={`text-[10.5px] ${statusCls[period.status]}`}>
                    {statusLabel[period.status]}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    ${period.paidAmount.toLocaleString("es-MX")}
                    <span className="text-[var(--text-muted)] font-normal"> / ${period.expectedAmount.toLocaleString("es-MX")}</span>
                  </p>
                  {period.remainingAmount > 0 && (
                    <p className="text-[10px] text-[var(--danger)]">Saldo: ${period.remainingAmount.toLocaleString("es-MX")}</p>
                  )}
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1 bg-[var(--bg-base)]">
                <div
                  className={`h-full transition-all ${period.status === "paid" ? "bg-[var(--accent)]" : "bg-[var(--danger)]"}`}
                  style={{ width: `${period.expectedAmount ? Math.min(100, (period.paidAmount / period.expectedAmount) * 100) : 0}%` }}
                />
              </div>
              {/* Installments */}
              {period.installments.length > 0 && (
                <div className="divide-y-[0.5px] divide-[var(--border)]">
                  {period.installments.map((inst, i) => (
                    <div key={inst.id} className="flex items-center justify-between px-4 py-2 text-[11px]">
                      <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <span className="w-4 h-4 rounded-full bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center text-[9px] font-bold">{i + 1}</span>
                        <span>{fmtDate(inst.date)}</span>
                        {inst.method && <span className="capitalize">{inst.method}</span>}
                        {inst.reference && <span className="font-mono text-[10px]">{inst.reference}</span>}
                      </div>
                      <span className="font-semibold text-[var(--text-primary)]">${inst.amount.toLocaleString("es-MX")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Tab: Pagos ──────────────────────────────────────────────────────────────

  function PagosTab() {
    const [transferEdit, setTransferEdit] = useState<{ monthId: string; ref: string; date: string } | null>(null);
    const [renewConfirm, setRenewConfirm] = useState(false);
    const paidCount   = c.paymentHistory.filter((p) => p.status === "paid").length;
    const totalMonths = c.paymentHistory.length;
    const isExpired   = new Date(c.contractEndDate) < new Date();

    // Calculate new contract dates for renewal preview
    const renewStartDate = new Date().toISOString().split("T")[0];
    const renewEndMs = new Date();
    if (renewType === "six_months") renewEndMs.setMonth(renewEndMs.getMonth() + 6);
    else renewEndMs.setFullYear(renewEndMs.getFullYear() + 1);
    const renewEndDate = renewEndMs.toISOString().split("T")[0];
    const renewNextPayment = new Date();
    renewNextPayment.setMonth(renewNextPayment.getMonth() + 1);
    const renewNextPaymentDate = renewNextPayment.toISOString().split("T")[0];

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

        {/* Fechas de pago resumen */}
        <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] px-4 py-3 space-y-1.5">
          {c.lastPaymentAt    && <DataRow label="Último pago real"     value={fmtDate(c.lastPaymentAt)} />}
          {c.nextPaymentDueAt && <DataRow label="Próximo vencimiento"  value={fmtDate(c.nextPaymentDueAt)} />}
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

        {/* ── Partial payment periods ────────────────────────────── */}
        <PeriodsSection clientId={c.id} expectedAmount={c.monthlyAmount ?? 0} />

        <section>
          <SectionTitle>Historial mensual</SectionTitle>
          <div className="space-y-0">
            {c.paymentHistory.map((p) => (
              <div key={p.id} className="py-2.5 border-b-[0.5px] border-[var(--border)] last:border-b-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--text-primary)] capitalize">{p.monthLabel}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Vence: {fmtDate(p.dueDate)}
                    </p>
                    {p.paidAt && (
                      <p className="text-[10px] text-[var(--text-muted)]">Pagado: {fmtDate(p.paidAt)}</p>
                    )}
                    {p.transferReference && (
                      <p className="text-[10px] font-mono text-[var(--text-muted)]">
                        Ref: {p.transferReference}
                        {p.transferDate && ` · ${fmtDate(p.transferDate)}`}
                      </p>
                    )}
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
                {/* Transfer reference mini-form */}
                {p.status === "paid" && (
                  <>
                    {transferEdit?.monthId === p.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          className="flex-1 bg-[var(--bg-base)] border-[0.5px] border-[var(--border)] rounded text-[11px] text-[var(--text-primary)] px-2 py-1 focus:outline-none focus:border-[var(--accent)] placeholder-[var(--text-muted)]"
                          placeholder="Referencia TRF-…"
                          value={transferEdit.ref}
                          onChange={(e) => setTransferEdit((t) => t && { ...t, ref: e.target.value })}
                        />
                        <input
                          type="date"
                          className="bg-[var(--bg-base)] border-[0.5px] border-[var(--border)] rounded text-[11px] text-[var(--text-primary)] px-2 py-1 focus:outline-none focus:border-[var(--accent)]"
                          value={transferEdit.date}
                          onChange={(e) => setTransferEdit((t) => t && { ...t, date: e.target.value })}
                        />
                        <button className={S.btnGhost + " !text-[10px]"}
                          onClick={() => {
                            store.setMonthStatus(c.id, p.id, "paid", transferEdit.ref || undefined, transferEdit.date || undefined);
                            setTransferEdit(null);
                          }}>OK</button>
                        <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          onClick={() => setTransferEdit(null)}>✕</button>
                      </div>
                    ) : (
                      <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                        onClick={() => setTransferEdit({ monthId: p.id, ref: p.transferReference ?? "", date: p.transferDate ?? "" })}>
                        {p.transferReference ? "Editar referencia" : "+ Agregar referencia"}
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Renovación de contrato — at the bottom, separate from payments */}
        <section className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] p-4 space-y-3">
          <SectionTitle>Renovación de contrato</SectionTitle>
          <p className="text-[11px] text-[var(--text-muted)]">
            Genera un nuevo ciclo de pagos desde hoy, reemplazando las fechas actuales del contrato.
          </p>
          <div className="flex gap-2">
            <select className={`${S.select} flex-1`} value={renewType}
              onChange={(e) => setRenewType(e.target.value as ContractType)}>
              {(Object.entries(CONTRACT_TYPE_LABELS) as [ContractType, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <button className={S.btnRose} onClick={() => setRenewConfirm(true)}>Renovar contrato desde hoy</button>
          </div>

          {renewConfirm && (
            <div className="bg-[var(--bg-base)] border-[0.5px] border-[var(--accent)] rounded-[var(--radius-surface)] p-3 space-y-2 mt-2">
              <p className="text-xs font-semibold text-[var(--text-primary)]">Confirmar renovación</p>
              <div className="text-[11px] text-[var(--text-muted)] space-y-1">
                <p>Cliente: <span className="text-[var(--text-primary)]">{c.business.name} — {c.specialist.publicName}</span></p>
                <p>Plan: <span className="text-[var(--text-primary)]">{CONTRACT_TYPE_LABELS[renewType]}</span></p>
                <p>Nuevo inicio: <span className="text-[var(--text-primary)]">{fmtDate(renewStartDate)}</span></p>
                <p>Nuevo vencimiento: <span className="text-[var(--accent)]">{fmtDate(renewEndDate)}</span></p>
                <p>Próximo pago: <span className="text-[var(--text-primary)]">{fmtDate(renewNextPaymentDate)}</span></p>
              </div>
              <div className="flex gap-2 pt-1">
                <button className={S.btnPrimary + " flex-1 !text-xs !py-1.5"} onClick={() => { store.renewContract(c.id, renewType); setRenewConfirm(false); }}>
                  Confirmar renovación
                </button>
                <button className={S.btnSecondary + " !text-xs !py-1.5"} onClick={() => setRenewConfirm(false)}>Cancelar</button>
              </div>
            </div>
          )}
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
                  className="flex items-center justify-between bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-control)] px-3 py-2">
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
              {c.activityLog.slice(0, 15).map((log, i) => (
                <div key={log.id} className="flex gap-3 pb-4 relative">
                  {i < Math.min(c.activityLog.length - 1, 14) && (
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
      <div className="relative w-full max-w-md bg-[var(--bg-surface)] border-l-[0.5px] border-[var(--border)] shadow-[0_1px_3px_rgba(0,0,0,.35)] flex flex-col h-full">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b-[0.5px] border-[var(--border)] shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-surface)] flex items-center justify-center text-[var(--bg-base)] text-sm font-bold shrink-0 bg-[var(--accent)]">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-mono text-[var(--text-muted)]">{c.clientNumber}</span>
                {c.salesRepName && (
                  <>
                    <span className="text-[var(--border)]">·</span>
                    <span className="text-[10px] font-mono text-[var(--accent)]">{c.sellerNumber}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{c.salesRepName}</span>
                  </>
                )}
              </div>
              <h2 className="text-[var(--text-primary)] font-semibold text-sm leading-tight truncate">{c.business.name}</h2>
              <p className="text-[var(--text-muted)] text-xs mt-0.5">
                {c.specialist.publicName}
                {c.businessType && (
                  <span className="ml-1.5 text-[10px] font-mono text-[var(--border)]">· {BUSINESS_TYPE_LABELS[c.businessType as BusinessType]}</span>
                )}
              </p>
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
        <TabBar className="shrink-0 px-4">
          {TABS.map((t) => (
            <TabButton key={t.key} active={tab === t.key} onClick={() => setTab(t.key)} className="px-3 py-3 mr-1">
              {t.label}
            </TabButton>
          ))}
        </TabBar>

        {/* Body */}
        <div className="flex-1 overflow-y-auto adm-scroll px-5 py-5">
          {tab === "general"   && <GeneralTab />}
          {tab === "datos"     && <DatosTab   />}
          {tab === "pagos"     && <PagosTab   />}
          {tab === "contratos" && <ContractsTab client={c} />}
          {tab === "config"    && <ConfigTab  />}
          {tab === "acceso"    && <AccesoTab  />}
        </div>
      </div>
    </div>
  );

  // ── AccesoTab ────────────────────────────────────────────────────────────────

  function AccesoTab() {
    const auth = useAdminAuth();
    const canViewAccess    = auth.can("client.access.view");
    const canEditAccess    = auth.can("client.access.edit");
    const canResetPassword = auth.can("client.password.reset");
    const canEditSubdomain = auth.can("client.subdomain.edit");

    const credInfo = getClientCredentialInfo(c.id);

    // Password reset wizard state
    const [resetStep, setResetStep] = useState<0 | 1 | 2 | 3>(0); // 0=hidden 1=confirm 2=set 3=done
    const [resetReason, setResetReason] = useState("");
    const [newPw, setNewPw] = useState("");
    const [showNewPw, setShowNewPw] = useState(false);
    const [confirmNewPw, setConfirmNewPw] = useState("");
    const [tempPwCopied, setTempPwCopied] = useState(false);
    const [resetError, setResetError] = useState("");
    const [generatedPw, setGeneratedPw] = useState("");

    // Phone edit state
    const [phoneEdit, setPhoneEdit] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState("");

    // Subdomain edit state
    const [subEdit, setSubEdit] = useState<string | null>(null);
    const [subError, setSubError] = useState("");
    const [subMsg, setSubMsg] = useState("");

    const store = useAdminStore();
    const clients = store.clients;

    function handleGenTempPw() {
      const pw = generateTempPassword();
      setNewPw(pw);
      setConfirmNewPw(pw);
      setGeneratedPw(pw);
    }

    function handleResetConfirm() {
      setResetError("");
      if (!newPw.trim()) { setResetError("La contraseña es obligatoria."); return; }
      if (newPw.length < 6) { setResetError("Mínimo 6 caracteres."); return; }
      if (newPw !== confirmNewPw) { setResetError("Las contraseñas no coinciden."); return; }
      const ok = adminResetClientPassword(c.id, newPw, auth.displayName);
      if (ok.success) {
        store.setMustChangePassword(c.id, true);
        store.updateClientLastAccess(c.id);
        setResetStep(3);
      } else {
        setResetError("No se encontró la credencial del cliente.");
      }
    }

    function handlePhoneSave() {
      const v = validatePhoneNumber(phoneEdit ?? "");
      if (!v.valid) { setPhoneError(v.message); return; }
      store.updateClientAccessPhone(c.id, phoneEdit!);
      setPhoneEdit(null);
      setPhoneError("");
    }

    function handleSubSave() {
      const norm = normalizeSubdomain(subEdit ?? "");
      const chk = checkSubdomainAvailability(norm, clients, c.id);
      if (!chk.available) { setSubError(chk.message); return; }
      store.setSlug(c.id, norm);
      setSubEdit(null);
      setSubError("");
      setSubMsg("Subdominio actualizado.");
    }

    if (!canViewAccess) {
      return (
        <div className="py-12 text-center text-[var(--text-muted)] text-sm">
          No tienes permiso para ver los datos de acceso.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Access info */}
        <section>
          <SectionTitle>Datos de acceso</SectionTitle>
          <div className="space-y-3 bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] px-4 py-4">
            <DRow label="Número de cliente">{c.clientNumber}</DRow>
            <DRow label="Teléfono de acceso">
              {phoneEdit !== null ? (
                <div className="flex flex-col gap-1 items-end">
                  <div className="flex gap-2">
                    <input
                      className={`${S.input} !py-1 !text-xs w-36`}
                      value={phoneEdit}
                      onChange={(e) => { setPhoneEdit(e.target.value); setPhoneError(""); }}
                      placeholder="10 dígitos"
                    />
                    <button className={`${S.btnPrimary} !px-2 !py-1 !text-[11px]`} onClick={handlePhoneSave}>Guardar</button>
                    <button className={`${S.btnSecondary} !px-2 !py-1 !text-[11px]`} onClick={() => setPhoneEdit(null)}>×</button>
                  </div>
                  {phoneError && <p className="text-[10px] text-[var(--danger)]">{phoneError}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[var(--text-primary)]">
                    {credInfo.accessPhone ? formatPhoneDisplay(credInfo.accessPhone) : (c.accessPhone ? formatPhoneDisplay(c.accessPhone) : "—")}
                  </span>
                  {canEditAccess && (
                    <button className="text-[10px] text-[var(--accent)] hover:underline" onClick={() => setPhoneEdit(credInfo.accessPhone ?? c.accessPhone ?? "")}>
                      Editar
                    </button>
                  )}
                </div>
              )}
            </DRow>
            <DRow label="Correo de contacto">{c.specialist.email ?? "—"}</DRow>
            <DRow label="Estado de acceso">{c.accessActive ? "Activo" : "Inactivo"}</DRow>
            <DRow label="Cambio de contraseña pendiente">{c.mustChangePassword ? "Sí" : "No"}</DRow>
            {c.lastAccessAt && <DRow label="Último acceso">{fmtDateTime(c.lastAccessAt)}</DRow>}
            {!credInfo.hasCredential && (
              <p className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-base)] rounded px-2 py-1.5">
                Este cliente no tiene credenciales configuradas aún. Se configuran durante la activación.
              </p>
            )}
          </div>
        </section>

        {/* Subdomain */}
        <section>
          <SectionTitle>Subdominio</SectionTitle>
          <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] px-4 py-4 space-y-3">
            {subEdit !== null ? (
              <div className="space-y-2">
                <input
                  className={S.input}
                  value={subEdit}
                  onChange={(e) => { setSubEdit(normalizeSubdomain(e.target.value)); setSubError(""); setSubMsg(""); }}
                />
                <p className="text-[10px] text-[var(--text-muted)]">Vista previa: {subEdit || "…"}.templatea2.com</p>
                <p className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-base)] rounded px-2 py-1">
                  ⚠️ Cambiar el subdominio puede afectar enlaces compartidos, códigos QR e integraciones existentes.
                </p>
                {subError && <p className="text-[11px] text-[var(--danger)]">{subError}</p>}
                <div className="flex gap-2">
                  <button className={`${S.btnPrimary} flex-1`} onClick={handleSubSave}>Guardar subdominio</button>
                  <button className={S.btnSecondary} onClick={() => { setSubEdit(null); setSubError(""); setSubMsg(""); }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-mono text-[var(--text-primary)]">{c.slug}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{c.subdomain}</p>
                </div>
                {canEditSubdomain && (
                  <button className="text-[11px] text-[var(--accent)] hover:underline" onClick={() => { setSubEdit(c.slug); setSubMsg(""); }}>
                    Editar
                  </button>
                )}
              </div>
            )}
            {subMsg && <p className="text-[11px] text-[var(--accent)]">{subMsg}</p>}
          </div>
        </section>

        {/* Password reset — Superadmin only */}
        {canResetPassword && (
          <section>
            <SectionTitle>Restablecer contraseña</SectionTitle>

            {resetStep === 0 && (
              <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] px-4 py-4">
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  El Superadmin puede restablecer la contraseña. El cliente deberá cambiarla en su próximo acceso. La contraseña actual nunca es visible.
                </p>
                <button className={S.btnDanger + " w-full"} onClick={() => setResetStep(1)}>
                  Restablecer contraseña
                </button>
              </div>
            )}

            {resetStep === 1 && (
              <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--danger)] rounded-[var(--radius-surface)] px-4 py-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Confirmar restablecimiento</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Cliente: <b>{c.clientNumber}</b> — {c.specialist.publicName}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Teléfono: {credInfo.accessPhone ? formatPhoneDisplay(credInfo.accessPhone) : "—"}</p>
                </div>
                <div>
                  <label className={S.label}>Motivo (opcional)</label>
                  <input className={S.input} value={resetReason} onChange={(e) => setResetReason(e.target.value)} placeholder="Ej. Cliente olvidó su contraseña" />
                </div>
                <div className="flex gap-2">
                  <button className={S.btnPrimary + " flex-1"} onClick={() => setResetStep(2)}>Continuar</button>
                  <button className={S.btnSecondary} onClick={() => { setResetStep(0); setResetReason(""); }}>Cancelar</button>
                </div>
              </div>
            )}

            {resetStep === 2 && (
              <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--danger)] rounded-[var(--radius-surface)] px-4 py-4 space-y-4">
                <p className="text-xs font-semibold text-[var(--text-primary)]">Establecer contraseña temporal</p>
                <button
                  type="button"
                  className="text-[11px] text-[var(--accent)] hover:underline"
                  onClick={handleGenTempPw}
                >
                  ⚡ Generar contraseña temporal
                </button>
                <div>
                  <label className={S.label}>Nueva contraseña *</label>
                  <div className="relative">
                    <input
                      className={`${S.input} pr-16`}
                      type={showNewPw ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => { setNewPw(e.target.value); setResetError(""); }}
                      placeholder="Mín. 6 caracteres"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      onClick={() => setShowNewPw(!showNewPw)}
                    >
                      {showNewPw ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={S.label}>Confirmar contraseña *</label>
                  <input
                    className={`${S.input} ${confirmNewPw && confirmNewPw !== newPw ? "border-[var(--danger)]" : ""}`}
                    type={showNewPw ? "text" : "password"}
                    value={confirmNewPw}
                    onChange={(e) => setConfirmNewPw(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                {resetError && <p className="text-[11px] text-[var(--danger)]">{resetError}</p>}
                <p className="text-[10px] text-[var(--text-muted)]">
                  ¿Confirmas el restablecimiento de la contraseña? El cliente deberá cambiarla en su próximo acceso.
                </p>
                <div className="flex gap-2">
                  <button className={S.btnDanger + " flex-1"} onClick={handleResetConfirm}>Confirmar restablecimiento</button>
                  <button className={S.btnSecondary} onClick={() => { setResetStep(0); setNewPw(""); setConfirmNewPw(""); setResetError(""); }}>Cancelar</button>
                </div>
              </div>
            )}

            {resetStep === 3 && (
              <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] px-4 py-4 space-y-3">
                <p className="text-xs font-semibold text-[var(--accent)]">✓ Contraseña restablecida</p>
                <p className="text-[11px] text-[var(--text-muted)]">El cliente deberá cambiar su contraseña al iniciar sesión.</p>
                {generatedPw && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono bg-[var(--bg-base)] border-[0.5px] border-[var(--border)] rounded px-3 py-2 flex-1">
                      {generatedPw}
                    </p>
                    <button
                      className={`${S.btnSecondary} !px-2 !py-1 !text-[11px]`}
                      onClick={() => { navigator.clipboard.writeText(generatedPw); setTempPwCopied(true); setTimeout(() => setTempPwCopied(false), 2000); }}
                    >
                      {tempPwCopied ? "✓ Copiado" : "Copiar"}
                    </button>
                  </div>
                )}
                {generatedPw && (
                  <p className="text-[10px] text-[var(--text-muted)]">Comparte esta contraseña con el cliente por un canal seguro. No se mostrará de nuevo.</p>
                )}
                <button className={S.btnSecondary + " w-full"} onClick={() => { setResetStep(0); setNewPw(""); setConfirmNewPw(""); setGeneratedPw(""); }}>
                  Cerrar
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    );
  }
}
