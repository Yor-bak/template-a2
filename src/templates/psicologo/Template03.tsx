"use client";

import { fraunces, figtree } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import { formatPriceString, scheduleFromOpeningHours } from "@/lib/profileUtils";

// Alterno 03 — concepto ORIGINAL: una CARTA ÍNTIMA + FAQ CONVERSACIONAL.
// Una sola columna centrada y angosta (max-w-2xl), mucho aire, serif calmada y grande.
// Se lee como una carta personal firmada por la terapeuta, no como un landing de marketing.
// Es deliberadamente distinto del alterno 02 (línea de tiempo del proceso) y de la base
// (portal con sidebar + tabs): aquí no hay tarjetas en rejilla, no hay <details>, no hay
// secciones full-width apiladas — solo prosa en primera persona, preguntas→respuestas
// separadas por hairlines y pull-quotes literarias. Tema 100% por variables CSS; hex solo
// en `PALETTES`.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "durazno-suave",
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
    id: "cielo-bruma",
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
    id: "jardin",
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

export const DEFAULT_PALETTE_ID = PALETTES[0].id;








const serif = { fontFamily: "var(--f-fraunces)" } as const;
const serifItalic = { fontFamily: "var(--f-fraunces)", fontStyle: "italic" } as const;

export function PsicologoTemplate03({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
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
      className={`${fraunces.variable} ${figtree.variable} relative min-h-screen overflow-hidden bg-[var(--c-bg)] text-[var(--c-ink)] pb-28`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-figtree)" }}
    >
      {!isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} />
      )}

      {/* Atmósfera suave: un solo resplandor difuso arriba, para dar profundidad sin ruido */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[460px]"
        style={{ background: "radial-gradient(70% 100% at 50% 0%, var(--c-soft), transparent 72%)" }}
      />

      {/* Barra superior mínima: nombre a la izquierda, enlace discreto a la derecha */}
      <header className="relative z-10 mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <span className="text-sm tracking-wide text-[var(--c-ink)]/70" style={serif}>
          {business.name}
        </span>
        <a
          href={`https://wa.me/${business.whatsapp}`}
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
              Llevo {specialist.yearsExperience?.toString() ?? "–"} años acompañando a adultos en terapia individual y de pareja.
              Estudié en la {specialist.school ?? ""} y, con el tiempo, fui afinando una forma de trabajar
              desde lo humanista: sin diagnósticos que te etiqueten ni prisas por &ldquo;arreglarte&rdquo;.
            </p>
            <p>
              Creo que la terapia no es un consultorio frío ni una lista de tareas. Es un espacio
              tuyo, a tu ritmo, donde podemos mirar de cerca lo que duele y lo que quieres cambiar,
              sin que nadie te apure.
            </p>
            <p>
              Hago {specialist.specialty.toLowerCase()}. Si quieres, te cuento aquí mismo cómo es
              trabajar conmigo, para que decidas con calma y sin presión.
            </p>
          </div>

          {specialist.biography && (
            <p className="mt-6 text-base leading-relaxed text-[var(--c-ink)]/65">{specialist.biography}</p>
          )}
          {specialist.school && (
            <p className="mt-2 text-sm text-[var(--c-ink)]/55">{specialist.school}</p>
          )}
          {specialist.certifications && specialist.certifications.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {specialist.certifications.map((c) => (
                <li key={c} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1 text-xs text-[var(--c-ink)]/55">{c}</li>
              ))}
            </ul>
          )}
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
                Como prefieras. Atiendo en consultorio en {business.address.neighborhood}, y también
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
            El consultorio está en {business.address.street}, {business.address.neighborhood}.{" "}
            {business.address.references}.
          </p>
          <a
            href={business.address.mapsUrl}
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
              href={`https://wa.me/${business.whatsapp}`}
              className="inline-flex min-h-[44px] items-center rounded-xl bg-[var(--c-accent)] px-6 text-sm font-medium text-[var(--c-surface)] transition hover:bg-[var(--c-accent-deep)]"
            >
              Escribir por WhatsApp
            </a>
            <a
              href={`tel:${business.phone.replace(/\D/g, "")}`}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-[var(--c-ink)]/20 px-6 text-sm font-medium transition hover:border-[var(--c-ink)]/40"
            >
              Llamar · {business.phone}
            </a>
            <a
              href={`mailto:${business.email ?? ""}`}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-[var(--c-ink)]/20 px-6 text-sm font-medium transition hover:border-[var(--c-ink)]/40"
            >
              {business.email ?? ""}
            </a>
          </div>

          {paymentMethods.length > 0 && (
            <div className="mt-8 rounded-2xl border border-[var(--c-ink)]/10 bg-[var(--c-soft)]/60 p-5">
              <p className="text-sm font-medium" style={serif}>Formas de pago</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {paymentMethods.map((m) => (
                  <span key={m} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1 text-xs text-[var(--c-ink)]/70">{m}</span>
                ))}
              </div>
              {paymentInstructions.showTransferDetails && (
                <div className="mt-4 rounded-xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] p-3 text-sm text-[var(--c-ink)]/70">
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
            <div className="mt-6 flex flex-wrap gap-4">
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">Instagram</a>}
              {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">Facebook</a>}
              {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">TikTok</a>}
              {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">YouTube</a>}
              {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">LinkedIn</a>}
              {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">Sitio web</a>}
            </div>
          )}

          <p className="mt-12 text-sm leading-relaxed text-[var(--c-ink)]/50">
            {specialist.displayName} · {specialist.school ?? ""} · Cédula profesional {specialist.professionalLicense} ·{" "}
            {specialist.patientsServed?.toLocaleString("es-MX") ?? "–"} personas acompañadas en {specialist.yearsExperience?.toString() ?? "–"} años.
          </p>
        </section>
        </div>
      </main>
    </div>
  );
}
