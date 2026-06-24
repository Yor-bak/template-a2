"use client";
import { useState, useEffect } from "react";
import { X, Plus, Trash2, CheckCircle2, Smile, Star, Clock, Activity,
  Heart, ShieldCheck, Sparkles, Stethoscope, Brain, MessageCircle, Users,
  Moon, BookOpen, Apple, Utensils, Flame, Droplets, PawPrint, Dog, Cat,
  Syringe, Scissors, Sun, Eye, Zap, Pill, Bone, Microscope, Aperture,
  SmilePlus, Baby, Target, Dumbbell, Hand, Weight, Move, BadgeCheck,
  Waves, RotateCcw, Calendar, AlertTriangle, ScanLine, TestTube,
  Salad, User } from "lucide-react";
import type { Service, PriceType } from "@/types";
import {
  useServices,
  generateSlug,
  ensureUniqueSlug,
  PRICE_TYPE_LABELS,
  PRICE_TYPE_HINTS,
} from "@/contexts/ServicesContext";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { useExtraProfile } from "@/contexts/ExtraProfileContext";
import { getTemplate } from "@/templates/registry";
import { getIconsForCategory } from "@/lib/serviceIcons";

// ── Tipos internos ───────────────────────────────────────────────────────────

type FormData = {
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  durationMinutes: string;
  priceType: PriceType;
  estimatedPrice: string;
  isEmergency: boolean;
  isActive: boolean;
  whenRecommended: string;
  includes: string[];
  recommendations: string[];
  icon: string;
};

type FormErrors = Partial<Record<keyof FormData | "root", string>>;

const emptyForm: FormData = {
  name: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  durationMinutes: "",
  priceType: "from",
  estimatedPrice: "",
  isEmergency: false,
  isActive: true,
  whenRecommended: "",
  includes: [""],
  recommendations: [""],
  icon: "",
};

function serviceToForm(svc: Service): FormData {
  return {
    name: svc.name,
    slug: svc.slug,
    shortDescription: svc.shortDescription,
    fullDescription: svc.fullDescription,
    durationMinutes: String(svc.durationMinutes),
    priceType: svc.priceType,
    estimatedPrice: svc.estimatedPrice ? String(svc.estimatedPrice) : "",
    isEmergency: svc.isEmergency,
    isActive: svc.isActive,
    whenRecommended: svc.whenRecommended ?? "",
    includes: svc.includes?.length ? svc.includes : [""],
    recommendations: svc.recommendations?.length ? svc.recommendations : [""],
    icon: svc.icon ?? "",
  };
}

// Mapa de nombre → componente para renderizar íconos dinámicamente
const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Smile, SmilePlus, Aperture, Zap, Shield: ShieldCheck, Scissors, ScanLine, Baby,
  Stethoscope, Pill, Activity, Microscope, Brain, Bone, Eye, TestTube,
  MessageCircle, Heart, Users, User, Moon, BookOpen,
  Apple, Salad, Weight, Flame, Droplets, Utensils,
  Move, Target, Dumbbell, Hand, Waves, RotateCcw,
  PawPrint, Dog, Cat, Syringe, AlertTriangle,
  Sparkles, Sun,
  Star, CheckCircle2, Clock, Calendar, BadgeCheck, ShieldCheck,
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface ServiceFormProps {
  open: boolean;
  editingService: Service | null;
  onClose: () => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ServiceForm({ open, editingService, onClose }: ServiceFormProps) {
  const { services, createService, updateService } = useServices();
  const { config } = useClinicConfig();
  const { appearance, serviceTemplateMedia, updateServiceTemplateMedia } = useExtraProfile();

  const activeTemplateId = appearance.selectedTemplateId ?? "dentista-01";
  const templateDef = getTemplate(activeTemplateId);
  const svcImageFields = templateDef?.serviceImageFields ?? [];

  // Category derived from specialty (simplistic: extract category key)
  const specialty = (config.specialty ?? "").toLowerCase();
  const category = specialty.includes("psic") ? "psicologo"
    : specialty.includes("nutri") ? "nutriologo"
    : specialty.includes("fisio") || specialty.includes("rehab") ? "fisioterapia"
    : specialty.includes("vet") ? "veterinario"
    : specialty.includes("estet") || specialty.includes("belleza") ? "estetica"
    : specialty.includes("méd") || specialty.includes("med") || specialty.includes("intern") ? "medico"
    : templateDef?.category ?? "dentista";

  const iconOptions = getIconsForCategory(category);

  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // template-specific media for this service
  const [svcMedia, setSvcMedia] = useState<Record<string, string>>({});
  const [slugManual, setSlugManual] = useState(false);

  // Inicializar form cuando abre
  useEffect(() => {
    if (!open) return;
    if (editingService) {
      setForm(serviceToForm(editingService));
      setSlugManual(true);
      // Load existing template media for this service
      const existing = serviceTemplateMedia[activeTemplateId]?.[editingService.id] ?? {};
      setSvcMedia(existing as Record<string, string>);
    } else {
      setForm(emptyForm);
      setSlugManual(false);
      setSvcMedia({});
    }
    setErrors({});
    setDone(false);
  }, [open, editingService, activeTemplateId, serviceTemplateMedia]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Auto-slug desde nombre (solo cuando no fue editado manualmente)
  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: slugManual ? f.slug : generateSlug(name),
    }));
    setErrors((e) => ({ ...e, name: undefined, slug: undefined }));
  }

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  // ── Includes / Recommendations ─────────────────────────────────────────────

  function setListItem(field: "includes" | "recommendations", idx: number, val: string) {
    setForm((f) => {
      const arr = [...f[field]];
      arr[idx] = val;
      return { ...f, [field]: arr };
    });
  }

  function addListItem(field: "includes" | "recommendations") {
    setForm((f) => ({ ...f, [field]: [...f[field], ""] }));
  }

  function removeListItem(field: "includes" | "recommendations", idx: number) {
    setForm((f) => {
      const arr = f[field].filter((_, i) => i !== idx);
      return { ...f, [field]: arr.length ? arr : [""] };
    });
  }

  // ── Validación ─────────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.slug.trim()) e.slug = "El slug es requerido";
    else {
      const conflict = services.find(
        (s) => s.slug === form.slug.trim() && s.id !== editingService?.id
      );
      if (conflict) e.slug = "Este slug ya está en uso";
    }
    if (!form.shortDescription.trim()) e.shortDescription = "La descripción corta es requerida";
    if (!form.fullDescription.trim()) e.fullDescription = "La descripción completa es requerida";
    const dur = Number(form.durationMinutes);
    if (!form.durationMinutes || isNaN(dur) || dur <= 0) e.durationMinutes = "Debe ser mayor a 0";
    if (["from", "fixed"].includes(form.priceType)) {
      const price = Number(form.estimatedPrice);
      if (!form.estimatedPrice || isNaN(price) || price <= 0)
        e.estimatedPrice = "Ingresa un precio mayor a 0";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: Omit<Service, "id" | "createdAt" | "updatedAt"> = {
      name: form.name.trim(),
      slug: ensureUniqueSlug(form.slug.trim(), services, editingService?.id),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      durationMinutes: Number(form.durationMinutes),
      priceType: form.priceType,
      estimatedPrice:
        ["from", "fixed"].includes(form.priceType) && form.estimatedPrice
          ? Number(form.estimatedPrice)
          : undefined,
      isEmergency: form.isEmergency,
      isActive: form.isActive,
      whenRecommended: form.whenRecommended.trim() || undefined,
      includes: form.includes.filter((i) => i.trim()),
      recommendations: form.recommendations.filter((r) => r.trim()),
      icon: form.icon || undefined,
    };

    setSubmitting(true);
    try {
      let savedId: string;
      if (editingService) {
        await updateService(editingService.id, payload);
        savedId = editingService.id;
      } else {
        const created = await createService(payload);
        savedId = (created as { id?: string })?.id ?? `svc-${Date.now()}`;
      }
      // Persist template-specific service media
      if (svcImageFields.length > 0 && Object.keys(svcMedia).length > 0) {
        updateServiceTemplateMedia(activeTemplateId, savedId, svcMedia);
      }
      setDone(true);
      setTimeout(() => {
        setDone(false);
        onClose();
      }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar el servicio.";
      setErrors((e) => ({ ...e, root: msg }));
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setDone(false);
    onClose();
  }

  if (!open) return null;

  const priceNeedsAmount = ["from", "fixed"].includes(form.priceType);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-white">
          <div>
            <h2 className="font-bold text-gray-900 text-base">
              {editingService ? "Editar servicio" : "Agregar servicio"}
            </h2>
            <p className="text-xs text-gray-400">
              {editingService ? "Modifica los campos y guarda." : "Rellena los campos para crear un nuevo servicio."}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Éxito */}
        {done && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center gap-3 z-10">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <p className="font-bold text-gray-800">
              {editingService ? "¡Servicio actualizado!" : "¡Servicio creado!"}
            </p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {/* ── Identidad ─────────────────────────────────────── */}
          <FieldGroup title="Identidad del servicio">
            <Field label="Nombre del servicio" required error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej. Limpieza dental profunda"
                className={inp(!!errors.name)}
              />
            </Field>

            <Field
              label="Slug (URL)"
              required
              error={errors.slug}
              hint='Se genera automáticamente. Ej: "limpieza-dental"'
            >
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugManual(true);
                  set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                }}
                placeholder="limpieza-dental"
                className={inp(!!errors.slug)}
              />
            </Field>

            <Field label="Descripción corta" required error={errors.shortDescription} hint="Una o dos oraciones que aparecen en la lista pública.">
              <input
                value={form.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                placeholder="Remoción profesional de sarro y placa bacteriana."
                className={inp(!!errors.shortDescription)}
              />
            </Field>

            <Field label="Descripción completa" required error={errors.fullDescription} hint="Se muestra en la página de detalle del servicio.">
              <textarea
                value={form.fullDescription}
                onChange={(e) => set("fullDescription", e.target.value)}
                rows={4}
                placeholder="Describe el tratamiento con detalle..."
                className={inp(!!errors.fullDescription)}
              />
            </Field>
          </FieldGroup>

          {/* ── Precio y duración ──────────────────────────────── */}
          <FieldGroup title="Precio y duración">
            <Field label="Duración aproximada (minutos)" required error={errors.durationMinutes}>
              <input
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={(e) => set("durationMinutes", e.target.value)}
                placeholder="45"
                className={inp(!!errors.durationMinutes)}
              />
            </Field>

            <Field label="Tipo de precio" required>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(["from", "fixed", "assessment_required", "hidden"] as PriceType[]).map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => set("priceType", pt)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      form.priceType === pt
                        ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]/40"
                        : "border-[var(--color-border)] hover:border-[var(--color-accent)]/40 bg-white"
                    }`}
                  >
                    <p className={`font-semibold text-xs mb-0.5 ${form.priceType === pt ? "text-[var(--color-primary)]" : "text-[var(--color-muted-text)]"}`}>
                      {PRICE_TYPE_LABELS[pt]}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{PRICE_TYPE_HINTS[pt]}</p>
                  </button>
                ))}
              </div>
            </Field>

            {priceNeedsAmount && (
              <Field label="Precio estimado (MXN)" required error={errors.estimatedPrice}>
                <input
                  type="number"
                  min={1}
                  value={form.estimatedPrice}
                  onChange={(e) => set("estimatedPrice", e.target.value)}
                  placeholder="500"
                  className={inp(!!errors.estimatedPrice)}
                />
              </Field>
            )}
          </FieldGroup>

          {/* ── Configuración ──────────────────────────────────── */}
          <FieldGroup title="Configuración">
            <Field label="¿Cuándo se recomienda? (opcional)" hint="Aparece en la página de detalle del servicio.">
              <input
                value={form.whenRecommended}
                onChange={(e) => set("whenRecommended", e.target.value)}
                placeholder="Ej. Cada 6 meses para mantener la salud bucal."
                className={inp(false)}
              />
            </Field>

            <div className="flex flex-col gap-2">
              <Toggle
                id="isEmergency"
                label="¿Es servicio de urgencia?"
                description="Aparece resaltado en la sección de urgencias."
                checked={form.isEmergency}
                onChange={(v) => set("isEmergency", v)}
                color="red"
              />
              <Toggle
                id="isActive"
                label="¿Está activo?"
                description="Los servicios inactivos no aparecen en la página pública ni en el formulario de citas."
                checked={form.isActive}
                onChange={(v) => set("isActive", v)}
                color="sky"
              />
            </div>
          </FieldGroup>

          {/* ── Incluye ────────────────────────────────────────── */}
          <FieldGroup title="¿Qué incluye?">
            <div className="space-y-2">
              {form.includes.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => setListItem("includes", idx, e.target.value)}
                    placeholder={`Ej. Anestesia local`}
                    className={`${inp(false)} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem("includes", idx)}
                    disabled={form.includes.length === 1}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem("includes")}
                className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:text-[var(--color-accent)] font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar elemento
              </button>
            </div>
          </FieldGroup>

          {/* ── Recomendaciones ────────────────────────────────── */}
          <FieldGroup title="Recomendaciones previas">
            <div className="space-y-2">
              {form.recommendations.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => setListItem("recommendations", idx, e.target.value)}
                    placeholder="Ej. No comer 1 hora antes"
                    className={`${inp(false)} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem("recommendations", idx)}
                    disabled={form.recommendations.length === 1}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addListItem("recommendations")}
                className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:text-[var(--color-accent)] font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar recomendación
              </button>
            </div>
          </FieldGroup>

          {/* ── Símbolo del servicio ───────────────────────────── */}
          {iconOptions.length > 0 && (
            <FieldGroup title="Símbolo del servicio">
              <p className="text-xs text-gray-400 mb-2">Selecciona un ícono representativo para este servicio.</p>
              <div className="grid grid-cols-6 gap-1.5">
                {iconOptions.map((opt) => {
                  const IconComp = ICON_COMPONENTS[opt.value];
                  if (!IconComp) return null;
                  const selected = form.icon === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      title={opt.label}
                      onClick={() => set("icon", selected ? "" : opt.value)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                        selected
                          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]/40 text-[var(--color-primary)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-accent)]/40 text-gray-500"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span className="text-[9px] leading-tight text-center line-clamp-1">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {form.icon && (
                <button
                  type="button"
                  onClick={() => set("icon", "")}
                  className="mt-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Quitar símbolo
                </button>
              )}
            </FieldGroup>
          )}

          {/* ── Imágenes para el template actual ──────────────── */}
          {svcImageFields.length > 0 && (
            <FieldGroup title={`Imágenes para el template`}>
              <p className="text-xs text-gray-400 mb-2">
                Imágenes específicas del template activo ({activeTemplateId}).
              </p>
              <div className="space-y-3">
                {svcImageFields.map((field) => (
                  <Field
                    key={field.key}
                    label={field.label}
                    required={field.required}
                    hint={[field.description, field.recommendedAspectRatio ? `Proporción recomendada: ${field.recommendedAspectRatio}` : ""].filter(Boolean).join(" · ")}
                  >
                    <input
                      type="url"
                      value={(svcMedia[field.key] as string) ?? ""}
                      onChange={(e) => setSvcMedia((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder="https://..."
                      className={inp(false)}
                    />
                  </Field>
                ))}
              </div>
            </FieldGroup>
          )}
        </form>

        {/* Footer fijo */}
        {errors.root && (
          <div className="px-6 py-2 bg-red-50 border-t border-red-100 text-xs text-red-600">{errors.root}</div>
        )}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3 bg-white">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-[var(--color-primary)] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60"
          >
            {submitting ? "Guardando..." : editingService ? "Guardar cambios" : "Crear servicio"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label, required, error, hint, children,
}: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-sky-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-[11px] text-gray-400 mb-1">{hint}</p>}
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Toggle({
  id, label, description, checked, onChange, color,
}: {
  id: string; label: string; description: string; checked: boolean;
  onChange: (v: boolean) => void; color: "sky" | "red";
}) {
  const active = color === "sky" ? "bg-sky-500" : "bg-red-500";
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${checked ? "border-gray-200 bg-gray-50" : "border-gray-100"}`}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full flex-shrink-0 mt-0.5 transition-colors ${checked ? active : "bg-gray-300"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
      <div>
        <p className="text-xs font-semibold text-gray-700">{label}</p>
        <p className="text-[11px] text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function inp(hasError: boolean) {
  return `w-full border ${hasError ? "border-red-300 bg-red-50" : "border-[var(--color-border)]"} rounded-xl px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-colors bg-white`;
}

