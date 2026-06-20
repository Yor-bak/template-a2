"use client";

import { useState } from "react";
import { outfit, ibmPlexSans, jetbrainsMono } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";

// Alterno B — "Tablero clínico": reimagina /medico como un panel de consultorio (estilo EMR),
// con navegación horizontal por pestañas, métricas como widgets de dashboard y servicios
// como tarjetas de módulo en vez de tabla. 3 paletas propias (teal / ámbar / rosa),
// distintas de las de los demás templates.
const palettes = [
  {
    name: "Teal tablero",
    swatch: "#0a6670",
    surface: "#f7f9fb",
    ink: "#16202b",
    vars: {
      "--c-bg": "#f7f9fb",
      "--c-ink": "#16202b",
      "--c-accent": "#0a6670",
      "--c-accent-deep": "#0b5e66",
      "--c-accent-soft": "#7fc6cb",
      "--c-urgent": "#d64545",
    },
  },
  {
    name: "Ámbar tablero",
    swatch: "#b45309",
    surface: "#faf6ef",
    ink: "#2a1c10",
    vars: {
      "--c-bg": "#faf6ef",
      "--c-ink": "#2a1c10",
      "--c-accent": "#b45309",
      "--c-accent-deep": "#92400e",
      "--c-accent-soft": "#f3c98b",
      "--c-urgent": "#c0392b",
    },
  },
  {
    name: "Rosa tablero",
    swatch: "#be185d",
    surface: "#fbf2f6",
    ink: "#2a1320",
    vars: {
      "--c-bg": "#fbf2f6",
      "--c-ink": "#2a1320",
      "--c-accent": "#be185d",
      "--c-accent-deep": "#9d174d",
      "--c-accent-soft": "#f3b8cf",
      "--c-urgent": "#d64545",
    },
  },
] as const;
const doctor = {
  name: "Centro Médico Altavista",
  doctor: "Dr. Joaquín Lemus Ortega",
  specialty: "Medicina Interna",
  school: "Facultad de Medicina, UNAM",
  license: "5821093",
  specialtyLicense: "8834201",
  experienceYears: "16",
  patients: "9,200",
  welcomeMessage:
    "Atención médica integral para adultos: desde el chequeo anual hasta el seguimiento de enfermedades crónicas, con un plan claro y explicado en lenguaje simple.",
  address: {
    street: "Av. Altavista 142, int. 3",
    neighborhood: "San Ángel, Álvaro Obregón",
    zip: "01060 CDMX",
    reference: "A dos cuadras del Parque de la Bombilla",
    mapsUrl: "https://maps.google.com/?q=Av+Altavista+142+CDMX",
  },
  phone: "55 2210 4477",
  phoneHref: "5522104477",
  whatsapp: "https://wa.me/525522104477",
  email: "contacto@centromedicoaltavista.mx",
  social: { facebook: "https://facebook.com", instagram: "https://instagram.com", instagramHandle: "@centroaltavista" },
};

const vitals = [
  { label: "Años de práctica", value: doctor.experienceYears },
  { label: "Pacientes atendidos", value: doctor.patients },
  { label: "Cédula profesional", value: doctor.license },
];

type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "precio fijo", from: "desde", consult: "a consulta" };

const services: { name: string; description: string; price: string; priceType: PriceType; isUrgency?: boolean }[] = [
  { name: "Consulta general", description: "Valoración, historial clínico y diagnóstico inicial.", price: "$650", priceType: "fixed" },
  { name: "Chequeo anual completo", description: "Biometría hemática, química sanguínea y revisión física.", price: "$1,800", priceType: "from" },
  { name: "Control de diabetes e hipertensión", description: "Seguimiento trimestral con ajuste de tratamiento.", price: "$700", priceType: "fixed" },
  { name: "Electrocardiograma", description: "Lectura e interpretación el mismo día.", price: "$450", priceType: "fixed" },
  { name: "Certificado médico", description: "Para trámites escolares, laborales o deportivos.", price: "$400", priceType: "fixed" },
  { name: "Vacunación del adulto", description: "Influenza, neumococo, tétanos y refuerzos.", price: "$350", priceType: "from" },
  { name: "Valoración prequirúrgica", description: "Dictamen de riesgo para cirugía programada.", price: "$900", priceType: "fixed" },
  { name: "Urgencia ambulatoria", description: "Fiebre alta, dolor agudo o malestar súbito.", price: "Consulta", priceType: "consult", isUrgency: true },
];

const schedule = [
  { day: "Lunes a viernes", hours: "8:00 – 19:00" },
  { day: "Sábado", hours: "9:00 – 14:00" },
  { day: "Domingo", hours: "Cerrado" },
];

const paymentMethods = ["Efectivo", "Tarjeta", "Transferencia", "Seguro de gastos médicos"];

const testimonials = [
  { name: "Rosa M.", quote: "Me explicó mis estudios sin tecnicismos y le dio seguimiento a mi tratamiento mes con mes.", treatment: "Control de hipertensión" },
  { name: "Felipe A.", quote: "Sacó mi certificado médico el mismo día, justo cuando lo necesitaba para el trabajo.", treatment: "Certificado médico" },
  { name: "Diana C.", quote: "El chequeo anual fue completo y me detectaron algo a tiempo gracias a sus estudios.", treatment: "Chequeo anual" },
];

const navLinks = [
  { href: "#especialista", label: "Especialista" },
  { href: "#servicios", label: "Servicios" },
  { href: "#ubicacion", label: "Ubicación" },
  { href: "#urgencias", label: "Urgencias" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#contacto", label: "Contacto" },
];

export default function MedicoTemplate02() {
  const [active, setActive] = useState(0);

  return (
    <div
      className={`${outfit.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)]`}
      style={{ ...(palettes[active].vars as React.CSSProperties), fontFamily: "var(--f-ibm-plex-sans)" }}
    >
      <PaletteSwitcher palettes={palettes} active={active} onSelect={setActive} />
      {/* Header: horizontal tab nav, not a sidebar — this is a "panel" you scan left to right */}
      <header className="sticky top-0 z-30 border-b border-[var(--c-ink)]/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--c-accent)]">Tablero clínico</p>
            <h1 className="text-base font-semibold" style={{ fontFamily: "var(--f-outfit)" }}>{doctor.name}</h1>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-[var(--c-ink)]/60 lg:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="transition hover:text-[var(--c-accent)]">{l.label}</a>
            ))}
          </nav>
          <a href={doctor.whatsapp} className="rounded-md bg-[var(--c-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--c-accent-deep)]">
            Agendar consulta
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-12 pb-28">
        {/* Hero: intro + a dashboard panel of stat tiles, side by side like a desk view */}
        <section className="grid gap-8 pb-12 md:grid-cols-[1.2fr_1fr] md:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">{doctor.specialty} · CDMX</p>
            <h2 className="mt-4 max-w-xl text-4xl leading-[1.1] md:text-5xl" style={{ fontFamily: "var(--f-outfit)" }}>
              El panorama completo de tu salud, en un solo lugar.
            </h2>
            <p className="mt-5 max-w-lg text-[var(--c-ink)]/70">{doctor.welcomeMessage}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={doctor.whatsapp} className="rounded-md bg-[var(--c-accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--c-accent-deep)]">
                Agendar consulta
              </a>
              <a href={`tel:${doctor.phoneHref}`} className="rounded-md border border-[var(--c-ink)]/20 px-6 py-3 text-sm font-medium transition hover:border-[var(--c-ink)]/50">
                Llamar al consultorio
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--c-ink)]/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-ink)]/50">Panorama del consultorio</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {vitals.map((v) => (
                <div key={v.label} className="rounded-xl border border-[var(--c-accent)]/15 bg-[var(--c-accent)]/5 p-3">
                  <dd className="text-lg font-semibold text-[var(--c-accent)]" style={{ fontFamily: "var(--f-jetbrains)" }}>{v.value}</dd>
                  <dt className="mt-1 text-xs leading-tight text-[var(--c-ink)]/60">{v.label}</dt>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Especialista */}
        <section id="especialista" className="grid gap-10 border-t border-[var(--c-ink)]/10 py-12 md:grid-cols-[1fr_1.4fr]">
          <div className="aspect-square rounded-2xl bg-[var(--c-accent)]/10" aria-hidden />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-accent)]">Perfil del médico</p>
            <h3 className="mt-2 text-2xl" style={{ fontFamily: "var(--f-outfit)" }}>{doctor.doctor}</h3>
            <p className="mt-3 max-w-lg text-[var(--c-ink)]/70">
              Médico cirujano con especialidad en {doctor.specialty} por la {doctor.school}. Cédula de
              especialidad {doctor.specialtyLicense}.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-[var(--c-ink)]/70">
              <li>· Historial clínico completo desde la primera consulta.</li>
              <li>· Resultados de laboratorio explicados, no solo entregados.</li>
              <li>· Seguimiento programado para padecimientos crónicos.</li>
            </ul>
          </div>
        </section>

        {/* Servicios: módulos de tarjeta en vez de tabla */}
        <section id="servicios" className="border-t border-[var(--c-ink)]/10 py-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-accent)]">Módulos disponibles</p>
          <h3 className="mt-2 text-2xl" style={{ fontFamily: "var(--f-outfit)" }}>Consultas y estudios</h3>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.name}
                className={`rounded-xl border p-5 ${s.isUrgency ? "border-[var(--c-urgent)]/30 bg-[var(--c-urgent)]/5" : "border-[var(--c-ink)]/10 bg-white"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-medium">{s.name}</h4>
                  <span
                    className="whitespace-nowrap text-base font-semibold text-[var(--c-accent)]"
                    style={{ fontFamily: "var(--f-jetbrains)" }}
                  >
                    {s.price}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--c-ink)]/60">{s.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-[var(--c-ink)]/40">{priceTypeLabel[s.priceType]}</span>
                  {s.isUrgency && (
                    <span className="rounded-full bg-[var(--c-urgent)]/15 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-[var(--c-urgent)]">
                      Urgente
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ubicación */}
        <section id="ubicacion" className="grid gap-10 border-t border-[var(--c-ink)]/10 py-12 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-accent)]">Acceso</p>
            <h3 className="mt-2 text-2xl" style={{ fontFamily: "var(--f-outfit)" }}>Ubicación y horario</h3>
            <address className="mt-4 not-italic text-[var(--c-ink)]/70">
              {doctor.address.street}<br />
              {doctor.address.neighborhood}<br />
              {doctor.address.zip}
            </address>
            <p className="mt-2 text-sm text-[var(--c-ink)]/60">{doctor.address.reference}</p>
            <a href={doctor.address.mapsUrl} className="mt-3 inline-block text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-8 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-md border border-[var(--c-ink)]/15 px-3 py-1 text-xs text-[var(--c-ink)]/70">{m}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--c-ink)]/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-ink)]/50">Disponibilidad</p>
            <div className="mt-3 divide-y divide-[var(--c-ink)]/10 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-2">
                  <span className="text-[var(--c-ink)]/70">{row.day}</span>
                  <span
                    className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/40" : "font-medium"}
                    style={{ fontFamily: "var(--f-jetbrains)" }}
                  >
                    {row.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Urgencias: alerta de panel, no bloque sólido */}
        <section id="urgencias" className="border-t border-[var(--c-ink)]/10 py-12">
          <div className="rounded-xl border-l-[6px] border-[var(--c-urgent)] bg-[var(--c-urgent)]/10 px-6 py-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-urgent)]">Alerta · Urgencia ambulatoria</p>
            <h3 className="mt-2 max-w-md text-xl" style={{ fontFamily: "var(--f-outfit)" }}>
              Fiebre alta, dolor agudo o malestar súbito no esperan turno.
            </h3>
            <div className="mt-5 flex gap-4">
              <a href={`tel:${doctor.phoneHref}`} className="rounded-md bg-[var(--c-urgent)] px-6 py-3 text-sm font-medium text-white">Llamar ahora</a>
              <a href={doctor.whatsapp} className="rounded-md border border-[var(--c-ink)]/20 px-6 py-3 text-sm font-medium">WhatsApp de urgencias</a>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section id="testimonios" className="border-t border-[var(--c-ink)]/10 py-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-accent)]">Registro de pacientes</p>
          <h3 className="mt-2 text-2xl" style={{ fontFamily: "var(--f-outfit)" }}>Lo que cuentan los pacientes</h3>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-xl border border-[var(--c-ink)]/10 bg-white p-5">
                <blockquote className="text-sm text-[var(--c-ink)]/80">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-3 text-xs text-[var(--c-ink)]/50">{t.name} · {t.treatment}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Contacto: panel de cierre */}
        <section id="contacto" className="my-4 rounded-2xl bg-[var(--c-ink)] px-8 py-10 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-accent-soft)]">Contacto</p>
          <h3 className="mt-2 text-2xl" style={{ fontFamily: "var(--f-outfit)" }}>Agenda tu consulta</h3>
          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="text-white/50">Teléfono</div>
              <a href={`tel:${doctor.phoneHref}`} className="mt-1 block font-medium">{doctor.phone}</a>
            </div>
            <div>
              <div className="text-white/50">WhatsApp</div>
              <a href={doctor.whatsapp} className="mt-1 block font-medium">{doctor.phone}</a>
            </div>
            <div>
              <div className="text-white/50">Correo</div>
              <a href={`mailto:${doctor.email}`} className="mt-1 block font-medium">{doctor.email}</a>
            </div>
            <div>
              <div className="text-white/50">Redes</div>
              <div className="mt-1 flex flex-col gap-1">
                <a href={doctor.social.facebook}>Facebook</a>
                <a href={doctor.social.instagram}>Instagram {doctor.social.instagramHandle}</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
