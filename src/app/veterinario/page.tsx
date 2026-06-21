"use client";

import { useState } from "react";
import { archivo, karla } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";

// 3 paletas propias de veterinario, familias distintas entre sí (y de los demás templates):
// --c-header es la banda viva (header), --c-accent el tono cálido de texto/precios/urgencia,
// --c-ink el oscuro, --c-bg el crema, --c-ink-deep el hover oscuro. El swatch es el header.
const palettes = [
  {
    name: "Ámbar campo",
    swatch: "#f4a637",
    surface: "#fbf3e7",
    ink: "#2e3b2c",
    vars: {
      "--c-bg": "#fbf3e7",
      "--c-ink": "#2e3b2c",
      "--c-ink-deep": "#1e2a1c",
      "--c-accent": "#c0622b",
      "--c-header": "#f4a637",
    },
  },
  {
    name: "Aqua coral",
    swatch: "#2bb3a3",
    surface: "#edf6f3",
    ink: "#1d3a35",
    vars: {
      "--c-bg": "#edf6f3",
      "--c-ink": "#1d3a35",
      "--c-ink-deep": "#122a26",
      "--c-accent": "#c8482f",
      "--c-header": "#2bb3a3",
    },
  },
  {
    name: "Lila durazno",
    swatch: "#a78bdb",
    surface: "#f5f1fb",
    ink: "#2c2440",
    vars: {
      "--c-bg": "#f5f1fb",
      "--c-ink": "#2c2440",
      "--c-ink-deep": "#1f1930",
      "--c-accent": "#b0531f",
      "--c-header": "#a78bdb",
    },
  },
] as const;

// Signature motifs for this specialty: a paw-print bullet/divider (instead of a generic dot or rule)
// and a "cartilla de vacunación" stamp-card layout for services, evoking a pet's actual vaccination booklet.
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

export default function VeterinarioTemplate() {
  const [active, setActive] = useState(0);

  return (
    <div
      className={`${archivo.variable} ${karla.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)]`}
      style={{ ...(palettes[active].vars as React.CSSProperties), fontFamily: "var(--f-karla)" }}
    >
      <PaletteSwitcher palettes={palettes} active={active} onSelect={setActive} />
      {/* Header */}
      <header className="border-b-4 border-[var(--c-ink)] bg-[var(--c-header)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <Paw className="h-7 w-7 text-[var(--c-ink)]" />
            <h1 className="text-lg font-black uppercase tracking-tight" style={{ fontFamily: "var(--f-archivo)" }}>
              {clinic.name}
            </h1>
          </div>
          <a href={clinic.whatsapp} className="rounded-full bg-[var(--c-ink)] px-5 py-2.5 text-sm font-bold text-[var(--c-bg)] transition hover:bg-[var(--c-ink-deep)]">
            Agendar cita
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-14 pb-28">
        {/* Hero */}
        <section className="grid gap-10 pb-14 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--c-accent)]">{clinic.specialty}</p>
            <h2
              className="mt-4 max-w-xl text-4xl font-black leading-[1.1] md:text-5xl"
              style={{ fontFamily: "var(--f-archivo)" }}
            >
              Para tu mascota, no para cualquier paciente.
            </h2>
            <p className="mt-5 max-w-lg text-[var(--c-ink)]/70">{clinic.welcomeMessage}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={clinic.whatsapp} className="rounded-full bg-[var(--c-ink)] px-6 py-3 text-sm font-bold text-[var(--c-bg)] transition hover:bg-[var(--c-ink-deep)]">
                Agendar cita
              </a>
              <a href={`tel:${clinic.phoneHref}`} className="rounded-full border-2 border-[var(--c-ink)]/30 px-6 py-3 text-sm font-bold transition hover:border-[var(--c-ink)]/60">
                Llamar a la clínica
              </a>
            </div>
            <PawTrail className="mt-10 text-[var(--c-accent)]/50" />
          </div>

          <div className="rounded-[2rem] border-4 border-[var(--c-ink)] bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--c-accent)]">Cartilla de la clínica</p>
            <dl className="mt-4 space-y-4">
              {stamps.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between border-b-2 border-dashed border-[var(--c-ink)]/20 pb-3 last:border-0 last:pb-0">
                  <dt className="text-sm text-[var(--c-ink)]/60">{s.label}</dt>
                  <dd className="font-mono text-xl font-bold text-[var(--c-accent)]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Especialista */}
        <section id="especialista" className="grid gap-10 border-t-2 border-dashed border-[var(--c-ink)]/20 py-14 md:grid-cols-[1fr_1.4fr]">
          <div className="aspect-square rounded-[2rem] bg-[var(--c-header)]/30" aria-hidden />
          <div>
            <h3 className="text-2xl font-black" style={{ fontFamily: "var(--f-archivo)" }}>{clinic.doctor}</h3>
            <p className="mt-3 max-w-lg text-[var(--c-ink)]/70">
              Médica veterinaria zootecnista con especialidad en {clinic.specialty}, egresada de la {clinic.school}.
              Cédula profesional {clinic.license}.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-[var(--c-ink)]/70">
              <li>🐾 Manejo de bajo estrés para perros y gatos.</li>
              <li>🐾 Hospitalización con monitoreo permanente.</li>
              <li>🐾 Cartilla digital con historial completo de cada mascota.</li>
            </ul>
          </div>
        </section>

        {/* Servicios */}
        <section id="servicios" className="border-t-2 border-dashed border-[var(--c-ink)]/20 py-14">
          <h3 className="text-2xl font-black" style={{ fontFamily: "var(--f-archivo)" }}>Servicios y cartilla de precios</h3>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.name}
                className={`rounded-2xl border-2 p-5 ${s.isUrgency ? "border-[var(--c-accent)] bg-[var(--c-accent)]/10" : "border-[var(--c-ink)]/15 bg-white"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2">
                    <Paw className="mt-1 h-4 w-4 shrink-0 text-[var(--c-accent)]" />
                    <h4 className="font-bold">{s.name}</h4>
                  </div>
                  <span className="whitespace-nowrap font-mono text-lg font-bold text-[var(--c-accent)]">{s.price}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--c-ink)]/60">{s.description}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-[var(--c-ink)]/40">{priceTypeLabel[s.priceType]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ubicación */}
        <section id="ubicacion" className="grid gap-10 border-t-2 border-dashed border-[var(--c-ink)]/20 py-14 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-black" style={{ fontFamily: "var(--f-archivo)" }}>Ubicación y horario</h3>
            <address className="mt-4 not-italic text-[var(--c-ink)]/70">
              {clinic.address.street}<br />
              {clinic.address.neighborhood}<br />
              {clinic.address.zip}
            </address>
            <p className="mt-2 text-sm text-[var(--c-ink)]/60">{clinic.address.reference}</p>
            <a href={clinic.address.mapsUrl} className="mt-3 inline-block text-sm font-bold text-[var(--c-accent)] underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-8 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border-2 border-[var(--c-ink)]/15 px-3 py-1 text-xs font-bold text-[var(--c-ink)]/70">{m}</span>
              ))}
            </div>
          </div>
          <div className="divide-y-2 divide-dashed divide-[var(--c-ink)]/15 self-start rounded-2xl border-2 border-[var(--c-ink)]/15 bg-white p-6 text-sm">
            {schedule.map((row) => (
              <div key={row.day} className="flex justify-between py-2">
                <span className="text-[var(--c-ink)]/70">{row.day}</span>
                <span className="font-bold">{row.hours}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Urgencias */}
        <section id="urgencias" className="my-14 rounded-[2rem] bg-[var(--c-ink)] px-8 py-10 text-[var(--c-bg)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--c-header)]">Urgencia 24 horas</p>
          <h3 className="mt-3 max-w-md text-2xl font-black" style={{ fontFamily: "var(--f-archivo)" }}>
            Intoxicación, trauma o dificultad para respirar no esperan.
          </h3>
          <div className="mt-6 flex gap-4">
            <a href={`tel:${clinic.phoneHref}`} className="rounded-full bg-[var(--c-accent)] px-6 py-3 text-sm font-bold text-white">Llamar ahora</a>
            <a href={clinic.whatsapp} className="rounded-full border-2 border-[var(--c-bg)]/40 px-6 py-3 text-sm font-bold">WhatsApp de urgencias</a>
          </div>
        </section>

        {/* Testimonios */}
        <section id="testimonios" className="border-t-2 border-dashed border-[var(--c-ink)]/20 py-14">
          <h3 className="text-2xl font-black" style={{ fontFamily: "var(--f-archivo)" }}>Lo que cuentan los dueños</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border-2 border-[var(--c-ink)]/15 bg-white p-5">
                <blockquote className="text-[var(--c-ink)]/80">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-3 text-xs font-bold text-[var(--c-ink)]/50">{t.name} · {t.treatment}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section id="contacto" className="border-t-2 border-dashed border-[var(--c-ink)]/20 py-14">
          <h3 className="text-2xl font-black" style={{ fontFamily: "var(--f-archivo)" }}>Agenda la cita de tu mascota</h3>
          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="text-[var(--c-ink)]/50">Teléfono</div>
              <a href={`tel:${clinic.phoneHref}`} className="mt-1 block font-bold">{clinic.phone}</a>
            </div>
            <div>
              <div className="text-[var(--c-ink)]/50">WhatsApp</div>
              <a href={clinic.whatsapp} className="mt-1 block font-bold">{clinic.phone}</a>
            </div>
            <div>
              <div className="text-[var(--c-ink)]/50">Correo</div>
              <a href={`mailto:${clinic.email}`} className="mt-1 block font-bold">{clinic.email}</a>
            </div>
            <div>
              <div className="text-[var(--c-ink)]/50">Redes</div>
              <div className="mt-1 flex flex-col gap-1">
                <a href={clinic.social.facebook}>Facebook</a>
                <a href={clinic.social.instagram}>Instagram {clinic.social.instagramHandle}</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
