"use client";
import { useState, useEffect } from "react";
import type {
  ContractType, PublicPageStatus, UserPlan, ClientStatus,
  SpecialistInfo, BusinessInfo, BusinessType,
} from "@/types/user";
import type { NewClientInput } from "@/store/adminStore";
import {
  useAdminStore, generateSlug, buildSubdomain,
  generateContractEndDate, CONTRACT_TYPE_LABELS, BUSINESS_TYPE_LABELS, MX_STATES,
} from "@/store/adminStore";
import { getBusinessVertical } from "@/lib/adminPermissions";
import { S, C, fmtDate } from "./adminUi";

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_CL = {
  basicData: false, services: false, address: false,
  paymentMethods: false, templateSelected: false, colorsSelected: false, testimonials: false,
};
const EMPTY_SPECIALIST: SpecialistInfo = {
  firstName: "", lastNamePaternal: "", lastNameMaternal: "",
  publicName: "", phone: "", whatsapp: "", email: "", shortDescription: "", bio: "",
};
const EMPTY_BUSINESS: BusinessInfo = {
  name: "", commercialName: "", street: "", exteriorNumber: "", interiorNumber: "",
  colony: "", municipality: "", city: "", state: "", postalCode: "",
  googleMapsUrl: "", phone: "", whatsapp: "",
};
const today = new Date().toISOString().split("T")[0];
const EMPTY: NewClientInput = {
  specialist: EMPTY_SPECIALIST, business: EMPTY_BUSINESS,
  businessType: "other",
  slug: "", plan: "standard",
  clientStatus: "active", publicPageStatus: "hidden",
  contractType: "six_months", activationDate: today,
  monthlyAmount: 299, onboardingChecklist: EMPTY_CL,
  salesRepId: "", salesRepName: "", assignedTo: "", internalNotes: "",
};
const STEPS = ["Responsable", "Negocio", "Cuenta", "Contrato"];

// ── Step bar ──────────────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center px-6 py-4 border-b-[0.5px] border-[var(--border)]">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-[0.5px] transition-colors ${
              i < current
                ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                : i === current
                ? "bg-[var(--bg-elevated)] text-[var(--accent)] border-[var(--accent)]"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]"
            }`}>
              {i < current ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] whitespace-nowrap font-medium ${
              i <= current ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
            }`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-3 mb-5 ${i < current ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Field helpers ─────────────────────────────────────────────────────────────

function F({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className={S.label}>{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}
function G2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}
function G3({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-4">{children}</div>;
}

// ── Step 1: Responsable ───────────────────────────────────────────────────────

function StepResponsable({
  data, businessType, onChange, onBusinessType,
}: {
  data: SpecialistInfo;
  businessType: BusinessType;
  onChange: (p: Partial<SpecialistInfo>) => void;
  onBusinessType: (t: BusinessType) => void;
}) {
  const vertical = getBusinessVertical(businessType);
  const inp = (field: keyof SpecialistInfo, placeholder: string, type = "text") => (
    <input type={type} className={S.input}
      value={(data[field] as string | undefined) ?? ""}
      onChange={(e) => onChange({ [field]: e.target.value })}
      placeholder={placeholder} />
  );
  useEffect(() => {
    if (data.firstName && data.lastNamePaternal) {
      const auto = [data.firstName, data.lastNamePaternal, data.lastNameMaternal].filter(Boolean).join(" ");
      onChange({ publicName: auto });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.firstName, data.lastNamePaternal, data.lastNameMaternal]);

  const namePlaceholder = vertical === "gimnasios" ? "Gerente o dueño" : "Mariana";
  const publicNameHint  = vertical === "gimnasios"
    ? '"Roberto Gutiérrez"'
    : '"Dra. Mariana López"';
  const descPlaceholder = vertical === "gimnasios"
    ? "Director del gimnasio con 10 años de trayectoria…"
    : "Especialista con 9 años de experiencia…";

  return (
    <div className="space-y-5">
      {/* Tipo de negocio — siempre visible en el primer paso */}
      <section>
        <p className={S.section}>Tipo de negocio</p>
        <F label="Tipo *">
          <select className={S.select} value={businessType}
            onChange={(e) => onBusinessType(e.target.value as BusinessType)}>
            {(Object.entries(BUSINESS_TYPE_LABELS) as [BusinessType, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </F>
      </section>

      <section>
        <p className={S.section}>Nombre del responsable</p>
        <G3>
          <F label="Nombre *">{inp("firstName", namePlaceholder)}</F>
          <F label="Apellido paterno *">{inp("lastNamePaternal", "López")}</F>
          <F label="Apellido materno">{inp("lastNameMaternal", "Fernández")}</F>
        </G3>
      </section>
      <section>
        <p className={S.section}>Nombre público</p>
        <F label="Nombre en página *" hint={publicNameHint}>
          <input className={S.input} value={data.publicName}
            onChange={(e) => onChange({ publicName: e.target.value })}
            placeholder={vertical === "gimnasios" ? "Roberto Gutiérrez" : "Dra. Mariana López"} />
        </F>
      </section>
      <section>
        <p className={S.section}>Contacto</p>
        <G3>
          <F label="Teléfono">{inp("phone", "5512345678")}</F>
          <F label="WhatsApp">{inp("whatsapp", "5512345678")}</F>
          <F label="Correo">{inp("email", vertical === "gimnasios" ? "gerente@gym.mx" : "dra@clinica.mx", "email")}</F>
        </G3>
      </section>
      <section>
        <p className={S.section}>Perfil público</p>
        <div className="space-y-3">
          <F label="Descripción corta">
            <input className={S.input} value={data.shortDescription ?? ""}
              onChange={(e) => onChange({ shortDescription: e.target.value })}
              placeholder={descPlaceholder} />
          </F>
          <F label="Biografía">
            <textarea className={`${S.input} min-h-[80px] resize-none`}
              value={data.bio ?? ""}
              onChange={(e) => onChange({ bio: e.target.value })}
              placeholder={vertical === "gimnasios" ? "Historia del gimnasio…" : "Egresada de la UNAM…"} />
          </F>
        </div>
      </section>
    </div>
  );
}

// ── Step 2: Negocio ───────────────────────────────────────────────────────────

function StepNegocio({
  data, businessType, onChange,
}: {
  data: BusinessInfo;
  businessType: BusinessType;
  onChange: (p: Partial<BusinessInfo>) => void;
}) {
  const vertical = getBusinessVertical(businessType);
  const namePlaceholder = vertical === "gimnasios" ? "IronFit Gym" : "Clínica Dental Sonrisa";
  const contactLabel = vertical === "gimnasios" ? "Contacto del negocio" : "Contacto del negocio";

  const inp = (field: keyof BusinessInfo, placeholder: string) => (
    <input className={S.input}
      value={(data[field] as string | undefined) ?? ""}
      onChange={(e) => onChange({ [field]: e.target.value })}
      placeholder={placeholder} />
  );
  return (
    <div className="space-y-5">
      <section>
        <p className={S.section}>Nombre</p>
        <G2>
          <F label="Nombre del negocio *">{inp("name", namePlaceholder)}</F>
          <F label="Nombre comercial" hint="Si difiere del oficial">{inp("commercialName", vertical === "gimnasios" ? "IronFit" : "Sonrisa")}</F>
        </G2>
      </section>
      <section>
        <p className={S.section}>Dirección</p>
        <div className="space-y-4">
          <G3>
            <F label="Calle">{inp("street", "Av. Insurgentes Sur")}</F>
            <F label="Nº exterior">{inp("exteriorNumber", "1234")}</F>
            <F label="Nº interior">{inp("interiorNumber", "Piso 2")}</F>
          </G3>
          <G2>
            <F label="Colonia">{inp("colony", "Del Valle")}</F>
            <F label="Alcaldía / Municipio">{inp("municipality", "Benito Juárez")}</F>
          </G2>
          <G3>
            <F label="Ciudad">{inp("city", "Ciudad de México")}</F>
            <F label="Estado">
              <select className={S.select} value={data.state ?? ""}
                onChange={(e) => onChange({ state: e.target.value })}>
                <option value="">Seleccionar…</option>
                {MX_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </F>
            <F label="Código postal">{inp("postalCode", "03100")}</F>
          </G3>
        </div>
      </section>
      <section>
        <p className={S.section}>{contactLabel}</p>
        <G3>
          <F label="Teléfono">{inp("phone", "5512345678")}</F>
          <F label="WhatsApp">{inp("whatsapp", "5512345678")}</F>
          <F label="Google Maps URL">{inp("googleMapsUrl", "https://maps.google.com/…")}</F>
        </G3>
      </section>
    </div>
  );
}

// ── Step 3: Cuenta ────────────────────────────────────────────────────────────

function StepCuenta({
  slug, plan, clientStatus, publicPageStatus, salesRepId,
  onSlug, onPlan, onStatus, onPage, onSalesRep, clinicName,
}: {
  slug: string; plan: UserPlan; clientStatus: ClientStatus;
  publicPageStatus: PublicPageStatus; salesRepId: string;
  onSlug: (v: string) => void; onPlan: (v: UserPlan) => void;
  onStatus: (v: ClientStatus) => void; onPage: (v: PublicPageStatus) => void;
  onSalesRep: (id: string, name: string) => void;
  clinicName: string;
}) {
  const { salesReps } = useAdminStore();
  return (
    <div className="space-y-5">
      <section>
        <p className={S.section}>Subdominio</p>
        <F label="Slug *" hint={slug ? `→ ${buildSubdomain(slug)}` : "Se genera desde el nombre del negocio"}>
          <div className="flex gap-2">
            <input className={S.input} value={slug}
              onChange={(e) => onSlug(e.target.value)} placeholder="clinica-sonrisa" />
            <button type="button" onClick={() => onSlug(generateSlug(clinicName))} className={S.btnGhost}>
              Auto
            </button>
          </div>
        </F>
      </section>
      <section>
        <p className={S.section}>Plan y estado</p>
        <G3>
          <F label="Plan">
            <select className={S.select} value={plan} onChange={(e) => onPlan(e.target.value as UserPlan)}>
              <option value="standard">Standard</option>
              <option value="cowork">Cowork</option>
              <option value="intelligence">Intelligence</option>
            </select>
          </F>
          <F label="Estado">
            <select className={S.select} value={clientStatus} onChange={(e) => onStatus(e.target.value as ClientStatus)}>
              <option value="active">Activo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </F>
          <F label="Página pública">
            <select className={S.select} value={publicPageStatus} onChange={(e) => onPage(e.target.value as PublicPageStatus)}>
              <option value="hidden">Oculta</option>
              <option value="published">Publicada</option>
            </select>
          </F>
        </G3>
      </section>
      <section>
        <p className={S.section}>Asignación</p>
        <F label="Vendedor responsable">
            <select className={S.select} value={salesRepId}
              onChange={(e) => {
                const rep = salesReps.find((r) => r.id === e.target.value);
                onSalesRep(e.target.value, rep?.name ?? "");
              }}>
              <option value="">Sin asignar</option>
              {salesReps.filter((r) => r.active).map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </F>
      </section>
    </div>
  );
}

// ── Step 4: Contrato ──────────────────────────────────────────────────────────

function StepContrato({
  contractType, activationDate, monthlyAmount, internalNotes,
  onType, onDate, onAmount, onNotes,
}: {
  contractType: ContractType; activationDate: string;
  monthlyAmount: number; internalNotes: string;
  onType: (v: ContractType) => void; onDate: (v: string) => void;
  onAmount: (v: number) => void; onNotes: (v: string) => void;
}) {
  const [amtStr, setAmtStr] = useState(String(monthlyAmount || ""));
  function handleAmtChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmtStr(raw);
    if (raw !== "") {
      const n = parseInt(raw, 10);
      if (!isNaN(n)) onAmount(n);
    }
  }
  const endDate = activationDate ? generateContractEndDate(activationDate, contractType) : "";
  return (
    <div className="space-y-5">
      <section>
        <p className={S.section}>Contrato</p>
        <div className="space-y-4">
          <G3>
            <F label="Tipo de contrato">
              <select className={S.select} value={contractType}
                onChange={(e) => onType(e.target.value as ContractType)}>
                {(Object.entries(CONTRACT_TYPE_LABELS) as [ContractType, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </F>
            <F label="Fecha de activación">
              <input type="date" className={S.input} value={activationDate}
                onChange={(e) => onDate(e.target.value)} />
            </F>
            <F label="Monto mensual (MXN)">
              <input type="text" inputMode="numeric" className={S.input}
                value={amtStr} onChange={handleAmtChange} placeholder="299" />
            </F>
          </G3>
          {endDate && (
            <div className="flex items-center justify-between bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-control)] px-4 py-3">
              <span className="text-xs text-[var(--text-muted)]">Fecha de vencimiento calculada</span>
              <span className="text-xs font-mono text-[var(--accent)]">{fmtDate(endDate)}</span>
            </div>
          )}
        </div>
      </section>
      <section>
        <p className={S.section}>Notas internas</p>
        <F label="Notas" hint="Visible solo para el equipo admin">
          <textarea className={`${S.input} min-h-[80px] resize-none`}
            value={internalNotes} onChange={(e) => onNotes(e.target.value)}
            placeholder="Contexto del cliente, acuerdos especiales…" />
        </F>
      </section>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function NewClientModal({ onClose }: { onClose: () => void }) {
  useAdminStore();
  const [form, setForm] = useState<NewClientInput>(EMPTY);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const setSpec        = (p: Partial<SpecialistInfo>) => setForm((f) => ({ ...f, specialist: { ...f.specialist, ...p } }));
  const setBusiness    = (p: Partial<BusinessInfo>)   => setForm((f) => ({ ...f, business:   { ...f.business,   ...p } }));
  const setBusinessType = (t: BusinessType) => setForm((f) => ({ ...f, businessType: t }));

  function validateStep() {
    if (step === 0) {
      if (!form.specialist.firstName.trim())       return "El nombre del responsable es obligatorio.";
      if (!form.specialist.lastNamePaternal.trim()) return "El apellido paterno es obligatorio.";
      if (!form.specialist.publicName.trim())       return "El nombre público es obligatorio.";
    }
    if (step === 1 && !form.business.name.trim()) return "El nombre del negocio es obligatorio.";
    if (step === 2 && !form.slug.trim())         return "El slug del subdominio es obligatorio.";
    if (step === 3) {
      if (!form.activationDate)                            return "La fecha de activación es obligatoria.";
      if (!form.monthlyAmount || form.monthlyAmount <= 0) return "El monto mensual debe ser mayor a 0.";
    }
    return "";
  }

  function next()  { const e = validateStep(); if (e) { setError(e); return; } setError(""); setStep((s) => s + 1); }
  function prev()  { setError(""); setStep((s) => s - 1); }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep();
    if (err) { setError(err); return; }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] w-full max-w-2xl max-h-[94vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b-[0.5px] border-[var(--border)] shrink-0">
          <div>
            <h2 className="text-[var(--text-primary)] font-semibold">Nuevo cliente</h2>
            <p className="text-[var(--text-muted)] text-xs mt-0.5">
              Completa los 4 pasos para registrar al cliente
              {form.businessType ? ` · ${BUSINESS_TYPE_LABELS[form.businessType as BusinessType]}` : ""}
            </p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors text-lg">
            ×
          </button>
        </div>

        <StepBar current={step} />

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto adm-scroll px-6 py-5">
          {step === 0 && (
            <StepResponsable
              data={form.specialist}
              businessType={(form.businessType ?? "other") as BusinessType}
              onChange={setSpec}
              onBusinessType={setBusinessType}
            />
          )}
          {step === 1 && (
            <StepNegocio
              data={form.business}
              businessType={(form.businessType ?? "other") as BusinessType}
              onChange={setBusiness}
            />
          )}
          {step === 2 && (
            <StepCuenta
              slug={form.slug} plan={form.plan}
              clientStatus={form.clientStatus} publicPageStatus={form.publicPageStatus}
              salesRepId={form.salesRepId ?? ""}
              onSlug={(v) => setForm((p) => ({ ...p, slug: v }))}
              onPlan={(v) => setForm((p) => ({ ...p, plan: v }))}
              onStatus={(v) => setForm((p) => ({ ...p, clientStatus: v }))}
              onPage={(v) => setForm((p) => ({ ...p, publicPageStatus: v }))}
              onSalesRep={(id, name) => setForm((p) => ({ ...p, salesRepId: id, salesRepName: name }))}
              clinicName={form.business.name}
            />
          )}
          {step === 3 && (
            <StepContrato
              contractType={form.contractType} activationDate={form.activationDate}
              monthlyAmount={form.monthlyAmount ?? 299} internalNotes={form.internalNotes ?? ""}
              onType={(v) => setForm((p) => ({ ...p, contractType: v }))}
              onDate={(v) => setForm((p) => ({ ...p, activationDate: v }))}
              onAmount={(v) => setForm((p) => ({ ...p, monthlyAmount: v }))}
              onNotes={(v) => setForm((p) => ({ ...p, internalNotes: v }))}
            />
          )}
          {error && (
            <p className="mt-4 text-[var(--danger)] text-xs">
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t-[0.5px] border-[var(--border)] shrink-0">
          <button type="button" onClick={step === 0 ? onClose : prev} className={S.btnSecondary}>
            {step === 0 ? "Cancelar" : "← Anterior"}
          </button>
          <span className="text-[11px] text-[var(--text-muted)]">{step + 1} / {STEPS.length}</span>
          {step < STEPS.length - 1
            ? <button type="button" onClick={next}    className={S.btnPrimary}>Siguiente →</button>
            : <button          onClick={handleSubmit} className={S.btnPrimary}>Crear cliente</button>
          }
        </div>
      </div>
    </div>
  );
}

// Suppress unused import warning — C is the design token reference
void C;
