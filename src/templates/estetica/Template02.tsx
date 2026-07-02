"use client";

import { cormorant, jost } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import {
  PAYMENT_METHOD_LABEL,
  formatPriceString,
  scheduleFromOpeningHours,
} from "@/lib/profileUtils";

// Alterno 02 de estética — layout tipo salón-belleza fotográfico (ref. leonora-studio.mx):
// header sticky con CTA pill, hero full-bleed con "foto" overlay, REJILLA DE TARJETAS DE
// SERVICIO donde cada tarjeta tiene su propia foto + nombre + precio + botón "Agendar cita",
// banda de stats, feed de comunidad en Instagram, mini bio de especialista, reseñas y footer.
// Esta forma (foto por tarjeta + reserva por tarjeta + feed IG) no la usa ninguna otra
// plantilla del repo. Tema 100% por variables CSS con 3 paletas nude/cálidas.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "nude-rosado",
    name: "Nude rosado",
    swatch: "#b06b78",
    surface: "#faf3f1",
    ink: "#2e2429",
    vars: {
      "--c-bg": "#faf3f1",
      "--c-surface": "#ffffff",
      "--c-ink": "#2e2429",
      "--c-accent": "#b06b78",
      "--c-accent-deep": "#8f5160",
      "--c-soft": "#f3e1dd",
    },
  },
  {
    id: "champagne",
    name: "Champagne",
    swatch: "#9c7b3f",
    surface: "#f8f4ec",
    ink: "#2b2620",
    vars: {
      "--c-bg": "#f8f4ec",
      "--c-surface": "#ffffff",
      "--c-ink": "#2b2620",
      "--c-accent": "#9c7b3f",
      "--c-accent-deep": "#7d6231",
      "--c-soft": "#efe6d3",
    },
  },
  {
    id: "lavanda-chic",
    name: "Lavanda chic",
    swatch: "#7e6aa8",
    surface: "#f4f1f8",
    ink: "#272430",
    vars: {
      "--c-bg": "#f4f1f8",
      "--c-surface": "#ffffff",
      "--c-ink": "#272430",
      "--c-accent": "#7e6aa8",
      "--c-accent-deep": "#63518a",
      "--c-soft": "#e7e1f1",
    },
  },
] as const;

export const DEFAULT_PALETTE_ID = PALETTES[0].id;


type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "sesión", from: "desde", consult: "a consulta" };









const cormorantStyle = { fontFamily: "var(--f-cormorant)" } as React.CSSProperties;

// Glifo de Instagram para el feed de comunidad.
const IconInstagram = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// Monograma reutilizable: inicial del servicio sobre la "foto" placeholder de cada tarjeta.
function PhotoTile({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[var(--c-soft)] ${className}`} aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--c-accent)]/15 via-transparent to-[var(--c-accent-deep)]/20" />
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full border border-[var(--c-accent)]/25" />
      <div className="absolute bottom-3 left-4 h-px w-10 bg-[var(--c-accent)]/50" />
      <span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl text-[var(--c-accent)]/40"
        style={cormorantStyle}
      >
        {label}
      </span>
    </div>
  );
}

export function EsteticaTemplate02({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
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

  const schedule = scheduleFromOpeningHours(openingHours);

  const paymentMethods = profilePayments.map((m) => PAYMENT_METHOD_LABEL[m]);

  const igHandle = socialLinks.instagram
    ? "@" + socialLinks.instagram.replace(/.*instagram\.com\//, "").replace(/\/?$/, "")
    : "";

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
      className={`${cormorant.variable} ${jost.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)] pb-28`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-jost)" }}
    >
      {isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} />
      )}

      {/* Header sticky: nombre del salón + CTA pill */}
      <header className="sticky top-0 z-30 border-b border-[var(--c-ink)]/10 bg-[var(--c-bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-col leading-none">
            <span className="text-2xl tracking-wide" style={cormorantStyle}>{business.name}</span>
            <span className="mt-1 text-[0.62rem] uppercase tracking-[0.32em] text-[var(--c-ink)]/55">Estudio de belleza</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-[var(--c-ink)]/70 md:flex">
            <a href="#servicios" className="transition hover:text-[var(--c-accent)]">Servicios</a>
            <a href="#comunidad" className="transition hover:text-[var(--c-accent)]">Comunidad</a>
            <a href="#especialista" className="transition hover:text-[var(--c-accent)]">Especialista</a>
            <a href="#contacto" className="transition hover:text-[var(--c-accent)]">Contacto</a>
          </nav>
          <a
            href={`https://wa.me/${business.whatsapp}`}
            className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--c-accent)] px-6 text-sm font-medium text-[var(--c-surface)] transition hover:bg-[var(--c-accent-deep)]"
          >
            Agendar cita
          </a>
        </div>
      </header>

      {/* Hero full-bleed: gran área de "foto" con titular elegante superpuesto */}
      <section className="relative isolate flex min-h-[78vh] items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-0 -z-10 bg-[var(--c-soft)]" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--c-accent)]/20 via-[var(--c-bg)]/30 to-[var(--c-accent-deep)]/30" aria-hidden />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--c-accent)]/15 blur-3xl" aria-hidden />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--c-surface)]/40" aria-hidden />
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.36em] text-[var(--c-accent-deep)]">{specialist.specialty}</p>
          <h1 className="mt-6 text-5xl leading-[1.02] sm:text-6xl md:text-7xl" style={cormorantStyle}>
            Realza tu belleza,<br />sin perder tu esencia.
          </h1>
          <p className="mx-auto mt-7 max-w-md text-[var(--c-ink)]/70">{specialist.shortDescription}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              href={`https://wa.me/${business.whatsapp}`}
              className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--c-ink)] px-8 text-sm font-medium text-[var(--c-surface)] transition hover:bg-[var(--c-accent)]"
            >
              Agendar cita
            </a>
            <a
              href={`tel:${business.phone.replace(/\D/g, "")}`}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--c-ink)]/30 px-8 text-sm font-medium transition hover:border-[var(--c-ink)]/60"
            >
              Llamar al estudio
            </a>
          </div>
        </div>
      </section>

      {/* Servicios: REJILLA DE TARJETAS con foto + nombre + precio + botón propio (firma del layout) */}
      <section id="servicios" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--c-accent-deep)]">El menú del estudio</p>
          <h2 className="mt-3 text-4xl md:text-5xl" style={cormorantStyle}>Nuestros tratamientos</h2>
          <p className="mx-auto mt-4 max-w-lg text-[var(--c-ink)]/65">
            Cada servicio se agenda por separado. Elige el tuyo y reserva en segundos.
          </p>
        </div>

        <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article
              key={s.name}
              className={`group flex flex-col overflow-hidden rounded-3xl border shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                s.isUrgency
                  ? "border-[var(--c-accent)]/40 bg-[var(--c-soft)]"
                  : "border-[var(--c-ink)]/10 bg-[var(--c-surface)]"
              }`}
            >
              <PhotoTile label={s.name.charAt(0)} className="aspect-[4/3]" />
              <div className="flex flex-1 flex-col p-6">
                {s.isUrgency && (
                  <span className="mb-2 self-start rounded-full bg-[var(--c-accent)] px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[var(--c-surface)]">
                    Atención post-tratamiento
                  </span>
                )}
                <h3 className="text-2xl" style={cormorantStyle}>{s.name}</h3>
                <p className="mt-2 flex-1 text-sm text-[var(--c-ink)]/65">{s.description}</p>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <span className="block text-[0.62rem] uppercase tracking-[0.18em] text-[var(--c-ink)]/45">
                      {priceTypeLabel[s.priceType]}
                    </span>
                    <span className="text-2xl text-[var(--c-accent-deep)]" style={cormorantStyle}>{s.price}</span>
                  </div>
                  <a
                    href={s.isUrgency ? `tel:${business.phone.replace(/\D/g, "")}` : `https://wa.me/${business.whatsapp}`}
                    className={`inline-flex min-h-[44px] items-center rounded-full px-5 text-sm font-medium transition ${
                      s.isUrgency
                        ? "bg-[var(--c-accent)] text-[var(--c-surface)] hover:bg-[var(--c-accent-deep)]"
                        : "border border-[var(--c-ink)]/20 text-[var(--c-ink)] hover:border-[var(--c-accent)] hover:text-[var(--c-accent-deep)]"
                    }`}
                  >
                    {s.isUrgency ? "Llamar ahora" : "Agendar cita"}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Stats / por qué: banda elegante */}
      <section className="bg-[var(--c-soft)]">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 text-center sm:grid-cols-3">
          {[
            { value: `${specialist.yearsExperience?.toString() ?? "–"} años`, label: "perfeccionando el detalle" },
            { value: `+${specialist.patientsServed?.toLocaleString("es-MX") ?? "–"}`, label: "pacientes atendidas" },
            { value: `Céd. ${specialist.professionalLicense}`, label: "respaldo profesional" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl text-[var(--c-accent-deep)] md:text-5xl" style={cormorantStyle}>{stat.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--c-ink)]/55">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comunidad en Instagram: rejilla de 6 tiles cuadrados con glifo + handle */}
      <section id="comunidad" className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--c-soft)] text-[var(--c-accent-deep)]">
            <IconInstagram className="h-6 w-6" />
          </span>
          <h2 className="text-4xl md:text-5xl" style={cormorantStyle}>Nuestra comunidad</h2>
          <a
            href={socialLinks.instagram ?? "#"}
            className="text-sm font-medium text-[var(--c-accent-deep)] underline-offset-4 hover:underline"
          >
            {igHandle} · Síguenos →
          </a>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <a
              key={i}
              href={socialLinks.instagram ?? "#"}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-[var(--c-soft)]"
              aria-label={`Ver publicación ${i + 1} en Instagram`}
            >
              <div className={`absolute inset-0 ${i % 2 === 0 ? "bg-[var(--c-accent)]/12" : "bg-[var(--c-accent-deep)]/14"}`} />
              <div className="absolute -left-5 -top-5 h-20 w-20 rounded-full border border-[var(--c-accent)]/25" aria-hidden />
              <span className="absolute inset-0 flex items-center justify-center text-[var(--c-accent-deep)]/45 transition group-hover:text-[var(--c-accent-deep)]">
                <IconInstagram className="h-8 w-8" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Especialista: mini bio */}
      <section id="especialista" className="bg-[var(--c-surface)]">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-20 md:grid-cols-[0.8fr_1.2fr]">
          <PhotoTile label="R" className="aspect-square rounded-3xl" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--c-accent-deep)]">Tu especialista</p>
            <h2 className="mt-3 text-4xl md:text-5xl" style={cormorantStyle}>{specialist.displayName}</h2>
            <p className="mt-5 max-w-md text-[var(--c-ink)]/70">
              Médica cirujana egresada de la {specialist.school}, especializada en {specialist.specialty.toLowerCase()}. Su filosofía:
              realzar lo que ya eres con técnica y mesura.
            </p>
            <p className="mt-3 text-sm text-[var(--c-ink)]/50">Cédula profesional {specialist.professionalLicense}</p>
            {specialist.biography && (
              <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--c-ink)]/70">{specialist.biography}</p>
            )}
            {specialist.school && (
              <p className="mt-3 text-sm text-[var(--c-ink)]/50">Formación: {specialist.school}</p>
            )}
            {specialist.certifications && specialist.certifications.length > 0 && (
              <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-[var(--c-ink)]/65">
                {specialist.certifications.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            )}
            <a
              href={`https://wa.me/${business.whatsapp}`}
              className="mt-7 inline-flex min-h-[44px] items-center rounded-full bg-[var(--c-ink)] px-7 text-sm font-medium text-[var(--c-surface)] transition hover:bg-[var(--c-accent)]"
            >
              Agendar cita con la Dra.
            </a>
          </div>
        </div>
      </section>

      {/* Testimonios: tarjetas suaves con fila de estrellas */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-4xl md:text-5xl" style={cormorantStyle}>Lo que dicen nuestras pacientes</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-3xl border border-[var(--c-ink)]/10 bg-[var(--c-surface)] p-7 shadow-sm">
              <div className="flex gap-1 text-[var(--c-accent)]" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 20.5l1.4-6.8L2.2 9l6.9-.7z" />
                  </svg>
                ))}
              </div>
              <span className="sr-only">5 de 5 estrellas</span>
              <blockquote className="mt-4 text-[var(--c-ink)]/80" style={cormorantStyle}>
                <span className="text-3xl leading-none text-[var(--c-accent)]">&ldquo;</span>
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 text-xs uppercase tracking-[0.16em] text-[var(--c-ink)]/50">
                {t.name} · {t.treatment}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA de cierre */}
      <section className="mx-auto max-w-6xl px-6 pb-4">
        <div className="overflow-hidden rounded-[2rem] bg-[var(--c-ink)] px-8 py-14 text-center text-[var(--c-surface)] md:px-16">
          <h2 className="text-4xl md:text-5xl" style={cormorantStyle}>Reserva tu cita hoy</h2>
          <p className="mx-auto mt-4 max-w-md text-[var(--c-surface)]/70">
            Te asesoramos para elegir el tratamiento ideal para tu piel y tus objetivos.
          </p>
          <a
            href={`https://wa.me/${business.whatsapp}`}
            className="mt-8 inline-flex min-h-[44px] items-center rounded-full bg-[var(--c-accent)] px-9 text-sm font-medium text-[var(--c-surface)] transition hover:bg-[var(--c-accent-deep)]"
          >
            Agendar cita
          </a>
        </div>
      </section>

      {/* Footer: ubicación, horario, pagos, contacto */}
      <footer id="contacto" className="mt-20 border-t border-[var(--c-ink)]/10 bg-[var(--c-surface)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-3">
          <div>
            <h3 className="text-2xl" style={cormorantStyle}>Ubicación</h3>
            <address className="mt-4 not-italic text-sm text-[var(--c-ink)]/70">
              {business.address.street}<br />
              {business.address.neighborhood}<br />
              {`${business.address.postalCode ?? ""} ${business.address.city}`.trim()}
            </address>
            <p className="mt-2 text-sm text-[var(--c-ink)]/50">{business.address.references}</p>
            <a
              href={business.address.mapsUrl}
              className="mt-3 inline-block text-sm font-medium text-[var(--c-accent-deep)] underline-offset-4 hover:underline"
            >
              Ver en Google Maps →
            </a>
          </div>

          <div>
            <h3 className="text-2xl" style={cormorantStyle}>Horario</h3>
            <div className="mt-4 divide-y divide-[var(--c-ink)]/10 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-2.5">
                  <span className="text-[var(--c-ink)]/65">{row.day}</span>
                  <span className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/35" : "font-medium"}>{row.hours}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1 text-xs text-[var(--c-ink)]/65">{m}</span>
              ))}
            </div>
            {paymentInstructions.showTransferDetails && (
              <div className="mt-4 rounded-xl border border-[var(--c-ink)]/15 bg-[var(--c-bg)] p-4 text-sm text-[var(--c-ink)]/65">
                <p className="font-semibold text-[var(--c-ink)]">Transferencia bancaria</p>
                {paymentInstructions.bankName && <p className="mt-1">Banco: {paymentInstructions.bankName}</p>}
                {paymentInstructions.accountHolder && <p>Titular: {paymentInstructions.accountHolder}</p>}
                {paymentInstructions.clabe && <p>CLABE: {paymentInstructions.clabe}</p>}
                {paymentInstructions.accountNumber && <p>Cuenta: {paymentInstructions.accountNumber}</p>}
                {paymentInstructions.cardLastFourDigits && <p>Tarjeta terminación: ••••{paymentInstructions.cardLastFourDigits}</p>}
                {paymentInstructions.paymentLink && (
                  <a href={paymentInstructions.paymentLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-medium text-[var(--c-accent-deep)] underline-offset-4 hover:underline">Pagar en línea</a>
                )}
                {paymentInstructions.transferReferenceInstructions && (
                  <p className="mt-2 italic">{paymentInstructions.transferReferenceInstructions}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-2xl" style={cormorantStyle}>Contacto</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[var(--c-ink)]/45">Teléfono</dt>
                <dd><a href={`tel:${business.phone.replace(/\D/g, "")}`} className="font-medium text-[var(--c-accent-deep)]">{business.phone}</a></dd>
              </div>
              <div>
                <dt className="text-[var(--c-ink)]/45">WhatsApp</dt>
                <dd><a href={`https://wa.me/${business.whatsapp}`} className="font-medium text-[var(--c-accent-deep)]">{business.phone}</a></dd>
              </div>
              <div>
                <dt className="text-[var(--c-ink)]/45">Correo</dt>
                <dd><a href={`mailto:${business.email ?? ""}`} className="font-medium text-[var(--c-accent-deep)]">{business.email ?? ""}</a></dd>
              </div>
              <div>
                <dt className="text-[var(--c-ink)]/45">Redes sociales</dt>
                <dd className="flex flex-wrap gap-2">
                  {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent-deep)] underline-offset-4 hover:underline">Instagram</a>}
                  {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent-deep)] underline-offset-4 hover:underline">Facebook</a>}
                  {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent-deep)] underline-offset-4 hover:underline">TikTok</a>}
                  {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent-deep)] underline-offset-4 hover:underline">YouTube</a>}
                  {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent-deep)] underline-offset-4 hover:underline">LinkedIn</a>}
                  {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent-deep)] underline-offset-4 hover:underline">Sitio web</a>}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="border-t border-[var(--c-ink)]/10 px-6 py-6 text-center text-xs text-[var(--c-ink)]/50">
          {business.name} · {specialist.displayName} · Polanco, CDMX
        </div>
      </footer>
    </div>
  );
}
