"use client";

import { bricolage, onest } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import {
  PAYMENT_METHOD_LABEL,
  formatPriceString,
  scheduleFromOpeningHours,
} from "@/lib/profileUtils";

// Alterno 02 de fisioterapia — concepto ORIGINAL: un "Mapa del cuerpo" / zonas de tratamiento.
// El centro de la página es una silueta humana de frente dibujada en SVG inline, con marcadores
// (pins) sobre regiones del cuerpo, cada uno enlazado a una etiqueta. Alrededor, los servicios se
// presentan como "zonas que tratamos". Ninguna otra plantilla del repo usa este layout anatómico.
// Tema 100% por variables CSS; sin hex fuera del array de paletas.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "clinico-azul",
    name: "Clínico azul",
    swatch: "#2f6fb0",
    surface: "#f4f7fb",
    ink: "#182230",
    vars: {
      "--c-bg": "#f4f7fb",
      "--c-surface": "#ffffff",
      "--c-ink": "#182230",
      "--c-accent": "#2f6fb0",
      "--c-accent-deep": "#245488",
      "--c-soft": "#e1ebf6",
    },
  },
  {
    id: "coral-activo",
    name: "Coral activo",
    swatch: "#c14a3a",
    surface: "#fbf3f1",
    ink: "#2a1d1a",
    vars: {
      "--c-bg": "#fbf3f1",
      "--c-surface": "#ffffff",
      "--c-ink": "#2a1d1a",
      "--c-accent": "#c14a3a",
      "--c-accent-deep": "#9d3a2d",
      "--c-soft": "#f7ddd6",
    },
  },
  {
    id: "esmeralda",
    name: "Esmeralda",
    swatch: "#1f7a55",
    surface: "#eff7f2",
    ink: "#142a20",
    vars: {
      "--c-bg": "#eff7f2",
      "--c-surface": "#ffffff",
      "--c-ink": "#142a20",
      "--c-accent": "#1f7a55",
      "--c-accent-deep": "#165c40",
      "--c-soft": "#d7ede1",
    },
  },
] as const;

export const DEFAULT_PALETTE_ID = PALETTES[0].id;


type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "por sesión", from: "desde", consult: "a consulta" };









// Zonas del mapa del cuerpo: coordenadas en el viewBox 0 0 220 460 de la silueta SVG.
// side controla de qué lado sale la etiqueta en el SVG (no se usa en la lista lateral).
const bodyZones = [
  { id: "cuello", region: "Cuello y hombro", treats: "Cervicalgia, contracturas y tendinitis de hombro.", x: 110, y: 92 },
  { id: "codo", region: "Codo y muñeca", treats: "Epicondilitis, túnel del carpo y esguinces.", x: 158, y: 196 },
  { id: "columna", region: "Columna", treats: "Lumbalgia, hernias y reeducación postural.", x: 110, y: 175 },
  { id: "cadera", region: "Cadera", treats: "Bursitis, movilidad y fuerza del core.", x: 92, y: 244 },
  { id: "rodilla", region: "Rodilla", treats: "Ligamento cruzado, menisco y post-cirugía.", x: 96, y: 332 },
  { id: "tobillo", region: "Tobillo", treats: "Esguinces, equilibrio y vuelta al deporte.", x: 100, y: 420 },
];

// Silueta humana de frente, trazo limpio (no caricaturesca). Cabeza, torso, brazos y piernas.
function BodySilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 460" className={className} fill="none" aria-hidden>
      {/* cabeza */}
      <circle cx="110" cy="34" r="24" className="fill-[var(--c-soft)] stroke-[var(--c-accent)]/30" strokeWidth="2" />
      {/* cuerpo */}
      <path
        className="fill-[var(--c-soft)] stroke-[var(--c-accent)]/30"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M110 58
           C 96 58 88 66 86 78
           L 84 96
           C 70 100 58 112 50 132
           L 36 184 C 33 192 40 198 46 192 L 62 150
           C 64 144 70 142 72 148
           L 78 196
           C 70 250 72 300 74 332
           L 70 414 C 68 426 80 430 86 422 L 96 340
           C 100 322 120 322 124 340
           L 134 422 C 140 430 152 426 150 414
           L 146 332
           C 148 300 150 250 142 196
           L 148 148 C 150 142 156 144 158 150 L 174 192
           C 180 198 187 192 184 184 L 170 132
           C 162 112 150 100 136 96
           L 134 78
           C 132 66 124 58 110 58 Z"
      />
    </svg>
  );
}

export function FisioterapiaTemplate02({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
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

  const stats = [
    { value: specialist.yearsExperience?.toString() ?? "–", label: "años de práctica" },
    { value: specialist.patientsServed?.toLocaleString("es-MX") ?? "–", label: "pacientes rehabilitados" },
    { value: specialist.professionalLicense, label: "cédula profesional" },
  ];

  return (
    <div
      className={`${bricolage.variable} ${onest.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)] pb-28`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-onest)" }}
    >
      {!isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--c-ink)]/12 bg-[var(--c-bg)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--c-accent)] text-[var(--c-surface)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="5" r="2.4" />
                <path d="M12 7.5v6M12 9l-5 2M12 9l5 2M9.5 21l2.5-7 2.5 7" />
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: "var(--f-bricolage)" }}>
              {business.name}
            </span>
          </div>
          <a
            href={`https://wa.me/${business.whatsapp}`}
            className="inline-flex min-h-[44px] items-center rounded-xl bg-[var(--c-accent)] px-5 text-sm font-semibold text-[var(--c-surface)] transition hover:bg-[var(--c-accent-deep)]"
          >
            Agendar sesión
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">{specialist.specialty}</p>
        <h1
          className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl"
          style={{ fontFamily: "var(--f-bricolage)" }}
        >
          Tratamos el dolor donde vive: zona por zona.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[var(--c-ink)]/70">{specialist.shortDescription}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`https://wa.me/${business.whatsapp}`}
            className="inline-flex min-h-[44px] items-center rounded-xl bg-[var(--c-accent)] px-6 text-sm font-semibold text-[var(--c-surface)] transition hover:bg-[var(--c-accent-deep)]"
          >
            Agendar sesión
          </a>
          <a
            href="#mapa"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-[var(--c-ink)]/20 px-6 text-sm font-semibold transition hover:border-[var(--c-accent)] hover:text-[var(--c-accent)]"
          >
            Ver el mapa del cuerpo
          </a>
        </div>
        <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-[var(--c-ink)]/12 pt-8">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-3xl font-semibold text-[var(--c-accent)]" style={{ fontFamily: "var(--f-bricolage)" }}>
                {s.value}
              </dt>
              <dd className="mt-1 text-xs uppercase tracking-wide text-[var(--c-ink)]/55">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* MAPA DEL CUERPO — firma del template */}
      <section id="mapa" className="scroll-mt-20 border-t border-[var(--c-ink)]/12 bg-[var(--c-surface)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">Mapa del cuerpo</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl" style={{ fontFamily: "var(--f-bricolage)" }}>
              Zonas que tratamos
            </h2>
            <p className="mt-3 text-[var(--c-ink)]/70">
              Cada lesión tiene su región. Localiza tu molestia en el mapa y conoce cómo la abordamos.
            </p>
          </div>

          <div className="mt-12 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            {/* Silueta + marcadores */}
            <div className="relative mx-auto w-full max-w-sm">
              <BodySilhouette className="w-full" />
              {bodyZones.map((z) => (
                <div
                  key={z.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${(z.x / 220) * 100}%`, top: `${(z.y / 460) * 100}%` }}
                >
                  <span className="relative grid h-4 w-4 place-items-center">
                    <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-[var(--c-accent)]/40" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--c-accent)] ring-2 ring-[var(--c-surface)]" />
                  </span>
                </div>
              ))}
            </div>

            {/* Lista de zonas tratadas */}
            <ol className="grid gap-3 sm:grid-cols-2">
              {bodyZones.map((z, i) => (
                <li
                  key={z.id}
                  className="flex gap-3 rounded-xl border border-[var(--c-ink)]/12 bg-[var(--c-bg)] p-4"
                >
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--c-accent)]/12 text-xs font-semibold text-[var(--c-accent)]"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-semibold" style={{ fontFamily: "var(--f-bricolage)" }}>{z.region}</h3>
                    <p className="mt-1 text-sm text-[var(--c-ink)]/65">{z.treats}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Sesiones y tratamientos */}
      <section id="servicios" className="border-t border-[var(--c-ink)]/12 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">Tarifas</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl" style={{ fontFamily: "var(--f-bricolage)" }}>
            Sesiones y tratamientos
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article
                key={s.name}
                className={`flex flex-col rounded-xl border p-5 ${
                  s.isUrgency
                    ? "border-[var(--c-accent)]/40 bg-[var(--c-accent)]/8"
                    : "border-[var(--c-ink)]/12 bg-[var(--c-surface)]"
                }`}
              >
                {s.isUrgency && (
                  <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--c-accent)] px-3 py-1 text-xs font-semibold text-[var(--c-surface)]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--c-surface)]" /> Sin cita
                  </span>
                )}
                <h3 className="font-semibold" style={{ fontFamily: "var(--f-bricolage)" }}>{s.name}</h3>
                <p className="mt-1.5 flex-1 text-sm text-[var(--c-ink)]/65">{s.description}</p>
                <div className="mt-4 flex items-baseline gap-2 border-t border-[var(--c-ink)]/10 pt-4">
                  <span className="text-xl font-semibold text-[var(--c-accent)]" style={{ fontFamily: "var(--f-bricolage)" }}>
                    {s.price}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-[var(--c-ink)]/50">{priceTypeLabel[s.priceType]}</span>
                </div>
                {s.isUrgency && (
                  <a
                    href={`tel:${business.phone.replace(/\D/g, "")}`}
                    className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--c-accent)] px-5 text-sm font-semibold text-[var(--c-surface)] transition hover:bg-[var(--c-accent-deep)]"
                  >
                    Llamar ahora · {business.phone}
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Tu fisioterapeuta */}
      <section className="border-t border-[var(--c-ink)]/12 bg-[var(--c-surface)] py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[auto_1fr] md:items-center">
          <div className="grid h-36 w-36 place-items-center rounded-2xl bg-[var(--c-soft)] text-[var(--c-accent)]" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">Tu fisioterapeuta</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl" style={{ fontFamily: "var(--f-bricolage)" }}>
              {specialist.displayName}
            </h2>
            <p className="mt-3 max-w-xl text-[var(--c-ink)]/70">
              Egresado de la {specialist.school ?? ""}, especializado en {specialist.specialty.toLowerCase()}. Cédula profesional {specialist.professionalLicense}.
            </p>
            <ul className="mt-5 grid gap-2 text-sm text-[var(--c-ink)]/70 sm:grid-cols-2">
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--c-accent)]" /> Medición de rango de movimiento en cada sesión.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--c-accent)]" /> Plan de ejercicios progresivo, no genérico.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--c-accent)]" /> Terapia manual y técnicas deportivas.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--c-accent)]" /> Alta cuando recuperas función completa.</li>
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

      {/* Testimonios */}
      <section className="border-t border-[var(--c-ink)]/12 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl" style={{ fontFamily: "var(--f-bricolage)" }}>
            Lo que cuentan los pacientes
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-xl border border-[var(--c-ink)]/12 bg-[var(--c-surface)] p-6">
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-[var(--c-accent)]/30" aria-hidden>
                  <path d="M10 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2H4v2h1a4 4 0 0 0 4-4V9a2 2 0 0 0-2-2h3zm10 0h-5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2h-1v2h1a4 4 0 0 0 4-4V9a2 2 0 0 0-2-2h3z" />
                </svg>
                <blockquote className="mt-4 flex-1 text-[var(--c-ink)]/80">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 text-xs text-[var(--c-ink)]/55">{t.name} · {t.treatment}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Ubicación + horario + pagos */}
      <section id="ubicacion" className="border-t border-[var(--c-ink)]/12 bg-[var(--c-surface)] py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl" style={{ fontFamily: "var(--f-bricolage)" }}>
              Ubicación
            </h2>
            <address className="mt-4 not-italic text-[var(--c-ink)]/70">
              {business.address.street}
              <br />
              {business.address.neighborhood}
              <br />
              {`${business.address.postalCode ?? ""} ${business.address.city}`.trim()}
            </address>
            <p className="mt-2 text-sm text-[var(--c-ink)]/55">{business.address.references}</p>
            <a
              href={business.address.mapsUrl}
              className="mt-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline"
            >
              Ver en Google Maps →
            </a>
            <div className="mt-7 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1.5 text-xs text-[var(--c-ink)]/70">{m}</span>
              ))}
            </div>
            {paymentInstructions.showTransferDetails && (
              <div className="mt-4 rounded-xl border border-[var(--c-ink)]/15 bg-[var(--c-bg)] p-4 text-sm text-[var(--c-ink)]/70">
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

          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl" style={{ fontFamily: "var(--f-bricolage)" }}>
              Horario
            </h2>
            <div className="mt-4 divide-y divide-[var(--c-ink)]/10 rounded-xl border border-[var(--c-ink)]/12 bg-[var(--c-bg)] px-5 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex items-center justify-between py-3">
                  <span className="text-[var(--c-ink)]/70">{row.day}</span>
                  <span className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/40" : "font-semibold"}>{row.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dolor agudo — call-out urgente */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-[var(--c-ink)] p-8 text-[var(--c-bg)] md:flex-row md:items-center md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">Dolor agudo</p>
            <h2 className="mt-2 max-w-md text-2xl font-semibold tracking-tight" style={{ fontFamily: "var(--f-bricolage)" }}>
              Un esguince o bloqueo reciente no espera a la próxima cita.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${business.phone.replace(/\D/g, "")}`}
              className="inline-flex min-h-[44px] items-center rounded-xl bg-[var(--c-accent)] px-6 text-sm font-semibold text-[var(--c-surface)] transition hover:bg-[var(--c-accent-deep)]"
            >
              Llamar ahora
            </a>
            <a
              href={`https://wa.me/${business.whatsapp}`}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-[var(--c-bg)]/30 px-6 text-sm font-semibold transition hover:border-[var(--c-bg)]/60"
            >
              WhatsApp directo
            </a>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <footer id="contacto" className="border-t border-[var(--c-ink)]/12 bg-[var(--c-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl" style={{ fontFamily: "var(--f-bricolage)" }}>
            Agenda tu sesión
          </h2>
          <dl className="mt-7 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <dt className="text-[var(--c-ink)]/50">Teléfono</dt>
              <dd><a href={`tel:${business.phone.replace(/\D/g, "")}`} className="mt-1 inline-flex min-h-[44px] items-center font-semibold text-[var(--c-accent)]">{business.phone}</a></dd>
            </div>
            <div>
              <dt className="text-[var(--c-ink)]/50">WhatsApp</dt>
              <dd><a href={`https://wa.me/${business.whatsapp}`} className="mt-1 inline-flex min-h-[44px] items-center font-semibold text-[var(--c-accent)]">{business.phone}</a></dd>
            </div>
            <div>
              <dt className="text-[var(--c-ink)]/50">Correo</dt>
              <dd><a href={`mailto:${business.email ?? ""}`} className="mt-1 inline-flex min-h-[44px] items-center font-semibold text-[var(--c-accent)]">{business.email ?? ""}</a></dd>
            </div>
            <div>
              <dt className="text-[var(--c-ink)]/50">Redes sociales</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[24px] items-center text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">Instagram</a>}
                {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[24px] items-center text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">Facebook</a>}
                {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[24px] items-center text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">TikTok</a>}
                {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[24px] items-center text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">YouTube</a>}
                {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[24px] items-center text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">LinkedIn</a>}
                {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[24px] items-center text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">Sitio web</a>}
              </dd>
            </div>
          </dl>
        </div>
        <div className="border-t border-[var(--c-ink)]/12 px-6 py-6 text-center text-xs text-[var(--c-ink)]/50">
          {business.name} · {specialist.displayName} · San Ángel, CDMX
        </div>
      </footer>
    </div>
  );
}
