"use client";

import { dmSerifDisplay, dmSans } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import {
  PAYMENT_METHOD_LABEL,
  formatPriceString,
  scheduleFromOpeningHours,
} from "@/lib/profileUtils";

// 3 paletas food-fresh propias de nutriólogo (familias distintas): Huerto (verde+naranja,
// la original), Frutos rojos y Cítrico. --c-accent2 es el secundario cálido (tile ubicación,
// urgencia); en las paletas nuevas se oscurece para pasar AA como texto.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "huerto",
    name: "Huerto",
    swatch: "#3f7a52",
    surface: "#fdf6ec",
    ink: "#2c3a2e",
    vars: {
      "--c-bg": "#fdf6ec",
      "--c-ink": "#2c3a2e",
      "--c-accent": "#3f7a52",
      "--c-accent-deep": "#326341",
      "--c-accent2": "#e8754a",
    },
  },
  {
    id: "frutos-rojos",
    name: "Frutos rojos",
    swatch: "#a83253",
    surface: "#fbf2ee",
    ink: "#2f2329",
    vars: {
      "--c-bg": "#fbf2ee",
      "--c-ink": "#2f2329",
      "--c-accent": "#a83253",
      "--c-accent-deep": "#87273f",
      "--c-accent2": "#a9711c",
    },
  },
  {
    id: "citrico",
    name: "Cítrico",
    swatch: "#267567",
    surface: "#f0f8f3",
    ink: "#1f3029",
    vars: {
      "--c-bg": "#f0f8f3",
      "--c-ink": "#1f3029",
      "--c-accent": "#267567",
      "--c-accent-deep": "#1d5a4f",
      "--c-accent2": "#b9651f",
    },
  },
] as const;

export const DEFAULT_PALETTE_ID = PALETTES[0].id;

// Structure for this specialty: a "tablero nutricional" bento grid — stats, schedule, location
// and the plate graphic all live as tiles in one mixed grid instead of stacked full-width
// sections, echoing the dashboards nutrition apps use rather than a clinic brochure layout.

type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "sesión", from: "desde", consult: "a consulta" };









export function NutriologoTemplate01({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
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
      className={`${dmSerifDisplay.variable} ${dmSans.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)]`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-dm-sans)" }}
    >
      {!isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} />
      )}
      <header className="border-b border-[var(--c-ink)]/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-lg" style={{ fontFamily: "var(--f-dm-serif)" }}>{business.name}</h1>
          <a href={`https://wa.me/${business.whatsapp}`} className="rounded-full bg-[var(--c-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--c-accent-deep)]">
            Agendar consulta
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-12 pb-28">
        {/* Hero */}
        <section className="pb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">{specialist.specialty}</p>
            <h2 className="mt-4 max-w-xl text-4xl leading-[1.15] md:text-5xl" style={{ fontFamily: "var(--f-dm-serif)" }}>
              Comer bien, sin reglas imposibles de seguir.
            </h2>
            <p className="mt-5 max-w-lg text-[var(--c-ink)]/70">{specialist.shortDescription}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={`https://wa.me/${business.whatsapp}`} className="rounded-full bg-[var(--c-accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--c-accent-deep)]">
                Agendar consulta
              </a>
              <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="rounded-full border border-[var(--c-ink)]/20 px-6 py-3 text-sm font-medium transition hover:border-[var(--c-ink)]/50">
                Llamar al consultorio
              </a>
            </div>
          </div>
        </section>

        {/* Bento "tablero nutricional" — mixed grid of tiles, not stacked sections */}
        <section className="grid gap-5 py-10 md:grid-cols-4 md:grid-rows-2">
          <div className="rounded-3xl bg-[var(--c-accent)] p-6 text-white md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Especialista</p>
            <h3 className="mt-2 text-xl" style={{ fontFamily: "var(--f-dm-serif)" }}>{specialist.displayName}</h3>
            <p className="mt-2 text-sm text-white/80">
              Nutrióloga clínica egresada de {specialist.school ?? ""}. Cédula profesional {specialist.professionalLicense}.
            </p>
            {specialist.biography && (
              <p className="mt-3 text-sm leading-relaxed text-white/80">{specialist.biography}</p>
            )}
            {specialist.school && (
              <p className="mt-2 text-sm text-white/70">Formación: {specialist.school}</p>
            )}
            {specialist.certifications && specialist.certifications.length > 0 && (
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-white/80">
                {specialist.certifications.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6">
            <p className="text-3xl" style={{ fontFamily: "var(--f-dm-serif)" }}>{specialist.yearsExperience?.toString() ?? "–"}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[var(--c-ink)]/50">Años de práctica</p>
          </div>

          <div className="rounded-3xl bg-white p-6">
            <p className="text-3xl" style={{ fontFamily: "var(--f-dm-serif)" }}>{specialist.patientsServed?.toLocaleString("es-MX") ?? "–"}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[var(--c-ink)]/50">Pacientes atendidos</p>
          </div>

          <div id="ubicacion" className="rounded-3xl bg-[var(--c-accent2)]/10 p-6 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-accent2)]">Ubicación</p>
            <address className="mt-2 not-italic text-sm text-[var(--c-ink)]/75">
              {business.address.street}, {business.address.neighborhood}, {`${business.address.postalCode ?? ""} ${business.address.city}`.trim()}
            </address>
            <a href={business.address.mapsUrl} className="mt-2 inline-block text-sm font-medium text-[var(--c-accent2)] underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
          </div>

          <div className="rounded-3xl bg-white p-6 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-accent)]">Horario</p>
            <div className="mt-2 divide-y divide-[var(--c-ink)]/10 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-1.5">
                  <span className="text-[var(--c-ink)]/70">{row.day}</span>
                  <span className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/40" : "font-medium"}>{row.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Servicios — accordion grouped by category, so only one plan's detail is open at a time */}
        <section id="servicios" className="py-10">
          <h3 className="text-2xl" style={{ fontFamily: "var(--f-dm-serif)" }}>Planes y consultas</h3>
          <div className="mt-8 space-y-3">
            {services.map((s) => (
              <details
                key={s.name}
                className={`group rounded-2xl border ${s.isUrgency ? "border-[var(--c-accent2)] bg-[var(--c-accent2)]/5" : "border-[var(--c-ink)]/10 bg-white"}`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4">
                  <span className="font-medium" style={{ fontFamily: "var(--f-dm-serif)" }}>{s.name}</span>
                  <span className="flex items-center gap-3">
                    <span className="whitespace-nowrap font-semibold text-[var(--c-accent)]">{s.price}</span>
                    <span className="text-[var(--c-ink)]/40 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <div className="px-6 pb-5 text-sm text-[var(--c-ink)]/65">
                  {s.description}
                  <span className="ml-2 text-xs uppercase tracking-wide text-[var(--c-ink)]/40">· {priceTypeLabel[s.priceType]}</span>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {paymentMethods.map((m) => (
              <span key={m} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1 text-xs text-[var(--c-ink)]/70">{m}</span>
            ))}
          </div>
          {paymentInstructions.showTransferDetails && (
            <div className="mt-4 rounded-xl border border-[var(--c-ink)]/15 bg-white p-4 text-sm text-[var(--c-ink)]/70">
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
        </section>

        {/* Testimonios */}
        <section id="testimonios" className="border-t border-[var(--c-ink)]/10 py-10">
          <h3 className="text-2xl" style={{ fontFamily: "var(--f-dm-serif)" }}>Lo que cuentan los pacientes</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-[var(--c-ink)]/10 bg-white p-5">
                <blockquote className="text-[var(--c-ink)]/80">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-3 text-xs text-[var(--c-ink)]/50">{t.name} · {t.treatment}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section id="contacto" className="border-t border-[var(--c-ink)]/10 py-10">
          <h3 className="text-2xl" style={{ fontFamily: "var(--f-dm-serif)" }}>Agenda tu consulta</h3>
          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="text-[var(--c-ink)]/50">Teléfono</div>
              <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="mt-1 block font-medium">{business.phone}</a>
            </div>
            <div>
              <div className="text-[var(--c-ink)]/50">WhatsApp</div>
              <a href={`https://wa.me/${business.whatsapp}`} className="mt-1 block font-medium">{business.phone}</a>
            </div>
            <div>
              <div className="text-[var(--c-ink)]/50">Correo</div>
              <a href={`mailto:${business.email ?? ""}`} className="mt-1 block font-medium">{business.email ?? ""}</a>
            </div>
            <div>
              <div className="text-[var(--c-ink)]/50">Redes sociales</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">Instagram</a>}
                {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">Facebook</a>}
                {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">TikTok</a>}
                {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">YouTube</a>}
                {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">LinkedIn</a>}
                {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">Sitio web</a>}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
