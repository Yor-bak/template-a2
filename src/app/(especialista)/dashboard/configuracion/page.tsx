"use client";
import { useState } from "react";
import Link from "next/link";
import {
  User, MapPin, Clock, CreditCard, Palette, Bot,
  CheckCircle2, AlertCircle, Car, Phone, Mail,
  ExternalLink, Save, Wifi, WifiOff, Info,
  Image, Search, MessageSquare, Globe, EyeOff,
  GraduationCap, Star, HelpCircle, Eye, Trash2, Plus,
  Sun, Moon, Monitor, Database, Download,
} from "lucide-react";
import { useClientData } from "@/contexts/ClientDataContext";
import { exportToCSV } from "@/lib/exportUtils";
import type { MessageTemplates } from "@/types/clinic";
import { DEFAULT_MESSAGE_TEMPLATES, MESSAGE_TEMPLATE_LABELS } from "@/lib/messageUtils";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { useExtraProfile } from "@/contexts/ExtraProfileContext";
import type { PublicTestimonial, PublicFAQ, DashboardTheme } from "@/types/profile";
import { getInitials } from "@/lib/profileUtils";
import { TEMPLATE_REGISTRY, getTemplate } from "@/templates/registry";
import { DASHBOARD_THEME_PRESETS, getThemePreset } from "@/lib/dashboardThemes";
import type { TemplateImageField } from "@/templates/types";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { DEFAULT_CLINIC_CONFIG as legacyClinic } from "@/config/defaultClinicData";
import type { OpeningHour, PaymentMethod } from "@/types/clinic";
import {
  ALL_PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  validateClinicConfig,
} from "@/lib/clinicUtils";

type Tab = "general" | "especialista" | "contacto" | "redes" | "horarios" | "pagos" | "apariencia" | "pagina" | "testimonios" | "preguntas" | "automatizacion" | "imagenes" | "seo" | "mensajes" | "datos";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "general",        label: "General",            icon: User          },
  { id: "especialista",   label: "Especialista",       icon: GraduationCap },
  { id: "contacto",       label: "Contacto y ubicación", icon: MapPin      },
  { id: "redes",          label: "Redes sociales",     icon: Globe         },
  { id: "horarios",       label: "Horarios",           icon: Clock         },
  { id: "pagos",          label: "Pagos y urgencias",  icon: CreditCard    },
  { id: "apariencia",     label: "Apariencia",         icon: Palette       },
  { id: "pagina",         label: "Página pública",     icon: Eye           },
  { id: "testimonios",    label: "Testimonios",        icon: Star          },
  { id: "preguntas",      label: "Preguntas",          icon: HelpCircle    },
  { id: "imagenes",       label: "Imágenes",           icon: Image         },
  { id: "seo",            label: "SEO Local",          icon: Search        },
  { id: "mensajes",       label: "Mensajes",           icon: MessageSquare },
  { id: "automatizacion", label: "Automatización",     icon: Bot           },
  { id: "datos",          label: "Datos y respaldo",   icon: Database      },
];

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputCls = (err?: string) =>
  `w-full border ${
    err
      ? "border-red-300 bg-[var(--ds-error)]/10 focus:ring-red-200"
      : "border-[var(--ds-border)] bg-[var(--ds-surface)] focus:ring-[var(--color-accent-soft)]"
  } rounded-xl px-4 py-2.5 text-sm text-[var(--ds-text)] placeholder:text-[var(--ds-text-muted)]/50 focus:outline-none focus:ring-2 focus:border-[var(--ds-ring)] transition-colors`;

function Field({
  label, required, error, hint, children,
}: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--ds-text-muted)] mb-1.5">
        {label}{required && <span className="text-[var(--ds-accent)] ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[var(--ds-text-muted)]/60 mt-1">{hint}</p>}
      {error && <p className="text-xs text-[var(--ds-error)] mt-1">{error}</p>}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-[var(--ds-text)] text-sm uppercase tracking-wide mb-5">{title}</h3>
      {children}
    </div>
  );
}

function SaveRow({
  onSave, saved, saving, errors, dirty = true,
}: {
  onSave: () => void; saved: boolean; saving: boolean; errors: string[]; dirty?: boolean;
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 pt-4">
      {saved && (
        <span className="flex items-center gap-1.5 text-[var(--ds-success)] text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Cambios guardados.
        </span>
      )}
      {errors.length > 0 && (
        <ul className="text-[var(--ds-error)] text-xs space-y-0.5">
          {errors.map((e) => <li key={e} className="flex items-center gap-1"><AlertCircle className="w-3 h-3 flex-shrink-0" />{e}</li>)}
        </ul>
      )}
      {!saved && errors.length === 0 && (
        dirty
          ? <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><Info className="w-3.5 h-3.5" />Cambios sin guardar</span>
          : <span />
      )}
      <button
        onClick={onSave}
        disabled={saving || !dirty}
        className="flex items-center gap-2 bg-[var(--ds-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--ds-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-4 h-4" />
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
}

// ── Tab A: General ─────────────────────────────────────────────────────────────

function GeneralTab() {
  const { config, saveConfig } = useClinicConfig();
  const initial = {
    clinicName: config.clinicName,
    shortDescription: config.shortDescription,
    welcomeMessage: config.welcomeMessage,
    showPrices: config.showPrices,
  };
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
    setSaved(false);
  }

  async function handleSave() {
    const errs: Record<string, string> = {};
    if (!form.clinicName.trim()) errs.clinicName = "El nombre del consultorio es requerido";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await saveConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Información del consultorio">
        <div className="space-y-4">
          <Field label="Nombre del consultorio" required error={errors.clinicName}>
            <input value={form.clinicName} onChange={(e) => set("clinicName", e.target.value)} className={inputCls(errors.clinicName)} placeholder="Ej. Clínica Dental Sonrisa" />
          </Field>
          <Field label="Descripción corta del consultorio" hint="Se muestra en el encabezado de la página pública.">
            <textarea rows={2} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={inputCls()} placeholder="Atención dental profesional, cercana y segura…" />
          </Field>
          <Field label="Mensaje de bienvenida" hint="Se muestra debajo del título principal en la landing.">
            <textarea rows={2} value={form.welcomeMessage} onChange={(e) => set("welcomeMessage", e.target.value)} className={inputCls()} placeholder="Tu sonrisa es nuestra prioridad…" />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.showPrices} onChange={(e) => set("showPrices", e.target.checked)} className="w-4 h-4 rounded border-[var(--ds-border)] accent-[var(--color-primary)]" />
            <span className="text-sm text-[var(--ds-text-muted)] font-medium">Mostrar precios estimados en la página pública</span>
          </label>
        </div>
      </SectionCard>
      <SaveRow onSave={handleSave} saved={saved} saving={false} errors={Object.values(errors).filter(Boolean)} dirty={dirty} />
    </div>
  );
}

// ── Tab B: Contacto y ubicación ────────────────────────────────────────────────

function ContactTab() {
  const { config, saveConfig } = useClinicConfig();
  const [form, setForm] = useState({
    phone: config.phone,
    whatsapp: config.whatsapp,
    email: config.email,
    address: config.address,
    neighborhood: config.neighborhood ?? "",
    city: config.city ?? "",
    state: config.state ?? "",
    country: config.country ?? "",
    locationReferences: config.locationReferences ?? "",
    googleMapsUrl: config.googleMapsUrl,
    googleMapsEmbedUrl: config.googleMapsEmbedUrl ?? "",
    parkingAvailable: config.parkingAvailable,
    parkingDetails: config.parkingDetails ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  async function handleSave() {
    const errs: Record<string, string> = {};
    if (!form.phone.trim()) errs.phone = "El teléfono es requerido";
    if (!form.whatsapp.trim()) errs.whatsapp = "El WhatsApp es requerido";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "El correo no tiene un formato válido";
    if (!form.address.trim()) errs.address = "La dirección es requerida";
    if (form.googleMapsUrl && !form.googleMapsUrl.startsWith("http"))
      errs.googleMapsUrl = "La URL debe comenzar con http";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await saveConfig({
      phone: form.phone,
      whatsapp: form.whatsapp,
      email: form.email,
      address: form.address,
      neighborhood: form.neighborhood || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      country: form.country || undefined,
      locationReferences: form.locationReferences || undefined,
      googleMapsUrl: form.googleMapsUrl,
      googleMapsEmbedUrl: form.googleMapsEmbedUrl || undefined,
      parkingAvailable: form.parkingAvailable,
      parkingDetails: form.parkingDetails || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Contacto">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Teléfono" required error={errors.phone}>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls(errors.phone)} placeholder="55 1234 5678" />
          </Field>
          <Field label="WhatsApp" required error={errors.whatsapp} hint="Solo números con código de país, sin espacios.">
            <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inputCls(errors.whatsapp)} placeholder="5512345678" />
          </Field>
          <Field label="Correo electrónico" error={errors.email}>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls(errors.email)} placeholder="contacto@clinica.com" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Dirección y ubicación">
        <div className="space-y-4">
          <Field label="Dirección completa" required error={errors.address}>
            <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls(errors.address)} placeholder="Av. Ejemplo 123, Col. Del Valle…" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Colonia / Zona" hint="Opcional">
              <input value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} className={inputCls()} placeholder="Col. Del Valle" />
            </Field>
            <Field label="Ciudad">
              <input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls()} placeholder="Ciudad de México" />
            </Field>
            <Field label="Estado">
              <input value={form.state} onChange={(e) => set("state", e.target.value)} className={inputCls()} placeholder="CDMX" />
            </Field>
            <Field label="País">
              <input value={form.country} onChange={(e) => set("country", e.target.value)} className={inputCls()} placeholder="México" />
            </Field>
          </div>
          <Field label="Referencias de ubicación" hint="Opcional — se muestra en la página pública.">
            <input value={form.locationReferences} onChange={(e) => set("locationReferences", e.target.value)} className={inputCls()} placeholder="A una cuadra del metro Del Valle…" />
          </Field>
          <Field label="URL de Google Maps" error={errors.googleMapsUrl}>
            <input value={form.googleMapsUrl} onChange={(e) => set("googleMapsUrl", e.target.value)} className={inputCls(errors.googleMapsUrl)} placeholder="https://maps.google.com/..." />
          </Field>
          <Field label="URL embed de Google Maps" hint="Opcional — para mostrar el mapa incrustado en la página de ubicación.">
            <input value={form.googleMapsEmbedUrl} onChange={(e) => set("googleMapsEmbedUrl", e.target.value)} className={inputCls()} placeholder="https://www.google.com/maps/embed?..." />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Estacionamiento">
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.parkingAvailable} onChange={(e) => set("parkingAvailable", e.target.checked)} className="w-4 h-4 rounded border-[var(--ds-border)] accent-[var(--color-primary)]" />
            <span className="text-sm text-[var(--ds-text-muted)] font-medium flex items-center gap-2">
              <Car className="w-4 h-4" />
              Estacionamiento disponible para pacientes
            </span>
          </label>
          {form.parkingAvailable && (
            <Field label="Detalles del estacionamiento" hint="Opcional — descripción que verá el cliente.">
              <input value={form.parkingDetails} onChange={(e) => set("parkingDetails", e.target.value)} className={inputCls()} placeholder="Estacionamiento frente al consultorio, sin costo." />
            </Field>
          )}
        </div>
      </SectionCard>

      <SaveRow onSave={handleSave} saved={saved} saving={false} errors={Object.values(errors).filter(Boolean)} />
    </div>
  );
}

// ── Tab C: Horarios ────────────────────────────────────────────────────────────

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-[var(--ds-border)] bg-[var(--ds-surface)] rounded-lg px-2.5 py-1.5 text-sm text-[var(--ds-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)] focus:border-[var(--ds-ring)] transition-colors"
    />
  );
}

function DayRow({ hour, onChange }: { hour: OpeningHour; onChange: (h: OpeningHour) => void }) {
  const toggle = () => {
    const next: OpeningHour = hour.isOpen
      ? { ...hour, isOpen: false, blocks: [] }
      : { ...hour, isOpen: true, blocks: [{ startTime: "09:00", endTime: "14:00" }] };
    onChange(next);
  };

  const updateBlock = (idx: number, key: "startTime" | "endTime", val: string) => {
    const blocks = hour.blocks.map((b, i) => (i === idx ? { ...b, [key]: val } : b));
    onChange({ ...hour, blocks });
  };

  const addBlock = () =>
    onChange({ ...hour, blocks: [...hour.blocks, { startTime: "16:00", endTime: "19:00" }] });

  const removeBlock = (idx: number) =>
    onChange({ ...hour, blocks: hour.blocks.filter((_, i) => i !== idx) });

  return (
    <div className="border border-[var(--ds-border)] rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={toggle}
          className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${hour.isOpen ? "bg-[var(--ds-accent)]" : "bg-gray-200"}`}
        >
          <span className={`block w-4 h-4 bg-[var(--ds-surface)] rounded-full shadow transition-transform mx-0.5 ${hour.isOpen ? "translate-x-5" : "translate-x-0"}`} />
        </button>
        <span className="text-sm font-semibold text-[var(--ds-text)] w-24">{hour.dayLabel}</span>
        {!hour.isOpen && <span className="text-xs text-[var(--ds-text-muted)]">Cerrado</span>}
      </div>

      {hour.isOpen && (
        <div className="ml-14 space-y-2">
          {hour.blocks.map((block, i) => (
            <div key={i} className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[var(--ds-text-muted)] w-14">Turno {i + 1}</span>
              <TimeInput value={block.startTime} onChange={(v) => updateBlock(i, "startTime", v)} />
              <span className="text-xs text-[var(--ds-text-muted)]">–</span>
              <TimeInput value={block.endTime} onChange={(v) => updateBlock(i, "endTime", v)} />
              {i > 0 && (
                <button
                  onClick={() => removeBlock(i)}
                  className="text-xs text-red-400 hover:text-[var(--ds-error)] transition-colors ml-1"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
          {hour.blocks.length < 2 && (
            <button
              onClick={addBlock}
              className="text-xs text-[var(--ds-primary)] hover:text-[var(--ds-accent)] font-semibold transition-colors"
            >
              + Agregar turno tarde
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function HoursTab() {
  const { config, saveConfig } = useClinicConfig();
  const [hours, setHours] = useState<OpeningHour[]>(() =>
    [...config.openingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  );
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function updateDay(dayOfWeek: number, h: OpeningHour) {
    setHours((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? h : d)));
  }

  async function handleSave() {
    const errs: string[] = [];
    for (const h of hours) {
      if (!h.isOpen) continue;
      for (const block of h.blocks) {
        if (block.endTime <= block.startTime) {
          errs.push(`${h.dayLabel}: la hora de fin debe ser mayor que la de inicio.`);
        }
      }
    }
    setErrors(errs);
    if (errs.length > 0) return;
    await saveConfig({ openingHours: hours });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <div className="bg-[var(--ds-surface-muted)]/40 border border-[var(--color-accent)]/20 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-[var(--ds-primary)]">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        Los horarios que configures aquí se mostrarán en la página pública (footer, ubicación y landing).
      </div>
      <SectionCard title="Horarios de atención">
        <div className="space-y-3">
          {hours.map((h) => (
            <DayRow key={h.dayOfWeek} hour={h} onChange={(updated) => updateDay(h.dayOfWeek, updated)} />
          ))}
        </div>
      </SectionCard>
      <SaveRow onSave={handleSave} saved={saved} saving={false} errors={errors} />
    </div>
  );
}

// ── Tab D: Pagos y urgencias ───────────────────────────────────────────────────

function PaymentsTab() {
  const { config, saveConfig } = useClinicConfig();
  const { paymentInstructions, updatePaymentInstructions } = useExtraProfile();
  const [payments, setPayments] = useState<PaymentMethod[]>(config.acceptedPayments);
  const [acceptsEmergencies, setAcceptsEmergencies] = useState(config.acceptsEmergencies);
  const [emergencyDescription, setEmergencyDescription] = useState(config.emergencyDescription ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(config.emergencyPhone ?? "");
  const [emergencyWhatsapp, setEmergencyWhatsapp] = useState(config.emergencyWhatsapp ?? "");
  const [pi, setPi] = useState({ ...paymentInstructions });
  const [saved, setSaved] = useState(false);
  const [clabeError, setClabeError] = useState("");

  function togglePayment(m: PaymentMethod) {
    setPayments((p) =>
      p.includes(m) ? p.filter((x) => x !== m) : [...p, m]
    );
  }

  function setPiField<K extends keyof typeof pi>(k: K, v: (typeof pi)[K]) {
    setPi((prev) => ({ ...prev, [k]: v }));
    if (k === "clabe") setClabeError("");
  }

  async function handleSave() {
    if (pi.clabe && pi.clabe.trim() && pi.clabe.replace(/\D/g, "").length !== 18) {
      setClabeError("La CLABE debe tener exactamente 18 dígitos");
      return;
    }
    await saveConfig({
      acceptedPayments: payments,
      acceptsEmergencies,
      emergencyDescription: emergencyDescription || undefined,
      emergencyPhone: emergencyPhone || undefined,
      emergencyWhatsapp: emergencyWhatsapp || undefined,
    });
    updatePaymentInstructions({
      ...pi,
      clabe: pi.clabe?.replace(/\D/g, "") || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Métodos de pago aceptados">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ALL_PAYMENT_METHODS.map((m) => {
            const active = payments.includes(m);
            return (
              <label
                key={m}
                className={`flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition-all ${
                  active
                    ? "border-[var(--color-accent)] bg-[var(--ds-surface-muted)]/30"
                    : "border-[var(--ds-border)] bg-[var(--ds-surface)] hover:border-[var(--color-accent)]/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => togglePayment(m)}
                  className="w-4 h-4 rounded accent-[var(--color-primary)] flex-shrink-0"
                />
                <span className="text-sm text-[var(--ds-text)] font-medium leading-tight">
                  {PAYMENT_METHOD_LABELS[m]}
                </span>
              </label>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Instrucciones de transferencia bancaria">
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={pi.showTransferDetails}
              onChange={(e) => setPiField("showTransferDetails", e.target.checked)}
              className="w-4 h-4 rounded border-[var(--ds-border)] accent-[var(--color-primary)]"
            />
            <span className="text-sm text-[var(--ds-text-muted)] font-medium">
              Mostrar datos de transferencia en la página pública
            </span>
          </label>
          {pi.showTransferDetails && (
            <div className="space-y-4 pl-7 border-l-2 border-[var(--color-accent)]/30 ml-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Banco">
                  <input value={pi.bankName ?? ""} onChange={(e) => setPiField("bankName", e.target.value || undefined)} className={inputCls()} placeholder="BBVA, Banamex, HSBC…" />
                </Field>
                <Field label="Titular de la cuenta">
                  <input value={pi.accountHolder ?? ""} onChange={(e) => setPiField("accountHolder", e.target.value || undefined)} className={inputCls()} placeholder="Nombre completo" />
                </Field>
                <Field label="CLABE interbancaria (18 dígitos)" error={clabeError}>
                  <input
                    value={pi.clabe ?? ""}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 18);
                      setPiField("clabe", digits || undefined);
                    }}
                    inputMode="numeric"
                    maxLength={18}
                    className={inputCls(clabeError)}
                    placeholder="000000000000000000"
                  />
                  {pi.clabe && <p className="text-xs text-[var(--ds-text-muted)]/60 mt-1">{pi.clabe.length}/18 dígitos</p>}
                </Field>
                <Field label="Número de cuenta (opcional)">
                  <input value={pi.accountNumber ?? ""} onChange={(e) => setPiField("accountNumber", e.target.value || undefined)} className={inputCls()} placeholder="1234567890" />
                </Field>
                <Field label="Últimos 4 dígitos de tarjeta (opcional)" hint="Solo los últimos 4. No ingreses el número completo.">
                  <input
                    value={pi.cardLastFourDigits ?? ""}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setPiField("cardLastFourDigits", digits || undefined);
                    }}
                    inputMode="numeric"
                    maxLength={4}
                    className={inputCls()}
                    placeholder="1234"
                  />
                </Field>
                <Field label="Link de pago (opcional)" hint="PayPal, Mercado Pago, etc.">
                  <input value={pi.paymentLink ?? ""} onChange={(e) => setPiField("paymentLink", e.target.value || undefined)} className={inputCls()} placeholder="https://mpago.la/..." />
                </Field>
              </div>
              <Field label="Instrucciones adicionales para la referencia" hint="Ej. Indica tu nombre completo en el concepto.">
                <textarea rows={2} value={pi.transferReferenceInstructions ?? ""} onChange={(e) => setPiField("transferReferenceInstructions", e.target.value || undefined)} className={inputCls()} placeholder="Por favor escribe tu nombre y número de cita en el concepto de la transferencia." />
              </Field>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Urgencias dentales">
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptsEmergencies}
              onChange={(e) => setAcceptsEmergencies(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--ds-border)] accent-[var(--color-primary)]"
            />
            <span className="text-sm text-[var(--ds-text-muted)] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--ds-error)]" />
              Atender urgencias dentales
            </span>
          </label>

          {acceptsEmergencies && (
            <div className="space-y-4 pl-7 border-l-2 border-[var(--color-accent)]/30 ml-2">
              <Field label="Descripción de urgencias" hint="Se mostrará en la sección de urgencias de la página pública.">
                <textarea
                  rows={2}
                  value={emergencyDescription}
                  onChange={(e) => setEmergencyDescription(e.target.value)}
                  className={inputCls()}
                  placeholder="¿Dolor intenso o fractura dental? Contáctanos…"
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Teléfono de urgencias" hint="Opcional — usa el teléfono general si está vacío.">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ds-text-muted)]" />
                    <input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className={`${inputCls()} pl-9`} placeholder="55 1234 5678" />
                  </div>
                </Field>
                <Field label="WhatsApp de urgencias" hint="Opcional — usa el WhatsApp general si está vacío.">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ds-text-muted)]" />
                    <input value={emergencyWhatsapp} onChange={(e) => setEmergencyWhatsapp(e.target.value)} className={`${inputCls()} pl-9`} placeholder="5512345678" />
                  </div>
                </Field>
              </div>
            </div>
          )}

          {!acceptsEmergencies && (
            <div className="pl-7 ml-2 text-sm text-[var(--ds-text-muted)]/70">
              La sección de urgencias no se mostrará de forma destacada en la página pública.
            </div>
          )}
        </div>
      </SectionCard>

      <SaveRow onSave={handleSave} saved={saved} saving={false} errors={clabeError ? [clabeError] : []} />
    </div>
  );
}

// ── Tab E: Apariencia ──────────────────────────────────────────────────────────

// ── Appearance sub-components ──────────────────────────────────────────────────

const TEMPLATE_CATEGORIES = [
  { key: "dentista",    label: "Dentista"    },
  { key: "medico",      label: "Médico"      },
  { key: "veterinario", label: "Veterinario" },
  { key: "psicologo",   label: "Psicólogo"   },
  { key: "nutriologo",  label: "Nutriólogo"  },
  { key: "fisioterapia",label: "Fisioterapia"},
  { key: "estetica",    label: "Estética"    },
] as const;

function TemplatePickerModal({
  currentId, onSelect, onClose,
}: { currentId: string; onSelect: (id: string) => void; onClose: () => void }) {
  const templates = Object.values(TEMPLATE_REGISTRY);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[var(--ds-surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--ds-border)]">
          <h2 className="font-bold text-[var(--ds-text)]">Seleccionar plantilla</h2>
          <button onClick={onClose} className="text-[var(--ds-text-muted)] hover:text-[var(--ds-text)] text-xl leading-none">✕</button>
        </div>
        <div className="overflow-y-auto p-6 space-y-6">
          {TEMPLATE_CATEGORIES.map(cat => {
            const cats = templates.filter(t => t.category === cat.key);
            if (!cats.length) return null;
            return (
              <div key={cat.key}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-muted)] mb-2">{cat.label}</p>
                <div className="grid grid-cols-3 gap-2">
                  {cats.map(t => {
                    const active = currentId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => onSelect(t.id)}
                        className={`rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-[var(--color-accent)] bg-[var(--ds-accent)]/10"
                            : "border-[var(--ds-border)] hover:border-[var(--color-accent)]/40"
                        }`}
                      >
                        <div className="flex gap-1 mb-2">
                          {[...t.palettes].slice(0, 3).map(p => (
                            <span key={p.id} className="w-3 h-3 rounded-full" style={{ background: p.swatch }} />
                          ))}
                        </div>
                        <p className="text-xs font-medium text-[var(--ds-text)] leading-tight">{t.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-[var(--ds-text-muted)] truncate">{t.description?.split("·")[0]}</p>
                          {active && <CheckCircle2 className="w-3 h-3 text-[var(--ds-accent)] flex-shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobilePreviewModal({
  PreviewComponent, profile, onClose,
}: { PreviewComponent: React.ComponentType<{ profile: unknown; isPreview: boolean }> | undefined; profile: unknown; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--ds-surface)] border-b border-[var(--ds-border)]">
        <span className="text-sm font-medium text-[var(--ds-text)]">Vista previa</span>
        <button onClick={onClose} className="text-[var(--ds-text-muted)] font-bold text-lg leading-none">✕</button>
      </div>
      <div className="flex-1 overflow-hidden relative bg-[var(--ds-surface)]">
        {PreviewComponent && (
          <div style={{ transform: "scale(0.42)", transformOrigin: "top left", width: `${100 / 0.42}%`, pointerEvents: "none", userSelect: "none" }}>
            <PreviewComponent profile={profile} isPreview={true} />
          </div>
        )}
      </div>
    </div>
  );
}

function LivePreviewPanel({ PreviewComponent, profile }: {
  PreviewComponent: React.ComponentType<{ profile: unknown; isPreview: boolean }> | undefined;
  profile: unknown;
}) {
  if (!PreviewComponent) {
    return (
      <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-bg)] flex items-center justify-center" style={{ height: "70vh" }}>
        <p className="text-sm text-[var(--ds-text-muted)]">Selecciona una plantilla</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-muted)] mb-2">Vista previa</p>
      {/* Isolation wrapper: reset CSS vars so dashboard theme doesn't bleed into preview */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--ds-border)] shadow-lg bg-[var(--ds-surface)]"
        style={{ height: "70vh" }}
      >
        <div
          style={{
            // Reset dashboard vars inside the preview so templates only see their own palette
            "--color-background": "initial",
            "--color-primary": "initial",
            "--color-accent": "initial",
            "--color-text": "initial",
            "--color-muted-text": "initial",
            "--color-border": "initial",
            "--color-card": "initial",
            transform: "scale(0.42)",
            transformOrigin: "top left",
            width: `${100 / 0.42}%`,
            pointerEvents: "none",
            userSelect: "none",
          } as React.CSSProperties}
        >
          <PreviewComponent profile={profile} isPreview={true} />
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--ds-text-muted)]/60 text-center">
        Vista previa aproximada · los datos reales se ven al publicar
      </p>
    </div>
  );
}

function TemplateImagesSection({
  imageFields, currentImages, onUpdate,
}: {
  imageFields: TemplateImageField[];
  currentImages: Record<string, string | string[]>;
  onUpdate: (fields: Record<string, string | string[]>) => void;
}) {
  if (!imageFields.length) return null;

  function updateField(key: string, value: string | string[]) {
    onUpdate({ ...currentImages, [key]: value });
  }

  return (
    <SectionCard title="Imágenes de esta plantilla">
      <div className="space-y-5">
        {imageFields.map(field => {
          const value = currentImages[field.key];

          if (field.multiple) {
            const arr = (Array.isArray(value) ? value : []) as string[];
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium text-[var(--ds-text-muted)] mb-1">
                  {field.label}{field.required && <span className="text-[var(--ds-accent)] ml-0.5">*</span>}
                </label>
                {field.description && <p className="text-xs text-[var(--ds-text-muted)]/60 mb-1">{field.description}</p>}
                {field.recommendedAspectRatio && (
                  <p className="text-xs text-[var(--ds-text-muted)]/50 mb-2">Proporción: {field.recommendedAspectRatio}</p>
                )}
                <div className="space-y-2">
                  {arr.map((url, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="url"
                        value={url}
                        onChange={e => {
                          const next = [...arr];
                          next[i] = e.target.value;
                          updateField(field.key, next);
                        }}
                        placeholder="https://..."
                        className={inputCls()}
                      />
                      {url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      )}
                      <button onClick={() => updateField(field.key, arr.filter((_, j) => j !== i))} className="text-red-400 hover:text-[var(--ds-error)] flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!field.maxItems || arr.length < field.maxItems) && (
                    <button
                      onClick={() => updateField(field.key, [...arr, ""])}
                      className="flex items-center gap-1 text-xs text-[var(--ds-text-muted)] hover:text-[var(--ds-primary)]"
                    >
                      <Plus className="w-3 h-3" /> Agregar imagen
                    </button>
                  )}
                </div>
              </div>
            );
          }

          const strVal = typeof value === "string" ? value : "";
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-[var(--ds-text-muted)] mb-1">
                {field.label}{field.required && <span className="text-[var(--ds-accent)] ml-0.5">*</span>}
              </label>
              {field.description && <p className="text-xs text-[var(--ds-text-muted)]/60 mb-1">{field.description}</p>}
              {field.recommendedAspectRatio && (
                <p className="text-xs text-[var(--ds-text-muted)]/50 mb-2">Proporción recomendada: {field.recommendedAspectRatio}</p>
              )}
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  value={strVal}
                  onChange={e => updateField(field.key, e.target.value)}
                  placeholder="https://..."
                  className={inputCls()}
                />
                {strVal && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={strVal} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    <button onClick={() => updateField(field.key, "")} className="text-red-400 hover:text-[var(--ds-error)] flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function DashboardThemeSection({ theme, onChange }: {
  theme: DashboardTheme;
  onChange: (partial: Partial<DashboardTheme>) => void;
}) {
  const { mode, selectedThemeId } = theme;

  function selectTheme(id: string) {
    const preset = getThemePreset(id);
    onChange({ selectedThemeId: id, lightColors: preset.light, darkColors: preset.dark });
  }

  const MODE_OPTIONS: { value: DashboardTheme["mode"]; label: string; Icon: React.ElementType }[] = [
    { value: "light",  label: "Claro",  Icon: Sun     },
    { value: "dark",   label: "Oscuro", Icon: Moon    },
    { value: "system", label: "Sistema",Icon: Monitor },
  ];

  return (
    <SectionCard title="Tema del panel">
      <p className="text-xs text-[var(--ds-text-muted)]/70 mb-4">
        Apariencia exclusiva de tu panel privado — no afecta la página pública ni las paletas de los templates.
      </p>

      {/* Theme picker */}
      <div className="space-y-1.5 mb-5">
        {DASHBOARD_THEME_PRESETS.map((preset) => {
          const active = (selectedThemeId ?? "marfil") === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => selectTheme(preset.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition ${
                active
                  ? "border-[var(--color-accent)] bg-[var(--ds-accent)]/8"
                  : "border-[var(--ds-border)] hover:border-[var(--color-accent)]/40"
              }`}
            >
              <div className="flex gap-1 flex-shrink-0">
                {preset.previewColors.map((c, i) => (
                  <span key={i} className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10" style={{ background: c }} />
                ))}
              </div>
              <span className="text-sm font-medium text-[var(--ds-text)]">{preset.name}</span>
              {active && <CheckCircle2 className="w-4 h-4 text-[var(--ds-accent)] ml-auto" />}
            </button>
          );
        })}
      </div>

      {/* Mode selector */}
      <div>
        <p className="text-xs font-semibold text-[var(--ds-text-muted)] uppercase tracking-wide mb-2">Modo</p>
        <div className="flex gap-2">
          {MODE_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => onChange({ mode: value })}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition ${
                mode === value
                  ? "border-[var(--color-accent)] bg-[var(--ds-accent)]/10 text-[var(--ds-primary)]"
                  : "border-[var(--ds-border)] text-[var(--ds-text-muted)] hover:border-[var(--color-accent)]/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function AppearanceTab() {
  const profile = usePublicProfile();
  const extra = useExtraProfile();
  const { appearance, updateAppearance } = profile;
  const { templateImages, updateTemplateImages, dashboardTheme, updateDashboardTheme } = extra;

  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const templateId = appearance.selectedTemplateId ?? "dentista-01";
  const templateDef = getTemplate(templateId);
  const PreviewComponent = templateDef?.component as React.ComponentType<{ profile: unknown; isPreview: boolean }> | undefined;
  const currentImages = templateImages[templateId] ?? {};

  const activePaletteId = appearance.selectedPaletteId;

  function handleTemplateSelect(id: string) {
    const def = getTemplate(id);
    updateAppearance({ selectedTemplateId: id, selectedPaletteId: def?.defaultPaletteId ?? "" });
    setShowTemplatePicker(false);
  }

  return (
    <div>
      {/* ── Desktop: 2-column layout ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* LEFT: controls */}
        <div className="space-y-4">

          {/* 1. Compact template selector */}
          <SectionCard title="Plantilla">
            <div className="flex items-center gap-3">
              <div className="flex gap-1 flex-shrink-0">
                {templateDef
                  ? [...templateDef.palettes].slice(0, 3).map(p => (
                      <span key={p.id} className="w-4 h-4 rounded-full ring-1 ring-black/10" style={{ background: p.swatch }} />
                    ))
                  : <span className="w-4 h-4 rounded-full bg-[var(--color-border)]" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--ds-text)] truncate">{templateDef?.name ?? templateId}</p>
                <p className="text-xs text-[var(--ds-text-muted)] truncate">{templateDef?.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {templateDef?.publicPath && (
                  <Link
                    href={templateDef.publicPath}
                    target="_blank"
                    className="text-xs text-[var(--ds-text-muted)] hover:text-[var(--ds-primary)] flex items-center gap-1"
                  >
                    Ver <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                <button
                  onClick={() => setShowTemplatePicker(true)}
                  className="rounded-lg border border-[var(--ds-border)] px-3 py-1.5 text-xs font-medium text-[var(--ds-text)] hover:bg-[var(--ds-bg)] transition"
                >
                  Cambiar
                </button>
              </div>
            </div>
          </SectionCard>

          {/* 2. Palette — only palettes of the active template */}
          {templateDef && (
            <SectionCard title="Paleta de colores">
              <div className="space-y-1.5">
                {[...templateDef.palettes].map(p => {
                  const isActive = p.id === activePaletteId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => updateAppearance({ selectedPaletteId: p.id })}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition ${
                        isActive
                          ? "border-[var(--color-accent)] bg-[var(--ds-accent)]/5"
                          : "border-[var(--ds-border)] hover:border-[var(--color-accent)]/40"
                      }`}
                    >
                      <div className="flex gap-1">
                        <span className="w-4 h-4 rounded-full ring-1 ring-black/10" style={{ background: p.swatch }} />
                        <span className="w-4 h-4 rounded-full ring-1 ring-black/10" style={{ background: p.surface }} />
                        <span className="w-4 h-4 rounded-full ring-1 ring-black/10" style={{ background: p.ink }} />
                      </div>
                      <span className="text-sm text-[var(--ds-text)]">{p.name}</span>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-[var(--ds-accent)] ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* 3. Dynamic image fields for the active template */}
          {templateDef && (
            <TemplateImagesSection
              imageFields={templateDef.imageFields}
              currentImages={currentImages}
              onUpdate={(fields) => updateTemplateImages(templateId, fields)}
            />
          )}

          {/* 4. Mobile preview button */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowMobilePreview(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--ds-border)] px-4 py-3 text-sm font-medium text-[var(--ds-text)] hover:bg-[var(--ds-bg)] transition"
            >
              <Eye className="w-4 h-4" /> Ver vista previa
            </button>
          </div>

          {/* 5. Dashboard theme (separated from public palette) */}
          <DashboardThemeSection theme={dashboardTheme} onChange={updateDashboardTheme} />

          {/* 6. Reset */}
          <div className="pt-1 pb-2">
            <button
              onClick={() => {
                updateAppearance({ selectedTemplateId: "dentista-01", selectedPaletteId: "azul-clinico" });
              }}
              className="text-xs text-[var(--ds-text-muted)] hover:text-[var(--ds-text)] underline"
            >
              Restablecer apariencia pública
            </button>
          </div>
        </div>

        {/* RIGHT: sticky live preview (desktop only) */}
        <div className="hidden lg:block">
          <div className="sticky top-4" style={{ maxHeight: "calc(100vh - 2rem)", overflowY: "auto" }}>
            <LivePreviewPanel PreviewComponent={PreviewComponent} profile={profile} />
          </div>
        </div>
      </div>

      {showTemplatePicker && (
        <TemplatePickerModal
          currentId={templateId}
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {showMobilePreview && (
        <MobilePreviewModal
          PreviewComponent={PreviewComponent}
          profile={profile}
          onClose={() => setShowMobilePreview(false)}
        />
      )}
    </div>
  );
}

// ── Tab F: Automatización ──────────────────────────────────────────────────────

function AutomationTab() {
  const isActive = legacyClinic.automationEnabled;
  return (
    <div className="space-y-5">
      <div
        className={`rounded-2xl border p-6 ${
          isActive ? "bg-violet-50 border-violet-200" : "bg-[var(--ds-bg)] border-[var(--ds-border)]"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isActive ? "bg-violet-100" : "bg-gray-200"
            }`}
          >
            {isActive ? (
              <Wifi className="w-4 h-4 text-violet-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-[var(--ds-text-muted)]" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold text-sm ${isActive ? "text-violet-900" : "text-[var(--ds-text)]"}`}>
                {isActive ? "Automatización activa" : "Automatización no activa"}
              </span>
              <span
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                  isActive ? "bg-violet-200 text-violet-800" : "bg-gray-200 text-[var(--ds-text-muted)]"
                }`}
              >
                {isActive
                  ? legacyClinic.automationMode === "n8n"
                    ? "n8n"
                    : "IA WhatsApp"
                  : "Manual"}
              </span>
            </div>
            <p className={`text-sm ${isActive ? "text-violet-700" : "text-[var(--ds-text-muted)]"}`}>
              {isActive
                ? `Tu consultorio tiene confirmaciones y recordatorios automáticos activos vía ${
                    legacyClinic.automationMode === "n8n" ? "n8n" : "IA WhatsApp"
                  }.`
                : "Este consultorio usa agenda manual. Puedes activar confirmaciones y recordatorios por WhatsApp o agenda con IA al contratar el plan avanzado."}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm">
        <p className="text-sm text-[var(--ds-text-muted)] leading-relaxed">
          La configuración de automatización es administrada por el equipo técnico. Si deseas activar confirmaciones automáticas por WhatsApp, integración con n8n o agenda con IA, contacta a soporte.
        </p>
      </div>
    </div>
  );
}

// ── Tab G: Imágenes ────────────────────────────────────────────────────────────

function ImagesTab() {
  const { config, saveConfig } = useClinicConfig();
  const [form, setForm] = useState({
    logoUrl:               config.logoUrl ?? "",
    heroImageUrl:          config.heroImageUrl ?? "",
    dentistPhotoUrl:       config.dentistPhotoUrl ?? "",
    clinicGalleryUrls:     (config.clinicGalleryUrls ?? []).join("\n"),
    beforeAfterGalleryUrls:(config.beforeAfterGalleryUrls ?? []).join("\n"),
  });
  const [saved, setSaved] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    await saveConfig({
      logoUrl:               form.logoUrl || undefined,
      heroImageUrl:          form.heroImageUrl || undefined,
      dentistPhotoUrl:       form.dentistPhotoUrl || undefined,
      clinicGalleryUrls:     form.clinicGalleryUrls.split("\n").map((s) => s.trim()).filter(Boolean),
      beforeAfterGalleryUrls: form.beforeAfterGalleryUrls.split("\n").map((s) => s.trim()).filter(Boolean),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <div className="bg-[var(--ds-surface-muted)]/40 border border-[var(--color-accent)]/20 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-[var(--ds-primary)]">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        Agrega las URLs de tus imágenes (Cloudinary, Imgur, Google Drive con acceso público, etc.).
      </div>
      <SectionCard title="Imágenes principales">
        <div className="space-y-4">
          <Field label="Logo del consultorio" hint="URL pública de la imagen del logotipo.">
            <input value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} className={inputCls()} placeholder="https://..." />
          </Field>
          <Field label="Imagen hero / fondo" hint="Imagen principal de la landing (banner).">
            <input value={form.heroImageUrl} onChange={(e) => set("heroImageUrl", e.target.value)} className={inputCls()} placeholder="https://..." />
          </Field>
          <Field label="Foto del dentista" hint="Foto de perfil del dentista para la sección de presentación.">
            <input value={form.dentistPhotoUrl} onChange={(e) => set("dentistPhotoUrl", e.target.value)} className={inputCls()} placeholder="https://..." />
          </Field>
        </div>
      </SectionCard>
      <SectionCard title="Galería del consultorio">
        <Field label="URLs de galería del consultorio" hint="Una URL por línea. Se mostrarán en la galería de la página pública.">
          <textarea rows={4} value={form.clinicGalleryUrls} onChange={(e) => set("clinicGalleryUrls", e.target.value)} className={inputCls()} placeholder={"https://imagen1.com\nhttps://imagen2.com"} />
        </Field>
      </SectionCard>
      <SectionCard title="Galería antes y después">
        <div className="flex items-start gap-2 bg-[var(--ds-warning)]/10 border border-[var(--ds-warning)]/30 rounded-xl p-3 mb-4 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Asegúrate de contar con el consentimiento explícito del paciente antes de publicar imágenes clínicas.
        </div>
        <Field label="URLs antes/después" hint="Una URL por línea.">
          <textarea rows={4} value={form.beforeAfterGalleryUrls} onChange={(e) => set("beforeAfterGalleryUrls", e.target.value)} className={inputCls()} placeholder={"https://antes1.com\nhttps://despues1.com"} />
        </Field>
      </SectionCard>
      <SaveRow onSave={handleSave} saved={saved} saving={false} errors={[]} />
    </div>
  );
}

// ── Tab H: SEO Local ───────────────────────────────────────────────────────────

function SeoTab() {
  const { config, saveConfig } = useClinicConfig();
  const [form, setForm] = useState({
    seoTitle:        config.seoTitle ?? "",
    seoDescription:  config.seoDescription ?? "",
    seoKeywords:     (config.seoKeywords ?? []).join(", "),
    seoCity:         config.seoCity ?? "",
    seoNeighborhood: config.seoNeighborhood ?? "",
    seoMainServices: (config.seoMainServices ?? []).join(", "),
    subdomain:       config.subdomain ?? "",
    customDomain:    config.customDomain ?? "",
  });
  const [saved, setSaved] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    await saveConfig({
      seoTitle:        form.seoTitle || undefined,
      seoDescription:  form.seoDescription || undefined,
      seoKeywords:     form.seoKeywords.split(",").map((s) => s.trim()).filter(Boolean),
      seoCity:         form.seoCity || undefined,
      seoNeighborhood: form.seoNeighborhood || undefined,
      seoMainServices: form.seoMainServices.split(",").map((s) => s.trim()).filter(Boolean),
      subdomain:       form.subdomain || undefined,
      customDomain:    form.customDomain || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Metadatos SEO">
        <div className="space-y-4">
          <Field label="Título SEO" hint="Aparece en el título de la pestaña del navegador y en Google. Máx. 60 caracteres recomendado.">
            <input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className={inputCls()} placeholder="Dentista en Del Valle | Clínica Dental Sonrisa" />
            <p className="text-xs text-right text-[var(--ds-text-muted)]/60 mt-0.5">{form.seoTitle.length}/60</p>
          </Field>
          <Field label="Descripción SEO" hint="Descripción que aparece en Google. Máx. 160 caracteres recomendado.">
            <textarea rows={3} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} className={inputCls()} placeholder="Atención dental profesional en Del Valle, CDMX. Limpieza, blanqueamiento, ortodoncia…" />
            <p className="text-xs text-right text-[var(--ds-text-muted)]/60 mt-0.5">{form.seoDescription.length}/160</p>
          </Field>
          <Field label="Palabras clave" hint="Separadas por coma. Ej: dentista del valle, clínica dental cdmx">
            <input value={form.seoKeywords} onChange={(e) => set("seoKeywords", e.target.value)} className={inputCls()} placeholder="dentista del valle, limpieza dental cdmx" />
          </Field>
        </div>
      </SectionCard>
      <SectionCard title="SEO Local">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Ciudad" hint="Para posicionamiento local en búsquedas.">
            <input value={form.seoCity} onChange={(e) => set("seoCity", e.target.value)} className={inputCls()} placeholder="Ciudad de México" />
          </Field>
          <Field label="Colonia / Zona" hint="Para búsquedas hiperlocales.">
            <input value={form.seoNeighborhood} onChange={(e) => set("seoNeighborhood", e.target.value)} className={inputCls()} placeholder="Col. Del Valle" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Servicios principales" hint="Separados por coma. Se usan para el SEO de servicios específicos.">
            <input value={form.seoMainServices} onChange={(e) => set("seoMainServices", e.target.value)} className={inputCls()} placeholder="Limpieza dental, Blanqueamiento, Ortodoncia" />
          </Field>
        </div>
      </SectionCard>
      <SectionCard title="Dominio y subdominio">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Subdominio" hint="Tu URL sería: {subdominio}.dentalsite.com">
            <input value={form.subdomain} onChange={(e) => set("subdomain", e.target.value)} className={inputCls()} placeholder="clinicasonrisa" />
          </Field>
          <Field label="Dominio personalizado" hint="Opcional — para plan Pro+.">
            <input value={form.customDomain} onChange={(e) => set("customDomain", e.target.value)} className={inputCls()} placeholder="www.miclínica.com" />
          </Field>
        </div>
      </SectionCard>
      <SaveRow onSave={handleSave} saved={saved} saving={false} errors={[]} />
    </div>
  );
}

// ── Tab I: Mensajes ────────────────────────────────────────────────────────────

function MessagesTab() {
  const { config, saveConfig } = useClinicConfig();
  const keys = Object.keys(DEFAULT_MESSAGE_TEMPLATES) as (keyof MessageTemplates)[];
  const [templates, setTemplates] = useState<Partial<MessageTemplates>>(config.messageTemplates ?? {});
  const [saved, setSaved] = useState(false);

  function updateTemplate(key: keyof MessageTemplates, value: string) {
    setTemplates((t) => ({ ...t, [key]: value }));
  }

  function resetTemplate(key: keyof MessageTemplates) {
    setTemplates((t) => {
      const next = { ...t };
      delete next[key];
      return next;
    });
  }

  async function handleSave() {
    await saveConfig({ messageTemplates: templates });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <div className="bg-[var(--ds-surface-muted)]/40 border border-[var(--color-accent)]/20 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-[var(--ds-primary)]">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        Usa <strong>[nombre]</strong>, <strong>[servicio]</strong>, <strong>[fecha]</strong>, <strong>[hora]</strong>, <strong>[clinica]</strong>, <strong>[direccion]</strong> como variables dinámicas.
      </div>
      <SectionCard title="Plantillas de mensajes WhatsApp / n8n">
        <div className="space-y-6">
          {keys.map((key) => {
            const customValue = templates[key];
            const defaultValue = DEFAULT_MESSAGE_TEMPLATES[key];
            const value = customValue ?? defaultValue;
            const isCustom = customValue !== undefined;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-[var(--ds-text-muted)] uppercase tracking-wide">
                    {MESSAGE_TEMPLATE_LABELS[key]}
                  </label>
                  {isCustom && (
                    <button onClick={() => resetTemplate(key)} className="text-xs text-[var(--ds-text-muted)] hover:text-[var(--ds-error)] transition-colors">
                      Restaurar predeterminado
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={value}
                  onChange={(e) => updateTemplate(key, e.target.value)}
                  className={`${inputCls()} ${isCustom ? "border-[var(--color-accent)]/50" : ""}`}
                />
              </div>
            );
          })}
        </div>
      </SectionCard>
      <SaveRow onSave={handleSave} saved={saved} saving={false} errors={[]} />
    </div>
  );
}

// ── Tab: Especialista ──────────────────────────────────────────────────────────

function EspecialistaTab() {
  const { config, saveConfig } = useClinicConfig();
  const { specialistExtra, updateSpecialistExtra } = useExtraProfile();

  const [coreForm, setCoreForm] = useState({
    dentistName: config.dentistName,
    professionalLicense: config.professionalLicense,
    specialty: config.specialty,
    yearsExperience: config.yearsExperience,
    patientsServed: config.patientsServed,
  });
  const [extraForm, setExtraForm] = useState({
    professionalTitle: specialistExtra.professionalTitle ?? "",
    specialtyLicense: specialistExtra.specialtyLicense ?? "",
    school: specialistExtra.school ?? "",
    biography: specialistExtra.biography ?? "",
    certifications: (specialistExtra.certifications ?? []).join("\n"),
  });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setCore<K extends keyof typeof coreForm>(k: K, v: (typeof coreForm)[K]) {
    setCoreForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  function setExtra<K extends keyof typeof extraForm>(k: K, v: (typeof extraForm)[K]) {
    setExtraForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    const errs: Record<string, string> = {};
    if (!coreForm.dentistName.trim()) errs.dentistName = "El nombre es requerido";
    if (!coreForm.professionalLicense.trim()) errs.professionalLicense = "La cédula es requerida";
    if (!coreForm.specialty.trim()) errs.specialty = "La especialidad es requerida";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await saveConfig(coreForm);
    updateSpecialistExtra({
      professionalTitle: extraForm.professionalTitle || undefined,
      specialtyLicense: extraForm.specialtyLicense || undefined,
      school: extraForm.school || undefined,
      biography: extraForm.biography || undefined,
      certifications: extraForm.certifications.split("\n").map((c) => c.trim()).filter(Boolean),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Datos del especialista">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre del especialista" required error={errors.dentistName}>
            <input value={coreForm.dentistName} onChange={(e) => setCore("dentistName", e.target.value)} className={inputCls(errors.dentistName)} placeholder="Ej. Dra. Mariana López" />
          </Field>
          <Field label="Especialidad" required error={errors.specialty}>
            <input value={coreForm.specialty} onChange={(e) => setCore("specialty", e.target.value)} className={inputCls(errors.specialty)} placeholder="Ej. Odontología Integral" />
          </Field>
          <Field label="Cédula profesional" required error={errors.professionalLicense}>
            <input value={coreForm.professionalLicense} onChange={(e) => setCore("professionalLicense", e.target.value)} className={inputCls(errors.professionalLicense)} placeholder="12345678" />
          </Field>
          <Field label="Título profesional" hint="Ej. Cirujana Dentista, Médico Internista.">
            <input value={extraForm.professionalTitle} onChange={(e) => setExtra("professionalTitle", e.target.value)} className={inputCls()} placeholder="Ej. Cirujana Dentista" />
          </Field>
          <Field label="Años de experiencia">
            <input type="number" min={0} value={coreForm.yearsExperience} onChange={(e) => setCore("yearsExperience", Number(e.target.value))} className={inputCls()} />
          </Field>
          <Field label="Clientes atendidos">
            <input type="number" min={0} value={coreForm.patientsServed} onChange={(e) => setCore("patientsServed", Number(e.target.value))} className={inputCls()} />
          </Field>
          <Field label="Cédula de especialidad">
            <input value={extraForm.specialtyLicense} onChange={(e) => setExtra("specialtyLicense", e.target.value)} className={inputCls()} placeholder="9871234" />
          </Field>
          <Field label="Universidad / Escuela">
            <input value={extraForm.school} onChange={(e) => setExtra("school", e.target.value)} className={inputCls()} placeholder="Ej. UNAM" />
          </Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="Biografía" hint="Texto más extenso sobre tu trayectoria y enfoque.">
            <textarea rows={4} value={extraForm.biography} onChange={(e) => setExtra("biography", e.target.value)} className={inputCls()} placeholder="Cuéntale a tus clientes sobre tu formación y forma de trabajar…" />
          </Field>
          <Field label="Certificaciones" hint="Una por línea.">
            <textarea rows={3} value={extraForm.certifications} onChange={(e) => setExtra("certifications", e.target.value)} className={inputCls()} placeholder={"Diplomado en Ortodoncia\nMiembro del Colegio…"} />
          </Field>
        </div>
      </SectionCard>
      <SaveRow onSave={handleSave} saved={saved} saving={false} errors={Object.values(errors).filter(Boolean)} />
    </div>
  );
}

// ── Tab: Redes sociales ────────────────────────────────────────────────────────

function RedesTab() {
  const { config, saveConfig } = useClinicConfig();
  const { businessExtra, updateBusinessExtra } = useExtraProfile();
  const [form, setForm] = useState({
    instagram: businessExtra.socialLinksExtra.instagram ?? config.socialMedia?.instagram ?? "",
    facebook: businessExtra.socialLinksExtra.facebook ?? config.socialMedia?.facebook ?? "",
    tiktok: businessExtra.socialLinksExtra.tiktok ?? "",
    youtube: businessExtra.socialLinksExtra.youtube ?? "",
    linkedin: businessExtra.socialLinksExtra.linkedin ?? "",
    website: businessExtra.socialLinksExtra.website ?? businessExtra.websiteUrl ?? "",
  });
  const [saved, setSaved] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    await saveConfig({
      socialMedia: {
        instagram: form.instagram || undefined,
        facebook: form.facebook || undefined,
      },
    });
    updateBusinessExtra({
      websiteUrl: form.website || undefined,
      socialLinksExtra: {
        instagram: form.instagram || undefined,
        facebook: form.facebook || undefined,
        tiktok: form.tiktok || undefined,
        youtube: form.youtube || undefined,
        linkedin: form.linkedin || undefined,
        website: form.website || undefined,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Redes sociales y sitio web">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Instagram" hint="URL completa de tu perfil.">
            <input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className={inputCls()} placeholder="https://instagram.com/usuario" />
          </Field>
          <Field label="Facebook">
            <input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} className={inputCls()} placeholder="https://facebook.com/pagina" />
          </Field>
          <Field label="TikTok">
            <input value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} className={inputCls()} placeholder="https://tiktok.com/@usuario" />
          </Field>
          <Field label="YouTube">
            <input value={form.youtube} onChange={(e) => set("youtube", e.target.value)} className={inputCls()} placeholder="https://youtube.com/@canal" />
          </Field>
          <Field label="LinkedIn">
            <input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} className={inputCls()} placeholder="https://linkedin.com/in/usuario" />
          </Field>
          <Field label="Sitio web">
            <input value={form.website} onChange={(e) => set("website", e.target.value)} className={inputCls()} placeholder="https://tusitio.com" />
          </Field>
        </div>
      </SectionCard>
      <SaveRow onSave={handleSave} saved={saved} saving={false} errors={[]} />
    </div>
  );
}

// ── Tab: Testimonios (CRUD) ────────────────────────────────────────────────────

const emptyTestimonial = (): PublicTestimonial => ({
  id: `t-${Date.now()}`,
  name: "",
  comment: "",
  rating: 5,
  isPublished: true,
});

function TestimoniosTab() {
  const { testimonials, upsertTestimonial, deleteTestimonial } = useExtraProfile();
  const [draft, setDraft] = useState<PublicTestimonial>(emptyTestimonial());

  function set<K extends keyof PublicTestimonial>(k: K, v: PublicTestimonial[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  function handleAdd() {
    if (!draft.name.trim() || !draft.comment.trim()) return;
    upsertTestimonial(draft);
    setDraft(emptyTestimonial());
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Testimonios publicados">
        {testimonials.length === 0 && (
          <p className="text-sm text-[var(--ds-text-muted)]/70">Aún no hay testimonios.</p>
        )}
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div key={t.id} className="flex items-start gap-3 border border-[var(--ds-border)] rounded-xl p-3">
              <div className="w-9 h-9 shrink-0 rounded-full bg-[var(--ds-primary)]/10 grid place-items-center text-xs font-bold text-[var(--ds-primary)]">
                {getInitials(t.name || "—")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--ds-text)]">{t.name}</span>
                  <span className="text-xs text-amber-500">{"★".repeat(t.rating ?? 5)}</span>
                </div>
                <p className="text-xs text-[var(--ds-text-muted)] mt-0.5 line-clamp-2">{t.comment}</p>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-[var(--ds-text-muted)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={t.isPublished}
                  onChange={(e) => upsertTestimonial({ ...t, isPublished: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[var(--color-primary)]"
                />
                Visible
              </label>
              <button onClick={() => deleteTestimonial(t.id)} className="text-red-400 hover:text-[var(--ds-error)] p-1" aria-label="Eliminar">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Agregar testimonio">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre del cliente" required>
            <input value={draft.name} onChange={(e) => set("name", e.target.value)} className={inputCls()} placeholder="Ej. María F." />
          </Field>
          <Field label="Calificación">
            <select value={draft.rating ?? 5} onChange={(e) => set("rating", Number(e.target.value))} className={inputCls()}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} estrellas</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Comentario" required>
            <textarea rows={3} value={draft.comment} onChange={(e) => set("comment", e.target.value)} className={inputCls()} placeholder="Lo que dice el cliente…" />
          </Field>
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--ds-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Agregar testimonio
        </button>
      </SectionCard>
    </div>
  );
}

// ── Tab: Preguntas frecuentes (CRUD) ───────────────────────────────────────────

const emptyFAQ = (): PublicFAQ => ({
  id: `f-${Date.now()}`,
  question: "",
  answer: "",
  isPublished: true,
});

function PreguntasTab() {
  const { faqs, upsertFAQ, deleteFAQ } = useExtraProfile();
  const [draft, setDraft] = useState<PublicFAQ>(emptyFAQ());

  function set<K extends keyof PublicFAQ>(k: K, v: PublicFAQ[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  function handleAdd() {
    if (!draft.question.trim() || !draft.answer.trim()) return;
    upsertFAQ(draft);
    setDraft(emptyFAQ());
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Preguntas frecuentes">
        {faqs.length === 0 && (
          <p className="text-sm text-[var(--ds-text-muted)]/70">Aún no hay preguntas.</p>
        )}
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f.id} className="border border-[var(--ds-border)] rounded-xl p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--ds-text)]">{f.question}</p>
                  <p className="text-xs text-[var(--ds-text-muted)] mt-0.5">{f.answer}</p>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-[var(--ds-text-muted)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f.isPublished}
                    onChange={(e) => upsertFAQ({ ...f, isPublished: e.target.checked })}
                    className="w-3.5 h-3.5 accent-[var(--color-primary)]"
                  />
                  Visible
                </label>
                <button onClick={() => deleteFAQ(f.id)} className="text-red-400 hover:text-[var(--ds-error)] p-1" aria-label="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Agregar pregunta">
        <div className="space-y-4">
          <Field label="Pregunta" required>
            <input value={draft.question} onChange={(e) => set("question", e.target.value)} className={inputCls()} placeholder="¿Necesito cita previa?" />
          </Field>
          <Field label="Respuesta" required>
            <textarea rows={3} value={draft.answer} onChange={(e) => set("answer", e.target.value)} className={inputCls()} placeholder="Sí, recomendamos agendar para…" />
          </Field>
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--ds-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Agregar pregunta
        </button>
      </SectionCard>
    </div>
  );
}

// ── Tab: Página pública (estado, acción, secciones, template) ───────────────────

function PaginaTab() {
  const { publicPage, updatePublicPage } = useExtraProfile();
  const sections = publicPage.sectionVisibility;
  const sectionLabels: { key: keyof typeof sections; label: string }[] = [
    { key: "specialist", label: "Especialista" },
    { key: "services", label: "Servicios" },
    { key: "benefits", label: "Beneficios" },
    { key: "testimonials", label: "Testimonios" },
    { key: "faqs", label: "Preguntas frecuentes" },
    { key: "gallery", label: "Galería" },
    { key: "payments", label: "Formas de pago" },
    { key: "processStages", label: "Proceso" },
    { key: "location", label: "Ubicación" },
    { key: "emergencies", label: "Urgencias" },
  ];

  return (
    <div className="space-y-5">
      <SectionCard title="Estado y acción principal">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Estado de la página">
            <select
              value={publicPage.status}
              onChange={(e) => updatePublicPage({ status: e.target.value as "draft" | "published" })}
              className={inputCls()}
            >
              <option value="published">Publicada</option>
              <option value="draft">Borrador</option>
            </select>
          </Field>
          <Field label="Acción principal del botón">
            <select
              value={publicPage.primaryAction}
              onChange={(e) => updatePublicPage({ primaryAction: e.target.value as "appointment" | "whatsapp" | "phone" })}
              className={inputCls()}
            >
              <option value="appointment">Agendar cita</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Llamar</option>
            </select>
          </Field>
          <Field label="Texto del botón principal">
            <input value={publicPage.primaryButtonLabel} onChange={(e) => updatePublicPage({ primaryButtonLabel: e.target.value })} className={inputCls()} placeholder="Agendar cita" />
          </Field>
          <Field label="Texto del botón secundario">
            <input value={publicPage.secondaryButtonLabel ?? ""} onChange={(e) => updatePublicPage({ secondaryButtonLabel: e.target.value })} className={inputCls()} placeholder="Enviar WhatsApp" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Mensaje predefinido de WhatsApp">
            <textarea rows={2} value={publicPage.whatsappPrefilledMessage ?? ""} onChange={(e) => updatePublicPage({ whatsappPrefilledMessage: e.target.value })} className={inputCls()} placeholder="Hola, me gustaría agendar una cita…" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Secciones visibles">
        <div className="grid sm:grid-cols-2 gap-2">
          {sectionLabels.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={sections[key]}
                onChange={(e) => updatePublicPage({ sectionVisibility: { ...sections, [key]: e.target.checked } })}
                className="w-4 h-4 rounded border-[var(--ds-border)] accent-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--ds-text-muted)] font-medium">{label}</span>
            </label>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ── Datos y respaldo ───────────────────────────────────────────────────────────

function DatosTab() {
  const { clients, carePlans, payments, followUps, exportBackup } = useClientData();

  function exportClientesCSV() {
    exportToCSV("clientes", [
      ["ID", "Nombre", "Teléfono", "Fecha nacimiento", "Alta", "Etiquetas", "Notas"],
      ...clients.map((c) => [c.id, c.name, c.phone, c.dateOfBirth ?? "", c.firstVisitAt, c.tags.join(", "), c.notes ?? ""]),
    ]);
  }

  function exportPagosCSV() {
    exportToCSV("pagos", [
      ["ID", "Cliente ID", "Plan ID", "Concepto", "Monto", "Fecha", "Método", "Estado", "Referencia"],
      ...payments.map((p) => [p.id, p.clientId, p.carePlanId ?? "", p.concept, p.amount, p.paymentDate, p.paymentMethod, p.status, p.reference ?? ""]),
    ]);
  }

  function exportSeguimientosCSV() {
    exportToCSV("seguimientos", [
      ["ID", "Cliente ID", "Título", "Fecha", "Prioridad", "Estado", "Descripción"],
      ...followUps.map((f) => [f.id, f.clientId, f.title, f.dueDate, f.priority, f.status, f.description ?? ""]),
    ]);
  }

  const btnCls = "flex items-center gap-3 w-full border border-[var(--ds-border)] text-[var(--ds-text)] px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[var(--ds-bg)] hover:border-[var(--ds-primary)]/30 transition-colors text-left";

  return (
    <div className="space-y-6">
      <div className="bg-[var(--ds-success)]/8 border border-[var(--ds-success)]/20 rounded-2xl p-4 text-sm text-[var(--ds-success)]">
        <p className="font-bold mb-1">Tu información sigue siendo tuya.</p>
        <p className="text-xs text-[var(--ds-success)]/80">Puedes descargar una copia cuando lo necesites.</p>
      </div>

      <SectionCard title="Exportar listados (CSV)">
        <div className="space-y-2">
          <button onClick={exportClientesCSV} className={btnCls}>
            <Download className="w-4 h-4 text-[var(--ds-primary)] flex-shrink-0" />
            <div>
              <p>Exportar clientes en CSV</p>
              <p className="text-xs text-[var(--ds-text-muted)] font-normal">{clients.length} clientes registrados</p>
            </div>
          </button>
          <button onClick={exportPagosCSV} className={btnCls}>
            <Download className="w-4 h-4 text-[var(--ds-primary)] flex-shrink-0" />
            <div>
              <p>Exportar pagos en CSV</p>
              <p className="text-xs text-[var(--ds-text-muted)] font-normal">{payments.length} registros</p>
            </div>
          </button>
          <button onClick={exportSeguimientosCSV} className={btnCls}>
            <Download className="w-4 h-4 text-[var(--ds-primary)] flex-shrink-0" />
            <div>
              <p>Exportar seguimientos en CSV</p>
              <p className="text-xs text-[var(--ds-text-muted)] font-normal">{followUps.length} seguimientos</p>
            </div>
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Respaldo completo (JSON)">
        <p className="text-sm text-[var(--ds-text-muted)] mb-4">Descarga todos los datos del consultorio en un solo archivo JSON estructurado y versionado.</p>
        <div className="bg-[var(--ds-bg)] border border-[var(--ds-border)] rounded-xl p-3 mb-4 text-xs text-[var(--ds-text-muted)] font-mono space-y-1">
          <p>{"{"}</p>
          <p className="pl-4">"version": "1.0.0",</p>
          <p className="pl-4">"data": {"{"}  clients, carePlans, payments, followUps, appointments, services  {"}"}</p>
          <p>{"}"}</p>
        </div>
        <button onClick={exportBackup} className="flex items-center gap-2 bg-[var(--ds-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--ds-primary)] transition-colors">
          <Download className="w-4 h-4" />
          Exportar respaldo completo en JSON
        </button>
        <p className="text-xs text-[var(--ds-text-muted)] mt-3">El archivo incluye: {clients.length} clientes · {carePlans.length} planes · {payments.length} pagos · {followUps.length} seguimientos</p>
      </SectionCard>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const { config, saveConfig } = useClinicConfig();
  const isPublished = config.publicPageStatus === "published";

  async function togglePublish() {
    await saveConfig({ publicPageStatus: isPublished ? "draft" : "published" });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--ds-text)]">Configuración del consultorio</h1>
          <p className="text-[var(--ds-text-muted)] text-sm mt-1">
            Los cambios se reflejan automáticamente en tu página pública.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={togglePublish}
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors ${
              isPublished
                ? "bg-[var(--ds-success)]/10 border-[var(--ds-success)]/30 text-[var(--ds-success)] hover:bg-[var(--ds-error)]/10 hover:border-[var(--ds-error)]/30 hover:text-[var(--ds-error)]"
                : "bg-[var(--ds-warning)]/10 border-[var(--ds-warning)]/30 text-[var(--ds-warning)] hover:bg-[var(--ds-success)]/10 hover:border-[var(--ds-success)]/30 hover:text-[var(--ds-success)]"
            }`}
          >
            {isPublished ? <Globe className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {isPublished ? "Publicada" : "Borrador — Publicar"}
          </button>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ds-primary)] hover:text-[var(--ds-accent)] transition-colors border border-[var(--ds-border)] px-4 py-2 rounded-xl bg-[var(--ds-surface)] hover:border-[var(--color-accent)]/50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver página pública
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--ds-bg)] border border-[var(--ds-border)] rounded-2xl p-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0",
                active
                  ? "bg-[var(--ds-surface)] shadow-sm text-[var(--ds-primary)] border border-[var(--ds-border)]"
                  : "text-[var(--ds-text-muted)] hover:text-[var(--ds-text)] hover:bg-white/60",
              ].join(" ")}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "general"        && <GeneralTab />}
      {activeTab === "especialista"   && <EspecialistaTab />}
      {activeTab === "contacto"       && <ContactTab />}
      {activeTab === "redes"          && <RedesTab />}
      {activeTab === "horarios"       && <HoursTab />}
      {activeTab === "pagos"          && <PaymentsTab />}
      {activeTab === "apariencia"     && <AppearanceTab />}
      {activeTab === "pagina"         && <PaginaTab />}
      {activeTab === "testimonios"    && <TestimoniosTab />}
      {activeTab === "preguntas"      && <PreguntasTab />}
      {activeTab === "imagenes"       && <ImagesTab />}
      {activeTab === "seo"            && <SeoTab />}
      {activeTab === "mensajes"       && <MessagesTab />}
      {activeTab === "automatizacion" && <AutomationTab />}
      {activeTab === "datos"          && <DatosTab />}
    </div>
  );
}
