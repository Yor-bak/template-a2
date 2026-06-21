"use client";

import { useState } from "react";
import { marcellus, mukta } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";

// Alterno 02 de nutriólogo — concepto ORIGINAL "carta de menú" / menú de degustación: la consulta
// nutricional se presenta como una carta de restaurante elegante, con cabecera centrada, cursos
// agrupados, hojas de puntos (leader dots) entre platillo y precio y reglas de hairline. Ningún
// otro template usa esta metáfora. Tema 100% por variables CSS; los hex solo viven en `palettes`.
const palettes = [
  {
    name: "Aceituna",
    swatch: "#5b6b33",
    surface: "#f7f3e8",
    ink: "#2e3120",
    vars: {
      "--c-bg": "#f7f3e8",
      "--c-surface": "#fffdf7",
      "--c-ink": "#2e3120",
      "--c-accent": "#5b6b33",
      "--c-accent-deep": "#46531f",
      "--c-soft": "#e9ead2",
    },
  },
  {
    name: "Vino tinto",
    swatch: "#8a2f33",
    surface: "#f7f0ee",
    ink: "#2e1c1c",
    vars: {
      "--c-bg": "#f7f0ee",
      "--c-surface": "#fffaf9",
      "--c-ink": "#2e1c1c",
      "--c-accent": "#8a2f33",
      "--c-accent-deep": "#6e2327",
      "--c-soft": "#efdcd9",
    },
  },
  {
    name: "Mostaza y carbón",
    swatch: "#8a5f12",
    surface: "#f6f3ec",
    ink: "#26231d",
    vars: {
      "--c-bg": "#f6f3ec",
      "--c-surface": "#fffdf6",
      "--c-ink": "#26231d",
      "--c-accent": "#8a5f12",
      "--c-accent-deep": "#6e4c0e",
      "--c-soft": "#ece2cc",
    },
  },
] as const;

const clinic = {
  name: "Plato Consciente",
  doctor: "Nutr. Camila Reyes Aguilar",
  specialty: "Nutrición clínica y deportiva",
  school: "Escuela de Dietética y Nutrición, INCMNSZ",
  license: "6190284",
  experienceYears: "8",
  patients: "1,250",
  welcomeMessage:
    "Planes de alimentación reales, hechos para tu rutina y tus gustos — no dietas genéricas de internet.",
  address: {
    street: "Calle Tamaulipas 66, piso 2",
    neighborhood: "Condesa, Cuauhtémoc",
    zip: "06140 CDMX",
    reference: "Arriba del café Tamaulipas",
    mapsUrl: "https://maps.google.com/?q=Tamaulipas+66+CDMX",
  },
  phone: "55 6671 2290",
  phoneHref: "5566712290",
  whatsapp: "https://wa.me/525566712290",
  email: "hola@platoconsciente.mx",
  social: { facebook: "https://facebook.com", instagram: "https://instagram.com", instagramHandle: "@platoconsciente" },
};

type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "sesión", from: "desde", consult: "a consulta" };

const services: { name: string; description: string; price: string; priceType: PriceType; isUrgency?: boolean }[] = [
  { name: "Primera consulta", description: "Historial, composición corporal y objetivos.", price: "$700", priceType: "fixed" },
  { name: "Plan de alimentación personalizado", description: "Menú semanal ajustado a tu rutina.", price: "$1,100", priceType: "from" },
  { name: "Seguimiento mensual", description: "Ajustes de plan y medición de avances.", price: "$550", priceType: "fixed" },
  { name: "Nutrición deportiva", description: "Planes para rendimiento y composición corporal.", price: "$1,300", priceType: "from" },
  { name: "Asesoría en línea", description: "Misma atención, por videollamada.", price: "$650", priceType: "fixed" },
  { name: "Antropometría e Inbody", description: "Medición de % de grasa, músculo y agua.", price: "$450", priceType: "fixed" },
  { name: "Plan para condiciones médicas", description: "Diabetes, hipertensión, SOP, entre otras.", price: "$1,200", priceType: "from" },
  { name: "Orientación urgente prequirúrgica", description: "Ajuste nutricional antes de una cirugía próxima.", price: "Consulta", priceType: "consult", isUrgency: true },
];

const schedule = [
  { day: "Lunes a viernes", hours: "9:00 – 18:00" },
  { day: "Sábado", hours: "9:00 – 13:00" },
  { day: "Domingo", hours: "Cerrado" },
];

const paymentMethods = ["Efectivo", "Tarjeta", "Transferencia"];

const testimonials = [
  { name: "Paola N.", quote: "El plan se adaptó a que como fuera de casa casi siempre, no a una dieta imposible.", treatment: "Plan personalizado" },
  { name: "Iván S.", quote: "Bajé de peso sin pasar hambre y entendiendo por qué comía lo que comía.", treatment: "Seguimiento mensual" },
];

const serif = { fontFamily: "var(--f-marcellus)" } as const;

// Agrupamos los servicios "a la carta" en cursos temáticos, como una carta de degustación.
const regular = services.filter((s) => !s.isUrgency);
const urgency = services.find((s) => s.isUrgency);
const courses: { title: string; tagline: string; items: typeof services }[] = [
  {
    title: "Para empezar",
    tagline: "El primer encuentro y las mediciones de base",
    items: regular.filter((s) => ["Primera consulta", "Antropometría e Inbody"].includes(s.name)),
  },
  {
    title: "Planes",
    tagline: "La carta principal, a la medida de tu día a día",
    items: regular.filter((s) =>
      ["Plan de alimentación personalizado", "Nutrición deportiva", "Plan para condiciones médicas"].includes(s.name),
    ),
  },
  {
    title: "Seguimiento",
    tagline: "Para sostener el avance en el tiempo",
    items: regular.filter((s) => ["Seguimiento mensual", "Asesoría en línea"].includes(s.name)),
  },
];

export default function NutriologoTemplate02() {
  const [active, setActive] = useState(0);

  return (
    <div
      className={`${marcellus.variable} ${mukta.variable} min-h-screen bg-[var(--c-bg)] pb-28 text-[var(--c-ink)]`}
      style={{ ...(palettes[active].vars as React.CSSProperties), fontFamily: "var(--f-mukta)" }}
    >
      <PaletteSwitcher palettes={palettes} active={active} onSelect={setActive} />

      {/* La "carta" — una hoja de papel-menú centrada sobre el fondo */}
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <div className="border border-[var(--c-ink)]/15 bg-[var(--c-surface)] px-6 py-12 shadow-sm sm:px-12 sm:py-16">
          {/* Masthead centrado */}
          <header className="text-center">
            <p className="text-[0.7rem] uppercase tracking-[0.45em] text-[var(--c-accent)]">Carta de</p>
            <h1
              className="mt-4 text-4xl uppercase tracking-[0.18em] sm:text-5xl"
              style={serif}
            >
              {clinic.name}
            </h1>
            <div className="mx-auto mt-6 flex max-w-xs items-center gap-4">
              <span className="h-px flex-1 bg-[var(--c-ink)]/20" />
              <span className="text-[var(--c-accent)]" aria-hidden>
                ✦
              </span>
              <span className="h-px flex-1 bg-[var(--c-ink)]/20" />
            </div>
            <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[var(--c-ink)]/70">{clinic.specialty}</p>
            <p className="mt-2 text-xs tracking-wide text-[var(--c-ink)]/55">
              {clinic.doctor} · Céd. {clinic.license}
            </p>
            <a
              href={clinic.whatsapp}
              className="mt-7 inline-flex min-h-[44px] items-center border-b border-[var(--c-accent)] px-2 text-sm uppercase tracking-[0.25em] text-[var(--c-accent)] transition hover:text-[var(--c-accent-deep)]"
              style={serif}
            >
              Reservar mesa · Agendar
            </a>
          </header>

          {/* Intro centrada */}
          <p className="mx-auto mt-12 max-w-xl text-center text-lg leading-relaxed text-[var(--c-ink)]/75" style={serif}>
            {clinic.welcomeMessage}
          </p>

          {/* La carta de cursos */}
          <div className="mt-14 space-y-12">
            {courses.map((course) => (
              <section key={course.title}>
                <div className="text-center">
                  <h2 className="text-2xl uppercase tracking-[0.3em] text-[var(--c-accent)]" style={serif}>
                    {course.title}
                  </h2>
                  <p className="mt-1.5 text-xs italic tracking-wide text-[var(--c-ink)]/55">{course.tagline}</p>
                  <span className="mx-auto mt-4 block h-px w-16 bg-[var(--c-ink)]/20" />
                </div>

                <ul className="mt-7 space-y-6">
                  {course.items.map((s) => (
                    <li key={s.name}>
                      {/* Fila de menú: platillo — hoja de puntos — precio */}
                      <div className="flex items-end gap-3">
                        <h3 className="shrink-0 text-lg leading-tight" style={serif}>
                          {s.name}
                        </h3>
                        <span
                          className="mb-1.5 flex-1 border-b border-dotted border-[var(--c-ink)]/35"
                          aria-hidden
                        />
                        <span className="shrink-0 text-lg leading-tight text-[var(--c-accent)]" style={serif}>
                          {s.price}
                        </span>
                      </div>
                      <p className="mt-1 max-w-md text-sm text-[var(--c-ink)]/65">
                        {s.description}
                        <span className="ml-2 text-xs uppercase tracking-[0.18em] text-[var(--c-ink)]/45">
                          {priceTypeLabel[s.priceType]}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {/* Fuera de carta — la opción de urgencia, como nota al pie */}
            {urgency && (
              <section className="border-t border-[var(--c-ink)]/15 pt-8 text-center">
                <p className="text-[0.7rem] uppercase tracking-[0.35em] text-[var(--c-accent)]">Fuera de carta</p>
                <h3 className="mt-3 text-lg" style={serif}>
                  {urgency.name}
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-[var(--c-ink)]/65">
                  {urgency.description} <span className="text-[var(--c-ink)]/45">· {priceTypeLabel[urgency.priceType]}</span>
                </p>
                <a
                  href={`tel:${clinic.phoneHref}`}
                  className="mt-4 inline-flex min-h-[44px] items-center px-2 text-sm uppercase tracking-[0.2em] text-[var(--c-accent)] underline-offset-4 hover:underline"
                  style={serif}
                >
                  Consultar disponibilidad →
                </a>
              </section>
            )}
          </div>

          {/* Detalle de la casa — stats refinadas */}
          <div className="mt-14 flex items-center justify-center gap-8 border-y border-[var(--c-ink)]/15 py-6 text-center">
            <div>
              <p className="text-3xl text-[var(--c-accent)]" style={serif}>
                {clinic.experienceYears}
              </p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-[var(--c-ink)]/55">Años de práctica</p>
            </div>
            <span className="h-10 w-px bg-[var(--c-ink)]/15" aria-hidden />
            <div>
              <p className="text-3xl text-[var(--c-accent)]" style={serif}>
                {clinic.patients}
              </p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-[var(--c-ink)]/55">Pacientes atendidos</p>
            </div>
          </div>

          {/* Testimonios — citas quietas centradas */}
          <div className="mt-12 space-y-9 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--c-accent)]">De la mesa de al lado</p>
            {testimonials.map((t) => (
              <figure key={t.name}>
                <blockquote className="mx-auto max-w-xl text-xl leading-relaxed tracking-wide text-[var(--c-ink)]/80" style={serif}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-xs uppercase tracking-[0.25em] text-[var(--c-ink)]/50">
                  {t.name} · {t.treatment}
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Pie de carta — horario, dirección, pagos y contacto */}
          <footer className="mt-14 border-t border-[var(--c-ink)]/15 pt-10">
            <div className="grid gap-10 text-center sm:grid-cols-2 sm:text-left">
              <div>
                <h2 className="text-sm uppercase tracking-[0.3em] text-[var(--c-accent)]" style={serif}>
                  Horario
                </h2>
                <dl className="mt-4 space-y-2 text-sm">
                  {schedule.map((row) => (
                    <div key={row.day} className="flex items-end justify-center gap-3 sm:justify-start">
                      <dt className="shrink-0 text-[var(--c-ink)]/70">{row.day}</dt>
                      <span className="mb-1 hidden flex-1 border-b border-dotted border-[var(--c-ink)]/30 sm:block" aria-hidden />
                      <dd className={row.hours === "Cerrado" ? "shrink-0 text-[var(--c-ink)]/45" : "shrink-0 font-semibold"}>
                        {row.hours}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h2 className="text-sm uppercase tracking-[0.3em] text-[var(--c-accent)]" style={serif}>
                  Dónde encontrarnos
                </h2>
                <address className="mt-4 not-italic text-sm leading-relaxed text-[var(--c-ink)]/70">
                  {clinic.address.street}
                  <br />
                  {clinic.address.neighborhood} · {clinic.address.zip}
                  <br />
                  {clinic.address.reference}
                </address>
                <a
                  href={clinic.address.mapsUrl}
                  className="mt-3 inline-flex min-h-[44px] items-center text-sm text-[var(--c-accent)] underline-offset-4 hover:underline"
                >
                  Ver en Google Maps →
                </a>
              </div>
            </div>

            {/* Formas de pago */}
            <div className="mt-10 text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--c-ink)]/55">Aceptamos</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {paymentMethods.map((m) => (
                  <span
                    key={m}
                    className="border border-[var(--c-ink)]/20 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-[var(--c-ink)]/70"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Contacto */}
            <div className="mx-auto mt-10 flex max-w-sm items-center gap-4">
              <span className="h-px flex-1 bg-[var(--c-ink)]/20" />
              <span className="text-[var(--c-accent)]" aria-hidden>
                ✦
              </span>
              <span className="h-px flex-1 bg-[var(--c-ink)]/20" />
            </div>

            <div className="mt-8 grid gap-6 text-center text-sm sm:grid-cols-3">
              <a
                href={`tel:${clinic.phoneHref}`}
                className="inline-flex min-h-[44px] flex-col items-center justify-center"
              >
                <span className="text-[0.65rem] uppercase tracking-[0.25em] text-[var(--c-ink)]/50">Teléfono</span>
                <span className="mt-1 text-[var(--c-accent)]">{clinic.phone}</span>
              </a>
              <a
                href={clinic.whatsapp}
                className="inline-flex min-h-[44px] flex-col items-center justify-center"
              >
                <span className="text-[0.65rem] uppercase tracking-[0.25em] text-[var(--c-ink)]/50">WhatsApp</span>
                <span className="mt-1 text-[var(--c-accent)]">{clinic.phone}</span>
              </a>
              <a
                href={`mailto:${clinic.email}`}
                className="inline-flex min-h-[44px] flex-col items-center justify-center"
              >
                <span className="text-[0.65rem] uppercase tracking-[0.25em] text-[var(--c-ink)]/50">Correo</span>
                <span className="mt-1 break-all text-[var(--c-accent)]">{clinic.email}</span>
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <a
                href={clinic.social.facebook}
                className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]"
              >
                Facebook
              </a>
              <a
                href={clinic.social.instagram}
                className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]"
              >
                Instagram {clinic.social.instagramHandle}
              </a>
            </div>

            <p className="mt-8 text-center text-[0.65rem] uppercase tracking-[0.3em] text-[var(--c-ink)]/45">
              {clinic.school}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
