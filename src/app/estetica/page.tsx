"use client";

import { useState } from "react";
import { playfair, sora } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";

// 3 paletas salón-belleza cálidas (familias distintas): Oro nude (la original, más cálida),
// Rosa malva y Arena & cacao. Tokens: --c-bg (fondo claro), --c-ink (oscuro cálido para
// bloques/ texto), --c-accent (acento dorado/rosado/bronce).
const palettes = [
  {
    name: "Oro nude",
    swatch: "#b58a4e",
    surface: "#f7f3ec",
    ink: "#2a2320",
    vars: {
      "--c-bg": "#f7f3ec",
      "--c-ink": "#2a2320",
      "--c-accent": "#b58a4e",
    },
  },
  {
    name: "Rosa malva",
    swatch: "#a4596a",
    surface: "#f8f1ee",
    ink: "#2e2328",
    vars: {
      "--c-bg": "#f8f1ee",
      "--c-ink": "#2e2328",
      "--c-accent": "#a4596a",
    },
  },
  {
    name: "Arena & cacao",
    swatch: "#9c6b45",
    surface: "#f4efe7",
    ink: "#2c2620",
    vars: {
      "--c-bg": "#f4efe7",
      "--c-ink": "#2c2620",
      "--c-accent": "#9c6b45",
    },
  },
] as const;

// Editorial / luxury-boutique shape, unlike anything else in the set: no header, no sidebar, no
// tabs — a full-bleed split hero with oversized serif type overlapping a color block, an
// asymmetric "especialista" section, a minimalist numbered treatment list with a gold rule that
// grows on hover, and a floating round CTA pill fixed to the corner instead of a nav bar.
const clinic = {
  name: "Lumière Estética",
  doctor: "Dra. Renata Solís Vargas",
  specialty: "Medicina estética facial y corporal",
  school: "Facultad de Medicina, Universidad La Salle",
  license: "8814502",
  experienceYears: "12",
  patients: "4,300",
  welcomeMessage:
    "Procedimientos estéticos con resultados naturales: cada plan se diseña sobre tu rostro, no sobre una plantilla.",
  address: {
    street: "Av. Presidente Masaryk 380, piso 1",
    neighborhood: "Polanco, Miguel Hidalgo",
    zip: "11560 CDMX",
    reference: "Junto a la boutique Dior",
    mapsUrl: "https://maps.google.com/?q=Masaryk+380+CDMX",
  },
  phone: "55 2208 6671",
  phoneHref: "5522086671",
  whatsapp: "https://wa.me/525522086671",
  email: "hola@lumiereestetica.mx",
  social: { facebook: "https://facebook.com", instagram: "https://instagram.com", instagramHandle: "@lumiereestetica" },
};

type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "sesión", from: "desde", consult: "a consulta" };

const services: { name: string; description: string; price: string; priceType: PriceType; isUrgency?: boolean }[] = [
  { name: "Valoración estética", description: "Diagnóstico de piel y plan personalizado.", price: "$500", priceType: "fixed" },
  { name: "Toxina botulínica", description: "Líneas de expresión en tercio superior del rostro.", price: "$3,800", priceType: "from" },
  { name: "Ácido hialurónico", description: "Volumen y contorno facial con resultado natural.", price: "$4,500", priceType: "from" },
  { name: "Hilos tensores", description: "Efecto lifting sin cirugía.", price: "$7,200", priceType: "from" },
  { name: "Limpieza facial profunda", description: "Extracción, hidratación y luz LED.", price: "$900", priceType: "fixed" },
  { name: "Peeling químico", description: "Renovación celular para manchas y textura.", price: "$1,200", priceType: "from" },
  { name: "Depilación láser", description: "Sesión por zona, tecnología de diodo.", price: "$600", priceType: "from" },
  { name: "Reacción alérgica a procedimiento", description: "Atención inmediata post-tratamiento.", price: "Consulta", priceType: "consult", isUrgency: true },
];

const schedule = [
  { day: "Lunes a viernes", hours: "10:00 – 19:00" },
  { day: "Sábado", hours: "10:00 – 15:00" },
  { day: "Domingo", hours: "Cerrado" },
];

const paymentMethods = ["Efectivo", "Tarjeta", "Transferencia", "Meses sin intereses"];

const testimonials = [
  { name: "Camila V.", quote: "El resultado del ácido hialurónico fue tan natural que nadie notó que me hice algo.", treatment: "Ácido hialurónico" },
  { name: "Fernanda I.", quote: "La doctora explica cada paso antes de hacerlo, nunca me sentí presionada a algo de más.", treatment: "Valoración estética" },
  { name: "Lucía B.", quote: "Después de los hilos tensores mi rostro se ve descansado, no diferente.", treatment: "Hilos tensores" },
];

export default function EsteticaTemplate() {
  const [active, setActive] = useState(0);

  return (
    <div
      className={`${playfair.variable} ${sora.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)] pb-28`}
      style={{ ...(palettes[active].vars as React.CSSProperties), fontFamily: "var(--f-sora)" }}
    >
      <PaletteSwitcher palettes={palettes} active={active} onSelect={setActive} />
      {/* Floating round CTA, not a header/nav bar */}
      <a
        href={clinic.whatsapp}
        className="fixed bottom-6 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--c-ink)] text-center text-[0.6rem] font-semibold uppercase leading-tight text-[var(--c-bg)] shadow-lg transition hover:bg-[var(--c-accent)] hover:text-[var(--c-ink)]"
      >
        Agendar<br />cita
      </a>

      {/* Hero: full-bleed split with oversized serif overlapping a color block */}
      <section className="relative grid overflow-hidden md:grid-cols-2">
        <div className="relative flex flex-col justify-center px-8 py-24 md:px-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--c-accent)]">{clinic.specialty}</p>
          <h1
            className="mt-6 text-6xl leading-[0.95] md:text-7xl"
            style={{ fontFamily: "var(--f-playfair)" }}
          >
            Belleza<br />con criterio<br />médico.
          </h1>
          <p className="mt-7 max-w-sm text-[var(--c-ink)]/65">{clinic.welcomeMessage}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href={clinic.whatsapp} className="rounded-full bg-[var(--c-ink)] px-7 py-3.5 text-sm font-medium text-[var(--c-bg)] transition hover:bg-[var(--c-accent)] hover:text-[var(--c-ink)]">
              Agendar valoración
            </a>
            <a href={`tel:${clinic.phoneHref}`} className="rounded-full border border-[var(--c-ink)]/25 px-7 py-3.5 text-sm font-medium transition hover:border-[var(--c-ink)]/50">
              Llamar al consultorio
            </a>
          </div>
        </div>
        <div className="relative hidden min-h-[70vh] bg-[var(--c-ink)] md:block">
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--c-accent)]/20 blur-3xl" aria-hidden />
          <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--c-accent)]/40" aria-hidden />
          <p
            className="absolute bottom-10 left-10 right-10 text-2xl text-[var(--c-bg)]/90"
            style={{ fontFamily: "var(--f-playfair)" }}
          >
            {clinic.experienceYears} años perfeccionando un solo objetivo: que se vea como tú, no como un procedimiento.
          </p>
        </div>
      </section>

      {/* Especialista: asymmetric, credentials as a vertical gold-ruled list */}
      <section id="especialista" className="grid gap-10 px-8 py-20 md:grid-cols-[1.4fr_1fr] md:px-16">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--c-accent)]">Tu especialista</p>
          <h2 className="mt-3 text-4xl" style={{ fontFamily: "var(--f-playfair)" }}>{clinic.doctor}</h2>
          <p className="mt-5 max-w-md text-[var(--c-ink)]/65">
            Médica cirujana egresada de la {clinic.school}, especializada en {clinic.specialty.toLowerCase()}.
          </p>
          <p className="mt-3 max-w-md text-sm text-[var(--c-ink)]/50">Cédula profesional {clinic.license}</p>
        </div>
        <dl className="space-y-5 border-l border-[var(--c-accent)]/40 pl-8">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--c-ink)]/45">Años de práctica</dt>
            <dd className="text-2xl" style={{ fontFamily: "var(--f-playfair)" }}>{clinic.experienceYears}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--c-ink)]/45">Pacientes atendidas</dt>
            <dd className="text-2xl" style={{ fontFamily: "var(--f-playfair)" }}>{clinic.patients}</dd>
          </div>
        </dl>
      </section>

      {/* Servicios: minimalist numbered list, gold rule grows on hover, not a card grid or table */}
      <section id="servicios" className="border-t border-[var(--c-ink)]/10 px-8 py-20 md:px-16">
        <h2 className="text-4xl" style={{ fontFamily: "var(--f-playfair)" }}>Tratamientos</h2>
        <div className="mt-12 divide-y divide-[var(--c-ink)]/10">
          {services.map((s, i) => (
            <div key={s.name} className={`group relative flex flex-wrap items-baseline justify-between gap-4 py-6 ${s.isUrgency ? "bg-[var(--c-accent)]/10 -mx-8 px-8 md:-mx-16 md:px-16" : ""}`}>
              <span className="absolute left-0 top-0 h-px w-0 bg-[var(--c-accent)] transition-all duration-300 group-hover:w-full" aria-hidden />
              <div className="flex items-baseline gap-5">
                <span className="font-mono text-xs text-[var(--c-accent)]">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-lg" style={{ fontFamily: "var(--f-playfair)" }}>{s.name}</h3>
                  <p className="mt-1 text-sm text-[var(--c-ink)]/55">{s.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-medium">{s.price}</span>
                <span className="ml-2 text-xs uppercase tracking-wide text-[var(--c-ink)]/40">{priceTypeLabel[s.priceType]}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {paymentMethods.map((m) => (
            <span key={m} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1 text-xs text-[var(--c-ink)]/65">{m}</span>
          ))}
        </div>
      </section>

      {/* Ubicación */}
      <section id="ubicacion" className="grid gap-10 border-t border-[var(--c-ink)]/10 px-8 py-20 md:grid-cols-2 md:px-16">
        <div>
          <h2 className="text-3xl" style={{ fontFamily: "var(--f-playfair)" }}>Ubicación</h2>
          <address className="mt-4 not-italic text-[var(--c-ink)]/65">
            {clinic.address.street}<br />
            {clinic.address.neighborhood}<br />
            {clinic.address.zip}
          </address>
          <p className="mt-2 text-sm text-[var(--c-ink)]/50">{clinic.address.reference}</p>
          <a href={clinic.address.mapsUrl} className="mt-3 inline-block text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">
            Ver en Google Maps →
          </a>
        </div>
        <div className="divide-y divide-[var(--c-ink)]/10 self-start text-sm">
          <h2 className="pb-4 text-3xl" style={{ fontFamily: "var(--f-playfair)" }}>Horario</h2>
          {schedule.map((row) => (
            <div key={row.day} className="flex justify-between py-3">
              <span className="text-[var(--c-ink)]/65">{row.day}</span>
              <span className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/35" : "font-medium"}>{row.hours}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonios: quote-led, oversized opening mark instead of cards */}
      <section id="testimonios" className="border-t border-[var(--c-ink)]/10 bg-[var(--c-ink)] px-8 py-20 text-[var(--c-bg)] md:px-16">
        <h2 className="text-3xl" style={{ fontFamily: "var(--f-playfair)" }}>Lo que dicen nuestras pacientes</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name}>
              <span className="text-5xl text-[var(--c-accent)]" style={{ fontFamily: "var(--f-playfair)" }}>&ldquo;</span>
              <blockquote className="mt-2 text-[var(--c-bg)]/85">{t.quote}</blockquote>
              <figcaption className="mt-4 text-xs uppercase tracking-wide text-[var(--c-bg)]/45">{t.name} · {t.treatment}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="px-8 py-20 md:px-16">
        <h2 className="text-3xl" style={{ fontFamily: "var(--f-playfair)" }}>Agenda tu valoración</h2>
        <div className="mt-8 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="text-[var(--c-ink)]/45">Teléfono</div>
            <a href={`tel:${clinic.phoneHref}`} className="mt-1 block font-medium">{clinic.phone}</a>
          </div>
          <div>
            <div className="text-[var(--c-ink)]/45">WhatsApp</div>
            <a href={clinic.whatsapp} className="mt-1 block font-medium">{clinic.phone}</a>
          </div>
          <div>
            <div className="text-[var(--c-ink)]/45">Correo</div>
            <a href={`mailto:${clinic.email}`} className="mt-1 block font-medium">{clinic.email}</a>
          </div>
          <div>
            <div className="text-[var(--c-ink)]/45">Redes</div>
            <div className="mt-1 flex flex-col gap-1">
              <a href={clinic.social.facebook}>Facebook</a>
              <a href={clinic.social.instagram}>Instagram {clinic.social.instagramHandle}</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
