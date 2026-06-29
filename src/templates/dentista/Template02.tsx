"use client";

import { sourceSerif4, sourceSans3 } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import { PAYMENT_METHOD_LABEL, formatPriceString, scheduleFromOpeningHours } from "@/lib/profileUtils";

type LocalPriceType = "fixed" | "from" | "consult";
const localPriceTypeLabel: Record<LocalPriceType, string> = {
  fixed: "precio fijo",
  from: "desde",
  consult: "a consulta",
};

// 3 paletas propias de este template (expediente clínico), distintas a las de los demás:
// el acento (--c-accent) funciona como texto y como fondo de botón en AA; --c-accent-soft
// es el tono claro sobre el sidebar oscuro; --c-bg dobla como "ivory" sobre fondos oscuros.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "verde-quirofano",
    name: "Verde quirófano",
    swatch: "#2d8b8b",
    surface: "#f1faee",
    ink: "#1a2332",
    vars: {
      "--c-bg": "#f1faee",
      "--c-ink": "#1a2332",
      "--c-accent": "#2d8b8b",
      "--c-accent-deep": "#246f6f",
      "--c-accent-soft": "#a8dadc",
    },
  },
  {
    id: "indigo-expediente",
    name: "Índigo expediente",
    swatch: "#3a55b0",
    surface: "#eef1f8",
    ink: "#1b2440",
    vars: {
      "--c-bg": "#eef1f8",
      "--c-ink": "#1b2440",
      "--c-accent": "#3a55b0",
      "--c-accent-deep": "#2c4391",
      "--c-accent-soft": "#b9c4ea",
    },
  },
  {
    id: "ciruela-clinica",
    name: "Ciruela clínica",
    swatch: "#8a3c70",
    surface: "#f6f1f6",
    ink: "#2a1d2e",
    vars: {
      "--c-bg": "#f6f1f6",
      "--c-ink": "#2a1d2e",
      "--c-accent": "#8a3c70",
      "--c-accent-deep": "#6f2e5a",
      "--c-accent-soft": "#d9b8d0",
    },
  },
] as const;

export const DEFAULT_PALETTE_ID = PALETTES[0].id;

// Tab order follows a real patient's first-visit path through the record: who treats you,
// what's offered, where and when, what happens in an emergency, who else has been treated,
// how to reach the office.
const sections = [
  { id: "especialista", code: "01", label: "Especialista" },
  { id: "servicios", code: "02", label: "Servicios" },
  { id: "ubicacion", code: "03", label: "Ubicación" },
  { id: "urgencias", code: "04", label: "Urgencias" },
  { id: "testimonios", code: "05", label: "Testimonios" },
  { id: "contacto", code: "06", label: "Contacto" },
];

export function DentistaTemplate02({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
  const { specialist, business, services: profileServices, testimonials: profileTestimonials, paymentMethods: profilePayments, paymentInstructions, openingHours, appearance } = profile;
  const socialLinks = business.socialLinks ?? {};
  const paymentMethodLabels = profilePayments.map((m) => PAYMENT_METHOD_LABEL[m]);
  const schedule = scheduleFromOpeningHours(openingHours);
  const services = profileServices.filter((s) => s.isActive).map((s) => ({
    name: s.name,
    price: s.priceType === "assessment_required" ? "Requiere valoración" : formatPriceString(s.priceType, s.estimatedPrice) || "Consultar",
    priceType: (s.priceType === "fixed" ? "fixed" : s.priceType === "assessment_required" ? "consult" : "from") as LocalPriceType,
    description: s.shortDescription,
    isUrgency: s.isEmergency,
  }));
  const testimonials = profileTestimonials.filter((t) => t.isPublished).sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99)).map((t) => ({
    quote: t.comment,
    name: t.name,
    treatment: profileServices.find((s) => s.id === t.serviceId)?.name ?? "Paciente",
  }));
  const milestones = [
    { value: specialist.yearsExperience?.toString() ?? "–", label: "años de práctica" },
    { value: specialist.patientsServed?.toLocaleString("es-MX") ?? "–", label: "pacientes atendidos" },
    { value: specialist.professionalLicense, label: "cédula profesional" },
  ];
  const activePalette = PALETTES.find((p) => p.id === appearance.selectedPaletteId) ?? PALETTES[0];
  const active = PALETTES.indexOf(activePalette);
  const setActive = (idx: number) => {
    if (!isPreview && onPaletteChange) onPaletteChange(PALETTES[idx].id);
  };

  return (
    <div
      className={`${sourceSerif4.variable} ${sourceSans3.variable} min-h-screen bg-[var(--c-bg)] text-[var(--c-ink)]`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-source-sans)" }}
    >
      {!isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} align="right" />
      )}
      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar: corporate trust register, the consultant's "credentials column" */}
        <aside className="sticky top-0 hidden h-screen w-72 flex-col justify-between border-r border-[var(--c-ink)]/10 bg-[var(--c-ink)] px-8 py-10 text-[var(--c-bg)] lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-accent-soft)]">Expediente clínico</p>
            {appearance.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={appearance.logoUrl} alt={business.name} className="mt-3 h-10 w-auto object-contain" />
            ) : (
              <h1
                className="mt-3 text-2xl leading-tight"
                style={{ fontFamily: "var(--f-source-serif)" }}
              >
                {business.name}
              </h1>
            )}
            <p className="mt-2 text-sm text-[var(--c-bg)]/70">{specialist.displayName}</p>

            {/* Sidebar as a row of record tabs, numbered because this is the real order of a first visit */}
            <nav className="mt-12 flex flex-col text-sm">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-baseline gap-3 rounded-r-md border-l-2 border-[var(--c-ink)] py-2 pl-4 text-[var(--c-bg)]/70 transition hover:border-[var(--c-accent-soft)] hover:bg-[var(--c-bg)]/5 hover:text-[var(--c-accent-soft)]"
                >
                  <span className="font-mono text-[0.7rem] text-[var(--c-accent)]">{s.code}</span>
                  {s.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="text-[var(--c-accent-soft)]">
            <a
              href={`https://wa.me/${business.whatsapp}`}
              className="block rounded-md bg-[var(--c-accent)] px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[var(--c-accent-deep)]"
            >
              Agendar consulta
            </a>
            <div className="suture mt-6" />
            <div className="mt-4 text-xs text-[var(--c-bg)]/60">
              <p>Cédula profesional {specialist.professionalLicense}</p>
              <p className="mt-1">{specialist.yearsExperience?.toString() ?? "–"} años de práctica</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-6 pt-14 pb-28 lg:px-14">
          {/* Hero */}
          <section className="pb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">
              {specialist.specialty} · CDMX
            </p>
            <h2
              className="mt-4 max-w-2xl text-4xl leading-[1.15] md:text-5xl"
              style={{ fontFamily: "var(--f-source-serif)" }}
            >
              Una práctica construida sobre confianza, no sobre promesas.
            </h2>
            <p className="mt-5 max-w-xl text-[var(--c-ink)]/70">{specialist.shortDescription}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href={`https://wa.me/${business.whatsapp}`} className="rounded-md bg-[var(--c-accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--c-accent-deep)]">
                Agendar consulta
              </a>
              <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="rounded-md border border-[var(--c-ink)]/20 px-6 py-3 text-sm font-medium transition hover:border-[var(--c-ink)]/50">
                Llamar al consultorio
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-8 border-t border-[var(--c-ink)]/10 pt-6">
              {milestones.map((m) => (
                <div key={m.label}>
                  <dt className="text-2xl font-semibold text-[var(--c-accent)]">{m.value}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wide text-[var(--c-ink)]/50">{m.label}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="suture text-[var(--c-ink)]/30" />

          {/* Especialista */}
          <section id="especialista" className="grid gap-10 py-14 md:grid-cols-[1fr_1.4fr]">
            {appearance.specialistPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={appearance.specialistPhotoUrl} alt={specialist.displayName} className="aspect-square w-full rounded-lg object-cover" />
            ) : (
              <div className="aspect-square rounded-lg bg-[var(--c-accent-soft)]/40" aria-hidden />
            )}
            <div>
              <h3 className="text-2xl" style={{ fontFamily: "var(--f-source-serif)" }}>
                {specialist.displayName}
              </h3>
              <p className="mt-3 max-w-lg text-[var(--c-ink)]/70">
                Cirujana dentista con especialidad en {specialist.specialty} por la {specialist.school}. Cédula de
                especialidad {specialist.specialtyLicense}.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-[var(--c-ink)]/70">
                <li>· Instrumental esterilizado por paciente, sin excepciones.</li>
                <li>· Un solo paciente por horario.</li>
                <li>· Plan de tratamiento por escrito, con precios desglosados.</li>
              </ul>

              {specialist.biography && (
                <p className="mt-6 text-sm leading-relaxed text-[var(--c-ink)]/70">{specialist.biography}</p>
              )}
              {specialist.school && (
                <p className="mt-3 text-sm text-[var(--c-ink)]/70">Formación: {specialist.school}</p>
              )}
              {specialist.certifications && specialist.certifications.length > 0 && (
                <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-[var(--c-ink)]/70">
                  {specialist.certifications.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              )}
            </div>
          </section>

          <div className="suture text-[var(--c-ink)]/30" />

          {/* Servicios */}
          <section id="servicios" className="py-14">
            <h3 className="text-2xl" style={{ fontFamily: "var(--f-source-serif)" }}>
              Tratamientos y precios
            </h3>
            <table className="mt-8 w-full border-collapse text-sm">
              <tbody>
                {services.map((s) => (
                  <tr key={s.name} className={`border-b border-[var(--c-ink)]/10 ${s.isUrgency ? "bg-[var(--c-accent)]/5" : ""}`}>
                    <td className="py-4 pr-6 align-top">
                      <div className="font-medium">{s.name}</div>
                      <div className="mt-1 text-[var(--c-ink)]/60">{s.description}</div>
                    </td>
                    <td className="py-4 text-right align-top whitespace-nowrap">
                      <div className="font-semibold text-[var(--c-accent)]">{s.price}</div>
                      <div className="text-xs text-[var(--c-ink)]/50">{localPriceTypeLabel[s.priceType]}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="suture text-[var(--c-ink)]/30" />

          {/* Ubicación */}
          <section id="ubicacion" className="grid gap-10 py-14 md:grid-cols-2">
            <div>
              <h3 className="text-2xl" style={{ fontFamily: "var(--f-source-serif)" }}>
                Ubicación y horario
              </h3>
              <address className="mt-4 not-italic text-[var(--c-ink)]/70">
                {business.address.street}
                <br />
                {business.address.neighborhood}
                <br />
                {`${business.address.postalCode ?? ""} ${business.address.city}`.trim()}
              </address>
              <p className="mt-2 text-sm text-[var(--c-ink)]/60">{business.address.references}</p>
              <a href={business.address.mapsUrl} className="mt-3 inline-block text-sm font-medium text-[var(--c-accent)] underline-offset-4 hover:underline">
                Ver en Google Maps →
              </a>

              <div className="mt-8 flex flex-wrap gap-2">
                {paymentMethodLabels.map((m) => (
                  <span key={m} className="rounded-md border border-[var(--c-ink)]/15 px-3 py-1 text-xs text-[var(--c-ink)]/70">
                    {m}
                  </span>
                ))}
              </div>
              {paymentInstructions.showTransferDetails && (
                <div className="mt-5 rounded-lg border border-[var(--c-ink)]/15 bg-[var(--c-bg)]/60 p-4 text-sm text-[var(--c-ink)]/70">
                  <p className="font-bold text-[var(--c-ink)]">Transferencia bancaria</p>
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
            <div className="divide-y divide-[var(--c-ink)]/10 self-start rounded-lg border border-[var(--c-ink)]/10 p-6 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-2">
                  <span className="text-[var(--c-ink)]/70">{row.day}</span>
                  <span className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/40" : "font-medium"}>{row.hours}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Urgencias */}
          <section id="urgencias" className="my-14 rounded-lg bg-[var(--c-ink)] px-8 py-10 text-[var(--c-bg)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-accent-soft)]">Urgencias</p>
            <h3 className="mt-3 max-w-md text-2xl" style={{ fontFamily: "var(--f-source-serif)" }}>
              Dolor agudo, fractura o golpe no esperan turno.
            </h3>
            <div className="mt-6 flex gap-4">
              <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="rounded-md bg-[var(--c-accent)] px-6 py-3 text-sm font-medium text-white">
                Llamar ahora
              </a>
              <a href={`https://wa.me/${business.whatsapp}`} className="rounded-md border border-[var(--c-bg)]/30 px-6 py-3 text-sm font-medium">
                WhatsApp de urgencias
              </a>
            </div>
          </section>

          {/* Testimonios */}
          <section id="testimonios" className="py-14">
            <h3 className="text-2xl" style={{ fontFamily: "var(--f-source-serif)" }}>
              Lo que cuentan los pacientes
            </h3>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.name} className="rounded-lg border border-[var(--c-ink)]/10 p-5">
                  <blockquote className="text-[var(--c-ink)]/80">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-3 text-xs text-[var(--c-ink)]/50">
                    {t.name} · {t.treatment}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* Contacto */}
          <section id="contacto" className="py-14">
            <h3 className="text-2xl" style={{ fontFamily: "var(--f-source-serif)" }}>
              Hablemos de tu sonrisa
            </h3>
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
    </div>
  );
}
