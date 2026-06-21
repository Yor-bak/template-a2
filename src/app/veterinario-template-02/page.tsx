"use client";

import { useState } from "react";
import { baloo2, mulish } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";

// Diseño alterno B para veterinario: BENTO GRID modular. Mismo contenido que /veterinario
// (misma clínica "Huella Sana", mismos servicios/horario/testimonios), pero la página entera
// se compone de "tiles" cuadrados/squircle de tamaños variados en una rejilla asimétrica.
// Todo el tema se aplica por variables CSS en el root; cero hex en className.
// Tokens: --c-bg fondo de página, --c-tile superficie de tile, --c-ink texto,
// --c-accent acento (títulos/botones), --c-accent-deep hover, --c-soft tile teñido, --c-urgent urgencias.
const palettes = [
  {
    name: "Durazno",
    swatch: "#c2562a",
    surface: "#fdf6f0",
    ink: "#3a2b25",
    vars: {
      "--c-bg": "#fdf6f0",
      "--c-tile": "#ffffff",
      "--c-ink": "#3a2b25",
      "--c-accent": "#c2562a",
      "--c-accent-deep": "#a3441c",
      "--c-soft": "#fbe6d6",
      "--c-urgent": "#b01030",
    },
  },
  {
    name: "Cielo",
    swatch: "#2a5f96",
    surface: "#eef4fb",
    ink: "#1f2d3d",
    vars: {
      "--c-bg": "#eef4fb",
      "--c-tile": "#ffffff",
      "--c-ink": "#1f2d3d",
      "--c-accent": "#2a5f96",
      "--c-accent-deep": "#214b78",
      "--c-soft": "#dceaf7",
      "--c-urgent": "#c0392b",
    },
  },
  {
    name: "Pradera",
    swatch: "#45701c",
    surface: "#f1f6ec",
    ink: "#25301f",
    vars: {
      "--c-bg": "#f1f6ec",
      "--c-tile": "#ffffff",
      "--c-ink": "#25301f",
      "--c-accent": "#45701c",
      "--c-accent-deep": "#365815",
      "--c-soft": "#e2efd6",
      "--c-urgent": "#c0392b",
    },
  },
] as const;

const clinic = {
  name: "Veterinaria Huella Sana",
  doctor: "MVZ. Ariadna Robles Cuéllar",
  specialty: "Medicina veterinaria de pequeñas especies",
  school: "Facultad de Medicina Veterinaria y Zootecnia, UNAM",
  license: "4471829",
  experienceYears: "9",
  patients: "3,600",
  welcomeMessage:
    "Consulta, vacunación, cirugía y hospitalización para perros y gatos, en un espacio pensado para que tu mascota llegue tranquila.",
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

const stamps = [
  { label: "Años atendiendo mascotas", value: clinic.experienceYears },
  { label: "Pacientes con cartilla", value: clinic.patients },
  { label: "Cédula profesional", value: clinic.license },
];

type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "precio fijo", from: "desde", consult: "a consulta" };

const services: { name: string; description: string; price: string; priceType: PriceType; isUrgency?: boolean }[] = [
  { name: "Consulta general", description: "Revisión completa y cartilla de vacunación al día.", price: "$450", priceType: "fixed" },
  { name: "Esquema de vacunación", description: "Vacuna múltiple, rabia y desparasitación.", price: "$380", priceType: "from" },
  { name: "Esterilización", description: "Cirugía de esterilización con hospitalización de un día.", price: "$1,900", priceType: "from" },
  { name: "Limpieza dental canina/felina", description: "Profilaxis dental bajo sedación controlada.", price: "$1,400", priceType: "from" },
  { name: "Estudios de laboratorio", description: "Biometría hemática y química sanguínea.", price: "$650", priceType: "from" },
  { name: "Baño medicado", description: "Para dermatitis, pulgas o garrapatas.", price: "$320", priceType: "fixed" },
  { name: "Microchip de identificación", description: "Registro permanente con cartilla.", price: "$500", priceType: "fixed" },
  { name: "Urgencia 24 horas", description: "Intoxicación, trauma o dificultad para respirar.", price: "Consulta", priceType: "consult", isUrgency: true },
];

const schedule = [
  { day: "Lunes a viernes", hours: "9:00 – 20:00" },
  { day: "Sábado", hours: "9:00 – 17:00" },
  { day: "Domingo", hours: "10:00 – 14:00" },
];

const paymentMethods = ["Efectivo", "Tarjeta", "Transferencia"];

const testimonials = [
  { name: "Mariana T.", quote: "Llevé a mi gato muy asustado y la doctora lo manejó con muchísima paciencia.", treatment: "Consulta general" },
  { name: "Héctor V.", quote: "La esterilización de mi perra fue rápida y la recuperación no tuvo complicaciones.", treatment: "Esterilización" },
  { name: "Lupita R.", quote: "Nos atendieron una urgencia de noche cuando ninguna otra clínica contestaba.", treatment: "Urgencia 24h" },
];

function Paw({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <ellipse cx="12" cy="16.2" rx="5.2" ry="4.3" />
      <ellipse cx="5.3" cy="10.4" rx="2.1" ry="2.6" transform="rotate(-25 5.3 10.4)" />
      <ellipse cx="18.7" cy="10.4" rx="2.1" ry="2.6" transform="rotate(25 18.7 10.4)" />
      <ellipse cx="8.6" cy="6.2" rx="1.8" ry="2.3" transform="rotate(-12 8.6 6.2)" />
      <ellipse cx="15.4" cy="6.2" rx="1.8" ry="2.3" transform="rotate(12 15.4 6.2)" />
    </svg>
  );
}

function PawTrail({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-8 ${className}`} aria-hidden>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Paw key={i} className={`h-3 w-3 ${i % 2 ? "translate-y-1.5" : ""}`} />
      ))}
    </div>
  );
}

// Featured services shown as their own row of tiles; the rest go in a compact list tile.
const featured = services.filter((s) => !s.isUrgency).slice(0, 3);
const compactRest = services.filter((s) => !s.isUrgency).slice(3);
const featuredTestimonial = testimonials[0];

const display = { fontFamily: "var(--f-baloo)" } as const;

export default function VeterinarioTemplate02() {
  const [active, setActive] = useState(0);

  return (
    <div
      className={`${baloo2.variable} ${mulish.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)]`}
      style={{ ...(palettes[active].vars as React.CSSProperties), fontFamily: "var(--f-mulish)" }}
    >
      <PaletteSwitcher palettes={palettes} active={active} onSelect={setActive} />

      <main className="mx-auto max-w-6xl px-4 pt-10 pb-28 sm:px-6">
        {/* Top brand bar (kept tiny so the bento grid is the page) */}
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--c-accent)] text-[var(--c-bg)]">
            <Paw className="h-6 w-6" />
          </span>
          <span className="text-lg font-extrabold tracking-tight" style={display}>
            {clinic.name}
          </span>
        </div>

        {/* BENTO GRID */}
        <div className="grid auto-rows-[minmax(0,auto)] grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
          {/* HERO — spans 2x2 */}
          <section className="col-span-2 row-span-2 flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-[var(--c-ink)]/10 bg-[var(--c-accent)] p-7 text-[var(--c-bg)] shadow-md md:p-9">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--c-bg)]/80">
                {clinic.specialty}
              </p>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] md:text-5xl" style={display}>
                Cuidamos a quien te recibe moviendo la cola.
              </h1>
              <p className="mt-5 max-w-md text-[var(--c-bg)]/90">{clinic.welcomeMessage}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={clinic.whatsapp}
                className="inline-flex min-h-[44px] items-center rounded-2xl bg-[var(--c-bg)] px-6 text-sm font-extrabold text-[var(--c-accent)] shadow-sm transition hover:bg-[var(--c-soft)]"
              >
                Agendar cita
              </a>
              <a
                href={`tel:${clinic.phoneHref}`}
                className="inline-flex min-h-[44px] items-center rounded-2xl border-2 border-[var(--c-bg)]/50 px-6 text-sm font-extrabold text-[var(--c-bg)] transition hover:border-[var(--c-bg)]"
              >
                Llamar a la clínica
              </a>
            </div>
            <PawTrail className="mt-7 text-[var(--c-bg)]/40" />
          </section>

          {/* URGENCIAS 24H — bold accent, spans 2 cols */}
          <section className="col-span-2 flex flex-col justify-between rounded-3xl border-2 border-[var(--c-ink)]/10 bg-[var(--c-urgent)] p-7 text-white shadow-md">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/85">Urgencia 24 horas</p>
              <p className="mt-3 text-xl font-extrabold leading-snug" style={display}>
                Intoxicación, trauma o dificultad para respirar no esperan.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`tel:${clinic.phoneHref}`}
                className="inline-flex min-h-[44px] items-center rounded-2xl bg-white px-5 text-sm font-extrabold text-[var(--c-urgent)] transition hover:bg-white/90"
              >
                Llamar ahora
              </a>
              <a
                href={clinic.whatsapp}
                className="inline-flex min-h-[44px] items-center rounded-2xl border-2 border-white/60 px-5 text-sm font-extrabold text-white transition hover:border-white"
              >
                WhatsApp
              </a>
            </div>
          </section>

          {/* STATS — one tile per stamp, sits beside urgencias */}
          {stamps.map((s) => (
            <section
              key={s.label}
              className="flex flex-col justify-center rounded-3xl border-2 border-[var(--c-ink)]/10 bg-[var(--c-soft)] p-5 shadow-sm"
            >
              <span className="text-3xl font-extrabold text-[var(--c-accent)]" style={display}>
                {s.value}
              </span>
              <span className="mt-1 text-xs font-semibold leading-tight text-[var(--c-ink)]/70">{s.label}</span>
            </section>
          ))}

          {/* ESPECIALISTA tile */}
          <section className="flex flex-col justify-center rounded-3xl border-2 border-[var(--c-ink)]/10 bg-[var(--c-tile)] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--c-accent)]">Te atiende</p>
            <p className="mt-2 text-base font-extrabold leading-tight" style={display}>
              {clinic.doctor}
            </p>
            <p className="mt-2 text-xs text-[var(--c-ink)]/60">
              Egresada de la {clinic.school}. Cédula {clinic.license}.
            </p>
          </section>

          {/* FEATURED SERVICES — three tiles */}
          {featured.map((s) => (
            <section
              key={s.name}
              className="flex flex-col rounded-3xl border-2 border-[var(--c-ink)]/10 bg-[var(--c-tile)] p-5 shadow-sm"
            >
              <Paw className="h-5 w-5 text-[var(--c-accent)]" />
              <h2 className="mt-3 font-extrabold leading-tight" style={display}>
                {s.name}
              </h2>
              <p className="mt-1 flex-1 text-xs text-[var(--c-ink)]/60">{s.description}</p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-lg font-extrabold text-[var(--c-accent)]">{s.price}</span>
                <span className="text-[10px] uppercase tracking-wide text-[var(--c-ink)]/45">
                  {priceTypeLabel[s.priceType]}
                </span>
              </div>
            </section>
          ))}

          {/* COMPACT REST OF SERVICES — tall-ish list tile spanning 2 cols */}
          <section className="col-span-2 rounded-3xl border-2 border-[var(--c-ink)]/10 bg-[var(--c-tile)] p-6 shadow-sm">
            <h2 className="text-lg font-extrabold" style={display}>
              Más servicios
            </h2>
            <ul className="mt-4 divide-y divide-dashed divide-[var(--c-ink)]/15">
              {compactRest.map((s) => (
                <li key={s.name} className="flex items-baseline justify-between gap-4 py-2.5">
                  <span className="flex items-baseline gap-2 text-sm">
                    <Paw className="relative top-0.5 h-3.5 w-3.5 shrink-0 text-[var(--c-accent)]" />
                    <span className="font-semibold">{s.name}</span>
                  </span>
                  <span className="whitespace-nowrap text-sm font-extrabold text-[var(--c-accent)]">
                    {s.price}{" "}
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--c-ink)]/45">
                      {priceTypeLabel[s.priceType]}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* TESTIMONIO — featured quote with stars, spans 2 cols */}
          <section className="col-span-2 flex flex-col justify-center rounded-3xl border-2 border-[var(--c-ink)]/10 bg-[var(--c-soft)] p-6 shadow-sm">
            <div className="flex items-center gap-1 text-[var(--c-accent)]">
              <span aria-hidden className="text-lg leading-none">★★★★★</span>
              <span className="sr-only">5 de 5 estrellas</span>
            </div>
            <blockquote className="mt-3 text-lg font-semibold leading-snug" style={display}>
              &ldquo;{featuredTestimonial.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-3 text-xs font-bold text-[var(--c-ink)]/55">
              {featuredTestimonial.name} · {featuredTestimonial.treatment}
            </figcaption>
          </section>

          {/* HORARIO tile */}
          <section className="col-span-2 rounded-3xl border-2 border-[var(--c-ink)]/10 bg-[var(--c-tile)] p-6 shadow-sm md:col-span-1">
            <h2 className="text-lg font-extrabold" style={display}>
              Horario
            </h2>
            <div className="mt-4 divide-y divide-dashed divide-[var(--c-ink)]/15 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between gap-3 py-2">
                  <span className="text-[var(--c-ink)]/70">{row.day}</span>
                  <span className="font-bold">{row.hours}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {paymentMethods.map((m) => (
                <span
                  key={m}
                  className="rounded-full border-2 border-[var(--c-ink)]/15 px-2.5 py-1 text-[10px] font-bold text-[var(--c-ink)]/70"
                >
                  {m}
                </span>
              ))}
            </div>
          </section>

          {/* CONTACTO tile */}
          <section className="col-span-2 rounded-3xl border-2 border-[var(--c-ink)]/10 bg-[var(--c-tile)] p-6 shadow-sm md:col-span-1">
            <h2 className="text-lg font-extrabold" style={display}>
              Contacto
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-[var(--c-ink)]/50">Teléfono</dt>
                <dd>
                  <a href={`tel:${clinic.phoneHref}`} className="font-bold hover:text-[var(--c-accent)]">
                    {clinic.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--c-ink)]/50">WhatsApp</dt>
                <dd>
                  <a href={clinic.whatsapp} className="font-bold hover:text-[var(--c-accent)]">
                    {clinic.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--c-ink)]/50">Correo</dt>
                <dd>
                  <a href={`mailto:${clinic.email}`} className="font-bold hover:text-[var(--c-accent)]">
                    {clinic.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--c-ink)]/50">Redes</dt>
                <dd className="flex flex-col">
                  <a href={clinic.social.facebook} className="font-bold hover:text-[var(--c-accent)]">
                    Facebook
                  </a>
                  <a href={clinic.social.instagram} className="font-bold hover:text-[var(--c-accent)]">
                    Instagram {clinic.social.instagramHandle}
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          {/* UBICACIÓN — map placeholder, spans 2 cols */}
          <section className="col-span-2 overflow-hidden rounded-3xl border-2 border-[var(--c-ink)]/10 bg-[var(--c-tile)] shadow-sm">
            <div
              className="grid h-32 place-items-center bg-[var(--c-soft)] text-[var(--c-accent)]"
              aria-hidden
            >
              <Paw className="h-10 w-10 opacity-60" />
            </div>
            <div className="p-6">
              <h2 className="text-lg font-extrabold" style={display}>
                Ubicación
              </h2>
              <address className="mt-3 not-italic text-sm text-[var(--c-ink)]/70">
                {clinic.address.street}
                <br />
                {clinic.address.neighborhood}, {clinic.address.zip}
              </address>
              <p className="mt-1 text-xs text-[var(--c-ink)]/55">{clinic.address.reference}</p>
              <a
                href={clinic.address.mapsUrl}
                className="mt-3 inline-flex min-h-[44px] items-center text-sm font-extrabold text-[var(--c-accent)] underline-offset-4 hover:underline"
              >
                Ver en Google Maps →
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
