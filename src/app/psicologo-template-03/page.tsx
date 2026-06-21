"use client";

import { useState } from "react";
import { fraunces, figtree } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";

// Alterno 03 — concepto ORIGINAL: una CARTA ÍNTIMA + FAQ CONVERSACIONAL.
// Una sola columna centrada y angosta (max-w-2xl), mucho aire, serif calmada y grande.
// Se lee como una carta personal firmada por la terapeuta, no como un landing de marketing.
// Es deliberadamente distinto del alterno 02 (línea de tiempo del proceso) y de la base
// (portal con sidebar + tabs): aquí no hay tarjetas en rejilla, no hay <details>, no hay
// secciones full-width apiladas — solo prosa en primera persona, preguntas→respuestas
// separadas por hairlines y pull-quotes literarias. Tema 100% por variables CSS; hex solo
// en `palettes`.
const palettes = [
  {
    name: "Durazno suave",
    swatch: "#b05a42",
    surface: "#fbf2ec",
    ink: "#3a2a24",
    vars: {
      "--c-bg": "#fbf2ec",
      "--c-surface": "#ffffff",
      "--c-ink": "#3a2a24",
      "--c-accent": "#b05a42",
      "--c-accent-deep": "#8f4632",
      "--c-soft": "#f6ddd0",
    },
  },
  {
    name: "Cielo bruma",
    swatch: "#4a6b8a",
    surface: "#eef3f7",
    ink: "#232e38",
    vars: {
      "--c-bg": "#eef3f7",
      "--c-surface": "#ffffff",
      "--c-ink": "#232e38",
      "--c-accent": "#4a6b8a",
      "--c-accent-deep": "#385572",
      "--c-soft": "#dde8f1",
    },
  },
  {
    name: "Jardín",
    swatch: "#4f7350",
    surface: "#eef4ec",
    ink: "#262f23",
    vars: {
      "--c-bg": "#eef4ec",
      "--c-surface": "#ffffff",
      "--c-ink": "#262f23",
      "--c-accent": "#4f7350",
      "--c-accent-deep": "#3c5b3d",
      "--c-soft": "#dfeadc",
    },
  },
] as const;

const clinic = {
  name: "Daniela Fuentes",
  doctor: "Psic. Daniela Fuentes Marín",
  specialty: "Psicología clínica y terapia de adultos",
  school: "Facultad de Psicología, UNAM",
  license: "7726154",
  experienceYears: "11",
  patients: "780",
  address: {
    street: "Av. Insurgentes Sur 1457, piso 4",
    neighborhood: "Insurgentes Mixcoac, CDMX",
    reference: "Edificio con acceso directo desde el metro Mixcoac",
    mapsUrl: "https://maps.google.com/?q=Insurgentes+Sur+1457+CDMX",
  },
  phone: "55 4002 7731",
  phoneHref: "5540027731",
  whatsapp: "https://wa.me/525540027731",
  email: "hola@danielafuentes.mx",
};

const services = [
  { name: "Primera sesión", description: "Conversación inicial para entender qué traes.", price: "$750" },
  { name: "Sesión individual", description: "50 minutos, semanal o quincenal.", price: "$850" },
  { name: "Terapia de pareja", description: "Sesiones de 75 minutos.", price: "$1,200" },
  { name: "Acompañamiento de duelo", description: "Proceso breve enfocado en una pérdida reciente.", price: "desde $800" },
  { name: "Sesión en línea", description: "Misma calidad de atención, por videollamada.", price: "$800" },
];

const schedule = [
  { day: "Lunes a viernes", hours: "10:00 – 19:00" },
  { day: "Sábado", hours: "10:00 – 14:00" },
  { day: "Domingo", hours: "Cerrado" },
];

const testimonials = [
  { name: "Andrea P.", quote: "Nunca me sentí apresurada. Fue el primer espacio donde pude hablar sin filtrar lo que decía.", treatment: "Sesión individual" },
  { name: "Sergio L.", quote: "La terapia de pareja nos dio herramientas reales, no solo nos hizo hablar de lo mismo.", treatment: "Terapia de pareja" },
  { name: "Renata G.", quote: "Me acompañó en el duelo de mi padre con mucho respeto por mis tiempos.", treatment: "Acompañamiento de duelo" },
];

const serif = { fontFamily: "var(--f-fraunces)" } as const;
const serifItalic = { fontFamily: "var(--f-fraunces)", fontStyle: "italic" } as const;

export default function PsicologoTemplate03() {
  const [active, setActive] = useState(0);

  return (
    <div
      className={`${fraunces.variable} ${figtree.variable} relative min-h-screen overflow-hidden bg-[var(--c-bg)] text-[var(--c-ink)] pb-28`}
      style={{ ...(palettes[active].vars as React.CSSProperties), fontFamily: "var(--f-figtree)" }}
    >
      <PaletteSwitcher palettes={palettes} active={active} onSelect={setActive} />

      {/* Atmósfera suave: un solo resplandor difuso arriba, para dar profundidad sin ruido */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[460px]"
        style={{ background: "radial-gradient(70% 100% at 50% 0%, var(--c-soft), transparent 72%)" }}
      />

      {/* Barra superior mínima: nombre a la izquierda, enlace discreto a la derecha */}
      <header className="relative z-10 mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <span className="text-sm tracking-wide text-[var(--c-ink)]/70" style={serif}>
          {clinic.name}
        </span>
        <a
          href={clinic.whatsapp}
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline"
        >
          Agendar sesión
        </a>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-4 pt-6 sm:px-6">
        <div className="rounded-[2rem] bg-[var(--c-surface)] px-6 py-10 shadow-[0_2px_60px_-24px_rgba(0,0,0,0.3)] ring-1 ring-[var(--c-ink)]/5 sm:px-12 sm:py-14">
        {/* CARTA DE APERTURA */}
        <section className="pt-2 pb-12">
          <p className="text-sm tracking-[0.18em] text-[var(--c-accent)]" style={serifItalic}>
            Hola, soy Daniela
          </p>
          <span aria-hidden className="mt-4 block h-px w-12 bg-[var(--c-accent)]/40" />
          <h1
            className="mt-6 text-4xl leading-[1.18] tracking-tight md:text-5xl"
            style={serif}
          >
            Si llegaste hasta aquí, algo dentro de ti ya está buscando un lugar donde respirar.
          </h1>

          <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--c-ink)]/75">
            <p>
              Llevo {clinic.experienceYears} años acompañando a adultos en terapia individual y de pareja.
              Estudié en la {clinic.school} y, con el tiempo, fui afinando una forma de trabajar
              desde lo humanista: sin diagnósticos que te etiqueten ni prisas por &ldquo;arreglarte&rdquo;.
            </p>
            <p>
              Creo que la terapia no es un consultorio frío ni una lista de tareas. Es un espacio
              tuyo, a tu ritmo, donde podemos mirar de cerca lo que duele y lo que quieres cambiar,
              sin que nadie te apure.
            </p>
            <p>
              Hago {clinic.specialty.toLowerCase()}. Si quieres, te cuento aquí mismo cómo es
              trabajar conmigo, para que decidas con calma y sin presión.
            </p>
          </div>

          <p className="mt-10 text-3xl text-[var(--c-accent)]" style={serifItalic}>
            Daniela
          </p>
        </section>

        {/* FAQ CONVERSACIONAL — preguntas y respuestas, separadas por hairlines, sobre banda suave */}
        <section className="rounded-3xl bg-[var(--c-soft)]/60 px-6 py-10 sm:px-8">
          <div className="divide-y divide-[var(--c-ink)]/10">
            <div className="pb-8">
              <h2 className="text-2xl leading-snug" style={serif}>
                ¿Es para mí?
              </h2>
              <p className="mt-3 leading-relaxed text-[var(--c-ink)]/75">
                No necesitas estar en crisis para venir. A veces basta con sentir que algo no
                termina de acomodar: ansiedad que no baja, una relación que pesa, un duelo que
                no encuentra salida, o simplemente las ganas de entenderte mejor. Si dudas, esa
                duda ya es una buena razón para conversar.
              </p>
            </div>

            <div className="py-8">
              <h2 className="text-2xl leading-snug" style={serif}>
                ¿Cómo es una sesión?
              </h2>
              <p className="mt-3 leading-relaxed text-[var(--c-ink)]/75">
                Son 50 minutos solo para ti. No hay un guion: empezamos por donde tú necesites
                y vamos despacio. Yo escucho mucho y pregunto cuando hace falta; no te voy a dar
                respuestas hechas, te acompaño mientras encuentras las tuyas. Lo que hablamos
                se queda entre nosotras.
              </p>
            </div>

            <div className="py-8">
              <h2 className="text-2xl leading-snug" style={serif}>
                ¿En línea o presencial?
              </h2>
              <p className="mt-3 leading-relaxed text-[var(--c-ink)]/75">
                Como prefieras. Atiendo en consultorio en {clinic.address.neighborhood}, y también
                por videollamada con la misma cercanía de siempre. Muchas personas combinan ambas
                según su semana; lo importante es que la terapia se acomode a tu vida, no al revés.
              </p>
            </div>

            <div className="pt-8">
              <h2 className="text-2xl leading-snug" style={serif}>
                ¿Cuánto cuesta?
              </h2>
              <p className="mt-3 leading-relaxed text-[var(--c-ink)]/75">
                Prefiero ser clara desde el principio, sin letras chiquitas. Estas son las
                modalidades y sus honorarios:
              </p>
              <ul className="mt-6 divide-y divide-[var(--c-ink)]/10 border-t border-[var(--c-ink)]/10">
                {services.map((s) => (
                  <li key={s.name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-4">
                    <span className="min-w-0">
                      <span className="text-lg" style={serif}>{s.name}</span>
                      <span className="mt-0.5 block text-sm text-[var(--c-ink)]/55">{s.description}</span>
                    </span>
                    <span className="text-lg text-[var(--c-accent)]" style={serif}>{s.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CUÁNDO Y DÓNDE — una línea compacta */}
        <section className="border-b border-[var(--c-ink)]/10 py-12">
          <h2 className="text-2xl" style={serif}>Cuándo y dónde</h2>
          <p className="mt-4 leading-relaxed text-[var(--c-ink)]/75">
            Atiendo{" "}
            {schedule.map((row, i) => (
              <span key={row.day}>
                {i > 0 && " · "}
                <span className="text-[var(--c-ink)]">{row.day.toLowerCase()}</span>{" "}
                {row.hours === "Cerrado" ? "cerrado" : row.hours}
              </span>
            ))}
            .
          </p>
          <p className="mt-3 leading-relaxed text-[var(--c-ink)]/75">
            El consultorio está en {clinic.address.street}, {clinic.address.neighborhood}.{" "}
            {clinic.address.reference}.
          </p>
          <a
            href={clinic.address.mapsUrl}
            className="mt-3 inline-flex min-h-[44px] items-center text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline"
          >
            Ver en Google Maps →
          </a>
        </section>

        {/* TESTIMONIOS — pull-quotes grandes y calmados */}
        <section className="space-y-14 py-16">
          {testimonials.slice(0, 2).map((t) => (
            <figure key={t.name}>
              <blockquote
                className="text-2xl leading-relaxed text-[var(--c-ink)]/85 md:text-3xl md:leading-relaxed"
                style={serifItalic}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-sm text-[var(--c-ink)]/55">
                — {t.name}, {t.treatment.toLowerCase()}
              </figcaption>
            </figure>
          ))}
        </section>

        {/* CIERRE — nota de contención + CTA calmado + contacto */}
        <section className="border-t border-[var(--c-ink)]/10 pt-14">
          <div className="rounded-2xl bg-[var(--c-soft)]/60 p-7">
            <p className="text-sm tracking-[0.18em] text-[var(--c-accent)]" style={serifItalic}>
              Si hoy es un día difícil
            </p>
            <p className="mt-3 text-xl leading-relaxed text-[var(--c-ink)]/80" style={serif}>
              No tienes que esperar a tu próxima cita para pedir ayuda. Escríbeme y vemos juntas
              cómo sostener este momento.
            </p>
          </div>

          <p className="mt-12 text-2xl leading-snug text-[var(--c-ink)]/85 md:text-3xl" style={serif}>
            Cuando quieras empezar, aquí estaré.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={clinic.whatsapp}
              className="inline-flex min-h-[44px] items-center rounded-xl bg-[var(--c-accent)] px-6 text-sm font-medium text-[var(--c-surface)] transition hover:bg-[var(--c-accent-deep)]"
            >
              Escribir por WhatsApp
            </a>
            <a
              href={`tel:${clinic.phoneHref}`}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-[var(--c-ink)]/20 px-6 text-sm font-medium transition hover:border-[var(--c-ink)]/40"
            >
              Llamar · {clinic.phone}
            </a>
            <a
              href={`mailto:${clinic.email}`}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-[var(--c-ink)]/20 px-6 text-sm font-medium transition hover:border-[var(--c-ink)]/40"
            >
              {clinic.email}
            </a>
          </div>

          <p className="mt-12 text-sm leading-relaxed text-[var(--c-ink)]/50">
            {clinic.doctor} · {clinic.school} · Cédula profesional {clinic.license} ·{" "}
            {clinic.patients} personas acompañadas en {clinic.experienceYears} años.
          </p>
        </section>
        </div>
      </main>
    </div>
  );
}
