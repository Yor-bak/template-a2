"use client";

import { lora, manrope } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import { formatPriceString, scheduleFromOpeningHours } from "@/lib/profileUtils";

// 3 paletas calmadas/humanistas propias de psicólogo (familias distintas entre sí):
// Tierra cálida (taupe), Salvia (verde sage) y Lavanda. Acento seguro en AA como texto y botón.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "tierra-calida",
    name: "Tierra cálida",
    swatch: "#7a5c44",
    surface: "#f6f4ef",
    ink: "#372f2c",
    vars: {
      "--c-bg": "#f6f4ef",
      "--c-ink": "#372f2c",
      "--c-ink-deep": "#241e1c",
      "--c-accent": "#7a5c44",
      "--c-accent-deep": "#624a37",
    },
  },
  {
    id: "salvia",
    name: "Salvia",
    swatch: "#4f6e4b",
    surface: "#eef3ee",
    ink: "#2a342a",
    vars: {
      "--c-bg": "#eef3ee",
      "--c-ink": "#2a342a",
      "--c-ink-deep": "#1b231b",
      "--c-accent": "#4f6e4b",
      "--c-accent-deep": "#3c563a",
    },
  },
  {
    id: "lavanda",
    name: "Lavanda",
    swatch: "#6b5b95",
    surface: "#f3f0f7",
    ink: "#2f2a3a",
    vars: {
      "--c-bg": "#f3f0f7",
      "--c-ink": "#2f2a3a",
      "--c-ink-deep": "#201c29",
      "--c-accent": "#6b5b95",
      "--c-accent-deep": "#564a78",
    },
  },
] as const;

export const DEFAULT_PALETTE_ID = PALETTES[0].id;

// Keeps a conventional header, but the body is not a vertical stack of full-width sections like
// every other template. Instead: a sticky profile card on the left that never scrolls away,
// paired with a single switchable content panel on the right (tabs, not separate sections) —
// closer to a patient-portal layout than a landing page.







const tabs = [
  { id: "servicios", label: "Servicios" },
  { id: "horario", label: "Horario y ubicación" },
  { id: "testimonios", label: "Testimonios" },
];

export function PsicologoTemplate01({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
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
      className={`${lora.variable} ${manrope.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)]`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-manrope)" }}
    >
      {isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} align="right" />
      )}
      {/* Conventional header */}
      <header className="sticky top-0 z-20 border-b border-[var(--c-ink)]/10 bg-[var(--c-bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg" style={{ fontFamily: "var(--f-lora)" }}>{business.name}</span>
          <a href={`https://wa.me/${business.whatsapp}`} className="rounded-md bg-[var(--c-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--c-accent-deep)]">
            Agendar sesión
          </a>
        </div>
      </header>

      {/* Two-column "portal" layout: sticky profile card + switchable panel, not stacked sections */}
      <main className="mx-auto grid max-w-5xl gap-8 px-6 pt-12 pb-28 md:grid-cols-[280px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="rounded-2xl border border-[var(--c-ink)]/10 bg-white p-6">
            <div className="aspect-square rounded-xl bg-[var(--c-accent)]/15" aria-hidden />
            <h1 className="mt-5 text-xl" style={{ fontFamily: "var(--f-lora)" }}>{specialist.displayName}</h1>
            <p className="mt-1 text-sm text-[var(--c-ink)]/60">{specialist.specialty}</p>

            <dl className="mt-5 space-y-2 border-t border-[var(--c-ink)]/10 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--c-ink)]/50">Cédula profesional</dt>
                <dd className="font-medium">{specialist.professionalLicense}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--c-ink)]/50">Años de práctica</dt>
                <dd className="font-medium">{specialist.yearsExperience?.toString() ?? "–"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--c-ink)]/50">Personas acompañadas</dt>
                <dd className="font-medium">{specialist.patientsServed?.toLocaleString("es-MX") ?? "–"}</dd>
              </div>
            </dl>

            {specialist.biography && (
              <p className="mt-4 text-sm leading-relaxed text-[var(--c-ink)]/70">{specialist.biography}</p>
            )}
            {specialist.school && (
              <p className="mt-2 text-xs text-[var(--c-ink)]/55">Formación: {specialist.school}</p>
            )}
            {specialist.certifications && specialist.certifications.length > 0 && (
              <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-[var(--c-ink)]/65">
                {specialist.certifications.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            )}
            <a href={`https://wa.me/${business.whatsapp}`} className="mt-6 block rounded-md bg-[var(--c-ink)] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[var(--c-ink-deep)]">
              Agendar sesión
            </a>
            <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="mt-2 block rounded-md border border-[var(--c-ink)]/20 px-4 py-2.5 text-center text-sm font-medium transition hover:border-[var(--c-ink)]/40">
              Llamar al consultorio
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--c-accent)]/30 bg-[var(--c-accent)]/5 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--c-accent)]">Contención en crisis</p>
            <p className="mt-2 text-sm text-[var(--c-ink)]/70">
              Si hoy es un día difícil, no esperes a tu próxima cita.
            </p>
            <a href={`https://wa.me/${business.whatsapp}`} className="mt-3 inline-block text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">
              Escribir ahora →
            </a>
          </div>
        </aside>

        <section>
          <p className="mb-6 max-w-md text-[var(--c-ink)]/70">
            Terapia individual y de pareja con un enfoque humanista, en consultorio o en línea.
          </p>

          <nav className="flex gap-1 rounded-lg border border-[var(--c-ink)]/10 bg-white p-1 text-sm">
            {tabs.map((t, i) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className={`flex-1 rounded-md px-4 py-2 text-center font-medium transition hover:bg-[var(--c-accent)]/10 ${i === 0 ? "bg-[var(--c-accent)] text-white hover:bg-[var(--c-accent)]" : "text-[var(--c-ink)]/70"}`}
              >
                {t.label}
              </a>
            ))}
          </nav>

          <div id="servicios" className="mt-8 scroll-mt-24 rounded-2xl border border-[var(--c-ink)]/10 bg-white p-6">
            <h2 className="text-lg" style={{ fontFamily: "var(--f-lora)" }}>Modalidades y honorarios</h2>
            <div className="mt-5 divide-y divide-[var(--c-ink)]/10">
              {services.map((s) => (
                <div key={s.name} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="mt-0.5 text-sm text-[var(--c-ink)]/55">{s.description}</div>
                  </div>
                  <span className="font-semibold text-[var(--c-accent)]">{s.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div id="horario" className="mt-8 scroll-mt-24 grid gap-6 rounded-2xl border border-[var(--c-ink)]/10 bg-white p-6 sm:grid-cols-2">
            <div>
              <h2 className="text-lg" style={{ fontFamily: "var(--f-lora)" }}>Ubicación</h2>
              <address className="mt-3 not-italic text-sm text-[var(--c-ink)]/70">
                {business.address.street}<br />
                {business.address.neighborhood}
              </address>
              <p className="mt-2 text-xs text-[var(--c-ink)]/50">{business.address.references}</p>
              <a href={business.address.mapsUrl} className="mt-3 inline-block text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">
                Ver en Google Maps →
              </a>
            </div>
            <div>
              <h2 className="text-lg" style={{ fontFamily: "var(--f-lora)" }}>Horario</h2>
              <div className="mt-3 divide-y divide-[var(--c-ink)]/10 text-sm">
                {schedule.map((row) => (
                  <div key={row.day} className="flex justify-between py-2">
                    <span className="text-[var(--c-ink)]/70">{row.day}</span>
                    <span className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/40" : "font-medium"}>{row.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="testimonios" className="mt-8 scroll-mt-24 rounded-2xl border border-[var(--c-ink)]/10 bg-white p-6">
            <h2 className="text-lg" style={{ fontFamily: "var(--f-lora)" }}>Lo que comparten quienes vienen aquí</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {testimonials.map((t) => (
                <figure key={t.name} className="rounded-xl bg-[var(--c-bg)] p-4">
                  <blockquote className="text-sm text-[var(--c-ink)]/80">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-2 text-xs text-[var(--c-ink)]/45">{t.name} · {t.treatment}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          {paymentMethods.length > 0 && (
            <div className="mt-8 rounded-2xl border border-[var(--c-ink)]/10 bg-white p-5">
              <h2 className="text-sm" style={{ fontFamily: "var(--f-lora)" }}>Formas de pago</h2>
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
            <div className="mt-6 rounded-2xl border border-[var(--c-ink)]/10 bg-white p-5">
              <h2 className="text-sm" style={{ fontFamily: "var(--f-lora)" }}>Redes sociales</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">Instagram</a>}
                {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">Facebook</a>}
                {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">TikTok</a>}
                {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">YouTube</a>}
                {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">LinkedIn</a>}
                {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">Sitio web</a>}
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-[var(--c-ink)]/50">
            ¿Dudas antes de agendar? Escribe a <a href={`mailto:${business.email ?? ""}`} className="underline">{business.email ?? ""}</a>
          </p>
        </section>
      </main>
    </div>
  );
}
