"use client";

import { quicksand, mulish } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import {
  PAYMENT_METHOD_LABEL,
  formatPriceString,
  scheduleFromOpeningHours,
} from "@/lib/profileUtils";

// Alterno 03 de nutriólogo — concepto ORIGINAL "cuaderno / planner semanal de hábitos": la
// página parece una agenda o diario de nutrición amable, con la rejilla de 7 días (Lun–Dom) de
// hábitos como pieza central, notas tipo sticky, stickers de metas y separadores punteados de
// libreta. Ningún otro template usa esta metáfora de planner. Tema 100% por variables CSS; los
// hex solo viven en `PALETTES`. Quicksand (redondeada, amigable) para títulos; Mulish para texto.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "menta-planner",
    name: "Menta planner",
    swatch: "#237a5d",
    surface: "#eef6f1",
    ink: "#1f2e27",
    vars: {
      "--c-bg": "#eef6f1",
      "--c-surface": "#ffffff",
      "--c-ink": "#1f2e27",
      "--c-accent": "#237a5d",
      "--c-accent-deep": "#1b5f48",
      "--c-soft": "#d7ede3",
    },
  },
  {
    id: "durazno-planner",
    name: "Durazno planner",
    swatch: "#b04f30",
    surface: "#fcf2ec",
    ink: "#33231c",
    vars: {
      "--c-bg": "#fcf2ec",
      "--c-surface": "#ffffff",
      "--c-ink": "#33231c",
      "--c-accent": "#b04f30",
      "--c-accent-deep": "#8f3f24",
      "--c-soft": "#f7ddcf",
    },
  },
  {
    id: "lavanda-planner",
    name: "Lavanda planner",
    swatch: "#6a5ab0",
    surface: "#f2f0f9",
    ink: "#28243a",
    vars: {
      "--c-bg": "#f2f0f9",
      "--c-surface": "#ffffff",
      "--c-ink": "#28243a",
      "--c-accent": "#6a5ab0",
      "--c-accent-deep": "#53458f",
      "--c-soft": "#e2def2",
    },
  },
] as const;

export const DEFAULT_PALETTE_ID = PALETTES[0].id;


type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "sesión", from: "desde", consult: "a consulta" };









const round = { fontFamily: "var(--f-quicksand)" } as const;

// La rejilla de la semana: cada día con un par de hábitos amables de ejemplo (ilustrativos).
// El último (Domingo) es de descanso, para variar el tono. Los checks son glifos estáticos.
const weekPlan: { day: string; short: string; habits: string[]; done: boolean[]; rest?: boolean }[] = [
  { day: "Lunes", short: "Lun", habits: ["Desayuno con proteína", "2 L de agua", "Caminata 20 min"], done: [true, true, false] },
  { day: "Martes", short: "Mar", habits: ["Verduras en la comida", "2 L de agua", "Dormir 7–8 h"], done: [true, false, true] },
  { day: "Miércoles", short: "Mié", habits: ["Fruta de colación", "Comer sin pantallas", "Estirar 10 min"], done: [false, true, false] },
  { day: "Jueves", short: "Jue", habits: ["Desayuno con proteína", "2 L de agua", "Caminata 20 min"], done: [true, true, true] },
  { day: "Viernes", short: "Vie", habits: ["Plato mitad verduras", "Menos azúcar añadida", "Movimiento 30 min"], done: [true, false, false] },
  { day: "Sábado", short: "Sáb", habits: ["Comida en familia", "Hidratación constante", "Paseo al aire libre"], done: [false, true, false] },
  { day: "Domingo", short: "Dom", habits: ["Día flexible y consciente", "Preparar la semana", "Descanso activo"], done: [false, false, false], rest: true },
];

// Notas tipo sticky sobre cómo trabajamos (en Quicksand, voz cercana).
const notes = [
  { title: "Sin dietas imposibles", body: "Nada de listas de prohibidos. Ajustamos lo que ya comes para que lo puedas sostener." },
  { title: "Comida de verdad", body: "Tortillas, frijoles, fruta, antojos incluidos con medida. Real, no de revista." },
  { title: "A tu ritmo", body: "Metas chiquitas cada semana. Si una falla, la retomamos sin culpa el lunes." },
];

// Check estático: círculo con palomita si done, círculo vacío punteado si pendiente.
function HabitCheck({ done }: { done: boolean }) {
  return done ? (
    <span
      className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--c-accent)] text-white"
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
  ) : (
    <span
      className="block h-5 w-5 shrink-0 rounded-full border-2 border-dashed border-[var(--c-ink)]/30"
      aria-hidden
    />
  );
}

export function NutriologoTemplate03({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
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

  const regular = services.filter((s) => !s.isUrgency);
  const urgency = services.find((s) => s.isUrgency);

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
      className={`${quicksand.variable} ${mulish.variable} min-h-screen bg-[var(--c-bg)] pb-28 text-[var(--c-ink)]`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-mulish)" }}
    >
      {isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} />
      )}

      {/* Header amable */}
      <header className="mx-auto max-w-5xl px-5 pt-8 sm:px-6">
        <div className="flex items-center justify-between gap-4 rounded-full bg-[var(--c-surface)] px-5 py-3 shadow-sm sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--c-soft)] text-[var(--c-accent)]" aria-hidden>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 4v13" /><path d="M11 9h5M11 13h5" />
              </svg>
            </span>
            <span className="text-lg font-bold" style={round}>{business.name}</span>
          </div>
          <a
            href={`https://wa.me/${business.whatsapp}`}
            className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--c-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--c-accent-deep)]"
            style={round}
          >
            Agendar consulta
          </a>
        </div>
      </header>

      {/* Hero corto */}
      <section className="mx-auto max-w-5xl px-5 pt-12 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--c-accent)]" style={round}>
          {specialist.specialty}
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-[1.15] sm:text-4xl md:text-5xl" style={round}>
          Tu semana, planeada con calma y comida de verdad.
        </h1>
        <p className="mt-4 max-w-xl text-[var(--c-ink)]/70">{specialist.shortDescription}</p>

        {/* Stickers de metas */}
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--c-soft)] px-4 py-2 text-sm font-semibold text-[var(--c-accent-deep)]" style={round}>
            <span className="text-base" aria-hidden>✦</span> {specialist.yearsExperience?.toString() ?? "–"} años acompañando
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--c-soft)] px-4 py-2 text-sm font-semibold text-[var(--c-accent-deep)]" style={round}>
            <span className="text-base" aria-hidden>♡</span> {specialist.patientsServed?.toLocaleString("es-MX") ?? "–"} pacientes
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-[var(--c-ink)]/25 px-4 py-2 text-sm font-semibold text-[var(--c-ink)]/70" style={round}>
            {specialist.displayName}
          </span>
        </div>
        {specialist.biography && (
          <p className="mt-4 max-w-xl mx-auto text-sm leading-relaxed text-[var(--c-ink)]/70">{specialist.biography}</p>
        )}
        {specialist.school && (
          <p className="mt-2 text-xs text-[var(--c-ink)]/55">Formación: {specialist.school}</p>
        )}
        {specialist.certifications && specialist.certifications.length > 0 && (
          <ul className="mt-2 mx-auto max-w-sm list-disc list-inside space-y-1 text-xs text-[var(--c-ink)]/65 text-left">
            {specialist.certifications.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        )}
      </section>

      {/* PLANNER SEMANAL — pieza central */}
      <section className="mx-auto mt-12 max-w-5xl px-5 sm:px-6">
        <div className="rounded-[2rem] bg-[var(--c-surface)] p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-dotted border-[var(--c-ink)]/15 pb-4">
            <div>
              <h2 className="text-2xl font-bold" style={round}>Mi semana de hábitos</h2>
              <p className="mt-1 text-sm text-[var(--c-ink)]/60">
                Así se ve un plan real: metas pequeñas, marcadas día con día.
              </p>
            </div>
            <span className="rounded-full bg-[var(--c-soft)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--c-accent-deep)]" style={round}>
              Ejemplo
            </span>
          </div>

          {/* Desktop: 7 columnas; tablet: scroll horizontal; móvil: apilado */}
          <div className="mt-5 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible md:grid-cols-4 lg:grid-cols-7 lg:gap-3">
            {weekPlan.map((d) => (
              <article
                key={d.day}
                className={`flex w-60 shrink-0 flex-col rounded-2xl border p-3.5 sm:w-auto ${
                  d.rest
                    ? "border-dashed border-[var(--c-accent)]/40 bg-[var(--c-soft)]/50"
                    : "border-[var(--c-ink)]/10 bg-[var(--c-bg)]"
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-[var(--c-accent)]" style={round}>{d.short}</span>
                  <span className="text-[0.65rem] uppercase tracking-wide text-[var(--c-ink)]/40">{d.day}</span>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {d.habits.map((h, i) => (
                    <li key={h} className="flex items-start gap-2">
                      <HabitCheck done={d.done[i]} />
                      <span className={`text-[0.8rem] leading-snug ${d.done[i] ? "text-[var(--c-ink)]/55 line-through" : "text-[var(--c-ink)]/80"}`}>
                        {h}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Tus planes */}
      <section id="planes" className="mx-auto mt-14 max-w-5xl px-5 sm:px-6">
        <h2 className="text-2xl font-bold" style={round}>Tus planes</h2>
        <p className="mt-1 text-sm text-[var(--c-ink)]/60">Elige por dónde empezar. Todo es ajustable a tu vida.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regular.map((s) => (
            <article key={s.name} className="flex flex-col rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] p-5 shadow-sm">
              <h3 className="font-bold leading-snug" style={round}>{s.name}</h3>
              <p className="mt-2 flex-1 text-sm text-[var(--c-ink)]/65">{s.description}</p>
              <div className="mt-4 flex items-end justify-between border-t border-dashed border-[var(--c-ink)]/15 pt-3">
                <span className="text-lg font-bold text-[var(--c-accent)]" style={round}>{s.price}</span>
                <span className="text-xs uppercase tracking-wide text-[var(--c-ink)]/45">{priceTypeLabel[s.priceType]}</span>
              </div>
            </article>
          ))}

          {urgency && (
            <article className="flex flex-col rounded-2xl border border-[var(--c-accent)]/30 bg-[var(--c-accent)]/8 p-5 shadow-sm">
              <span className="self-start rounded-full bg-[var(--c-accent)] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white" style={round}>
                Urgente
              </span>
              <h3 className="mt-3 font-bold leading-snug" style={round}>{urgency.name}</h3>
              <p className="mt-2 flex-1 text-sm text-[var(--c-ink)]/70">{urgency.description}</p>
              <div className="mt-4 flex items-end justify-between border-t border-dashed border-[var(--c-accent)]/30 pt-3">
                <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="inline-flex min-h-[44px] items-center text-sm font-bold text-[var(--c-accent-deep)]" style={round}>
                  Llamar ahora →
                </a>
                <span className="text-xs uppercase tracking-wide text-[var(--c-ink)]/45">{priceTypeLabel[urgency.priceType]}</span>
              </div>
            </article>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {paymentMethods.map((m) => (
            <span key={m} className="rounded-full border border-[var(--c-ink)]/15 bg-[var(--c-surface)] px-3 py-1 text-xs font-semibold text-[var(--c-ink)]/70" style={round}>
              {m}
            </span>
          ))}
        </div>
        {paymentInstructions.showTransferDetails && (
          <div className="mt-4 rounded-2xl border border-[var(--c-ink)]/15 bg-[var(--c-surface)] p-4 text-sm text-[var(--c-ink)]/70">
            <p className="font-bold text-[var(--c-ink)]" style={round}>Transferencia bancaria</p>
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
      </section>

      {/* Notas / cómo trabajamos — bloque tipo libreta */}
      <section className="mx-auto mt-14 max-w-5xl px-5 sm:px-6">
        <div className="rounded-[2rem] bg-[var(--c-soft)] p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <span className="text-[var(--c-accent)]" aria-hidden>✎</span>
            <h2 className="text-xl font-bold" style={round}>Cómo trabajamos</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {notes.map((n) => (
              <div key={n.title} className="rounded-2xl bg-[var(--c-surface)] p-4 shadow-sm">
                <p className="text-sm font-bold text-[var(--c-accent-deep)]" style={round}>{n.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--c-ink)]/70" style={round}>{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="mx-auto mt-14 max-w-5xl px-5 sm:px-6">
        <h2 className="text-2xl font-bold" style={round}>Lo que cuentan</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] p-5 shadow-sm">
              <span className="text-2xl leading-none text-[var(--c-accent)]/50" aria-hidden>“</span>
              <blockquote className="mt-1 text-[var(--c-ink)]/80" style={round}>{t.quote}</blockquote>
              <figcaption className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--c-ink)]/50">
                {t.name} · {t.treatment}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Footer estilo planner */}
      <footer id="contacto" className="mx-auto mt-14 max-w-5xl px-5 sm:px-6">
        <div className="rounded-[2rem] bg-[var(--c-surface)] p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Horario como tarjeta semanal */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--c-accent)]" style={round}>Horario</h3>
              <dl className="mt-3 space-y-2 text-sm">
                {schedule.map((row) => (
                  <div key={row.day} className="flex items-center justify-between gap-3 border-b border-dashed border-[var(--c-ink)]/12 pb-2">
                    <dt className="text-[var(--c-ink)]/70">{row.day}</dt>
                    <dd className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/40" : "font-semibold"}>{row.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Dirección */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--c-accent)]" style={round}>Dónde estamos</h3>
              <address className="mt-3 not-italic text-sm leading-relaxed text-[var(--c-ink)]/70">
                {business.address.street}<br />
                {business.address.neighborhood} · {`${business.address.postalCode ?? ""} ${business.address.city}`.trim()}<br />
                {business.address.references}
              </address>
              <a href={business.address.mapsUrl} className="mt-3 inline-flex min-h-[44px] items-center text-sm font-bold text-[var(--c-accent)] underline-offset-4 hover:underline" style={round}>
                Ver en Google Maps →
              </a>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--c-accent)]" style={round}>Contacto</h3>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="inline-flex min-h-[44px] items-center gap-2">
                  <span className="text-[var(--c-ink)]/50">Tel</span>
                  <span className="font-semibold text-[var(--c-accent)]">{business.phone}</span>
                </a>
                <a href={`https://wa.me/${business.whatsapp}`} className="inline-flex min-h-[44px] items-center gap-2">
                  <span className="text-[var(--c-ink)]/50">WhatsApp</span>
                  <span className="font-semibold text-[var(--c-accent)]">{business.phone}</span>
                </a>
                <a href={`mailto:${business.email ?? ""}`} className="inline-flex min-h-[44px] items-center gap-2">
                  <span className="text-[var(--c-ink)]/50">Correo</span>
                  <span className="break-all font-semibold text-[var(--c-accent)]">{business.email ?? ""}</span>
                </a>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]">Instagram</a>}
                  {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]">Facebook</a>}
                  {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]">TikTok</a>}
                  {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]">YouTube</a>}
                  {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]">LinkedIn</a>}
                  {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]">Sitio web</a>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t-2 border-dotted border-[var(--c-ink)]/15 pt-5 text-center text-xs text-[var(--c-ink)]/50">
            {business.name} · {specialist.displayName} · Céd. {specialist.professionalLicense} · {specialist.school ?? ""}
          </div>
        </div>
      </footer>
    </div>
  );
}
