"use client";

import { marcellus, mukta } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import {
  PAYMENT_METHOD_LABEL,
  formatPriceString,
  scheduleFromOpeningHours,
} from "@/lib/profileUtils";

// Alterno 02 de nutriólogo — concepto ORIGINAL "carta de menú" / menú de degustación: la consulta
// nutricional se presenta como una carta de restaurante elegante, con cabecera centrada, cursos
// agrupados, hojas de puntos (leader dots) entre platillo y precio y reglas de hairline. Ningún
// otro template usa esta metáfora. Tema 100% por variables CSS; los hex solo viven en `PALETTES`.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "aceituna",
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
    id: "vino-tinto",
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
    id: "mostaza-y-carbon",
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

export const DEFAULT_PALETTE_ID = PALETTES[0].id;


type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "sesión", from: "desde", consult: "a consulta" };









const serif = { fontFamily: "var(--f-marcellus)" } as const;

export function NutriologoTemplate02({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
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

  const activePalette = PALETTES.find((p) => p.id === appearance.selectedPaletteId) ?? PALETTES[0];
  const active = PALETTES.indexOf(activePalette);
  const setActive = (idx: number) => {
    if (!isPreview && onPaletteChange) onPaletteChange(PALETTES[idx].id);
  };

  const localPriceType = (pt: string): PriceType =>
    pt === "fixed" ? "fixed" : pt === "assessment_required" ? "consult" : "from";

  const services = profileServices
    .filter((s) => s.isActive)
    .map((s) => ({
      name: s.name,
      description: s.shortDescription,
      price: s.priceType === "assessment_required" ? "Consulta" : formatPriceString(s.priceType, s.estimatedPrice) || "Consulta",
      priceType: localPriceType(s.priceType),
      isUrgency: s.isEmergency,
    }));

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

  const schedule = scheduleFromOpeningHours(openingHours);

  const paymentMethods = profilePayments.map((m) => PAYMENT_METHOD_LABEL[m]);

  const testimonials = profileTestimonials
    .filter((t) => t.isPublished)
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99))
    .map((t) => ({
      name: t.name,
      quote: t.comment,
      treatment: profileServices.find((s) => s.id === t.serviceId)?.name ?? "Paciente",
    }));

  return (
    <div
      className={`${marcellus.variable} ${mukta.variable} min-h-screen bg-[var(--c-bg)] pb-28 text-[var(--c-ink)]`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-mukta)" }}
    >
      {isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} />
      )}

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
              {business.name}
            </h1>
            <div className="mx-auto mt-6 flex max-w-xs items-center gap-4">
              <span className="h-px flex-1 bg-[var(--c-ink)]/20" />
              <span className="text-[var(--c-accent)]" aria-hidden>
                ✦
              </span>
              <span className="h-px flex-1 bg-[var(--c-ink)]/20" />
            </div>
            <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[var(--c-ink)]/70">{specialist.specialty}</p>
            <p className="mt-2 text-xs tracking-wide text-[var(--c-ink)]/55">
              {specialist.displayName} · Céd. {specialist.professionalLicense}
            </p>
            {specialist.biography && (
              <p className="mt-4 max-w-md mx-auto text-sm leading-relaxed text-[var(--c-ink)]/70">{specialist.biography}</p>
            )}
            {specialist.school && (
              <p className="mt-2 text-xs text-[var(--c-ink)]/55">Formación: {specialist.school}</p>
            )}
            {specialist.certifications && specialist.certifications.length > 0 && (
              <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-[var(--c-ink)]/65 text-left mx-auto max-w-sm">
                {specialist.certifications.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            )}
            <a
              href={`https://wa.me/${business.whatsapp}`}
              className="mt-7 inline-flex min-h-[44px] items-center border-b border-[var(--c-accent)] px-2 text-sm uppercase tracking-[0.25em] text-[var(--c-accent)] transition hover:text-[var(--c-accent-deep)]"
              style={serif}
            >
              Reservar mesa · Agendar
            </a>
          </header>

          {/* Intro centrada */}
          <p className="mx-auto mt-12 max-w-xl text-center text-lg leading-relaxed text-[var(--c-ink)]/75" style={serif}>
            {specialist.shortDescription}
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
                  href={`tel:${business.phone.replace(/\D/g, "")}`}
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
                {specialist.yearsExperience?.toString() ?? "–"}
              </p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-[var(--c-ink)]/55">Años de práctica</p>
            </div>
            <span className="h-10 w-px bg-[var(--c-ink)]/15" aria-hidden />
            <div>
              <p className="text-3xl text-[var(--c-accent)]" style={serif}>
                {specialist.patientsServed?.toLocaleString("es-MX") ?? "–"}
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
                  {business.address.street}
                  <br />
                  {business.address.neighborhood} · {`${business.address.postalCode ?? ""} ${business.address.city}`.trim()}
                  <br />
                  {business.address.references}
                </address>
                <a
                  href={business.address.mapsUrl}
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
              {paymentInstructions.showTransferDetails && (
                <div className="mt-4 rounded-xl border border-[var(--c-ink)]/15 bg-white/60 p-4 text-sm text-[var(--c-ink)]/70 text-left">
                  <p className="font-semibold text-[var(--c-ink)]">Transferencia bancaria</p>
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
                href={`tel:${business.phone.replace(/\D/g, "")}`}
                className="inline-flex min-h-[44px] flex-col items-center justify-center"
              >
                <span className="text-[0.65rem] uppercase tracking-[0.25em] text-[var(--c-ink)]/50">Teléfono</span>
                <span className="mt-1 text-[var(--c-accent)]">{business.phone}</span>
              </a>
              <a
                href={`https://wa.me/${business.whatsapp}`}
                className="inline-flex min-h-[44px] flex-col items-center justify-center"
              >
                <span className="text-[0.65rem] uppercase tracking-[0.25em] text-[var(--c-ink)]/50">WhatsApp</span>
                <span className="mt-1 text-[var(--c-accent)]">{business.phone}</span>
              </a>
              <a
                href={`mailto:${business.email ?? ""}`}
                className="inline-flex min-h-[44px] flex-col items-center justify-center"
              >
                <span className="text-[0.65rem] uppercase tracking-[0.25em] text-[var(--c-ink)]/50">Correo</span>
                <span className="mt-1 break-all text-[var(--c-accent)]">{business.email ?? ""}</span>
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]">Instagram</a>}
              {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]">Facebook</a>}
              {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]">TikTok</a>}
              {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]">YouTube</a>}
              {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]">LinkedIn</a>}
              {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center text-[var(--c-ink)]/70 hover:text-[var(--c-accent)]">Sitio web</a>}
            </div>

            <p className="mt-8 text-center text-[0.65rem] uppercase tracking-[0.3em] text-[var(--c-ink)]/45">
              {specialist.school ?? ""}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
