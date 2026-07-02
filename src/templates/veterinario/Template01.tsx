"use client";

import { archivo, karla } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import {
  PAYMENT_METHOD_LABEL,
  formatPriceString,
  scheduleFromOpeningHours,
} from "@/lib/profileUtils";

// 3 paletas propias de veterinario, familias distintas entre sí (y de los demás templates):
// --c-header es la banda viva (header), --c-accent el tono cálido de texto/precios/urgencia,
// --c-ink el oscuro, --c-bg el crema, --c-ink-deep el hover oscuro. El swatch es el header.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "ambar-campo",
    name: "Ámbar campo",
    swatch: "#f4a637",
    surface: "#fbf3e7",
    ink: "#2e3b2c",
    vars: {
      "--c-bg": "#fbf3e7",
      "--c-ink": "#2e3b2c",
      "--c-ink-deep": "#1e2a1c",
      "--c-accent": "#c0622b",
      "--c-header": "#f4a637",
    },
  },
  {
    id: "aqua-coral",
    name: "Aqua coral",
    swatch: "#2bb3a3",
    surface: "#edf6f3",
    ink: "#1d3a35",
    vars: {
      "--c-bg": "#edf6f3",
      "--c-ink": "#1d3a35",
      "--c-ink-deep": "#122a26",
      "--c-accent": "#c8482f",
      "--c-header": "#2bb3a3",
    },
  },
  {
    id: "lila-durazno",
    name: "Lila durazno",
    swatch: "#a78bdb",
    surface: "#f5f1fb",
    ink: "#2c2440",
    vars: {
      "--c-bg": "#f5f1fb",
      "--c-ink": "#2c2440",
      "--c-ink-deep": "#1f1930",
      "--c-accent": "#b0531f",
      "--c-header": "#a78bdb",
    },
  },
] as const;

export const DEFAULT_PALETTE_ID = PALETTES[0].id;

// Signature motifs for this specialty: a paw-print bullet/divider (instead of a generic dot or rule)
// and a "cartilla de vacunación" stamp-card layout for services, evoking a pet's actual vaccination booklet.


type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "precio fijo", from: "desde", consult: "a consulta" };









function Paw({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <ellipse cx="12" cy="16.2" rx="5.2" ry="4.3" />
      <ellipse cx="5.3" cy="10.4" rx="2.1" ry="2.6" transform="rotate(-25 5.3 10.4)" />
      <ellipse cx="18.7" cy="10.4" rx="2.1" ry="2.6" transform="rotate(25 18.7 10.4)" />
      <ellipse cx="8.6" cy="6.2" rx="1.8" ry="2.3" transform="rotate(-12 8.6 6.2)" />
      <ellipse cx="15.4" cy="6.2" rx="1.8" ry="2.3" transform="rotate(12 15.4 6.2)" />
    </svg>
  );
}

function PawTrail({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-8 ${className}`} aria-hidden>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Paw key={i} className={`h-3 w-3 ${i % 2 ? "translate-y-1.5" : ""}`} />
      ))}
    </div>
  );
}

export function VeterinarioTemplate01({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
  const {
    specialist,
    business,
    services: profileServices,
    testimonials: profileTestimonials,
    paymentMethods: profilePayments,
    paymentInstructions,
    openingHours,
    appearance,
  } = profile;
  const socialLinks = business.socialLinks ?? {};

  const stamps = [
    { label: "Años atendiendo mascotas", value: specialist.yearsExperience?.toString() ?? "–" },
    { label: "Pacientes con cartilla", value: specialist.patientsServed?.toLocaleString("es-MX") ?? "–" },
    { label: "Cédula profesional", value: specialist.professionalLicense },
  ];

  const activePalette = PALETTES.find((p) => p.id === appearance.selectedPaletteId) ?? PALETTES[0];
  const active = PALETTES.indexOf(activePalette);
  const setActive = (idx: number) => {
    if (!isPreview && onPaletteChange) onPaletteChange(PALETTES[idx].id);
  };

  const localPriceType = (pt: string): PriceType =>
    pt === "fixed" ? "fixed" : pt === "assessment_required" ? "consult" : "from";

  const services = profileServices
    .filter((s) => s.isActive)
    .map((s) => ({
      name: s.name,
      description: s.shortDescription,
      price: s.priceType === "assessment_required" ? "Consulta" : formatPriceString(s.priceType, s.estimatedPrice) || "Consulta",
      priceType: localPriceType(s.priceType),
      isUrgency: s.isEmergency,
    }));

  const schedule = scheduleFromOpeningHours(openingHours);

  const paymentMethods = profilePayments.map((m) => PAYMENT_METHOD_LABEL[m]);

  const testimonials = profileTestimonials
    .filter((t) => t.isPublished)
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99))
    .map((t) => ({
      name: t.name,
      quote: t.comment,
      treatment: profileServices.find((s) => s.id === t.serviceId)?.name ?? "Paciente",
    }));

  return (
    <div
      className={`${archivo.variable} ${karla.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)]`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-karla)" }}
    >
      {isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} />
      )}
      {/* Header */}
      <header className="border-b-4 border-[var(--c-ink)] bg-[var(--c-header)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <Paw className="h-7 w-7 text-[var(--c-ink)]" />
            <h1 className="text-lg font-black uppercase tracking-tight" style={{ fontFamily: "var(--f-archivo)" }}>
              {business.name}
            </h1>
          </div>
          <a href={`https://wa.me/${business.whatsapp}`} className="rounded-full bg-[var(--c-ink)] px-5 py-2.5 text-sm font-bold text-[var(--c-bg)] transition hover:bg-[var(--c-ink-deep)]">
            Agendar cita
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-14 pb-28">
        {/* Hero */}
        <section className="grid gap-10 pb-14 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--c-accent)]">{specialist.specialty}</p>
            <h2
              className="mt-4 max-w-xl text-4xl font-black leading-[1.1] md:text-5xl"
              style={{ fontFamily: "var(--f-archivo)" }}
            >
              Para tu mascota, no para cualquier paciente.
            </h2>
            <p className="mt-5 max-w-lg text-[var(--c-ink)]/70">{specialist.shortDescription}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={`https://wa.me/${business.whatsapp}`} className="rounded-full bg-[var(--c-ink)] px-6 py-3 text-sm font-bold text-[var(--c-bg)] transition hover:bg-[var(--c-ink-deep)]">
                Agendar cita
              </a>
              <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="rounded-full border-2 border-[var(--c-ink)]/30 px-6 py-3 text-sm font-bold transition hover:border-[var(--c-ink)]/60">
                Llamar a la clínica
              </a>
            </div>
            <PawTrail className="mt-10 text-[var(--c-accent)]/50" />
          </div>

          <div className="rounded-[2rem] border-4 border-[var(--c-ink)] bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--c-accent)]">Cartilla de la clínica</p>
            <dl className="mt-4 space-y-4">
              {stamps.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between border-b-2 border-dashed border-[var(--c-ink)]/20 pb-3 last:border-0 last:pb-0">
                  <dt className="text-sm text-[var(--c-ink)]/60">{s.label}</dt>
                  <dd className="font-mono text-xl font-bold text-[var(--c-accent)]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Especialista */}
        <section id="especialista" className="grid gap-10 border-t-2 border-dashed border-[var(--c-ink)]/20 py-14 md:grid-cols-[1fr_1.4fr]">
          <div className="aspect-square rounded-[2rem] bg-[var(--c-header)]/30" aria-hidden />
          <div>
            <h3 className="text-2xl font-black" style={{ fontFamily: "var(--f-archivo)" }}>{specialist.displayName}</h3>
            <p className="mt-3 max-w-lg text-[var(--c-ink)]/70">
              Médica veterinaria zootecnista con especialidad en {specialist.specialty}, egresada de la {specialist.school ?? ""}.
              Cédula profesional {specialist.professionalLicense}.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-[var(--c-ink)]/70">
              <li>🐾 Manejo de bajo estrés para perros y gatos.</li>
              <li>🐾 Hospitalización con monitoreo permanente.</li>
              <li>🐾 Cartilla digital con historial completo de cada mascota.</li>
            </ul>
            {specialist.biography && (
              <p className="mt-5 text-sm leading-relaxed text-[var(--c-ink)]/70">{specialist.biography}</p>
            )}
            {specialist.school && (
              <p className="mt-3 text-sm text-[var(--c-ink)]/70">Formación: {specialist.school}</p>
            )}
            {specialist.certifications && specialist.certifications.length > 0 && (
              <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-[var(--c-ink)]/70">
                {specialist.certifications.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            )}
          </div>
        </section>

        {/* Servicios */}
        <section id="servicios" className="border-t-2 border-dashed border-[var(--c-ink)]/20 py-14">
          <h3 className="text-2xl font-black" style={{ fontFamily: "var(--f-archivo)" }}>Servicios y cartilla de precios</h3>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.name}
                className={`rounded-2xl border-2 p-5 ${s.isUrgency ? "border-[var(--c-accent)] bg-[var(--c-accent)]/10" : "border-[var(--c-ink)]/15 bg-white"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2">
                    <Paw className="mt-1 h-4 w-4 shrink-0 text-[var(--c-accent)]" />
                    <h4 className="font-bold">{s.name}</h4>
                  </div>
                  <span className="whitespace-nowrap font-mono text-lg font-bold text-[var(--c-accent)]">{s.price}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--c-ink)]/60">{s.description}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-[var(--c-ink)]/40">{priceTypeLabel[s.priceType]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ubicación */}
        <section id="ubicacion" className="grid gap-10 border-t-2 border-dashed border-[var(--c-ink)]/20 py-14 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-black" style={{ fontFamily: "var(--f-archivo)" }}>Ubicación y horario</h3>
            <address className="mt-4 not-italic text-[var(--c-ink)]/70">
              {business.address.street}<br />
              {business.address.neighborhood}<br />
              {`${business.address.postalCode ?? ""} ${business.address.city}`.trim()}
            </address>
            <p className="mt-2 text-sm text-[var(--c-ink)]/60">{business.address.references}</p>
            <a href={business.address.mapsUrl} className="mt-3 inline-block text-sm font-bold text-[var(--c-accent)] underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-8 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border-2 border-[var(--c-ink)]/15 px-3 py-1 text-xs font-bold text-[var(--c-ink)]/70">{m}</span>
              ))}
            </div>
            {paymentInstructions.showTransferDetails && (
              <div className="mt-4 rounded-2xl border-2 border-[var(--c-ink)]/15 bg-white p-4 text-sm text-[var(--c-ink)]/70">
                <p className="font-bold text-[var(--c-ink)]">Transferencia bancaria</p>
                {paymentInstructions.bankName && <p className="mt-1">Banco: {paymentInstructions.bankName}</p>}
                {paymentInstructions.accountHolder && <p>Titular: {paymentInstructions.accountHolder}</p>}
                {paymentInstructions.clabe && <p>CLABE: {paymentInstructions.clabe}</p>}
                {paymentInstructions.accountNumber && <p>Cuenta: {paymentInstructions.accountNumber}</p>}
                {paymentInstructions.cardLastFourDigits && <p>Tarjeta terminación: ••••{paymentInstructions.cardLastFourDigits}</p>}
                {paymentInstructions.paymentLink && (
                  <a href={paymentInstructions.paymentLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-bold text-[var(--c-accent)] underline-offset-4 hover:underline">Pagar en línea</a>
                )}
                {paymentInstructions.transferReferenceInstructions && (
                  <p className="mt-2 italic">{paymentInstructions.transferReferenceInstructions}</p>
                )}
              </div>
            )}
          </div>
          <div className="divide-y-2 divide-dashed divide-[var(--c-ink)]/15 self-start rounded-2xl border-2 border-[var(--c-ink)]/15 bg-white p-6 text-sm">
            {schedule.map((row) => (
              <div key={row.day} className="flex justify-between py-2">
                <span className="text-[var(--c-ink)]/70">{row.day}</span>
                <span className="font-bold">{row.hours}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Urgencias */}
        <section id="urgencias" className="my-14 rounded-[2rem] bg-[var(--c-ink)] px-8 py-10 text-[var(--c-bg)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--c-header)]">Urgencia 24 horas</p>
          <h3 className="mt-3 max-w-md text-2xl font-black" style={{ fontFamily: "var(--f-archivo)" }}>
            Intoxicación, trauma o dificultad para respirar no esperan.
          </h3>
          <div className="mt-6 flex gap-4">
            <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="rounded-full bg-[var(--c-accent)] px-6 py-3 text-sm font-bold text-white">Llamar ahora</a>
            <a href={`https://wa.me/${business.whatsapp}`} className="rounded-full border-2 border-[var(--c-bg)]/40 px-6 py-3 text-sm font-bold">WhatsApp de urgencias</a>
          </div>
        </section>

        {/* Testimonios */}
        <section id="testimonios" className="border-t-2 border-dashed border-[var(--c-ink)]/20 py-14">
          <h3 className="text-2xl font-black" style={{ fontFamily: "var(--f-archivo)" }}>Lo que cuentan los dueños</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border-2 border-[var(--c-ink)]/15 bg-white p-5">
                <blockquote className="text-[var(--c-ink)]/80">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-3 text-xs font-bold text-[var(--c-ink)]/50">{t.name} · {t.treatment}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section id="contacto" className="border-t-2 border-dashed border-[var(--c-ink)]/20 py-14">
          <h3 className="text-2xl font-black" style={{ fontFamily: "var(--f-archivo)" }}>Agenda la cita de tu mascota</h3>
          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="text-[var(--c-ink)]/50">Teléfono</div>
              <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="mt-1 block font-bold">{business.phone}</a>
            </div>
            <div>
              <div className="text-[var(--c-ink)]/50">WhatsApp</div>
              <a href={`https://wa.me/${business.whatsapp}`} className="mt-1 block font-bold">{business.phone}</a>
            </div>
            <div>
              <div className="text-[var(--c-ink)]/50">Correo</div>
              <a href={`mailto:${business.email ?? ""}`} className="mt-1 block font-bold">{business.email ?? ""}</a>
            </div>
            <div>
              <div className="text-[var(--c-ink)]/50">Redes</div>
              <div className="mt-1 flex flex-col gap-1">
                {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-[var(--c-accent)]">Instagram</a>}
                {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-[var(--c-accent)]">Facebook</a>}
                {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-[var(--c-accent)]">TikTok</a>}
                {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-[var(--c-accent)]">YouTube</a>}
                {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-[var(--c-accent)]">LinkedIn</a>}
                {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-[var(--c-accent)]">Sitio web</a>}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
