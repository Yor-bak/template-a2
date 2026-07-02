"use client";

import { spectral, publicSans } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import {
  PAYMENT_METHOD_LABEL,
  formatPriceString,
  scheduleFromOpeningHours,
} from "@/lib/profileUtils";

// 3 paletas propias de fisioterapia (familias distintas): Terracota (rust, la original),
// Cobalto (azul deportivo) y Lima bosque (verde). Acento seguro en AA como texto y botón.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "terracota",
    name: "Terracota",
    swatch: "#b5562f",
    surface: "#fbfaf7",
    ink: "#22312b",
    vars: {
      "--c-bg": "#fbfaf7",
      "--c-ink": "#22312b",
      "--c-ink-deep": "#0f1814",
      "--c-accent": "#b5562f",
      "--c-accent-deep": "#93431f",
    },
  },
  {
    id: "cobalto",
    name: "Cobalto",
    swatch: "#2563c4",
    surface: "#f5f8fc",
    ink: "#1c2735",
    vars: {
      "--c-bg": "#f5f8fc",
      "--c-ink": "#1c2735",
      "--c-ink-deep": "#0e1722",
      "--c-accent": "#2563c4",
      "--c-accent-deep": "#1d4e9e",
    },
  },
  {
    id: "lima-bosque",
    name: "Lima bosque",
    swatch: "#45701c",
    surface: "#f6f9f1",
    ink: "#1f2a1c",
    vars: {
      "--c-bg": "#f6f9f1",
      "--c-ink": "#1f2a1c",
      "--c-ink-deep": "#101810",
      "--c-accent": "#45701c",
      "--c-accent-deep": "#355314",
    },
  },
] as const;

export const DEFAULT_PALETTE_ID = PALETTES[0].id;

// Completely different shape from every other specialty: no sidebar, no tabs, no bento, no
// table. This is a vertical "recovery journey" — a thin top progress rail instead of a nav menu,
// alternating left/right milestone rows for services, and a horizontal snap-scroll strip for
// testimonials. The signature motif is a stepped recovery curve (not an arc) used as a recurring
// background watermark instead of a small icon.

const stages = [
  { code: "01", label: "Valoración" },
  { code: "02", label: "Plan" },
  { code: "03", label: "Terapia" },
  { code: "04", label: "Alta funcional" },
];

type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "por sesión", from: "desde", consult: "a consulta" };









function RecoveryCurve({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 120" className={className} preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 110 L40 110 L40 90 L80 90 L80 75 L120 75 L120 55 L160 55 L160 45 L200 45 L200 30 L240 30 L240 22 L280 22 L280 14 L320 14 L320 8 L360 8 L360 4 L400 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}

export function FisioterapiaTemplate01({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
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
      className={`${spectral.variable} ${publicSans.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)] pb-28`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-public-sans)" }}
    >
      {isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} />
      )}
      {/* Thin progress rail instead of a header or sidebar nav */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[var(--c-ink)]/10 bg-[var(--c-bg)]/95 px-6 py-3 backdrop-blur md:px-12">
        <span className="text-sm font-semibold" style={{ fontFamily: "var(--f-spectral)" }}>{business.name}</span>
        <div className="hidden items-center gap-0 md:flex">
          {stages.map((s, i) => (
            <div key={s.code} className="flex items-center">
              <a href={`#etapa-${s.code}`} className="flex items-center gap-2 px-3 text-xs uppercase tracking-wide text-[var(--c-ink)]/60 hover:text-[var(--c-accent)]">
                <span className="font-mono text-[var(--c-accent)]">{s.code}</span>
                {s.label}
              </a>
              {i < stages.length - 1 && <span className="h-px w-6 bg-[var(--c-ink)]/15" />}
            </div>
          ))}
        </div>
        <a href={`https://wa.me/${business.whatsapp}`} className="rounded-full bg-[var(--c-ink)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--c-ink-deep)]">
          Agendar
        </a>
      </div>

      {/* Hero: full-bleed with recovery curve as background watermark, not a small icon */}
      <section className="relative overflow-hidden px-6 py-20 md:px-12">
        <RecoveryCurve className="pointer-events-none absolute -bottom-4 left-0 h-32 w-full text-[var(--c-accent)]/10" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">{specialist.specialty}</p>
          <h1 className="mt-5 text-5xl leading-[1.1] md:text-6xl" style={{ fontFamily: "var(--f-spectral)" }}>
            Cada sesión avanza la curva.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-[var(--c-ink)]/70">{specialist.shortDescription}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href={`https://wa.me/${business.whatsapp}`} className="rounded-full bg-[var(--c-accent)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--c-accent-deep)]">
              Agendar sesión
            </a>
            <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="rounded-full border border-[var(--c-ink)]/25 px-7 py-3.5 text-sm font-semibold transition hover:border-[var(--c-ink)]/50">
              Llamar al consultorio
            </a>
          </div>
        </div>
        <div className="relative mt-16 grid grid-cols-3 gap-6 border-t border-[var(--c-ink)]/10 pt-8 max-w-2xl">
          <div>
            <p className="text-3xl font-semibold text-[var(--c-accent)]" style={{ fontFamily: "var(--f-spectral)" }}>{specialist.yearsExperience?.toString() ?? "–"}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[var(--c-ink)]/50">Años de práctica</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-[var(--c-accent)]" style={{ fontFamily: "var(--f-spectral)" }}>{specialist.patientsServed?.toLocaleString("es-MX") ?? "–"}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[var(--c-ink)]/50">Pacientes rehabilitados</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-[var(--c-accent)]" style={{ fontFamily: "var(--f-spectral)" }}>{specialist.professionalLicense}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[var(--c-ink)]/50">Cédula profesional</p>
          </div>
        </div>
      </section>

      {/* Especialista, woven into the journey as "stage 00" */}
      <section className="border-t border-[var(--c-ink)]/10 bg-white px-6 py-16 md:px-12">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[auto_1fr]">
          <div className="aspect-square w-40 rounded-full bg-[var(--c-accent)]/15" aria-hidden />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-accent)]">Tu fisioterapeuta</p>
            <h2 className="mt-2 text-2xl" style={{ fontFamily: "var(--f-spectral)" }}>{specialist.displayName}</h2>
            <p className="mt-3 max-w-lg text-[var(--c-ink)]/70">
              Egresado de la {specialist.school ?? ""}, especializado en {specialist.specialty.toLowerCase()}.
            </p>
            <ul className="mt-5 space-y-1.5 text-sm text-[var(--c-ink)]/70">
              <li>— Medición de rango de movimiento en cada sesión.</li>
              <li>— Plan de ejercicios progresivo, no genérico.</li>
              <li>— Alta cuando recuperas función, no cuando se acaban las sesiones.</li>
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
        </div>
      </section>

      {/* Etapas del proceso: horizontal stage markers anchored by the rail above */}
      <section className="border-t border-[var(--c-ink)]/10 px-6 py-16 md:px-12">
        <h2 className="text-2xl" style={{ fontFamily: "var(--f-spectral)" }}>El camino de recuperación</h2>
        <div className="mt-10 grid gap-0 md:grid-cols-4">
          {stages.map((s, i) => (
            <div key={s.code} id={`etapa-${s.code}`} className="scroll-mt-24 border-t-2 border-[var(--c-accent)] pt-4 md:border-t-4">
              <span className="font-mono text-xs text-[var(--c-accent)]">{s.code}</span>
              <p className="mt-1 text-lg" style={{ fontFamily: "var(--f-spectral)" }}>{s.label}</p>
              <p className="mt-2 text-sm text-[var(--c-ink)]/60">
                {i === 0 && "Medimos movilidad, fuerza y dolor para establecer una línea base."}
                {i === 1 && "Definimos objetivos medibles y el número de sesiones estimado."}
                {i === 2 && "Terapia manual, ejercicio dirigido y ajustes semana a semana."}
                {i === 3 && "Pruebas de rendimiento y alta cuando recuperas función completa."}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios: alternating left/right milestone rows, not a table or card grid */}
      <section id="servicios" className="border-t border-[var(--c-ink)]/10 bg-white px-6 py-16 md:px-12">
        <h2 className="text-2xl" style={{ fontFamily: "var(--f-spectral)" }}>Sesiones y tratamientos</h2>
        <div className="mt-10 space-y-10">
          {services.map((s, i) => (
            <div
              key={s.name}
              className={`flex flex-col gap-3 border-b border-[var(--c-ink)]/10 pb-8 last:border-0 md:flex-row md:items-baseline md:gap-8 ${
                i % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""
              } ${s.isUrgency ? "bg-[var(--c-accent)]/5 -mx-6 px-6 py-6 md:-mx-12 md:px-12" : ""}`}
            >
              <div className="md:w-1/3">
                <span className={`text-2xl font-semibold ${s.isUrgency ? "text-[var(--c-accent)]" : "text-[var(--c-ink)]"}`} style={{ fontFamily: "var(--f-spectral)" }}>
                  {s.price}
                </span>
                <span className="ml-2 text-xs uppercase tracking-wide text-[var(--c-ink)]/45">{priceTypeLabel[s.priceType]}</span>
              </div>
              <div className="md:w-2/3">
                <h3 className="font-semibold">{s.name}</h3>
                <p className="mt-1 text-sm text-[var(--c-ink)]/60">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ubicación + urgencias combined in one split band */}
      <section id="ubicacion" className="border-t border-[var(--c-ink)]/10 px-6 py-16 md:px-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl" style={{ fontFamily: "var(--f-spectral)" }}>Ubicación y horario</h2>
            <address className="mt-4 not-italic text-[var(--c-ink)]/70">
              {business.address.street}
              <br />
              {business.address.neighborhood}
              <br />
              {`${business.address.postalCode ?? ""} ${business.address.city}`.trim()}
            </address>
            <p className="mt-2 text-sm text-[var(--c-ink)]/55">{business.address.references}</p>
            <a href={business.address.mapsUrl} className="mt-3 inline-block text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-7 divide-y divide-[var(--c-ink)]/10 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-2">
                  <span className="text-[var(--c-ink)]/70">{row.day}</span>
                  <span className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/40" : "font-semibold"}>{row.hours}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1 text-xs text-[var(--c-ink)]/70">{m}</span>
              ))}
            </div>
            {paymentInstructions.showTransferDetails && (
              <div className="mt-4 rounded-xl border border-[var(--c-ink)]/15 bg-white p-4 text-sm text-[var(--c-ink)]/70">
                <p className="font-semibold text-[var(--c-ink)]">Transferencia bancaria</p>
                {paymentInstructions.bankName && <p className="mt-1">Banco: {paymentInstructions.bankName}</p>}
                {paymentInstructions.accountHolder && <p>Titular: {paymentInstructions.accountHolder}</p>}
                {paymentInstructions.clabe && <p>CLABE: {paymentInstructions.clabe}</p>}
                {paymentInstructions.accountNumber && <p>Cuenta: {paymentInstructions.accountNumber}</p>}
                {paymentInstructions.cardLastFourDigits && <p>Tarjeta terminación: ••••{paymentInstructions.cardLastFourDigits}</p>}
                {paymentInstructions.paymentLink && (
                  <a href={paymentInstructions.paymentLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">Pagar en línea</a>
                )}
                {paymentInstructions.transferReferenceInstructions && (
                  <p className="mt-2 italic">{paymentInstructions.transferReferenceInstructions}</p>
                )}
              </div>
            )}
          </div>

          <div id="urgencias" className="rounded-2xl bg-[var(--c-ink)] px-8 py-10 text-[var(--c-bg)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-accent)]">Dolor agudo</p>
            <h2 className="mt-3 text-2xl" style={{ fontFamily: "var(--f-spectral)" }}>
              Un esguince o bloqueo reciente no espera a la próxima cita.
            </h2>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="rounded-full bg-[var(--c-accent)] px-6 py-3 text-sm font-semibold text-white">
                Llamar ahora
              </a>
              <a href={`https://wa.me/${business.whatsapp}`} className="rounded-full border border-[var(--c-bg)]/30 px-6 py-3 text-sm font-semibold">
                WhatsApp directo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios: horizontal snap-scroll strip, not a grid */}
      <section id="testimonios" className="border-t border-[var(--c-ink)]/10 bg-white py-16">
        <h2 className="px-6 text-2xl md:px-12" style={{ fontFamily: "var(--f-spectral)" }}>Lo que cuentan los pacientes</h2>
        <div className="mt-8 flex gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:px-12" style={{ scrollSnapType: "x mandatory" }}>
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="min-w-[280px] flex-shrink-0 rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-bg)] p-6 md:min-w-[340px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <blockquote className="text-[var(--c-ink)]/80">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-xs text-[var(--c-ink)]/50">{t.name} · {t.treatment}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="border-t border-[var(--c-ink)]/10 px-6 py-16 md:px-12">
        <h2 className="text-2xl" style={{ fontFamily: "var(--f-spectral)" }}>Agenda tu sesión</h2>
        <div className="mt-7 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="text-[var(--c-ink)]/50">Teléfono</div>
            <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="mt-1 block font-semibold">{business.phone}</a>
          </div>
          <div>
            <div className="text-[var(--c-ink)]/50">WhatsApp</div>
            <a href={`https://wa.me/${business.whatsapp}`} className="mt-1 block font-semibold">{business.phone}</a>
          </div>
          <div>
            <div className="text-[var(--c-ink)]/50">Correo</div>
            <a href={`mailto:${business.email ?? ""}`} className="mt-1 block font-semibold">{business.email ?? ""}</a>
          </div>
          <div>
            <div className="text-[var(--c-ink)]/50">Redes sociales</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">Instagram</a>}
              {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">Facebook</a>}
              {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">TikTok</a>}
              {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">YouTube</a>}
              {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">LinkedIn</a>}
              {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">Sitio web</a>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
