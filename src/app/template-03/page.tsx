"use client";

import { useState } from "react";
import { outfit, plusJakarta } from "@/lib/fonts";
import { clinic, services, priceTypeLabel, schedule, paymentMethods, testimonials, milestones } from "@/lib/mockClinic";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";

// Alterno C — rediseño inspirado en sitios de marketing dental tipo "clínica grande"
// (hero con gradiente, antes/después, CTA de alto contraste, servicios en acordeón,
// testimonios con estrellas). 3 paletas propias: el gradiente (g1→g2→accent) define el
// carácter, el CTA es un tono claro de alto contraste con texto oscuro (--c-ink) y el
// rojo de urgencias se mantiene constante.
const palettes = [
  {
    name: "Aurora violeta",
    swatch: "#5b21b6",
    surface: "#f7f6fb",
    ink: "#1c1530",
    vars: {
      "--c-bg": "#f7f6fb",
      "--c-ink": "#1c1530",
      "--c-g1": "#16215c",
      "--c-g2": "#3a2680",
      "--c-accent": "#5b21b6",
      "--c-cta": "#fbbf24",
      "--c-cta-deep": "#f3b30c",
      "--c-urgent": "#dc2626",
    },
  },
  {
    name: "Atardecer coral",
    swatch: "#c2185b",
    surface: "#fbf5f7",
    ink: "#2a1020",
    vars: {
      "--c-bg": "#fbf5f7",
      "--c-ink": "#2a1020",
      "--c-g1": "#3b1140",
      "--c-g2": "#7a1f5c",
      "--c-accent": "#c2185b",
      "--c-cta": "#34d399",
      "--c-cta-deep": "#16b67e",
      "--c-urgent": "#dc2626",
    },
  },
  {
    name: "Bosque esmeralda",
    swatch: "#0f7a52",
    surface: "#f1f8f4",
    ink: "#0d2018",
    vars: {
      "--c-bg": "#f1f8f4",
      "--c-ink": "#0d2018",
      "--c-g1": "#06342b",
      "--c-g2": "#0a5e3f",
      "--c-accent": "#0f7a52",
      "--c-cta": "#fbbf24",
      "--c-cta-deep": "#f3b30c",
      "--c-urgent": "#dc2626",
    },
  },
] as const;

const highlights = [
  { label: "Diagnóstico digital", detail: "Radiografía y fotos antes de proponer cualquier plan." },
  { label: "Instrumental esterilizado", detail: "Un kit nuevo por paciente, sin excepciones." },
  { label: "Urgencias el mismo día", detail: "Dolor agudo o golpe, respuesta en horas, no en días." },
  { label: "Meses sin intereses", detail: "Planes de pago a 3 y 6 meses en tratamientos mayores." },
];

const stars = "★★★★★";

export default function Template03() {
  const [active, setActive] = useState(0);

  return (
    <div
      className={`${outfit.variable} ${plusJakarta.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)]`}
      style={{ ...(palettes[active].vars as React.CSSProperties), fontFamily: "var(--f-plus-jakarta)" }}
    >
      <PaletteSwitcher palettes={palettes} active={active} onSelect={setActive} />
      {/* Header: fijo, con CTA de llamada de alto contraste como en la referencia */}
      <header className="sticky top-0 z-30 border-b border-[var(--c-ink)]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <span className="text-base font-semibold" style={{ fontFamily: "var(--f-outfit)" }}>{clinic.name}</span>
          <nav className="hidden items-center gap-6 text-sm text-[var(--c-ink)]/60 lg:flex">
            <a href="#especialista" className="hover:text-[var(--c-ink)]">Especialista</a>
            <a href="#servicios" className="hover:text-[var(--c-ink)]">Servicios</a>
            <a href="#testimonios" className="hover:text-[var(--c-ink)]">Testimonios</a>
            <a href="#ubicacion" className="hover:text-[var(--c-ink)]">Ubicación</a>
          </nav>
          <a href={`tel:${clinic.phoneHref}`} className="rounded-full bg-[var(--c-cta)] px-5 py-2.5 text-sm font-semibold text-[var(--c-ink)] transition hover:bg-[var(--c-cta-deep)]">
            Llámanos
          </a>
        </div>
      </header>

      {/* Hero: gradiente azul→violeta, antes/después y CTA dual */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--c-g1)] via-[var(--c-g2)] to-[var(--c-accent)] px-6 py-20 text-white md:px-16 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--c-cta)]">{clinic.specialty}</p>
            <h1 className="mt-4 max-w-xl text-4xl leading-[1.1] md:text-5xl" style={{ fontFamily: "var(--f-outfit)" }}>
              La sonrisa que evitabas mostrar, hoy con un plan claro.
            </h1>
            <p className="mt-5 max-w-lg text-white/80">{clinic.welcomeMessage}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={clinic.whatsapp} className="rounded-full bg-[var(--c-cta)] px-6 py-3 text-sm font-semibold text-[var(--c-ink)] transition hover:bg-[var(--c-cta-deep)]">
                Agendar valoración
              </a>
              <a href={`tel:${clinic.phoneHref}`} className="rounded-full border border-white/40 px-6 py-3 text-sm font-medium transition hover:border-white/70">
                Llamar al consultorio
              </a>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-white/15 pt-6">
              {milestones.map((m) => (
                <div key={m.label}>
                  <dt className="text-2xl font-semibold text-[var(--c-cta)]" style={{ fontFamily: "var(--f-outfit)" }}>{m.value}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wide text-white/60">{m.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* "Antes / Después" simulado con bloques, sin foto real */}
          <div className="grid grid-cols-2 gap-3 rounded-3xl bg-white/10 p-4 backdrop-blur">
            <div className="rounded-2xl bg-[var(--c-ink)]/30 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Antes</p>
              <div className="mt-3 aspect-[3/4] rounded-xl bg-[var(--c-ink)]/40" aria-hidden />
            </div>
            <div className="rounded-2xl bg-white/15 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-cta)]">Después</p>
              <div className="mt-3 aspect-[3/4] rounded-xl bg-white/25" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      {/* Destacados: 4 chips, como los íconos de beneficio bajo el hero de la referencia */}
      <section className="border-b border-[var(--c-ink)]/10 bg-white px-6 py-10 md:px-16">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h) => (
            <div key={h.label} className="rounded-2xl border border-[var(--c-ink)]/10 p-5">
              <div className="h-2 w-8 rounded-full bg-gradient-to-r from-[var(--c-g2)] to-[var(--c-accent)]" aria-hidden />
              <p className="mt-3 font-semibold">{h.label}</p>
              <p className="mt-1 text-sm text-[var(--c-ink)]/60">{h.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-16 md:px-16">
        {/* Especialista */}
        <section id="especialista" className="grid gap-10 border-b border-[var(--c-ink)]/10 pb-16 md:grid-cols-[1fr_1.4fr]">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-[var(--c-g2)]/15 to-[var(--c-accent)]/15" aria-hidden />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">La especialista</p>
            <h2 className="mt-3 text-3xl" style={{ fontFamily: "var(--f-outfit)" }}>{clinic.doctor}</h2>
            <p className="mt-4 max-w-lg text-[var(--c-ink)]/70">
              Especialidad en {clinic.specialty} por la {clinic.school}. Cédula profesional {clinic.license},
              cédula de especialidad {clinic.specialtyLicense}.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-[var(--c-ink)]/70">
              <li>· Plan de tratamiento por escrito, con precios desglosados antes de empezar.</li>
              <li>· Un solo paciente por horario, sin sala de espera saturada.</li>
              <li>· Seguimiento fotográfico del antes y después de cada caso.</li>
            </ul>
          </div>
        </section>

        {/* Servicios: acordeón con <details>, sin JS de cliente */}
        <section id="servicios" className="border-b border-[var(--c-ink)]/10 py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">Servicios</p>
          <h2 className="mt-3 text-3xl" style={{ fontFamily: "var(--f-outfit)" }}>Tratamientos y precios</h2>
          <div className="mt-8 divide-y divide-[var(--c-ink)]/10 rounded-2xl border border-[var(--c-ink)]/10 bg-white">
            {services.map((s) => (
              <details key={s.name} className="group rounded-xl open:bg-[var(--c-accent)]/[0.06]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl p-5 transition hover:bg-[var(--c-accent)]/[0.03]">
                  <div>
                    <span className="font-medium">{s.name}</span>
                    {s.isUrgency && (
                      <span className="ml-2 rounded-full bg-[var(--c-urgent)]/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-[var(--c-urgent)]">
                        Urgencia
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="whitespace-nowrap text-sm font-semibold text-[var(--c-accent)]">{s.price}</span>
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--c-ink)]/20 text-sm transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </div>
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-sm text-[var(--c-ink)]/65">{s.description}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-[var(--c-ink)]/55">{priceTypeLabel[s.priceType]}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Ubicación */}
        <section id="ubicacion" className="grid gap-10 border-b border-[var(--c-ink)]/10 py-16 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">Visítanos</p>
            <h2 className="mt-3 text-3xl" style={{ fontFamily: "var(--f-outfit)" }}>Ubicación y horario</h2>
            <address className="mt-4 not-italic text-[var(--c-ink)]/70">
              {clinic.address.street}<br />
              {clinic.address.neighborhood}<br />
              {clinic.address.zip}
            </address>
            <p className="mt-2 text-sm text-[var(--c-ink)]/55">{clinic.address.reference}</p>
            <a href={clinic.address.mapsUrl} className="mt-3 inline-block text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-8 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1 text-xs text-[var(--c-ink)]/65">{m}</span>
              ))}
            </div>
          </div>
          <div className="self-start rounded-2xl border border-[var(--c-ink)]/10 bg-white p-6 text-sm">
            {schedule.map((row) => (
              <div key={row.day} className="flex justify-between border-b border-[var(--c-ink)]/10 py-2 last:border-0">
                <span className="text-[var(--c-ink)]/70">{row.day}</span>
                <span className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/35" : "font-medium"}>{row.hours}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Urgencias */}
        <section className="my-16 rounded-3xl bg-[var(--c-urgent)] px-8 py-10 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Urgencias</p>
          <h2 className="mt-3 max-w-md text-2xl" style={{ fontFamily: "var(--f-outfit)" }}>
            Dolor agudo, fractura o golpe no esperan turno.
          </h2>
          <div className="mt-6 flex gap-4">
            <a href={`tel:${clinic.phoneHref}`} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--c-urgent)]">
              Llamar ahora
            </a>
            <a href={clinic.whatsapp} className="rounded-full border border-white/40 px-6 py-3 text-sm font-medium">
              WhatsApp
            </a>
          </div>
        </section>

        {/* Testimonios: calificación de estrellas con texto accesible */}
        <section id="testimonios" className="py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">Testimonios</p>
          <h2 className="mt-3 text-3xl" style={{ fontFamily: "var(--f-outfit)" }}>Lo que dicen nuestros pacientes</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-[var(--c-ink)]/10 bg-white p-6">
                <div className="text-sm tracking-wide text-[var(--c-cta)]">
                  <span aria-hidden>{stars}</span>
                  <span className="sr-only">5 de 5 estrellas</span>
                </div>
                <blockquote className="mt-3 text-[var(--c-ink)]/80">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 text-xs text-[var(--c-ink)]/50">
                  {t.name} · {t.treatment}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>

      {/* Contacto: cierre con el mismo gradiente del hero */}
      <section id="contacto" className="bg-gradient-to-br from-[var(--c-g1)] via-[var(--c-g2)] to-[var(--c-accent)] px-6 pt-16 pb-28 text-white md:px-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl" style={{ fontFamily: "var(--f-outfit)" }}>Hablemos de tu sonrisa</h2>
          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="text-white/60">Teléfono</div>
              <a href={`tel:${clinic.phoneHref}`} className="mt-1 block font-medium">{clinic.phone}</a>
            </div>
            <div>
              <div className="text-white/60">WhatsApp</div>
              <a href={clinic.whatsapp} className="mt-1 block font-medium">{clinic.phone}</a>
            </div>
            <div>
              <div className="text-white/60">Correo</div>
              <a href={`mailto:${clinic.email}`} className="mt-1 block font-medium">{clinic.email}</a>
            </div>
            <div>
              <div className="text-white/60">Redes</div>
              <div className="mt-1 flex flex-col gap-1">
                <a href={clinic.social.facebook}>Facebook</a>
                <a href={clinic.social.instagram}>Instagram {clinic.social.instagramHandle}</a>
              </div>
            </div>
          </div>
          <a href={clinic.whatsapp} className="mt-8 inline-block rounded-full bg-[var(--c-cta)] px-7 py-3 text-sm font-semibold text-[var(--c-ink)] transition hover:bg-[var(--c-cta-deep)]">
            Agendar valoración
          </a>
        </div>
      </section>
    </div>
  );
}
