"use client";
import { useState, useEffect } from "react";
import type { TransferRecord, BusinessType, ContractType, UserPlan, ActivationInput } from "@/types/user";
import { useAdminStore, BUSINESS_TYPE_LABELS } from "@/store/adminStore";
import { isSlugAvailable, generateSuggestedSubdomain, validateSubdomain, normalizeSubdomain, BUSINESS_TYPE_SLUG_MAP } from "@/lib/transferRules";
import { normalizePhoneNumber, validatePhoneNumber, formatPhoneDisplay } from "@/lib/phoneUtils";
import { registerClientCredential, DEFAULT_TEMP_PASSWORD } from "@/lib/clientAuth";
import { S } from "./adminUi";

// ── Step indicators ───────────────────────────────────────────────────────────

const STEPS = ["Verificar pago", "Datos del cliente", "Revisar y confirmar"];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-[0.5px] transition-colors ${
                i < current
                  ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--bg-base)]"
                  : i === current
                  ? "bg-[var(--accent-muted)] border-[var(--accent)] text-[var(--accent)]"
                  : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)]"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] mt-1 whitespace-nowrap ${i === current ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-[0.5px] mx-2 mb-4 ${i < current ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Verify payment ────────────────────────────────────────────────────

function StepVerify({
  transfer,
  onConfirm,
  onCancel,
}: {
  transfer: TransferRecord;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { salesReps, commissions } = useAdminStore();
  const [checked, setChecked] = useState(false);

  const seller = salesReps.find((r) => r.id === transfer.sellerId);
  const existingCommission = commissions.find((c) => c.transferId === transfer.id);
  const commissionAmount = existingCommission?.amount ?? seller?.fixedCommissionAmount ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <p className={S.section}>Detalles del pago recibido</p>
        <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] px-4 py-4 space-y-3">
          <Row label="Referencia bancaria" value={<span className="font-mono text-[var(--accent)]">{transfer.referenceNumber}</span>} />
          <Row label="Fecha de transferencia" value={new Date(transfer.transferDate + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })} />
          <Row label="Monto" value={<span className="font-bold text-[var(--text-primary)]">${transfer.amount.toLocaleString("es-MX")}</span>} />
          {seller && <Row label="Vendedor" value={`${seller.name} (${seller.sellerNumber})`} />}
          {transfer.prospectName && <Row label="Prospecto" value={transfer.prospectName} />}
          {transfer.prospectiveBusinessName && <Row label="Negocio" value={transfer.prospectiveBusinessName} />}
          {commissionAmount > 0 && (
            <Row label="Comisión a generar" value={<span className="text-[var(--accent)] font-semibold">${commissionAmount.toLocaleString("es-MX")}</span>} />
          )}
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 accent-[var(--accent)]"
        />
        <span className="text-sm text-[var(--text-primary)]">
          Confirmo que este pago fue recibido en la cuenta bancaria de J2EC y los datos corresponden al comprobante.
        </span>
      </label>

      <div className="flex gap-3 pt-1">
        <button className={S.btnDanger + " flex-1"} type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button
          className={S.btnPrimary + " flex-1"}
          type="button"
          disabled={!checked}
          onClick={onConfirm}
          style={{ opacity: checked ? 1 : 0.45 }}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Minimal client data ───────────────────────────────────────────────

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  businessName: string;
  businessType: BusinessType;
  plan: UserPlan;
  monthlyAmount: string;
  contractType: ContractType;
  activationDate: string;
  slug: string;
  slugManual: boolean;    // true = admin edited manually, don't auto-overwrite
  firstMonthlyPaymentGeneratesCommission: boolean;
}

function StepData({
  transfer,
  form,
  onChange,
  onNext,
  onBack,
  hasSeller,
}: {
  transfer: TransferRecord;
  form: FormData;
  onChange: (patch: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
  hasSeller: boolean;
}) {
  const { clients } = useAdminStore();
  const [error, setError] = useState("");

  // Auto-generate slug when name/type/phone change unless admin edited it manually
  useEffect(() => {
    if (!form.slugManual) {
      const suggested = generateSuggestedSubdomain({
        businessType: form.businessType,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });
      if (suggested) onChange({ slug: suggested });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.firstName, form.lastName, form.businessType, form.phone, form.slugManual]);

  const slugValidation = validateSubdomain(form.slug);
  const slugAvailable  = slugValidation.valid && isSlugAvailable(form.slug, clients);
  const slugOk = slugValidation.valid && slugAvailable;

  const phoneValid = validatePhoneNumber(form.phone).valid;
  const giroExample = BUSINESS_TYPE_SLUG_MAP[form.businessType] ?? "negocio";
  const last4 = normalizePhoneNumber(form.phone).slice(-4) || "xxxx";
  const firstEx = form.firstName.split(" ")[0]?.toLowerCase() || "nombre";
  const lastEx  = form.lastName.split(" ")[0]?.toLowerCase() || "apellido";
  const slugExample = `${giroExample}-${firstEx}-${lastEx}-${last4}`;

  function handleSlugChange(value: string) {
    onChange({ slug: normalizeSubdomain(value), slugManual: true });
  }

  function handleRegenerate() {
    onChange({ slugManual: false });
  }

  function handleNext() {
    setError("");
    if (!form.firstName.trim()) { setError("El nombre del responsable es obligatorio."); return; }
    if (!form.lastName.trim()) { setError("El apellido es obligatorio."); return; }
    if (!form.phone.trim() || !phoneValid) { setError("El teléfono de acceso debe tener al menos 10 dígitos."); return; }
    if (!form.businessName.trim()) { setError("El nombre del negocio es obligatorio."); return; }
    if (!slugOk) { setError(!slugValidation.valid ? slugValidation.message : "El subdominio ya está en uso o es reservado."); return; }
    const amount = parseFloat(form.monthlyAmount);
    if (isNaN(amount) || amount <= 0) { setError("El monto mensual debe ser mayor a 0."); return; }
    onNext();
  }

  return (
    <div className="space-y-5">
      {/* Responsable */}
      <div>
        <p className={S.section}>Responsable del negocio</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={S.label}>Nombre *</label>
            <input className={S.input} value={form.firstName} onChange={(e) => onChange({ firstName: e.target.value })} placeholder="Ej. Mariana" />
          </div>
          <div>
            <label className={S.label}>Apellido *</label>
            <input className={S.input} value={form.lastName} onChange={(e) => onChange({ lastName: e.target.value })} placeholder="Ej. López" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className={S.label}>Teléfono de acceso *</label>
            <input
              className={`${S.input} ${form.phone && !phoneValid ? "border-[var(--danger)]" : ""}`}
              value={form.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="Ej. 55 1234 5678"
              type="tel"
            />
            {form.phone && phoneValid && (
              <p className="text-[10px] text-[var(--accent)] mt-1">{formatPhoneDisplay(form.phone)}</p>
            )}
            {form.phone && !phoneValid && (
              <p className="text-[10px] text-[var(--danger)] mt-1">Mínimo 10 dígitos.</p>
            )}
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Usado para iniciar sesión en el panel</p>
          </div>
          <div>
            <label className={S.label}>Correo de contacto *</label>
            <input className={S.input} type="email" value={form.email} onChange={(e) => onChange({ email: e.target.value })} placeholder="correo@ejemplo.com" />
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Para recuperación y notificaciones</p>
          </div>
        </div>
      </div>

      {/* Negocio */}
      <div>
        <p className={S.section}>Información del negocio</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={S.label}>Nombre del negocio *</label>
            <input className={S.input} value={form.businessName} onChange={(e) => onChange({ businessName: e.target.value })} placeholder="Ej. Clínica San Rafael" />
          </div>
          <div>
            <label className={S.label}>Tipo de negocio</label>
            <select className={S.select} value={form.businessType} onChange={(e) => onChange({ businessType: e.target.value as BusinessType })}>
              {(Object.entries(BUSINESS_TYPE_LABELS) as [BusinessType, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-end justify-between mb-1.5">
            <label className={`${S.label} !mb-0`}>
              Subdominio * <span className="normal-case font-normal tracking-normal">(giro-nombre-apellido-últimos 4 del teléfono)</span>
            </label>
            <button
              type="button"
              className="text-[10px] text-[var(--accent)] hover:underline"
              onClick={handleRegenerate}
            >
              ↺ Regenerar sugerencia
            </button>
          </div>
          <input
            className={`${S.input} ${form.slug && !slugOk ? "border-[var(--danger)]" : ""}`}
            value={form.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="ej. dentista-mariana-lopez-5678"
          />
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            Ejemplo: <span className="font-mono">{slugExample}</span> · {form.slug || "…"}.templatea2.com
          </p>
          {form.slug && !slugValidation.valid && (
            <p className="text-[11px] text-[var(--danger)] mt-1">{slugValidation.message}</p>
          )}
          {form.slug && slugValidation.valid && !slugAvailable && (
            <p className="text-[11px] text-[var(--danger)] mt-1">Subdominio ya está en uso o es reservado.</p>
          )}
          {form.slug && slugOk && (
            <p className="text-[11px] text-[var(--accent)] mt-1">✓ Disponible</p>
          )}
        </div>
      </div>

      {/* Contrato */}
      <div>
        <p className={S.section}>Contrato</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={S.label}>Monto mensual *</label>
            <input className={S.input} type="number" min="1" value={form.monthlyAmount} onChange={(e) => onChange({ monthlyAmount: e.target.value })} />
          </div>
          <div>
            <label className={S.label}>Tipo de contrato</label>
            <select className={S.select} value={form.contractType} onChange={(e) => onChange({ contractType: e.target.value as ContractType })}>
              <option value="six_months">6 meses</option>
              <option value="one_year">1 año</option>
            </select>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className={S.label}>Plan</label>
            <select className={S.select} value={form.plan} onChange={(e) => onChange({ plan: e.target.value as UserPlan })}>
              <option value="standard">Standard</option>
              <option value="cowork">Cowork</option>
              <option value="intelligence">Intelligence</option>
            </select>
          </div>
          <div>
            <label className={S.label}>Fecha de activación *</label>
            <input className={S.input} type="date" value={form.activationDate} onChange={(e) => onChange({ activationDate: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Comisión de primera mensualidad */}
      {hasSeller && (
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.firstMonthlyPaymentGeneratesCommission}
            onChange={(e) => onChange({ firstMonthlyPaymentGeneratesCommission: e.target.checked })}
            className="mt-0.5 accent-[var(--accent)]"
          />
          <div>
            <span className="text-sm text-[var(--text-primary)]">Generar comisión al pago de la primera mensualidad</span>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Si se marca, se generará automáticamente una comisión para el vendedor cuando se complete el primer pago mensual.</p>
          </div>
        </label>
      )}

      {/* Contraseña temporal — informativa */}
      <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] px-4 py-3">
        <p className="text-[11px] text-[var(--text-muted)]">
          Se asignará automáticamente la contraseña temporal <span className="font-mono font-semibold text-[var(--text-primary)]">{DEFAULT_TEMP_PASSWORD}</span> al activar. El cliente deberá cambiarla en su primer acceso.
        </p>
      </div>

      {error && (
        <p className="text-[var(--danger)] text-xs">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button className={S.btnSecondary + " flex-1"} type="button" onClick={onBack}>← Atrás</button>
        <button className={S.btnPrimary + " flex-1"} type="button" onClick={handleNext}>Siguiente →</button>
      </div>
    </div>
  );
}

// ── Step 3: Review and confirm ────────────────────────────────────────────────

function StepReview({
  transfer,
  form,
  onConfirm,
  onBack,
  loading,
}: {
  transfer: TransferRecord;
  form: FormData;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const { salesReps } = useAdminStore();
  const seller = salesReps.find((r) => r.id === transfer.sellerId);

  return (
    <div className="space-y-5">
      <div>
        <p className={S.section}>Resumen de activación</p>
        <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] px-4 py-4 space-y-3">
          <Row label="Responsable" value={`${form.firstName} ${form.lastName}`} />
          <Row label="Teléfono" value={form.phone} />
          {form.email && <Row label="Correo" value={form.email} />}
          <Row label="Negocio" value={form.businessName} />
          <Row label="Tipo" value={BUSINESS_TYPE_LABELS[form.businessType]} />
          <Row label="Subdominio" value={<span className="font-mono text-[var(--accent)]">{form.slug}.templatea2.com</span>} />
          <div className="border-t-[0.5px] border-[var(--border)] pt-3 space-y-3">
            <Row label="Monto mensual" value={`$${parseFloat(form.monthlyAmount).toLocaleString("es-MX")}`} />
            <Row label="Contrato" value={form.contractType === "six_months" ? "6 meses" : "1 año"} />
            <Row label="Activación" value={new Date(form.activationDate + "T00:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })} />
            <Row label="Acceso (teléfono)" value={<span className="font-mono text-[var(--accent)]">{formatPhoneDisplay(form.phone)}</span>} />
            <Row label="Contraseña temporal" value={<span className="font-mono text-[var(--text-muted)]">{DEFAULT_TEMP_PASSWORD} (el cliente debe cambiarla)</span>} />
          </div>
          {seller && (
            <div className="border-t-[0.5px] border-[var(--border)] pt-3 space-y-3">
              <Row label="Vendedor" value={`${seller.name} (${seller.sellerNumber})`} />
              <Row label="Comisión apertura" value={<span className="text-[var(--accent)] font-semibold">${(transfer.fixedCommissionAmount ?? seller.fixedCommissionAmount ?? 0).toLocaleString("es-MX")}</span>} />
              <Row label="Com. 1ª mensualidad" value={form.firstMonthlyPaymentGeneratesCommission ? <span className="text-[var(--accent)]">Sí — se crea en espera, activa al confirmar primera mensualidad</span> : <span className="text-[var(--text-muted)]">No</span>} />
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-[var(--text-muted)]">
        Al confirmar: se creará el cliente, se generará el historial de pagos, se activará el subdominio y se autorizará la comisión del vendedor.
      </p>

      <div className="flex gap-3 pt-1">
        <button className={S.btnSecondary + " flex-1"} type="button" onClick={onBack} disabled={loading}>
          ← Atrás
        </button>
        <button
          className={S.btnPrimary + " flex-1"}
          type="button"
          onClick={onConfirm}
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Activando…" : "✓ Confirmar y activar"}
        </button>
      </div>
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-[11px] text-[var(--text-muted)] shrink-0">{label}</span>
      <span className="text-xs text-[var(--text-primary)] text-right">{value}</span>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export function ActivationWizard({
  transfer,
  onClose,
}: {
  transfer: TransferRecord;
  onClose: () => void;
}) {
  const store = useAdminStore();
  const [step, setStep] = useState(
    transfer.status === "pending_activation" ? 1 : 0,
  );
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);
  const [pwCopied, setPwCopied] = useState(false);

  const [form, setForm] = useState<FormData>(() => {
    const firstName = (transfer.prospectName ?? "").split(" ")[0] ?? "";
    const lastName  = (transfer.prospectName ?? "").split(" ").slice(1).join(" ") ?? "";
    const phone     = transfer.prospectPhone ?? "";
    const businessType: BusinessType = "dentist";
    return {
      firstName, lastName, phone,
      email: "",
      businessName: transfer.prospectiveBusinessName ?? transfer.prospectName ?? "",
      businessType,
      plan: "standard",
      monthlyAmount: String(transfer.amount),
      contractType: "six_months",
      activationDate: transfer.transferDate,
      slug: generateSuggestedSubdomain({ businessType, firstName, lastName, phone }),
      slugManual: false,
      firstMonthlyPaymentGeneratesCommission: false,
    };
  });

  function patch(p: Partial<FormData>) {
    setForm((prev) => ({ ...prev, ...p }));
  }

  function handleVerifyConfirm() {
    store.verifyOpeningTransfer(transfer.id);
    setStep(1);
  }

  function handleActivate() {
    setLoading(true);
    const input: ActivationInput = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      businessName: form.businessName.trim(),
      businessType: form.businessType,
      plan: form.plan,
      monthlyAmount: parseFloat(form.monthlyAmount),
      contractType: form.contractType,
      activationDate: form.activationDate,
      slug: form.slug.trim(),
      accessPhone: normalizePhoneNumber(form.phone),
      initialPassword: DEFAULT_TEMP_PASSWORD,
      mustChangePassword: true,
      firstMonthlyPaymentGeneratesCommission: form.firstMonthlyPaymentGeneratesCommission || undefined,
    };
    // Simulate async (provisioning would be a real API call)
    setTimeout(() => {
      store.activateClientFromTransfer(transfer.id, input);
      // Register credentials in the mock auth service
      const clientNumber = `TA2-${String(store.clients.length + 1).padStart(4, "0")}`;
      registerClientCredential({
        clientId: "clt-" + transfer.id,
        clientNumber,
        accessPhone: normalizePhoneNumber(form.phone),
        initialPassword: DEFAULT_TEMP_PASSWORD,
        mustChangePassword: true,
        businessName: form.businessName.trim(),
        ownerName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        plan: form.plan,
        slug: form.slug.trim(),
      });
      setLoading(false);
      setActivated(true);
    }, 600);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg bg-[var(--bg-surface)] border-[0.5px] border-[var(--border)] rounded-[var(--radius-surface)] flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b-[0.5px] border-[var(--border)] shrink-0">
          <div>
            <h2 className="text-[var(--text-primary)] font-semibold">Activar cliente</h2>
            <p className="text-[var(--text-muted)] text-xs mt-0.5 font-mono">{transfer.referenceNumber} · ${transfer.amount.toLocaleString("es-MX")}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto adm-scroll px-6 py-5">
          {activated ? (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-muted)] border-[0.5px] border-[var(--accent)] flex items-center justify-center text-[var(--accent)] text-xl mx-auto mb-3">✓</div>
                <p className="font-semibold text-[var(--text-primary)]">¡Cliente activado exitosamente!</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{form.businessName.trim()} · {form.firstName.trim()} {form.lastName.trim()}</p>
              </div>
              <div className="bg-[var(--bg-elevated)] border-[0.5px] border-[var(--accent)] rounded-[var(--radius-surface)] px-4 py-4 space-y-2">
                <p className="text-[11px] font-semibold text-[var(--text-primary)]">Contraseña temporal del cliente</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-[var(--bg-base)] border-[0.5px] border-[var(--border)] rounded px-3 py-2 flex-1 text-[var(--text-primary)]">
                    {DEFAULT_TEMP_PASSWORD}
                  </span>
                  <button
                    className="px-3 py-2 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--bg-base)] text-xs font-semibold border-[0.5px] border-[var(--accent)] transition-colors"
                    onClick={() => { navigator.clipboard.writeText(DEFAULT_TEMP_PASSWORD); setPwCopied(true); setTimeout(() => setPwCopied(false), 2000); }}
                  >
                    {pwCopied ? "✓ Copiado" : "Copiar"}
                  </button>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">El cliente deberá cambiarla en su primer acceso. Compártela por un canal seguro.</p>
              </div>
              <button className="w-full px-4 py-2 rounded-[var(--radius-control)] bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[0.5px] border-[var(--border)] text-sm font-medium" onClick={onClose}>
                Cerrar
              </button>
            </div>
          ) : (<>
          <StepBar current={step} />

          {step === 0 && (
            <StepVerify
              transfer={transfer}
              onConfirm={handleVerifyConfirm}
              onCancel={onClose}
            />
          )}
          {step === 1 && (
            <StepData
              transfer={transfer}
              form={form}
              onChange={patch}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
              hasSeller={!!transfer.sellerId}
            />
          )}
          {step === 2 && (
            <StepReview
              transfer={transfer}
              form={form}
              onConfirm={handleActivate}
              onBack={() => setStep(1)}
              loading={loading}
            />
          )}
          </>)}
        </div>
      </div>
    </div>
  );
}
