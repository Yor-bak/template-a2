"use client";

import { newsreader, instrumentSans } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import { formatPriceString, scheduleFromOpeningHours } from "@/lib/profileUtils";

// Alterno 02 — concepto ORIGINAL: una LÍNEA DE TIEMPO VERTICAL del proceso terapéutico
// ("Cómo es el proceso") como columna vertebral de la página. Ninguna otra plantilla del
// repo usa este eje: las demás van con secciones apiladas, portal con sidebar, tabs tipo
// dashboard, gradiente de marketing, galería institucional, bento o rejilla de hospital.
// Los hitos (01–04) se alternan a izquierda/derecha de una línea central en escritorio y se
// apilan en una sola columna en móvil. Tema 100% por variables CSS, hex solo en `PALETTES`.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "bruma-azul",
    name: "Bruma azul",
    swatch: "#3f6079",
    surface: "#eef2f6",
    ink: "#1f2a35",
    vars: {
      "--c-bg": "#eef2f6",
      "--c-surface": "#ffffff",
      "--c-ink": "#1f2a35",
      "--c-accent": "#3f6079",
      "--c-accent-deep": "#2f4a5f",
      "--c-soft": "#dde7ef",
    },
  },
  {
    id: "arcilla",
    name: "Arcilla",
    swatch: "#9c5142",
    surface: "#f7f1ee",
    ink: "#322723",
    vars: {
      "--c-bg": "#f7f1ee",
      "--c-surface": "#ffffff",
      "--c-ink": "#322723",
      "--c-accent": "#9c5142",
      "--c-accent-deep": "#7e4034",
      "--c-soft": "#f0e0d9",
    },
  },
  {
    id: "pino",
    name: "Pino",
    swatch: "#2f6b5e",
    surface: "#eef4f1",
    ink: "#16271f",
    vars: {
      "--c-bg": "#eef4f1",
      "--c-surface": "#ffffff",
      "--c-ink": "#16271f",
      "--c-accent": "#2f6b5e",
      "--c-accent-deep": "#234f46",
      "--c-soft": "#d9ebe4",
    },
  },
] as const;

export const DEFAULT_PALETTE_ID = PALETTES[0].id;

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







export function PsicologoTemplate02({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
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
  const paymentMethods = profilePayments.map((m) => ({ cash: "Efectivo", card: "Tarjeta", transfer: "Transferencia", paypal: "PayPal", stripe: "Stripe" } as Record<string, string>)[m] ?? m);

  const activePalette = PALETTES.find((p) => p.id === appearance.selectedPaletteId) ?? PALETTES[0];
  const palActive = PALETTES.indexOf(activePalette);
  const setPalActive = (idx: number) => {
    if (!isPreview && onPaletteChange) onPaletteChange(PALETTES[idx].id);
  };

  const services = profileServices
    .filter((s) => s.isActive)
    .map((s) => ({
      name: s.name,
      description: s.shortDescription,
      price:
        s.priceType === "assessment_required"
          ? "Requiere valoración"
          : s.priceType === "from"
            ? `desde ${formatPriceString("fixed", s.estimatedPrice)}`
            : formatPriceString(s.priceType, s.estimatedPrice) || "Consultar",
    }));

  const firstStepService = services[0];
  const sessionServices = services.slice(1);

  const schedule = scheduleFromOpeningHours(openingHours);

  const testimonials = profileTestimonials
    .filter((t) => t.isPublished)
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99))
    .map((t) => ({
      name: t.name,
      quote: t.comment,
      treatment: profileServices.find((s) => s.id === t.serviceId)?.name ?? "Paciente",
    }));

  const active = palActive;
  const setActive = setPalActive;

  return (
    <div
      className={`${newsreader.variable} ${instrumentSans.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)] pb-28`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-instrument)" }}
    >
      {!isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} />
      )}

      {/* Header calmado: nombre + un solo CTA */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <span className="text-xl tracking-tight" style={{ fontFamily: "var(--f-newsreader)" }}>
          {clinic.name}
        </span>
        <a
          href={clinic.whatsapp}
          className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--c-accent)] px-6 text-sm font-medium text-[var(--c-surface)] transition hover:bg-[var(--c-accent-deep)]"
        >
          Agendar sesión
        </a>
      </header>

      {/* Intro centrada y breve */}
      <section className="mx-auto max-w-2xl px-6 pt-10 pb-16 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--c-accent)]">Cómo es el proceso</p>
        <h1
          className="mt-5 text-4xl leading-[1.15] tracking-tight md:text-5xl"
          style={{ fontFamily: "var(--f-newsreader)" }}
        >
          Ir a terapia no es un salto al vacío. Es un camino que recorremos juntos, paso a paso.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[var(--c-ink)]/70">
          Soy {clinic.doctor}. Acompaño a adultos en procesos individuales y de pareja con un enfoque humanista,
          en consultorio o en línea. Aquí no hay prisa: empezamos por escucharte.
        </p>
      </section>

      {/* LA LÍNEA DE TIEMPO — columna vertebral de la página */}
      <section className="mx-auto max-w-4xl px-6">
        <ol className="relative">
          {/* Línea vertical: a la izquierda en móvil, centrada en escritorio */}
          <span
            className="pointer-events-none absolute top-2 bottom-2 left-[11px] w-px bg-[var(--c-accent)]/30 md:left-1/2 md:-translate-x-1/2"
            aria-hidden
          />

          {/* HITO 01 — Primera conversación */}
          <li className="relative mb-14 pl-12 md:mb-20 md:grid md:grid-cols-2 md:gap-0 md:pl-0">
            {/* Nodo en la línea */}
            <span
              className="absolute top-1.5 left-0 grid h-6 w-6 place-items-center rounded-full bg-[var(--c-accent)] md:left-1/2 md:-translate-x-1/2"
              aria-hidden
            >
              <span className="h-2 w-2 rounded-full bg-[var(--c-surface)]" />
            </span>
            {/* Tarjeta a la IZQUIERDA en escritorio */}
            <div className="md:col-start-1 md:pr-12 md:text-right">
              <div className="rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] p-6 shadow-sm">
                <p className="text-sm font-medium tracking-[0.2em] text-[var(--c-accent)]">01</p>
                <h2 className="mt-2 text-2xl tracking-tight" style={{ fontFamily: "var(--f-newsreader)" }}>
                  Primera conversación
                </h2>
                <p className="mt-3 leading-relaxed text-[var(--c-ink)]/70">
                  Una sesión inicial para conocernos y entender qué te trae. Sin compromiso de continuar:
                  si sientes que no es el espacio para ti, te lo digo con honestidad.
                </p>
                <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2 border-t border-[var(--c-ink)]/10 pt-4 md:flex-row-reverse">
                  <span className="text-lg font-semibold text-[var(--c-accent)]">{firstStepService.price}</span>
                  <span className="text-sm text-[var(--c-ink)]/55">
                    {firstStepService.name} · {firstStepService.description}
                  </span>
                </div>
              </div>
            </div>
          </li>

          {/* HITO 02 — Definimos el enfoque */}
          <li className="relative mb-14 pl-12 md:mb-20 md:grid md:grid-cols-2 md:gap-0 md:pl-0">
            <span
              className="absolute top-1.5 left-0 grid h-6 w-6 place-items-center rounded-full bg-[var(--c-accent)] md:left-1/2 md:-translate-x-1/2"
              aria-hidden
            >
              <span className="h-2 w-2 rounded-full bg-[var(--c-surface)]" />
            </span>
            {/* Tarjeta a la DERECHA en escritorio */}
            <div className="md:col-start-2 md:pl-12">
              <div className="rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] p-6 shadow-sm">
                <p className="text-sm font-medium tracking-[0.2em] text-[var(--c-accent)]">02</p>
                <h2 className="mt-2 text-2xl tracking-tight" style={{ fontFamily: "var(--f-newsreader)" }}>
                  Definimos el enfoque
                </h2>
                <p className="mt-3 leading-relaxed text-[var(--c-ink)]/70">
                  A partir de lo que platicamos acordamos un objetivo claro y el ritmo que te queda: semanal o
                  quincenal, presencial o en línea. La terapia se adapta a tu vida, no al revés.
                </p>
              </div>
            </div>
          </li>

          {/* HITO 03 — Sesiones (modalidades + honorarios) */}
          <li className="relative mb-14 pl-12 md:mb-20 md:grid md:grid-cols-2 md:gap-0 md:pl-0">
            <span
              className="absolute top-1.5 left-0 grid h-6 w-6 place-items-center rounded-full bg-[var(--c-accent)] md:left-1/2 md:-translate-x-1/2"
              aria-hidden
            >
              <span className="h-2 w-2 rounded-full bg-[var(--c-surface)]" />
            </span>
            {/* Tarjeta a la IZQUIERDA en escritorio */}
            <div className="md:col-start-1 md:pr-12">
              <div className="rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] p-6 shadow-sm md:text-left">
                <p className="text-sm font-medium tracking-[0.2em] text-[var(--c-accent)]">03</p>
                <h2 className="mt-2 text-2xl tracking-tight" style={{ fontFamily: "var(--f-newsreader)" }}>
                  Sesiones
                </h2>
                <p className="mt-3 leading-relaxed text-[var(--c-ink)]/70">
                  El corazón del proceso. Trabajamos con regularidad sobre lo que acordamos, revisando el
                  avance sin perder de vista cómo te sientes. Estas son las modalidades y honorarios:
                </p>
                <ul className="mt-5 divide-y divide-[var(--c-ink)]/10 border-t border-[var(--c-ink)]/10">
                  {sessionServices.map((s) => (
                    <li key={s.name} className="flex flex-wrap items-baseline justify-between gap-3 py-3">
                      <span>
                        <span className="font-medium">{s.name}</span>
                        <span className="mt-0.5 block text-sm text-[var(--c-ink)]/55">{s.description}</span>
                      </span>
                      <span className="font-semibold text-[var(--c-accent)]">{s.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>

          {/* HITO 04 — Seguimiento y cierre */}
          <li className="relative pl-12 md:grid md:grid-cols-2 md:gap-0 md:pl-0">
            <span
              className="absolute top-1.5 left-0 grid h-6 w-6 place-items-center rounded-full bg-[var(--c-accent)] md:left-1/2 md:-translate-x-1/2"
              aria-hidden
            >
              <span className="h-2 w-2 rounded-full bg-[var(--c-surface)]" />
            </span>
            {/* Tarjeta a la DERECHA en escritorio */}
            <div className="md:col-start-2 md:pl-12">
              <div className="rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] p-6 shadow-sm">
                <p className="text-sm font-medium tracking-[0.2em] text-[var(--c-accent)]">04</p>
                <h2 className="mt-2 text-2xl tracking-tight" style={{ fontFamily: "var(--f-newsreader)" }}>
                  Seguimiento y cierre
                </h2>
                <p className="mt-3 leading-relaxed text-[var(--c-ink)]/70">
                  Cuando los objetivos se cumplen, espaciamos las sesiones y preparamos un cierre cuidado.
                  La puerta queda abierta: puedes volver cuando lo necesites.
                </p>
              </div>
            </div>
          </li>
        </ol>
      </section>

      {/* Pull-quote calmada en italic (Newsreader) */}
      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p
          className="text-2xl leading-relaxed text-[var(--c-ink)]/80 md:text-3xl"
          style={{ fontFamily: "var(--f-newsreader)", fontStyle: "italic" }}
        >
          &ldquo;Mi trabajo no es darte respuestas, sino acompañarte mientras encuentras las tuyas.&rdquo;
        </p>
        <p className="mt-5 text-sm text-[var(--c-ink)]/55">
          {clinic.doctor} · {specialist.school ?? clinic.school} · Cédula {clinic.license}
        </p>
        {specialist.biography && (
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--c-ink)]/60">{specialist.biography}</p>
        )}
        {specialist.certifications && specialist.certifications.length > 0 && (
          <ul className="mx-auto mt-3 flex flex-wrap justify-center gap-2">
            {specialist.certifications.map((c) => (
              <li key={c} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1 text-xs text-[var(--c-ink)]/60">{c}</li>
            ))}
          </ul>
        )}
      </section>

      {/* Horario y ubicación */}
      <section className="mx-auto max-w-4xl px-6">
        <div className="grid gap-6 rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] p-8 sm:grid-cols-2">
          <div>
            <h2 className="text-2xl tracking-tight" style={{ fontFamily: "var(--f-newsreader)" }}>
              Horario
            </h2>
            <dl className="mt-4 divide-y divide-[var(--c-ink)]/10 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-2.5">
                  <dt className="text-[var(--c-ink)]/70">{row.day}</dt>
                  <dd className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/40" : "font-medium"}>{row.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-2xl tracking-tight" style={{ fontFamily: "var(--f-newsreader)" }}>
              Dónde nos vemos
            </h2>
            <address className="mt-4 not-italic text-sm leading-relaxed text-[var(--c-ink)]/70">
              {clinic.address.street}
              <br />
              {clinic.address.neighborhood}
            </address>
            <p className="mt-2 text-xs text-[var(--c-ink)]/50">{clinic.address.reference}</p>
            <a
              href={clinic.address.mapsUrl}
              className="mt-3 inline-block text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline"
            >
              Ver en Google Maps →
            </a>
          </div>
        </div>
      </section>

      {/* Testimonios — tarjetas suaves */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl tracking-tight" style={{ fontFamily: "var(--f-newsreader)" }}>
          Lo que comparten quienes vienen aquí
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-soft)] p-6"
            >
              <blockquote
                className="flex-1 text-[var(--c-ink)]/80"
                style={{ fontFamily: "var(--f-newsreader)", fontStyle: "italic" }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-xs text-[var(--c-ink)]/50">
                {t.name} · {t.treatment}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Contención + contacto */}
      <section className="mx-auto max-w-4xl px-6">
        <div className="rounded-2xl border border-[var(--c-accent)]/30 bg-[var(--c-soft)] p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--c-accent)]">Si hoy es un día difícil</p>
          <p
            className="mt-3 max-w-2xl text-xl leading-relaxed text-[var(--c-ink)]/80"
            style={{ fontFamily: "var(--f-newsreader)" }}
          >
            No tienes que esperar a tu próxima cita para pedir ayuda. Escríbeme y vemos cómo sostener este momento.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={clinic.whatsapp}
              className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--c-accent)] px-6 text-sm font-medium text-[var(--c-surface)] transition hover:bg-[var(--c-accent-deep)]"
            >
              Escribir por WhatsApp
            </a>
            <a
              href={`tel:${clinic.phoneHref}`}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--c-ink)]/20 px-6 text-sm font-medium transition hover:border-[var(--c-ink)]/40"
            >
              Llamar · {clinic.phone}
            </a>
            <a
              href={`mailto:${clinic.email}`}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--c-ink)]/20 px-6 text-sm font-medium transition hover:border-[var(--c-ink)]/40"
            >
              {clinic.email}
            </a>
          </div>
        </div>

        {paymentMethods.length > 0 && (
          <div className="mt-8 rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] p-5">
            <h2 className="text-sm font-medium">Formas de pago</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1 text-xs text-[var(--c-ink)]/70">{m}</span>
              ))}
            </div>
            {paymentInstructions.showTransferDetails && (
              <div className="mt-4 rounded-xl border border-[var(--c-ink)]/10 bg-[var(--c-bg)] p-3 text-sm text-[var(--c-ink)]/70">
                <p className="font-medium text-[var(--c-ink)]">Transferencia bancaria</p>
                {paymentInstructions.bankName && <p className="mt-1">Banco: {paymentInstructions.bankName}</p>}
                {paymentInstructions.accountHolder && <p>Titular: {paymentInstructions.accountHolder}</p>}
                {paymentInstructions.clabe && <p>CLABE: {paymentInstructions.clabe}</p>}
                {paymentInstructions.accountNumber && <p>Cuenta: {paymentInstructions.accountNumber}</p>}
                {paymentInstructions.cardLastFourDigits && <p>Tarjeta terminación: ••••{paymentInstructions.cardLastFourDigits}</p>}
                {paymentInstructions.paymentLink && (
                  <a href={paymentInstructions.paymentLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">Pagar en línea</a>
                )}
                {paymentInstructions.transferReferenceInstructions && (
                  <p className="mt-2 italic">{paymentInstructions.transferReferenceInstructions}</p>
                )}
              </div>
            )}
          </div>
        )}

        {Object.values(socialLinks).some(Boolean) && (
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">Instagram</a>}
            {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">Facebook</a>}
            {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">TikTok</a>}
            {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">YouTube</a>}
            {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">LinkedIn</a>}
            {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">Sitio web</a>}
          </div>
        )}

        <p className="mt-12 text-center text-sm text-[var(--c-ink)]/50">
          {clinic.name} · {clinic.specialty} · {clinic.experienceYears} años de práctica · {clinic.patients} personas acompañadas
        </p>
      </section>
    </div>
  );
}
