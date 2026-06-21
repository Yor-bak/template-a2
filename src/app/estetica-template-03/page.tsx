"use client";

import { useState } from "react";
import { bodoniModa, jost } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";

// Alterno 03 de estética — concepto editorial "LOOKBOOK / REVISTA DE BELLEZA": una revista de moda
// impresa cuyo centro es una GALERÍA MASONRY asimétrica de "looks / transformaciones". Estructura
// inédita en el repo: masthead de portada con wordmark Bodoni centrado y filete fino, portada con
// titular gigante + imagen de portada, galería masonry de alturas variables (columns + break-inside),
// índice tipo "contenidos" de revista, spread editorial de la especialista, testimonios como grandes
// citas en Bodoni itálica y footer de contacto. Distinto del alterno 02 (catálogo de tarjetas uniforme
// + feed IG) y del principal (split-hero con lista numerada). Tema 100% por variables CSS, 3 paletas.
const palettes = [
  {
    name: "Noir & oro",
    swatch: "#8a6d3c",
    surface: "#ffffff",
    ink: "#1c1a18",
    vars: {
      "--c-bg": "#f5f2ee",
      "--c-surface": "#ffffff",
      "--c-ink": "#1c1a18",
      "--c-accent": "#8a6d3c",
      "--c-accent-deep": "#6e5530",
      "--c-soft": "#ebe4d8",
    },
  },
  {
    name: "Rosa terracota",
    swatch: "#b05438",
    surface: "#ffffff",
    ink: "#271d18",
    vars: {
      "--c-bg": "#f8f1ec",
      "--c-surface": "#ffffff",
      "--c-ink": "#271d18",
      "--c-accent": "#b05438",
      "--c-accent-deep": "#8d402a",
      "--c-soft": "#f2ddd1",
    },
  },
  {
    name: "Salvia",
    swatch: "#54684a",
    surface: "#ffffff",
    ink: "#232a20",
    vars: {
      "--c-bg": "#f1f4ee",
      "--c-surface": "#ffffff",
      "--c-ink": "#232a20",
      "--c-accent": "#54684a",
      "--c-accent-deep": "#41523a",
      "--c-soft": "#e0e8da",
    },
  },
] as const;

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

const bodoni = { fontFamily: "var(--f-bodoni)" } as React.CSSProperties;
const bodoniItalic = { fontFamily: "var(--f-bodoni)", fontStyle: "italic" } as React.CSSProperties;

// Looks de la galería: solo los servicios no-urgencia se convierten en placas fotográficas.
const lookbook = services.filter((s) => !s.isUrgency);
const urgency = services.find((s) => s.isUrgency);

// Alturas variables para la masonry — proporción de cada placa alterna retrato/cuadrado/paisaje.
const plateAspect = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[5/4]", "aspect-[3/4]", "aspect-square", "aspect-[4/5]"];

// Índice tipo "contenidos de revista": tratamientos agrupados por sección del cuerpo.
const indexSections = [
  { label: "Rostro", treatments: ["Toxina botulínica", "Ácido hialurónico", "Hilos tensores"] },
  { label: "Piel", treatments: ["Valoración estética", "Limpieza facial profunda", "Peeling químico"] },
  { label: "Cuerpo", treatments: ["Depilación láser"] },
];

// Placa fotográfica placeholder: degradado acento→ink con monograma e índice editorial.
function Plate({ index, label, aspect }: { index: number; label: string; aspect: string }) {
  return (
    <div className={`relative w-full overflow-hidden bg-[var(--c-soft)] ${aspect}`} aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--c-accent)]/20 via-transparent to-[var(--c-accent-deep)]/30" />
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-[var(--c-accent)]/25" />
      <div className="absolute left-4 top-4 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--c-ink)]/45">
        Look {String(index + 1).padStart(2, "0")}
      </div>
      <span
        className="absolute bottom-4 right-5 text-6xl leading-none text-[var(--c-accent)]/35"
        style={bodoniItalic}
      >
        {label}
      </span>
    </div>
  );
}

export default function EsteticaTemplate03() {
  const [active, setActive] = useState(0);

  return (
    <div
      className={`${bodoniModa.variable} ${jost.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)] pb-28`}
      style={{ ...(palettes[active].vars as React.CSSProperties), fontFamily: "var(--f-jost)" }}
    >
      <PaletteSwitcher palettes={palettes} active={active} onSelect={setActive} />

      {/* MASTHEAD: portada de revista — fila superior, wordmark Bodoni centrado y filete */}
      <header className="mx-auto max-w-6xl px-6 pt-8">
        <div className="flex items-center justify-between border-b border-[var(--c-ink)]/15 pb-3 text-[0.65rem] uppercase tracking-[0.28em] text-[var(--c-ink)]/55">
          <span>N.º 03 · Edición belleza</span>
          <span className="hidden sm:inline">{clinic.specialty}</span>
          <a href={clinic.whatsapp} className="font-medium text-[var(--c-accent-deep)] hover:underline">
            Reservar
          </a>
        </div>
        <div className="py-8 text-center">
          <p className="text-[0.68rem] uppercase tracking-[0.4em] text-[var(--c-accent-deep)]">Lookbook · Revista de belleza</p>
          <h1
            className="mt-4 text-5xl leading-none sm:text-7xl md:text-8xl"
            style={bodoni}
          >
            {clinic.name}
          </h1>
          <div className="mx-auto mt-6 flex max-w-md items-center gap-4 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--c-ink)]/45">
            <span className="h-px flex-1 bg-[var(--c-ink)]/20" />
            <span>Polanco · CDMX</span>
            <span className="h-px flex-1 bg-[var(--c-ink)]/20" />
          </div>
        </div>
      </header>

      {/* COVER: titular gigante con palabra itálica + standfirst + imagen de portada */}
      <section className="mx-auto grid max-w-6xl items-end gap-10 px-6 py-12 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.34em] text-[var(--c-accent-deep)]">En portada</p>
          <h2 className="mt-5 text-5xl leading-[0.95] sm:text-6xl md:text-7xl" style={bodoni}>
            La belleza,
            <br />
            <span style={bodoniItalic}>editada</span> con
            <br />
            criterio médico.
          </h2>
          <p className="mt-7 max-w-md text-lg text-[var(--c-ink)]/70">{clinic.welcomeMessage}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href={clinic.whatsapp}
              className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--c-ink)] px-8 text-sm font-medium uppercase tracking-[0.12em] text-[var(--c-surface)] transition hover:bg-[var(--c-accent)]"
            >
              Reservar valoración
            </a>
            <a
              href={`tel:${clinic.phoneHref}`}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--c-ink)]/30 px-8 text-sm font-medium uppercase tracking-[0.12em] transition hover:border-[var(--c-ink)]/60"
            >
              Llamar al estudio
            </a>
          </div>
        </div>
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--c-soft)]" aria-hidden>
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--c-ink)]/15 via-transparent to-[var(--c-accent)]/30" />
          <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--c-accent)]/40" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--c-accent)]/15 blur-3xl" />
          <span className="absolute bottom-6 left-6 right-6 text-3xl leading-tight text-[var(--c-ink)]/80" style={bodoniItalic}>
            Resultados que se ven como tú.
          </span>
        </div>
      </section>

      {/* LOOKBOOK GALLERY (firma): masonry asimétrica de placas de altura variable */}
      <section id="lookbook" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--c-ink)]/15 pb-5">
          <h2 className="text-4xl sm:text-5xl" style={bodoni}>El lookbook</h2>
          <p className="max-w-xs text-sm text-[var(--c-ink)]/55">
            Una selección editorial de tratamientos, cada uno fotografiado como un look.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_15rem]">
          {/* Masonry: CSS columns + break-inside-avoid para alturas asimétricas */}
          <div className="columns-2 gap-6 md:columns-3 [column-fill:balance]">
            {lookbook.map((s, i) => (
              <figure key={s.name} className="mb-6 break-inside-avoid">
                <Plate index={i} label={s.name.charAt(0)} aspect={plateAspect[i % plateAspect.length]} />
                <figcaption className="pt-3">
                  <h3 className="text-2xl leading-tight" style={bodoni}>{s.name}</h3>
                  <p className="mt-1 text-sm text-[var(--c-ink)]/60">{s.description}</p>
                  <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-[var(--c-ink)]/12 pt-3">
                    <span className="text-sm">
                      <span className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--c-ink)]/45">
                        {priceTypeLabel[s.priceType]}
                      </span>{" "}
                      <span className="text-lg text-[var(--c-accent-deep)]" style={bodoni}>{s.price}</span>
                    </span>
                    <a
                      href={clinic.whatsapp}
                      className="inline-flex min-h-[44px] items-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--c-accent-deep)] underline-offset-4 hover:underline"
                    >
                      Reservar →
                    </a>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Nota editorial lateral: la urgencia como aparte de revista, no placa */}
          {urgency && (
            <aside className="self-start border-t-2 border-[var(--c-accent)] bg-[var(--c-surface)] p-6 lg:sticky lg:top-6">
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[var(--c-accent-deep)]">Nota de la redacción</p>
              <h3 className="mt-3 text-2xl leading-tight" style={bodoni}>Atención post-tratamiento</h3>
              <p className="mt-3 text-sm text-[var(--c-ink)]/65">{urgency.description}</p>
              <a
                href={`tel:${clinic.phoneHref}`}
                className="mt-5 inline-flex min-h-[44px] items-center text-sm font-medium uppercase tracking-[0.14em] text-[var(--c-accent-deep)] underline-offset-4 hover:underline"
              >
                Llamar ahora · {clinic.phone}
              </a>
            </aside>
          )}
        </div>
      </section>

      {/* ÍNDICE tipo contenidos de revista: secciones con tratamientos y filete punteado */}
      <section className="border-y border-[var(--c-ink)]/15 bg-[var(--c-soft)]/50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-4xl sm:text-5xl" style={bodoni}>Contenidos</h2>
            <span className="text-[0.62rem] uppercase tracking-[0.3em] text-[var(--c-ink)]/45">Índice de tratamientos</span>
          </div>
          <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {indexSections.map((section, si) => (
              <div key={section.label}>
                <div className="flex items-baseline gap-3">
                  <span className="text-sm text-[var(--c-accent-deep)]" style={bodoniItalic}>
                    {String(si + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-2xl" style={bodoni}>{section.label}</h3>
                </div>
                <ul className="mt-5 space-y-3">
                  {section.treatments.map((name) => {
                    const svc = services.find((s) => s.name === name);
                    return (
                      <li key={name} className="flex items-baseline gap-2 text-sm">
                        <span className="whitespace-nowrap">{name}</span>
                        <span className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-[var(--c-ink)]/30" aria-hidden />
                        <span className="whitespace-nowrap text-[var(--c-ink)]/55">{svc?.price}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL / la especialista: spread asimétrico con retrato + pull-quote + bio */}
      <section id="especialista" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 md:grid-cols-[0.85fr_1.15fr]">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--c-soft)]" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--c-accent)]/15 via-transparent to-[var(--c-ink)]/20" />
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full border border-[var(--c-accent)]/30" />
            <span className="absolute bottom-6 left-6 text-7xl text-[var(--c-accent)]/35" style={bodoniItalic}>R</span>
          </div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.34em] text-[var(--c-accent-deep)]">La especialista</p>
            <blockquote className="mt-5 text-3xl leading-snug sm:text-4xl" style={bodoniItalic}>
              &ldquo;Mi trabajo no es cambiar tu rostro: es devolverle lo que el tiempo le pidió prestado.&rdquo;
            </blockquote>
            <p className="mt-7 max-w-lg text-[var(--c-ink)]/70">
              {clinic.doctor}, médica cirujana egresada de la {clinic.school}, especializada en{" "}
              {clinic.specialty.toLowerCase()}.
            </p>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-6 border-t border-[var(--c-ink)]/15 pt-6">
              <div>
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--c-ink)]/45">Experiencia</dt>
                <dd className="mt-1 text-3xl text-[var(--c-accent-deep)]" style={bodoni}>{clinic.experienceYears}</dd>
                <dd className="text-xs text-[var(--c-ink)]/50">años</dd>
              </div>
              <div>
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--c-ink)]/45">Pacientes</dt>
                <dd className="mt-1 text-3xl text-[var(--c-accent-deep)]" style={bodoni}>{clinic.patients}</dd>
                <dd className="text-xs text-[var(--c-ink)]/50">atendidas</dd>
              </div>
              <div>
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--c-ink)]/45">Cédula</dt>
                <dd className="mt-1 text-xl text-[var(--c-accent-deep)]" style={bodoni}>{clinic.license}</dd>
                <dd className="text-xs text-[var(--c-ink)]/50">profesional</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS: grandes citas editoriales en Bodoni itálica, no tarjetas */}
      <section className="border-t border-[var(--c-ink)]/15 bg-[var(--c-ink)] text-[var(--c-surface)]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-center text-[0.65rem] uppercase tracking-[0.34em] text-[var(--c-surface)]/55">
            Las lectoras opinan
          </p>
          <div className="mt-14 space-y-16">
            {testimonials.map((t, i) => (
              <figure
                key={t.name}
                className={`max-w-3xl ${i % 2 === 1 ? "ml-auto text-right" : "mr-auto text-left"}`}
              >
                <blockquote className="text-3xl leading-snug sm:text-4xl" style={bodoniItalic}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-[0.62rem] uppercase tracking-[0.28em] text-[var(--c-surface)]/55">
                  {t.name} · {t.treatment}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER contacto / visítanos */}
      <footer id="contacto" className="mx-auto max-w-6xl px-6 py-20">
        <div className="border-b border-[var(--c-ink)]/15 pb-8 text-center">
          <h2 className="text-4xl sm:text-6xl" style={bodoni}>Visítanos</h2>
          <p className="mx-auto mt-4 max-w-md text-[var(--c-ink)]/65">
            Reserva tu valoración y diseñemos juntas tu próximo look.
          </p>
          <a
            href={clinic.whatsapp}
            className="mt-8 inline-flex min-h-[44px] items-center rounded-full bg-[var(--c-accent)] px-9 text-sm font-medium uppercase tracking-[0.12em] text-[var(--c-surface)] transition hover:bg-[var(--c-accent-deep)]"
          >
            Reservar cita
          </a>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="text-xl" style={bodoni}>Ubicación</h3>
            <address className="mt-4 not-italic text-sm text-[var(--c-ink)]/70">
              {clinic.address.street}
              <br />
              {clinic.address.neighborhood}
              <br />
              {clinic.address.zip}
            </address>
            <p className="mt-2 text-sm text-[var(--c-ink)]/50">{clinic.address.reference}</p>
            <a
              href={clinic.address.mapsUrl}
              className="mt-3 inline-block text-sm font-medium text-[var(--c-accent-deep)] underline-offset-4 hover:underline"
            >
              Ver en Google Maps →
            </a>
          </div>

          <div>
            <h3 className="text-xl" style={bodoni}>Horario</h3>
            <div className="mt-4 divide-y divide-[var(--c-ink)]/12 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-2.5">
                  <span className="text-[var(--c-ink)]/65">{row.day}</span>
                  <span className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/35" : "font-medium"}>{row.hours}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1 text-xs text-[var(--c-ink)]/65">
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl" style={bodoni}>Contacto</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[var(--c-ink)]/45">Teléfono</dt>
                <dd>
                  <a href={`tel:${clinic.phoneHref}`} className="font-medium text-[var(--c-accent-deep)]">{clinic.phone}</a>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--c-ink)]/45">WhatsApp</dt>
                <dd>
                  <a href={clinic.whatsapp} className="font-medium text-[var(--c-accent-deep)]">{clinic.phone}</a>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--c-ink)]/45">Correo</dt>
                <dd>
                  <a href={`mailto:${clinic.email}`} className="font-medium text-[var(--c-accent-deep)]">{clinic.email}</a>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--c-ink)]/45">Redes</dt>
                <dd className="flex flex-col gap-1">
                  <a href={clinic.social.facebook} className="hover:text-[var(--c-accent-deep)]">Facebook</a>
                  <a href={clinic.social.instagram} className="hover:text-[var(--c-accent-deep)]">
                    Instagram {clinic.social.instagramHandle}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--c-ink)]/12 pt-6 text-center text-[0.62rem] uppercase tracking-[0.28em] text-[var(--c-ink)]/45">
          {clinic.name} · N.º 03 Edición belleza · Polanco, CDMX
        </div>
      </footer>
    </div>
  );
}
