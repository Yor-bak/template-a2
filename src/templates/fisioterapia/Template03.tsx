"use client";

import { gabarito, beVietnam } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import {
  PAYMENT_METHOD_LABEL,
  formatPriceString,
  scheduleFromOpeningHours,
} from "@/lib/profileUtils";

// Alterno 03 de fisioterapia — concepto ORIGINAL: un "PROGRAMA DE EJERCICIO" tipo app de fitness.
// La página se siente como la pantalla de un programa de rehabilitación en una app móvil de
// entrenamiento, llevada a un landing: header tipo app con pill "Empezar", una card hero de
// "programa de hoy" con barra de progreso, y el proceso de rehabilitación renderizado como un
// feed de cards de ejercicio/sesión con chips de métricas (series·reps, duración, rango) y
// números grandes en Gabarito. Ninguna otra plantilla del repo usa este layout de app de fitness.
// Tema 100% por variables CSS; sin hex fuera del array de paletas. Tema claro y enérgico.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "electrico",
    name: "Eléctrico",
    swatch: "#4f46e5",
    surface: "#f3f5f9",
    ink: "#161a24",
    vars: {
      "--c-bg": "#f3f5f9",
      "--c-surface": "#ffffff",
      "--c-ink": "#161a24",
      "--c-accent": "#4f46e5",
      "--c-accent-deep": "#3f37c4",
      "--c-soft": "#e5e3fb",
    },
  },
  {
    id: "magma",
    name: "Magma",
    swatch: "#b83d1a",
    surface: "#fbf3ef",
    ink: "#2a1813",
    vars: {
      "--c-bg": "#fbf3ef",
      "--c-surface": "#ffffff",
      "--c-ink": "#2a1813",
      "--c-accent": "#b83d1a",
      "--c-accent-deep": "#932f12",
      "--c-soft": "#f7d9cd",
    },
  },
  {
    id: "lima-neon",
    name: "Lima neón",
    swatch: "#4a7c1a",
    surface: "#f1f7ec",
    ink: "#1b2614",
    vars: {
      "--c-bg": "#f1f7ec",
      "--c-surface": "#ffffff",
      "--c-ink": "#1b2614",
      "--c-accent": "#4a7c1a",
      "--c-accent-deep": "#395f13",
      "--c-soft": "#e0eed0",
    },
  },
] as const;

export const DEFAULT_PALETTE_ID = PALETTES[0].id;

const clinic = {
  name: "Núcleo Fisioterapia",
  doctor: "Fis. Tomás Vidal Esparza",
  specialty: "Rehabilitación física y deportiva",
  school: "Escuela Nacional de Medicina y Homeopatía, IPN",
  license: "5390271",
  experienceYears: "10",
  patients: "2,100",
  welcomeMessage:
    "Rehabilitación con objetivos medibles: rango de movimiento, fuerza y vuelta a tu actividad, sesión por sesión.",
  address: {
    street: "Av. Revolución 1450, local 3",
    neighborhood: "San Ángel, Álvaro Obregón",
    zip: "01000 CDMX",
    reference: "Junto al gimnasio Vértice",
    mapsUrl: "https://maps.google.com/?q=Av+Revolucion+1450+CDMX",
  },
  phone: "55 7710 4482",
  phoneHref: "5577104482",
  whatsapp: "https://wa.me/525577104482",
  email: "contacto@nucleofisio.mx",
  social: { facebook: "https://facebook.com", instagram: "https://instagram.com", instagramHandle: "@nucleofisio" },
};

type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "por sesión", from: "desde", consult: "a consulta" };









// El programa como feed de "ejercicios/sesiones" — las 4 etapas de recuperación con métricas
// plausibles de rehabilitación (series·reps, duración, rango articular) y estado de avance.
type Block = {
  step: string;
  title: string;
  detail: string;
  metrics: string[];
  status: "done" | "active" | "todo";
};
const programBlocks: Block[] = [
  {
    step: "01",
    title: "Valoración",
    detail: "Medimos movilidad, fuerza y dolor para fijar tu línea base.",
    metrics: ["45 min", "rango: inicial", "1 sesión"],
    status: "done",
  },
  {
    step: "02",
    title: "Plan",
    detail: "Definimos objetivos medibles y el número de sesiones estimado.",
    metrics: ["objetivos: 4", "carga: ligera", "revisión semanal"],
    status: "done",
  },
  {
    step: "03",
    title: "Terapia",
    detail: "Terapia manual y ejercicio dirigido, con ajuste semana a semana.",
    metrics: ["3 series · 12 reps", "rango: 0–90°", "2 sesiones/sem"],
    status: "active",
  },
  {
    step: "04",
    title: "Alta funcional",
    detail: "Pruebas de rendimiento y alta cuando recuperas función completa.",
    metrics: ["rango: completo", "fuerza: 100%", "test final"],
    status: "todo",
  },
];

function StatusBadge({ status }: { status: Block["status"] }) {
  if (status === "done") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--c-accent)] text-[var(--c-surface)]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 13l4 4L19 7" />
        </svg>
        <span className="sr-only">Completado</span>
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--c-soft)]">
        <span className="absolute inline-flex h-7 w-7 animate-ping rounded-full bg-[var(--c-accent)]/30" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--c-accent)]" />
        <span className="sr-only">En curso</span>
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--c-ink)]/20 text-xs font-bold text-[var(--c-ink)]/40">
      <span aria-hidden>·</span>
      <span className="sr-only">Pendiente</span>
    </span>
  );
}

function Stars() {
  return (
    <span className="flex gap-0.5 text-[var(--c-accent)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.8 6.2 20.8l1.1-6.4L2.6 9.8l6.5-.9z" />
        </svg>
      ))}
      <span className="sr-only">5 de 5 estrellas</span>
    </span>
  );
}

export function FisioterapiaTemplate03({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
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
    { value: clinic.experienceYears, label: "años de práctica" },
    { value: clinic.patients, label: "pacientes rehabilitados" },
    { value: clinic.license, label: "cédula profesional" },
  ];

  return (
    <div
      className={`${gabarito.variable} ${beVietnam.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)] pb-28`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-bevietnam)" }}
    >
      {!isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} />
      )}

      {/* Header tipo app */}
      <header className="sticky top-0 z-30 border-b border-[var(--c-ink)]/10 bg-[var(--c-bg)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--c-accent)] text-[var(--c-surface)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6.5 6.5v11M17.5 6.5v11M4 9.5v5M20 9.5v5M6.5 12h11" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--f-gabarito)" }}>
              {clinic.name}
            </span>
          </div>
          <a
            href={clinic.whatsapp}
            className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--c-accent)] px-6 text-sm font-bold text-[var(--c-surface)] transition hover:bg-[var(--c-accent-deep)]"
            style={{ fontFamily: "var(--f-gabarito)" }}
          >
            Empezar
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5">
        {/* Hero card "programa de hoy" — estilo pantalla de app */}
        <section className="pt-7">
          <div className="overflow-hidden rounded-3xl bg-[var(--c-accent)] text-[var(--c-surface)] shadow-xl shadow-[var(--c-accent)]/20">
            <div className="px-7 pt-7 pb-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--c-surface)]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--c-surface)]" />
                  Tu programa de hoy
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl" style={{ fontFamily: "var(--f-gabarito)" }}>
                Recupera tu rango, sesión por sesión.
              </h1>
              <p className="mt-4 max-w-md text-[var(--c-surface)]/85">{clinic.welcomeMessage}</p>

              {/* Barra de progreso del programa */}
              <div className="mt-7">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-semibold text-[var(--c-surface)]/90">Semana 6 de 10</span>
                  <span className="text-2xl font-extrabold" style={{ fontFamily: "var(--f-gabarito)" }}>
                    60%
                  </span>
                </div>
                <div
                  className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[var(--c-surface)]/25"
                  role="progressbar"
                  aria-valuenow={60}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Avance del programa de rehabilitación"
                >
                  <span className="block h-full rounded-full bg-[var(--c-surface)]" style={{ width: "60%" }} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 border-t border-[var(--c-surface)]/15 px-7 py-5">
              <a
                href={clinic.whatsapp}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[var(--c-surface)] px-6 text-sm font-bold text-[var(--c-accent-deep)] transition hover:opacity-90"
                style={{ fontFamily: "var(--f-gabarito)" }}
              >
                Agendar sesión
              </a>
              <a
                href={`tel:${clinic.phoneHref}`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--c-surface)]/40 px-6 text-sm font-bold transition hover:border-[var(--c-surface)]"
                style={{ fontFamily: "var(--f-gabarito)" }}
              >
                Llamar
              </a>
            </div>
          </div>
        </section>

        {/* Stats / progreso — tiles tipo app */}
        <section className="mt-6 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] px-4 py-5 text-center">
              <p className="text-3xl font-extrabold text-[var(--c-accent)] md:text-4xl" style={{ fontFamily: "var(--f-gabarito)" }}>
                {s.value}
              </p>
              <p className="mt-1.5 text-[11px] uppercase leading-tight tracking-wide text-[var(--c-ink)]/55">{s.label}</p>
            </div>
          ))}
        </section>

        {/* EL PROGRAMA — firma del template: feed de cards de ejercicio/sesión */}
        <section id="programa" className="mt-10 scroll-mt-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--c-accent)]">El programa</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl" style={{ fontFamily: "var(--f-gabarito)" }}>
                Tu ruta de recuperación
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--c-soft)] px-3 py-1 text-xs font-bold text-[var(--c-accent-deep)]">
              4 bloques
            </span>
          </div>

          <ol className="mt-6 space-y-3">
            {programBlocks.map((b) => (
              <li
                key={b.step}
                className={`rounded-2xl border bg-[var(--c-surface)] p-5 ${
                  b.status === "active" ? "border-[var(--c-accent)]/40 ring-1 ring-[var(--c-accent)]/20" : "border-[var(--c-ink)]/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="text-2xl font-extrabold tabular-nums text-[var(--c-ink)]/25"
                    style={{ fontFamily: "var(--f-gabarito)" }}
                    aria-hidden
                  >
                    {b.step}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--f-gabarito)" }}>
                        {b.title}
                      </h3>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="mt-1 text-sm text-[var(--c-ink)]/65">{b.detail}</p>
                    <div className="mt-3.5 flex flex-wrap gap-2 border-t border-[var(--c-ink)]/8 pt-3.5">
                      {b.metrics.map((m) => (
                        <span
                          key={m}
                          className="inline-flex items-center rounded-lg bg-[var(--c-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--c-ink)]/75"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Sesiones y tarifas — filas/cards compactas tipo app */}
        <section id="servicios" className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--c-accent)]">Tarifas</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl" style={{ fontFamily: "var(--f-gabarito)" }}>
                Sesiones y tarifas
              </h2>
            </div>
          </div>

          {/* Alerta urgencia destacada */}
          {services
            .filter((s) => s.isUrgency)
            .map((s) => (
              <div key={s.name} className="mt-6 overflow-hidden rounded-2xl bg-[var(--c-accent)] text-[var(--c-surface)]">
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--c-surface)]/20">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--c-surface)]/80">Sin cita previa</p>
                      <h3 className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--f-gabarito)" }}>{s.name}</h3>
                      <p className="mt-1 text-sm text-[var(--c-surface)]/85">{s.description}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${clinic.phoneHref}`}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[var(--c-surface)] px-6 text-sm font-bold text-[var(--c-accent-deep)] transition hover:opacity-90"
                    style={{ fontFamily: "var(--f-gabarito)" }}
                  >
                    Llamar ahora
                  </a>
                </div>
              </div>
            ))}

          <ul className="mt-4 divide-y divide-[var(--c-ink)]/8 overflow-hidden rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)]">
            {services
              .filter((s) => !s.isUrgency)
              .map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <h3 className="font-bold" style={{ fontFamily: "var(--f-gabarito)" }}>{s.name}</h3>
                    <p className="mt-0.5 text-sm text-[var(--c-ink)]/60">{s.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-extrabold text-[var(--c-accent)]" style={{ fontFamily: "var(--f-gabarito)" }}>{s.price}</p>
                    <p className="text-[11px] uppercase tracking-wide text-[var(--c-ink)]/50">{priceTypeLabel[s.priceType]}</p>
                  </div>
                </li>
              ))}
          </ul>
        </section>

        {/* Tu fisioterapeuta — mini bio */}
        <section className="mt-12">
          <div className="rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] p-6">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--c-soft)] text-[var(--c-accent)]" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--c-accent)]">Tu fisioterapeuta</p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight" style={{ fontFamily: "var(--f-gabarito)" }}>{clinic.doctor}</h2>
              </div>
            </div>
            <p className="mt-4 text-[var(--c-ink)]/70">
              Egresado de la {clinic.school}, especializado en {clinic.specialty.toLowerCase()}. Cédula profesional {clinic.license}.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-[var(--c-ink)]/70 sm:grid-cols-2">
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--c-accent)]" /> Medición de rango en cada sesión.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--c-accent)]" /> Plan progresivo, no genérico.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--c-accent)]" /> Terapia manual y deportiva.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--c-accent)]" /> Alta por función, no por sesiones.</li>
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

        {/* Testimonios — review cards tipo app */}
        <section className="mt-12">
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl" style={{ fontFamily: "var(--f-gabarito)" }}>
            Reseñas de pacientes
          </h2>
          <div className="mt-6 space-y-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] p-5">
                <div className="flex items-center justify-between gap-3">
                  <figcaption className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--c-soft)] text-sm font-bold text-[var(--c-accent-deep)]" aria-hidden style={{ fontFamily: "var(--f-gabarito)" }}>
                      {t.name.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-sm font-bold" style={{ fontFamily: "var(--f-gabarito)" }}>{t.name}</span>
                      <span className="block text-xs text-[var(--c-ink)]/55">{t.treatment}</span>
                    </span>
                  </figcaption>
                  <Stars />
                </div>
                <blockquote className="mt-3 text-[var(--c-ink)]/80">&ldquo;{t.quote}&rdquo;</blockquote>
              </figure>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contacto" className="mt-12 border-t border-[var(--c-ink)]/10 bg-[var(--c-surface)]">
        <div className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl" style={{ fontFamily: "var(--f-gabarito)" }}>
            Agenda tu sesión
          </h2>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            {/* Horario */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--c-accent)]">Horario</h3>
              <div className="mt-3 divide-y divide-[var(--c-ink)]/8 rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-bg)] px-4 text-sm">
                {schedule.map((row) => (
                  <div key={row.day} className="flex items-center justify-between py-3">
                    <span className="text-[var(--c-ink)]/70">{row.day}</span>
                    <span className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/40" : "font-bold"} style={{ fontFamily: "var(--f-gabarito)" }}>{row.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dirección */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--c-accent)]">Dónde estamos</h3>
              <address className="mt-3 not-italic text-[var(--c-ink)]/70">
                {clinic.address.street}
                <br />
                {clinic.address.neighborhood}
                <br />
                {clinic.address.zip}
              </address>
              <p className="mt-1 text-sm text-[var(--c-ink)]/55">{clinic.address.reference}</p>
              <a
                href={clinic.address.mapsUrl}
                className="mt-3 inline-flex min-h-[44px] items-center text-sm font-bold text-[var(--c-accent)] underline-offset-4 hover:underline"
                style={{ fontFamily: "var(--f-gabarito)" }}
              >
                Ver en Google Maps →
              </a>
            </div>
          </div>

          {/* Pagos */}
          <div className="mt-7">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--c-accent)]">Métodos de pago</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--c-ink)]/70">{m}</span>
              ))}
            </div>
            {paymentInstructions.showTransferDetails && (
              <div className="mt-4 rounded-xl border border-[var(--c-ink)]/15 bg-[var(--c-bg)] p-4 text-sm text-[var(--c-ink)]/70">
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

          {/* Contacto */}
          <div className="mt-7 grid gap-5 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="text-[var(--c-ink)]/50">Teléfono</div>
              <a href={`tel:${clinic.phoneHref}`} className="mt-1 inline-flex min-h-[44px] items-center font-bold text-[var(--c-accent)]">{clinic.phone}</a>
            </div>
            <div>
              <div className="text-[var(--c-ink)]/50">WhatsApp</div>
              <a href={clinic.whatsapp} className="mt-1 inline-flex min-h-[44px] items-center font-bold text-[var(--c-accent)]">{clinic.phone}</a>
            </div>
            <div>
              <div className="text-[var(--c-ink)]/50">Correo</div>
              <a href={`mailto:${clinic.email}`} className="mt-1 inline-flex min-h-[44px] items-center font-bold text-[var(--c-accent)]">{clinic.email}</a>
            </div>
            <div>
              <div className="text-[var(--c-ink)]/50">Redes sociales</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[24px] items-center text-sm font-bold text-[var(--c-accent)] underline-offset-4 hover:underline">Instagram</a>}
                {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[24px] items-center text-sm font-bold text-[var(--c-accent)] underline-offset-4 hover:underline">Facebook</a>}
                {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[24px] items-center text-sm font-bold text-[var(--c-accent)] underline-offset-4 hover:underline">TikTok</a>}
                {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[24px] items-center text-sm font-bold text-[var(--c-accent)] underline-offset-4 hover:underline">YouTube</a>}
                {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[24px] items-center text-sm font-bold text-[var(--c-accent)] underline-offset-4 hover:underline">LinkedIn</a>}
                {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[24px] items-center text-sm font-bold text-[var(--c-accent)] underline-offset-4 hover:underline">Sitio web</a>}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--c-ink)]/10 px-5 py-6 text-center text-xs text-[var(--c-ink)]/50">
          {clinic.name} · {clinic.doctor} · San Ángel, CDMX
        </div>
      </footer>
    </div>
  );
}
