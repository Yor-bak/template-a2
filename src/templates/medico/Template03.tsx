"use client";

import { manrope, karla } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import {
  PAYMENT_METHOD_LABEL,
  formatPriceString,
  scheduleFromOpeningHours,
} from "@/lib/profileUtils";

// 3 paletas propias (clínica institucional): el acento (--c-accent) es seguro en AA como
// texto y botón; los tintes (--c-soft/--c-soft2/--c-band) acompañan el tono del acento.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "esmeralda",
    name: "Esmeralda",
    swatch: "#047857",
    surface: "#ffffff",
    ink: "#15211d",
    vars: {
      "--c-ink": "#15211d",
      "--c-accent": "#047857",
      "--c-accent-deep": "#036249",
      "--c-soft": "#e7f3ee",
      "--c-soft2": "#cfe7dd",
      "--c-band": "#f6faf8",
      "--c-on-dark": "#7fd1b5",
      "--c-urgent": "#c0462b",
      "--c-star": "#f0a500",
    },
  },
  {
    id: "vino",
    name: "Vino",
    swatch: "#9b2242",
    surface: "#ffffff",
    ink: "#2a1218",
    vars: {
      "--c-ink": "#2a1218",
      "--c-accent": "#9b2242",
      "--c-accent-deep": "#7e1a35",
      "--c-soft": "#f7e8ec",
      "--c-soft2": "#efcdd6",
      "--c-band": "#fbf4f6",
      "--c-on-dark": "#e0a3b3",
      "--c-urgent": "#c0392b",
      "--c-star": "#f0a500",
    },
  },
  {
    id: "azul-cielo",
    name: "Azul cielo",
    swatch: "#0e78ba",
    surface: "#ffffff",
    ink: "#0e2638",
    vars: {
      "--c-ink": "#0e2638",
      "--c-accent": "#0e78ba",
      "--c-accent-deep": "#0a5f96",
      "--c-soft": "#e3f1fb",
      "--c-soft2": "#c3e0f4",
      "--c-band": "#eff7fd",
      "--c-on-dark": "#9bcdee",
      "--c-urgent": "#c0462b",
      "--c-star": "#f0a500",
    },
  },
] as const;

export const DEFAULT_PALETTE_ID = PALETTES[0].id;

// Alterno C — rediseño inspirado en sitios de clínica institucional (medicasmart.com.mx):
// hero centrado "clínica de confianza", tarjetas de servicio con icono + "Conocer más",
// bloques de Misión/Visión, galería de instalaciones, testimonios con estrellas y un
// bloque de contacto completo. Paleta verde clínica sobre blanco (cálida pero profesional)
// y tipografía Manrope + Karla, distinta del alterno B "tablero" y del médico principal.

type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "precio fijo", from: "desde", consult: "a consulta" };









function IconStethoscope() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 3v5a4 4 0 0 0 8 0V3" />
      <path d="M9 16a5 5 0 0 0 10 0v-2" />
      <circle cx="19" cy="11" r="2" />
    </svg>
  );
}
function IconPulse() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12h3l2-6 4 12 2-6h3" />
      <path d="M16 12h5" />
    </svg>
  );
}
function IconDocument() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}
function IconCross() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const categories = [
  { Icon: IconStethoscope, title: "Consulta de especialidad", desc: "Medicina interna: valoración, historial clínico y diagnóstico con tiempo real de consulta." },
  { Icon: IconPulse, title: "Control de crónicos", desc: "Diabetes e hipertensión con seguimiento programado y ajuste de tratamiento." },
  { Icon: IconDocument, title: "Estudios y certificados", desc: "Electrocardiograma, laboratorio y certificados médicos el mismo día." },
  { Icon: IconCross, title: "Urgencia ambulatoria", desc: "Fiebre alta, dolor agudo o malestar súbito atendidos sin esperar turno." },
];

const facilities = [
  { label: "Consultorios" },
  { label: "Sala de procedimientos" },
  { label: "Recepción" },
  { label: "Laboratorio" },
];

const stars = "★★★★★";

export function MedicoTemplate03({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
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

  const stats = [
    { value: specialist.yearsExperience?.toString() ?? "–", label: "años de práctica" },
    { value: specialist.patientsServed?.toLocaleString("es-MX") ?? "–", label: "pacientes atendidos" },
    { value: "98%", label: "pacientes que regresan" },
  ];

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
      className={`${manrope.variable} ${karla.variable} min-h-screen bg-white text-[var(--c-ink)]`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-karla)" }}
    >
      {isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} />
      )}
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--c-ink)]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2 text-[var(--c-accent)]">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--c-soft)]">
              <IconCross />
            </span>
            <span className="text-base font-bold text-[var(--c-ink)]" style={{ fontFamily: "var(--f-manrope)" }}>{business.name}</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-[var(--c-ink)]/65 lg:flex">
            <a href="#nosotros" className="hover:text-[var(--c-accent)]">Nosotros</a>
            <a href="#servicios" className="hover:text-[var(--c-accent)]">Servicios</a>
            <a href="#instalaciones" className="hover:text-[var(--c-accent)]">Instalaciones</a>
            <a href="#testimonios" className="hover:text-[var(--c-accent)]">Testimonios</a>
            <a href="#contacto" className="hover:text-[var(--c-accent)]">Contacto</a>
          </nav>
          <a href={`https://wa.me/${business.whatsapp}`} className="rounded-full bg-[var(--c-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--c-accent-deep)]">
            Agendar
          </a>
        </div>
      </header>

      {/* Hero: centrado, banda verde suave */}
      <section className="bg-gradient-to-b from-[var(--c-soft)] to-white px-6 py-20 text-center md:py-28">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block rounded-full border border-[var(--c-accent)]/20 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--c-accent)]">
            {specialist.specialty} · CDMX
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] md:text-6xl" style={{ fontFamily: "var(--f-manrope)" }}>
            Tu clínica de confianza, cerca de casa.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--c-ink)]/70">{specialist.shortDescription}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a href={`https://wa.me/${business.whatsapp}`} className="rounded-full bg-[var(--c-accent)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--c-accent-deep)]">
              Conócenos
            </a>
            <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="rounded-full border border-[var(--c-ink)]/20 px-7 py-3.5 text-sm font-semibold transition hover:border-[var(--c-accent)] hover:text-[var(--c-accent)]">
              Llamar al consultorio
            </a>
          </div>

          <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-[var(--c-ink)]/10 pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-3xl font-extrabold text-[var(--c-accent)]" style={{ fontFamily: "var(--f-manrope)" }}>{s.value}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wide text-[var(--c-ink)]/55">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Servicios: 4 tarjetas con icono + "Conocer más" */}
      <section id="servicios" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">Servicios</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--f-manrope)" }}>Cómo te podemos ayudar</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <div key={c.title} className="flex flex-col rounded-2xl border border-[var(--c-ink)]/10 p-6 transition hover:border-[var(--c-accent)]/40 hover:shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--c-soft)] text-[var(--c-accent)]">
                <c.Icon />
              </span>
              <h3 className="mt-5 font-bold" style={{ fontFamily: "var(--f-manrope)" }}>{c.title}</h3>
              <p className="mt-2 flex-1 text-sm text-[var(--c-ink)]/65">{c.desc}</p>
              <a href="#contacto" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--c-accent)] hover:gap-2">
                Conocer más
                <span aria-hidden>→</span>
              </a>
            </div>
          ))}
        </div>

        {/* Precios de referencia */}
        <div className="mt-16 rounded-3xl bg-[var(--c-band)] p-8 md:p-10">
          <h3 className="text-xl font-bold" style={{ fontFamily: "var(--f-manrope)" }}>Consultas y estudios</h3>
          <div className="mt-6 grid gap-x-10 gap-y-1 md:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.name}
                className={`flex items-baseline justify-between gap-4 border-b border-[var(--c-ink)]/10 py-3 ${s.isUrgency ? "text-[var(--c-urgent)]" : ""}`}
              >
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-[var(--c-ink)]/55">{s.description}</div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className={`text-sm font-bold ${s.isUrgency ? "text-[var(--c-urgent)]" : "text-[var(--c-accent)]"}`}>{s.price}</div>
                  <div className="text-[0.7rem] text-[var(--c-ink)]/45">{priceTypeLabel[s.priceType]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nosotros: Misión / Visión + médico */}
      <section id="nosotros" className="bg-[var(--c-band)] px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-[var(--c-soft)] to-[var(--c-soft2)]" aria-hidden />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">Nosotros</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--f-manrope)" }}>Atención personalizada y humana</h2>
            <p className="mt-4 text-[var(--c-ink)]/70">
              {specialist.displayName}, médico cirujano con especialidad en {specialist.specialty} por la {specialist.school}
              {" "}(cédula de especialidad {specialist.specialtyLicense}). Cada paciente recibe un plan por escrito,
              estudios explicados y seguimiento real.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--c-ink)]/10 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--c-accent)]">Misión</p>
                <p className="mt-2 text-sm text-[var(--c-ink)]/70">Cuidar la salud del adulto con cercanía, claridad y rigor clínico.</p>
              </div>
              <div className="rounded-2xl border border-[var(--c-ink)]/10 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--c-accent)]">Visión</p>
                <p className="mt-2 text-sm text-[var(--c-ink)]/70">Ser el consultorio de confianza al que la familia regresa por años.</p>
              </div>
            </div>
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
        </div>
      </section>

      {/* Instalaciones: galería de placeholders etiquetados */}
      <section id="instalaciones" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">Instalaciones</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--f-manrope)" }}>Un espacio pensado para ti</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {facilities.map((f, i) => (
            <div key={f.label} className={`group relative overflow-hidden rounded-2xl ${i === 0 ? "sm:col-span-2 sm:row-span-2 sm:aspect-auto" : ""}`}>
              <div className={`bg-gradient-to-br from-[var(--c-soft)] to-[var(--c-soft2)] ${i === 0 ? "h-full min-h-[12rem]" : "aspect-[4/3]"}`} aria-hidden />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--c-ink)]">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Urgencias: banda compacta */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[var(--c-ink)] px-8 py-10 text-white md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--c-on-dark)]">Urgencia ambulatoria</p>
            <h2 className="mt-2 max-w-md text-2xl font-bold" style={{ fontFamily: "var(--f-manrope)" }}>
              Fiebre alta, dolor agudo o malestar súbito no esperan turno.
            </h2>
          </div>
          <div className="flex shrink-0 gap-3">
            <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="rounded-full bg-[var(--c-urgent)] px-6 py-3 text-sm font-semibold text-white">Llamar ahora</a>
            <a href={`https://wa.me/${business.whatsapp}`} className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold">WhatsApp</a>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">Testimonios</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--f-manrope)" }}>Lo que dicen nuestros pacientes</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-[var(--c-ink)]/10 p-6">
              <div className="text-sm tracking-wide text-[var(--c-star)]">
                <span aria-hidden>{stars}</span>
                <span className="sr-only">5 de 5 estrellas</span>
              </div>
              <blockquote className="mt-3 text-[var(--c-ink)]/80">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-xs text-[var(--c-ink)]/55">{t.name} · {t.treatment}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="bg-[var(--c-band)] px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--c-accent)]">Contacto</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--f-manrope)" }}>Agenda tu consulta</h2>
            <p className="mt-4 max-w-md text-[var(--c-ink)]/70">
              Escríbenos o llámanos y te confirmamos disponibilidad el mismo día.
            </p>

            <dl className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--c-ink)]/50">Teléfono</dt>
                <dd><a href={`tel:${business.phone.replace(/\D/g, "")}`} className="mt-1 block font-semibold text-[var(--c-accent)]">{business.phone}</a></dd>
              </div>
              <div>
                <dt className="text-[var(--c-ink)]/50">WhatsApp</dt>
                <dd><a href={`https://wa.me/${business.whatsapp}`} className="mt-1 block font-semibold text-[var(--c-accent)]">{business.phone}</a></dd>
              </div>
              <div>
                <dt className="text-[var(--c-ink)]/50">Correo</dt>
                <dd><a href={`mailto:${business.email ?? ""}`} className="mt-1 block font-semibold text-[var(--c-accent)]">{business.email ?? ""}</a></dd>
              </div>
              <div>
                <dt className="text-[var(--c-ink)]/50">Redes sociales</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">Instagram</a>}
                  {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">Facebook</a>}
                  {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">TikTok</a>}
                  {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">YouTube</a>}
                  {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">LinkedIn</a>}
                  {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">Sitio web</a>}
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--c-ink)]/50">Formas de pago</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {paymentMethods.map((m) => (
                  <span key={m} className="rounded-full border border-[var(--c-ink)]/15 px-3 py-1 text-xs text-[var(--c-ink)]/65">{m}</span>
                ))}
              </div>
              {paymentInstructions.showTransferDetails && (
                <div className="mt-4 rounded-xl border border-[var(--c-ink)]/15 bg-white p-4 text-sm text-[var(--c-ink)]/70">
                  <p className="font-bold text-[var(--c-ink)]">Transferencia bancaria</p>
                  {paymentInstructions.bankName && <p className="mt-1">Banco: {paymentInstructions.bankName}</p>}
                  {paymentInstructions.accountHolder && <p>Titular: {paymentInstructions.accountHolder}</p>}
                  {paymentInstructions.clabe && <p>CLABE: {paymentInstructions.clabe}</p>}
                  {paymentInstructions.accountNumber && <p>Cuenta: {paymentInstructions.accountNumber}</p>}
                  {paymentInstructions.cardLastFourDigits && <p>Tarjeta terminación: ••••{paymentInstructions.cardLastFourDigits}</p>}
                  {paymentInstructions.paymentLink && (
                    <a href={paymentInstructions.paymentLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">Pagar en línea</a>
                  )}
                  {paymentInstructions.transferReferenceInstructions && (
                    <p className="mt-2 italic">{paymentInstructions.transferReferenceInstructions}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--c-ink)]/10 bg-white p-6">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[var(--c-soft)] to-[var(--c-soft2)]" aria-hidden />
            <address className="mt-5 not-italic text-sm text-[var(--c-ink)]/70">
              {business.address.street}<br />
              {business.address.neighborhood}<br />
              {`${business.address.postalCode ?? ""} ${business.address.city}`.trim()}
            </address>
            <p className="mt-1 text-xs text-[var(--c-ink)]/55">{business.address.references}</p>
            <a href={business.address.mapsUrl} className="mt-2 inline-block text-sm font-semibold text-[var(--c-accent)] underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-5 divide-y divide-[var(--c-ink)]/10 border-t border-[var(--c-ink)]/10 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-2">
                  <span className="text-[var(--c-ink)]/70">{row.day}</span>
                  <span className={row.hours === "Cerrado" ? "text-[var(--c-ink)]/40" : "font-medium"}>{row.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--c-ink)]/10 px-6 pt-8 pb-28 text-center text-sm text-[var(--c-ink)]/55">
        {business.name} · {specialist.displayName} · CDMX
      </footer>
    </div>
  );
}
