"use client";

import { useState } from "react";
import { libreFranklin, hankenGrotesk } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";

// Alterno C — rediseño institucional tipo hospital veterinario (ref. hospitalveterinariok-lev.com):
// barra de utilidad con horario + urgencias 24h, rejilla amplia de especialidades con iconos,
// banda de "cultura de prevención", publicaciones y CTA de cita. Tono médico-corporativo serio,
// opuesto al bento juguetón del alterno B. Tema por variables CSS con 3 paletas hospitalarias.
const palettes = [
  {
    name: "Azul hospital",
    swatch: "#1c5fa8",
    surface: "#f4f7fb",
    ink: "#15212e",
    vars: {
      "--c-bg": "#f4f7fb",
      "--c-surface": "#ffffff",
      "--c-ink": "#15212e",
      "--c-primary": "#1c5fa8",
      "--c-primary-deep": "#154a82",
      "--c-soft": "#e3edf8",
      "--c-urgent": "#d83b34",
    },
  },
  {
    name: "Verde salud",
    swatch: "#1f7a52",
    surface: "#f1f8f4",
    ink: "#14271f",
    vars: {
      "--c-bg": "#f1f8f4",
      "--c-surface": "#ffffff",
      "--c-ink": "#14271f",
      "--c-primary": "#1f7a52",
      "--c-primary-deep": "#155f3f",
      "--c-soft": "#e0f0e8",
      "--c-urgent": "#d83b34",
    },
  },
  {
    name: "Teal profundo",
    swatch: "#0e6b7a",
    surface: "#eff6f7",
    ink: "#102a2e",
    vars: {
      "--c-bg": "#eff6f7",
      "--c-surface": "#ffffff",
      "--c-ink": "#102a2e",
      "--c-primary": "#0e6b7a",
      "--c-primary-deep": "#0a5260",
      "--c-soft": "#def0f2",
      "--c-urgent": "#d83b34",
    },
  },
] as const;

const clinic = {
  name: "Hospital Veterinario Huella Sana",
  doctor: "MVZ. Ariadna Robles Cuéllar",
  specialty: "Hospital veterinario de pequeñas especies · 24 horas",
  school: "Facultad de Medicina Veterinaria y Zootecnia, UNAM",
  license: "4471829",
  experienceYears: "9",
  patients: "3,600",
  welcomeMessage:
    "Atención hospitalaria para perros y gatos con cultura de prevención: consulta, cirugía, hospitalización, laboratorio e imagenología bajo un mismo techo, con urgencias las 24 horas.",
  address: {
    street: "Calle Pino Suárez 88",
    neighborhood: "Coyoacán Centro",
    zip: "04000 CDMX",
    reference: "Frente al Mercado de Coyoacán",
    mapsUrl: "https://maps.google.com/?q=Pino+Suarez+88+CDMX",
  },
  phone: "55 3398 1120",
  phoneHref: "5533981120",
  whatsapp: "https://wa.me/525533981120",
  email: "hola@huellasana.mx",
  social: { facebook: "https://facebook.com", instagram: "https://instagram.com", instagramHandle: "@huellasana" },
};

const schedule = [
  { day: "Lunes a viernes", hours: "9:00 – 20:00" },
  { day: "Sábado", hours: "9:00 – 17:00" },
  { day: "Domingo", hours: "10:00 – 14:00" },
  { day: "Urgencias", hours: "24 horas" },
];

const stats = [
  { value: clinic.experienceYears + " años", label: "de operación" },
  { value: clinic.patients, label: "pacientes en expediente" },
  { value: "24/7", label: "urgencias" },
  { value: "12", label: "especialidades" },
];

type Svg = { className?: string };
const IconStethoscope = ({ className = "" }: Svg) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 3v5a4 4 0 0 0 8 0V3" /><path d="M9 16a5 5 0 0 0 10 0v-2" /><circle cx="19" cy="11" r="2" />
  </svg>
);
const IconSyringe = ({ className = "" }: Svg) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 2l4 4M17 7l-1.5-1.5M14 6L6 14l-2 6 6-2 8-8M8 12l4 4" />
  </svg>
);
const IconScalpel = ({ className = "" }: Svg) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 20L14 10l6-6-2 8-8 8z" /><path d="M4 20l4-4" />
  </svg>
);
const IconBed = ({ className = "" }: Svg) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 7v12M3 13h18v6M21 13a5 5 0 0 0-5-5H9v5" /><circle cx="7" cy="11" r="1.4" />
  </svg>
);
const IconFlask = ({ className = "" }: Svg) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" /><path d="M7 15h10" />
  </svg>
);
const IconScan = ({ className = "" }: Svg) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2" /><path d="M4 12h16" />
  </svg>
);
const IconTooth = ({ className = "" }: Svg) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M7 3c-2.5 0-4 2-4 5 0 4 2 5 2.5 9 .3 2.5 2.5 2.5 2.8 0 .2-2 .7-3 1.7-3s1.5 1 1.7 3c.3 2.5 2.5 2.5 2.8 0C15.5 13 17.5 12 17.5 8c0-3-1.5-5-4-5-1.5 0-2.5 1-3.5 1S8.5 3 7 3z" />
  </svg>
);
const IconDroplet = ({ className = "" }: Svg) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10z" />
  </svg>
);
const IconScissors = ({ className = "" }: Svg) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8 8l12 8M8 16L20 8" />
  </svg>
);
const IconBowl = ({ className = "" }: Svg) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 11h18a9 9 0 0 1-18 0z" /><path d="M12 11V7M12 7a2 2 0 1 1 2-2" />
  </svg>
);
const IconShield = ({ className = "" }: Svg) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" />
  </svg>
);
const IconClock = ({ className = "" }: Svg) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);

const Paw = ({ className = "" }: Svg) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <ellipse cx="12" cy="16.2" rx="5.2" ry="4.3" />
    <ellipse cx="5.3" cy="10.4" rx="2.1" ry="2.6" transform="rotate(-25 5.3 10.4)" />
    <ellipse cx="18.7" cy="10.4" rx="2.1" ry="2.6" transform="rotate(25 18.7 10.4)" />
    <ellipse cx="8.6" cy="6.2" rx="1.8" ry="2.3" transform="rotate(-12 8.6 6.2)" />
    <ellipse cx="15.4" cy="6.2" rx="1.8" ry="2.3" transform="rotate(12 15.4 6.2)" />
  </svg>
);

const services: { Icon: (p: Svg) => React.JSX.Element; title: string; desc: string; urgent?: boolean }[] = [
  { Icon: IconStethoscope, title: "Consulta general", desc: "Revisión completa y cartilla al día." },
  { Icon: IconSyringe, title: "Vacunación", desc: "Esquema múltiple, rabia y desparasitación." },
  { Icon: IconScalpel, title: "Cirugía", desc: "Esterilización y cirugía de tejidos blandos." },
  { Icon: IconBed, title: "Hospitalización", desc: "Monitoreo permanente y cuidados intensivos." },
  { Icon: IconFlask, title: "Laboratorio", desc: "Biometría, química sanguínea y más." },
  { Icon: IconScan, title: "Imagenología", desc: "Radiografía digital y ultrasonido." },
  { Icon: IconTooth, title: "Odontología", desc: "Profilaxis dental bajo sedación controlada." },
  { Icon: IconDroplet, title: "Dermatología", desc: "Dermatitis, alergias, pulgas y garrapatas." },
  { Icon: IconScissors, title: "Estética y baño", desc: "Baño medicado y corte para perros y gatos." },
  { Icon: IconBowl, title: "Nutrición y dietas", desc: "Planes y alimento de prescripción." },
  { Icon: IconShield, title: "Medicina preventiva", desc: "Geriatría y chequeos programados." },
  { Icon: IconClock, title: "Urgencias 24 h", desc: "Intoxicación, trauma o dificultad respiratoria.", urgent: true },
];

const posts = [
  { tag: "Prevención", title: "Calendario de vacunación de cachorros", excerpt: "Qué vacuna toca y cuándo, mes a mes, en su primer año." },
  { tag: "Nutrición", title: "Señales de sobrepeso en gatos", excerpt: "Cómo detectarlo a tiempo y ajustar la dieta sin estrés." },
  { tag: "Urgencias", title: "Qué hacer ante una intoxicación", excerpt: "Primeros pasos en casa antes de llegar al hospital." },
];

const paymentMethods = ["Efectivo", "Tarjeta", "Transferencia"];

export default function VeterinarioTemplate03() {
  const [active, setActive] = useState(0);

  return (
    <div
      className={`${libreFranklin.variable} ${hankenGrotesk.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)]`}
      style={{ ...(palettes[active].vars as React.CSSProperties), fontFamily: "var(--f-hanken)" }}
    >
      <PaletteSwitcher palettes={palettes} active={active} onSelect={setActive} />

      {/* Barra de utilidad: horario + urgencias 24h */}
      <div className="bg-[var(--c-primary-deep)] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-2 text-xs">
          <span className="inline-flex items-center gap-2"><IconClock className="h-4 w-4" /> Lun–Vie 9–20 · Sáb 9–17 · Dom 10–14</span>
          <a href={`tel:${clinic.phoneHref}`} className="inline-flex items-center gap-2 font-semibold">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--c-urgent)]" /> Urgencias 24 h · {clinic.phone}
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--c-ink)]/10 bg-[var(--c-surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--c-primary)] text-white">
              <Paw className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "var(--f-libre)" }}>
              {clinic.name}
            </span>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--c-ink)]/70 lg:flex">
            <a href="#servicios" className="hover:text-[var(--c-primary)]">Servicios</a>
            <a href="#prevencion" className="hover:text-[var(--c-primary)]">Prevención</a>
            <a href="#publicaciones" className="hover:text-[var(--c-primary)]">Publicaciones</a>
            <a href="#contacto" className="hover:text-[var(--c-primary)]">Contacto</a>
          </nav>
          <a href={clinic.whatsapp} className="inline-flex min-h-[44px] items-center rounded-md bg-[var(--c-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--c-primary-deep)]">
            Agendar cita
          </a>
        </div>
      </header>

      {/* Hero institucional: titular + tarjeta de horario/urgencias */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.25fr_1fr] md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--c-primary)]">{clinic.specialty}</p>
          <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl" style={{ fontFamily: "var(--f-libre)" }}>
            Un hospital completo para perros y gatos.
          </h1>
          <p className="mt-5 max-w-lg text-[var(--c-ink)]/70">{clinic.welcomeMessage}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={clinic.whatsapp} className="inline-flex min-h-[44px] items-center rounded-md bg-[var(--c-primary)] px-6 text-sm font-bold text-white transition hover:bg-[var(--c-primary-deep)]">
              Agendar cita
            </a>
            <a href={`tel:${clinic.phoneHref}`} className="inline-flex min-h-[44px] items-center rounded-md border border-[var(--c-ink)]/25 px-6 text-sm font-bold transition hover:border-[var(--c-primary)] hover:text-[var(--c-primary)]">
              Llamar al hospital
            </a>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-5 border-t border-[var(--c-ink)]/10 pt-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-2xl font-extrabold text-[var(--c-primary)]" style={{ fontFamily: "var(--f-libre)" }}>{s.value}</dt>
                <dd className="mt-1 text-xs text-[var(--c-ink)]/55">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--c-primary)]">Horario de atención</p>
          <div className="mt-4 divide-y divide-[var(--c-ink)]/10 text-sm">
            {schedule.map((row) => (
              <div key={row.day} className="flex items-center justify-between py-2.5">
                <span className="text-[var(--c-ink)]/70">{row.day}</span>
                <span className={`font-semibold ${row.hours === "24 horas" ? "text-[var(--c-urgent)]" : ""}`}>{row.hours}</span>
              </div>
            ))}
          </div>
          <a href={clinic.address.mapsUrl} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[var(--c-primary)] underline-offset-4 hover:underline">
            Ver ubicación en el mapa →
          </a>
        </div>
      </section>

      {/* Servicios: rejilla amplia de especialidades con iconos */}
      <section id="servicios" className="bg-[var(--c-surface)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--c-primary)]">Especialidades</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl" style={{ fontFamily: "var(--f-libre)" }}>
                Todo bajo un mismo techo
              </h2>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.title}
                className={`group rounded-xl border p-5 transition hover:shadow-md ${
                  s.urgent ? "border-[var(--c-urgent)]/40 bg-[var(--c-urgent)]/5" : "border-[var(--c-ink)]/10 bg-[var(--c-bg)]"
                }`}
              >
                <span
                  className={`grid h-12 w-12 place-items-center rounded-lg ${
                    s.urgent ? "bg-[var(--c-urgent)] text-white" : "bg-[var(--c-soft)] text-[var(--c-primary)]"
                  }`}
                >
                  <s.Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-bold" style={{ fontFamily: "var(--f-libre)" }}>{s.title}</h3>
                <p className="mt-1 text-sm text-[var(--c-ink)]/65">{s.desc}</p>
                <a
                  href={s.urgent ? `tel:${clinic.phoneHref}` : clinic.whatsapp}
                  className={`mt-3 inline-flex items-center gap-1 text-sm font-bold ${s.urgent ? "text-[var(--c-urgent)]" : "text-[var(--c-primary)]"}`}
                >
                  {s.urgent ? "Llamar ahora" : "Detalles"} <span aria-hidden>→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultura de prevención */}
      <section id="prevencion" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 rounded-2xl bg-[var(--c-primary)] p-8 text-white md:grid-cols-[1.2fr_1fr] md:items-center md:p-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">Cultura de prevención</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl" style={{ fontFamily: "var(--f-libre)" }}>
              Prevenir cuesta menos que tratar.
            </h2>
            <p className="mt-4 max-w-lg text-white/85">
              {clinic.doctor}, {clinic.school.toLowerCase()} (cédula {clinic.license}), encabeza un equipo que prioriza
              chequeos a tiempo, expediente digital y planes de salud por etapa de vida de tu mascota.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              "Manejo de bajo estrés para perros y gatos.",
              "Expediente digital con historial completo.",
              "Planes de salud por etapa de vida.",
              "Hospitalización con monitoreo permanente.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-lg bg-white/10 px-4 py-3">
                <Paw className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Publicaciones */}
      <section id="publicaciones" className="bg-[var(--c-surface)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--c-primary)]">Publicaciones</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl" style={{ fontFamily: "var(--f-libre)" }}>
            Consejos para dueños responsables
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <article key={p.title} className="flex flex-col rounded-xl border border-[var(--c-ink)]/10 bg-[var(--c-bg)] p-6">
                <span className="self-start rounded-full bg-[var(--c-soft)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--c-primary)]">
                  {p.tag}
                </span>
                <h3 className="mt-4 font-bold leading-snug" style={{ fontFamily: "var(--f-libre)" }}>{p.title}</h3>
                <p className="mt-2 flex-1 text-sm text-[var(--c-ink)]/65">{p.excerpt}</p>
                <a href={clinic.social.facebook} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[var(--c-primary)]">
                  Leer más <span aria-hidden>→</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Urgencias 24h */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border-2 border-[var(--c-urgent)] bg-[var(--c-urgent)]/5 p-8 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[var(--c-urgent)] text-white">
              <IconClock className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: "var(--f-libre)" }}>Urgencias las 24 horas</h2>
              <p className="mt-1 max-w-md text-sm text-[var(--c-ink)]/70">
                Si tu mascota requiere atención fuera del horario de consulta, llámanos: siempre hay un médico de guardia.
              </p>
            </div>
          </div>
          <a href={`tel:${clinic.phoneHref}`} className="inline-flex min-h-[44px] shrink-0 items-center rounded-md bg-[var(--c-urgent)] px-6 text-sm font-bold text-white">
            Llamar ahora · {clinic.phone}
          </a>
        </div>
      </section>

      {/* Contacto + footer */}
      <footer id="contacto" className="border-t border-[var(--c-ink)]/10 bg-[var(--c-surface)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--c-primary)] text-white"><Paw className="h-5 w-5" /></span>
              <span className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "var(--f-libre)" }}>{clinic.name}</span>
            </div>
            <address className="mt-4 not-italic text-sm text-[var(--c-ink)]/70">
              {clinic.address.street}<br />
              {clinic.address.neighborhood} · {clinic.address.zip}<br />
              {clinic.address.reference}
            </address>
            <a href={clinic.address.mapsUrl} className="mt-3 inline-block text-sm font-bold text-[var(--c-primary)] underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-6 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1 text-xs font-semibold text-[var(--c-ink)]/70">{m}</span>
              ))}
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <dt className="text-[var(--c-ink)]/50">Teléfono</dt>
              <dd><a href={`tel:${clinic.phoneHref}`} className="mt-1 block font-bold text-[var(--c-primary)]">{clinic.phone}</a></dd>
            </div>
            <div>
              <dt className="text-[var(--c-ink)]/50">WhatsApp</dt>
              <dd><a href={clinic.whatsapp} className="mt-1 block font-bold text-[var(--c-primary)]">{clinic.phone}</a></dd>
            </div>
            <div>
              <dt className="text-[var(--c-ink)]/50">Correo</dt>
              <dd><a href={`mailto:${clinic.email}`} className="mt-1 block font-bold text-[var(--c-primary)]">{clinic.email}</a></dd>
            </div>
            <div>
              <dt className="text-[var(--c-ink)]/50">Redes</dt>
              <dd className="mt-1 flex flex-col gap-1">
                <a href={clinic.social.facebook}>Facebook</a>
                <a href={clinic.social.instagram}>Instagram {clinic.social.instagramHandle}</a>
              </dd>
            </div>
          </dl>
        </div>
        <div className="border-t border-[var(--c-ink)]/10 px-6 py-6 pb-28 text-center text-xs text-[var(--c-ink)]/50">
          {clinic.name} · {clinic.doctor} · Coyoacán, CDMX
        </div>
      </footer>
    </div>
  );
}
