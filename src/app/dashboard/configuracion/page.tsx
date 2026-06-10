"use client";
import { useState } from "react";
import Link from "next/link";
import {
  User, MapPin, Clock, CreditCard, Palette, Bot,
  CheckCircle2, AlertCircle, Car, Phone, Mail,
  ExternalLink, Save, Wifi, WifiOff, Info,
  Image, Search, MessageSquare, Globe, EyeOff,
} from "lucide-react";
import type { MessageTemplates } from "@/types/clinic";
import { DEFAULT_MESSAGE_TEMPLATES, MESSAGE_TEMPLATE_LABELS } from "@/utils/messageUtils";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { ThemePaletteSelector } from "@/components/theme/ThemePaletteSelector";
import { clinic as legacyClinic } from "@/data/clinic";
import type { OpeningHour, PaymentMethod } from "@/types/clinic";
import {
  ALL_PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  validateClinicConfig,
} from "@/utils/clinicUtils";

type Tab = "general" | "contacto" | "horarios" | "pagos" | "apariencia" | "automatizacion" | "imagenes" | "seo" | "mensajes";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "general",        label: "General",            icon: User          },
  { id: "contacto",       label: "Contacto y ubicación", icon: MapPin      },
  { id: "horarios",       label: "Horarios",           icon: Clock         },
  { id: "pagos",          label: "Pagos y urgencias",  icon: CreditCard    },
  { id: "apariencia",     label: "Apariencia",         icon: Palette       },
  { id: "imagenes",       label: "Imágenes",           icon: Image         },
  { id: "seo",            label: "SEO Local",          icon: Search        },
  { id: "mensajes",       label: "Mensajes",           icon: MessageSquare },
  { id: "automatizacion", label: "Automatización",     icon: Bot           },
];

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputCls = (err?: string) =>
  `w-full border ${
    err
      ? "border-red-300 bg-red-50 focus:ring-red-200"
      : "border-[var(--color-border)] bg-white focus:ring-[var(--color-accent-soft)]"
  } rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted-text)]/50 focus:outline-none focus:ring-2 focus:border-[var(--color-accent)] transition-colors`;

function Field({
  label, required, error, hint, children,
}: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-muted-text)] mb-1.5">
        {label}{required && <span className="text-[var(--color-accent)] ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[var(--color-muted-text)]/60 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-[var(--color-text)] text-sm uppercase tracking-wide mb-5">{title}</h3>
      {children}
    </div>
  );
}

function SaveRow({
  onSave, saved, saving, errors,
}: {
  onSave: () => void; saved: boolean; saving: boolean; errors: string[];
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 pt-4">
      {saved && (
        <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Configuración actualizada correctamente.
        </span>
      )}
      {errors.length > 0 && (
        <ul className="text-red-600 text-xs space-y-0.5">
          {errors.map((e) => <li key={e} className="flex items-center gap-1"><AlertCircle className="w-3 h-3 flex-shrink-0" />{e}</li>)}
        </ul>
      )}
      {!saved && errors.length === 0 && <span />}
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
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
  const [form, setForm] = useState({
    clinicName: config.clinicName,
    dentistName: config.dentistName,
    professionalLicense: config.professionalLicense,
    specialty: config.specialty,
    yearsExperience: config.yearsExperience,
    patientsServed: config.patientsServed,
    shortDescription: config.shortDescription,
    welcomeMessage: config.welcomeMessage,
    showPrices: config.showPrices,
  });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  function handleSave() {
    const errs = validateClinicConfig(form);
    const relevant = Object.fromEntries(
      Object.entries(errs).filter(([k]) => k in form)
    );
    setErrors(relevant);
    if (Object.keys(relevant).length > 0) return;
    saveConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Información del consultorio y dentista">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre del consultorio" required error={errors.clinicName}>
            <input value={form.clinicName} onChange={(e) => set("clinicName", e.target.value)} className={inputCls(errors.clinicName)} placeholder="Ej. Clínica Dental Sonrisa" />
          </Field>
          <Field label="Nombre del dentista" required error={errors.dentistName}>
            <input value={form.dentistName} onChange={(e) => set("dentistName", e.target.value)} className={inputCls(errors.dentistName)} placeholder="Ej. Dra. Mariana López" />
          </Field>
          <Field label="Cédula profesional" required error={errors.professionalLicense}>
            <input value={form.professionalLicense} onChange={(e) => set("professionalLicense", e.target.value)} className={inputCls(errors.professionalLicense)} placeholder="12345678" />
          </Field>
          <Field label="Especialidad" required error={errors.specialty}>
            <input value={form.specialty} onChange={(e) => set("specialty", e.target.value)} className={inputCls(errors.specialty)} placeholder="Ej. Odontología Integral" />
          </Field>
          <Field label="Años de experiencia" error={errors.yearsExperience}>
            <input type="number" min={0} value={form.yearsExperience} onChange={(e) => set("yearsExperience", Number(e.target.value))} className={inputCls(errors.yearsExperience)} />
          </Field>
          <Field label="Pacientes atendidos" error={errors.patientsServed}>
            <input type="number" min={0} value={form.patientsServed} onChange={(e) => set("patientsServed", Number(e.target.value))} className={inputCls(errors.patientsServed)} />
          </Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="Descripción corta del consultorio" hint="Se muestra en el encabezado de la página pública.">
            <textarea rows={2} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={inputCls()} placeholder="Atención dental profesional, cercana y segura…" />
          </Field>
          <Field label="Mensaje de bienvenida" hint="Se muestra debajo del título principal en la landing.">
            <textarea rows={2} value={form.welcomeMessage} onChange={(e) => set("welcomeMessage", e.target.value)} className={inputCls()} placeholder="Tu sonrisa es nuestra prioridad…" />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.showPrices} onChange={(e) => set("showPrices", e.target.checked)} className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-muted-text)] font-medium">Mostrar precios estimados en la página pública</span>
          </label>
        </div>
      </SectionCard>
      <SaveRow onSave={handleSave} saved={saved} saving={false} errors={Object.values(errors).filter(Boolean)} />
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

  function handleSave() {
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
    saveConfig({
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
            <input type="checkbox" checked={form.parkingAvailable} onChange={(e) => set("parkingAvailable", e.target.checked)} className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-muted-text)] font-medium flex items-center gap-2">
              <Car className="w-4 h-4" />
              Estacionamiento disponible para pacientes
            </span>
          </label>
          {form.parkingAvailable && (
            <Field label="Detalles del estacionamiento" hint="Opcional — descripción que verá el paciente.">
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
      className="border border-[var(--color-border)] bg-white rounded-lg px-2.5 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-soft)] focus:border-[var(--color-accent)] transition-colors"
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
    <div className="border border-[var(--color-border)] rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={toggle}
          className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${hour.isOpen ? "bg-[var(--color-accent)]" : "bg-gray-200"}`}
        >
          <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${hour.isOpen ? "translate-x-5" : "translate-x-0"}`} />
        </button>
        <span className="text-sm font-semibold text-[var(--color-text)] w-24">{hour.dayLabel}</span>
        {!hour.isOpen && <span className="text-xs text-[var(--color-muted-text)]">Cerrado</span>}
      </div>

      {hour.isOpen && (
        <div className="ml-14 space-y-2">
          {hour.blocks.map((block, i) => (
            <div key={i} className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[var(--color-muted-text)] w-14">Turno {i + 1}</span>
              <TimeInput value={block.startTime} onChange={(v) => updateBlock(i, "startTime", v)} />
              <span className="text-xs text-[var(--color-muted-text)]">–</span>
              <TimeInput value={block.endTime} onChange={(v) => updateBlock(i, "endTime", v)} />
              {i > 0 && (
                <button
                  onClick={() => removeBlock(i)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors ml-1"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
          {hour.blocks.length < 2 && (
            <button
              onClick={addBlock}
              className="text-xs text-[var(--color-primary)] hover:text-[var(--color-accent)] font-semibold transition-colors"
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

  function handleSave() {
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
    saveConfig({ openingHours: hours });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <div className="bg-[var(--color-accent-soft)]/40 border border-[var(--color-accent)]/20 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-[var(--color-primary)]">
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
  const [payments, setPayments] = useState<PaymentMethod[]>(config.acceptedPayments);
  const [acceptsEmergencies, setAcceptsEmergencies] = useState(config.acceptsEmergencies);
  const [emergencyDescription, setEmergencyDescription] = useState(config.emergencyDescription ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(config.emergencyPhone ?? "");
  const [emergencyWhatsapp, setEmergencyWhatsapp] = useState(config.emergencyWhatsapp ?? "");
  const [saved, setSaved] = useState(false);

  function togglePayment(m: PaymentMethod) {
    setPayments((p) =>
      p.includes(m) ? p.filter((x) => x !== m) : [...p, m]
    );
  }

  function handleSave() {
    saveConfig({
      acceptedPayments: payments,
      acceptsEmergencies,
      emergencyDescription: emergencyDescription || undefined,
      emergencyPhone: emergencyPhone || undefined,
      emergencyWhatsapp: emergencyWhatsapp || undefined,
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
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]/30"
                    : "border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => togglePayment(m)}
                  className="w-4 h-4 rounded accent-[var(--color-primary)] flex-shrink-0"
                />
                <span className="text-sm text-[var(--color-text)] font-medium leading-tight">
                  {PAYMENT_METHOD_LABELS[m]}
                </span>
              </label>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Urgencias dentales">
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptsEmergencies}
              onChange={(e) => setAcceptsEmergencies(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
            />
            <span className="text-sm text-[var(--color-muted-text)] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
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
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-text)]" />
                    <input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className={`${inputCls()} pl-9`} placeholder="55 1234 5678" />
                  </div>
                </Field>
                <Field label="WhatsApp de urgencias" hint="Opcional — usa el WhatsApp general si está vacío.">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-text)]" />
                    <input value={emergencyWhatsapp} onChange={(e) => setEmergencyWhatsapp(e.target.value)} className={`${inputCls()} pl-9`} placeholder="5512345678" />
                  </div>
                </Field>
              </div>
            </div>
          )}

          {!acceptsEmergencies && (
            <div className="pl-7 ml-2 text-sm text-[var(--color-muted-text)]/70">
              La sección de urgencias no se mostrará de forma destacada en la página pública.
            </div>
          )}
        </div>
      </SectionCard>

      <SaveRow onSave={handleSave} saved={saved} saving={false} errors={[]} />
    </div>
  );
}

// ── Tab E: Apariencia ──────────────────────────────────────────────────────────

function AppearanceTab() {
  return (
    <div className="space-y-5">
      <ThemePaletteSelector />
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
          isActive ? "bg-violet-50 border-violet-200" : "bg-gray-50 border-gray-200"
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
              <WifiOff className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold text-sm ${isActive ? "text-violet-900" : "text-gray-700"}`}>
                {isActive ? "Automatización activa" : "Automatización no activa"}
              </span>
              <span
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                  isActive ? "bg-violet-200 text-violet-800" : "bg-gray-200 text-gray-500"
                }`}
              >
                {isActive
                  ? legacyClinic.automationMode === "n8n"
                    ? "n8n"
                    : "IA WhatsApp"
                  : "Manual"}
              </span>
            </div>
            <p className={`text-sm ${isActive ? "text-violet-700" : "text-gray-500"}`}>
              {isActive
                ? `Tu consultorio tiene confirmaciones y recordatorios automáticos activos vía ${
                    legacyClinic.automationMode === "n8n" ? "n8n" : "IA WhatsApp"
                  }.`
                : "Este consultorio usa agenda manual. Puedes activar confirmaciones y recordatorios por WhatsApp o agenda con IA al contratar el plan avanzado."}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
        <p className="text-sm text-[var(--color-muted-text)] leading-relaxed">
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

  function handleSave() {
    saveConfig({
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
      <div className="bg-[var(--color-accent-soft)]/40 border border-[var(--color-accent)]/20 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-[var(--color-primary)]">
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
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
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

  function handleSave() {
    saveConfig({
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
            <p className="text-xs text-right text-[var(--color-muted-text)]/60 mt-0.5">{form.seoTitle.length}/60</p>
          </Field>
          <Field label="Descripción SEO" hint="Descripción que aparece en Google. Máx. 160 caracteres recomendado.">
            <textarea rows={3} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} className={inputCls()} placeholder="Atención dental profesional en Del Valle, CDMX. Limpieza, blanqueamiento, ortodoncia…" />
            <p className="text-xs text-right text-[var(--color-muted-text)]/60 mt-0.5">{form.seoDescription.length}/160</p>
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

  function handleSave() {
    saveConfig({ messageTemplates: templates });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <div className="bg-[var(--color-accent-soft)]/40 border border-[var(--color-accent)]/20 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-[var(--color-primary)]">
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
                  <label className="text-sm font-semibold text-[var(--color-muted-text)] uppercase tracking-wide">
                    {MESSAGE_TEMPLATE_LABELS[key]}
                  </label>
                  {isCustom && (
                    <button onClick={() => resetTemplate(key)} className="text-xs text-[var(--color-muted-text)] hover:text-red-500 transition-colors">
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

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const { config, saveConfig } = useClinicConfig();
  const isPublished = config.publicPageStatus === "published";

  function togglePublish() {
    saveConfig({ publicPageStatus: isPublished ? "draft" : "published" });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text)]">Configuración del consultorio</h1>
          <p className="text-[var(--color-muted-text)] text-sm mt-1">
            Los cambios se reflejan automáticamente en tu página pública.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={togglePublish}
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors ${
              isPublished
                ? "bg-green-50 border-green-200 text-green-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
            }`}
          >
            {isPublished ? <Globe className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {isPublished ? "Publicada" : "Borrador — Publicar"}
          </button>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors border border-[var(--color-border)] px-4 py-2 rounded-xl bg-white hover:border-[var(--color-accent)]/50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver página pública
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl p-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0",
                active
                  ? "bg-white shadow-sm text-[var(--color-primary)] border border-[var(--color-border)]"
                  : "text-[var(--color-muted-text)] hover:text-[var(--color-text)] hover:bg-white/60",
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
      {activeTab === "contacto"       && <ContactTab />}
      {activeTab === "horarios"       && <HoursTab />}
      {activeTab === "pagos"          && <PaymentsTab />}
      {activeTab === "apariencia"     && <AppearanceTab />}
      {activeTab === "imagenes"       && <ImagesTab />}
      {activeTab === "seo"            && <SeoTab />}
      {activeTab === "mensajes"       && <MessagesTab />}
      {activeTab === "automatizacion" && <AutomationTab />}
    </div>
  );
}
