"use client";

import { lora, nunitoSans } from "@/lib/fonts";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import {
  PAYMENT_METHOD_LABEL,
  formatPriceString,
  scheduleFromOpeningHours,
} from "@/lib/profileUtils";

// Signature motif for this specialty: an EKG/heartbeat trace used as the recurring
// section divider, and a "signos vitales" stat strip instead of a generic milestones row —
// both read instantly as "consulta médica" rather than a reskinned dental layout.

type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "precio fijo", from: "desde", consult: "a consulta" };









// Las 3 paletas también viven como rutas propias en /medico-paleta-2 y /medico-paleta-3.
// Este switch solo cambia las variables CSS en el cliente para previsualizarlas aquí mismo.
// swatch/surface/ink son los colores que consume el PaletteSwitcher compartido.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "azul-clinico",
    name: "Azul clínico",
    swatch: "#2563a8",
    surface: "#f4f7f6",
    ink: "#15324a",
    vars: {
      "--color-medico-bg": "#f4f7f6",
      "--color-medico-ink": "#15324a",
      "--color-medico-accent": "#2563a8",
      "--color-medico-accent-deep": "#1d4e88",
      "--color-medico-accent-soft": "#7fb1e0",
      "--color-medico-urgent": "#c23a32",
    },
  },
  {
    id: "verde-clinico",
    name: "Verde clínico",
    swatch: "#21694a",
    surface: "#f4f7f3",
    ink: "#1b2e22",
    vars: {
      "--color-medico-bg": "#f4f7f3",
      "--color-medico-ink": "#1b2e22",
      "--color-medico-accent": "#21694a",
      "--color-medico-accent-deep": "#184f37",
      "--color-medico-accent-soft": "#9bcdae",
      "--color-medico-urgent": "#c1442e",
    },
  },
  {
    id: "vino-calido",
    name: "Vino cálido",
    swatch: "#7c2d44",
    surface: "#f8f3ef",
    ink: "#2a1c20",
    vars: {
      "--color-medico-bg": "#f8f3ef",
      "--color-medico-ink": "#2a1c20",
      "--color-medico-accent": "#7c2d44",
      "--color-medico-accent-deep": "#5c2032",
      "--color-medico-accent-soft": "#d9a8b8",
      "--color-medico-urgent": "#a23d28",
    },
  },
] as const;

export const DEFAULT_PALETTE_ID = PALETTES[0].id;

function Pulse({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 40" className={className} preserveAspectRatio="none" aria-hidden>
      <polyline
        points="0,20 60,20 80,20 95,4 110,36 125,20 160,20 180,20 195,8 210,32 225,20 400,20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MedicoTemplate01({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
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

  const vitals = [
    { label: "Años de práctica", value: specialist.yearsExperience?.toString() ?? "–" },
    { label: "Pacientes atendidos", value: specialist.patientsServed?.toLocaleString("es-MX") ?? "–" },
    { label: "Cédula profesional", value: specialist.professionalLicense },
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
      className={`${lora.variable} ${nunitoSans.variable} min-h-screen bg-medico-bg text-medico-ink`}
      style={{ ...(PALETTES[active].vars as React.CSSProperties), fontFamily: "var(--f-nunito-sans)" }}
    >
      {!isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} />
      )}

      {/* Header */}
      <header className="border-b border-medico-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-medico-accent">Consulta médica</p>
            <h1 className="text-lg font-semibold" style={{ fontFamily: "var(--f-lora)" }}>{business.name}</h1>
          </div>
          <a href={`https://wa.me/${business.whatsapp}`} className="rounded-md bg-medico-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-medico-accent-deep">
            Agendar consulta
          </a>
        </div>
        <Pulse className="h-3 w-full text-medico-accent/30" />
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-14 pb-32">
        {/* Hero */}
        <section className="grid gap-10 pb-14 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-medico-accent">{specialist.specialty} · CDMX</p>
            <h2 className="mt-4 max-w-xl text-4xl leading-[1.15] md:text-5xl" style={{ fontFamily: "var(--f-lora)" }}>
              Medicina interna con seguimiento real, no solo recetas.
            </h2>
            <p className="mt-5 max-w-lg text-medico-ink/70">{specialist.shortDescription}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={`https://wa.me/${business.whatsapp}`} className="rounded-md bg-medico-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-medico-accent-deep">
                Agendar consulta
              </a>
              <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="rounded-md border border-medico-ink/20 px-6 py-3 text-sm font-medium transition hover:border-medico-ink/50">
                Llamar al consultorio
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-medico-ink/10 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-medico-accent">Signos vitales del consultorio</p>
            <dl className="mt-4 space-y-4">
              {vitals.map((v) => (
                <div key={v.label} className="flex items-baseline justify-between border-b border-medico-ink/10 pb-3 last:border-0 last:pb-0">
                  <dt className="text-sm text-medico-ink/60">{v.label}</dt>
                  <dd className="font-mono text-xl font-semibold text-medico-accent">{v.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <Pulse className="h-4 w-full text-medico-ink/15" />

        {/* Especialista */}
        <section id="especialista" className="grid gap-10 py-14 md:grid-cols-[1fr_1.4fr]">
          <div className="aspect-square rounded-2xl bg-medico-accent/10" aria-hidden />
          <div>
            <h3 className="text-2xl" style={{ fontFamily: "var(--f-lora)" }}>{specialist.displayName}</h3>
            <p className="mt-3 max-w-lg text-medico-ink/70">
              Médico cirujano con especialidad en {specialist.specialty} por la {specialist.school}. Cédula de
              especialidad {specialist.specialtyLicense}.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-medico-ink/70">
              <li>· Historial clínico completo desde la primera consulta.</li>
              <li>· Resultados de laboratorio explicados, no solo entregados.</li>
              <li>· Seguimiento programado para padecimientos crónicos.</li>
            </ul>

            {specialist.biography && (
              <p className="mt-6 text-sm leading-relaxed text-medico-ink/70">{specialist.biography}</p>
            )}
            {specialist.school && (
              <p className="mt-3 text-sm text-medico-ink/70">Formación: {specialist.school}</p>
            )}
            {specialist.certifications && specialist.certifications.length > 0 && (
              <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-medico-ink/70">
                {specialist.certifications.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            )}
          </div>
        </section>

        <Pulse className="h-4 w-full text-medico-ink/15" />

        {/* Servicios */}
        <section id="servicios" className="py-14">
          <h3 className="text-2xl" style={{ fontFamily: "var(--f-lora)" }}>Consultas y estudios</h3>
          <table className="mt-8 w-full border-collapse text-sm">
            <tbody>
              {services.map((s) => (
                <tr key={s.name} className={`border-b border-medico-ink/10 ${s.isUrgency ? "bg-medico-urgent/5" : ""}`}>
                  <td className="py-4 pr-6 align-top">
                    <div className="font-medium">{s.name}</div>
                    <div className="mt-1 text-medico-ink/60">{s.description}</div>
                  </td>
                  <td className="py-4 text-right align-top whitespace-nowrap">
                    <div className="font-semibold text-medico-accent">{s.price}</div>
                    <div className="text-xs text-medico-ink/50">{priceTypeLabel[s.priceType]}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <Pulse className="h-4 w-full text-medico-ink/15" />

        {/* Ubicación */}
        <section id="ubicacion" className="grid gap-10 py-14 md:grid-cols-2">
          <div>
            <h3 className="text-2xl" style={{ fontFamily: "var(--f-lora)" }}>Ubicación y horario</h3>
            <address className="mt-4 not-italic text-medico-ink/70">
              {business.address.street}<br />
              {business.address.neighborhood}<br />
              {`${business.address.postalCode ?? ""} ${business.address.city}`.trim()}
            </address>
            <p className="mt-2 text-sm text-medico-ink/60">{business.address.references}</p>
            <a href={business.address.mapsUrl} className="mt-3 inline-block text-sm font-medium text-medico-accent underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-8 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-md border border-medico-ink/15 px-3 py-1 text-xs text-medico-ink/70">{m}</span>
              ))}
            </div>
            {paymentInstructions.showTransferDetails && (
              <div className="mt-5 rounded-xl border border-medico-ink/15 bg-white p-4 text-sm text-medico-ink/70">
                <p className="font-bold text-medico-ink">Transferencia bancaria</p>
                {paymentInstructions.bankName && <p className="mt-1">Banco: {paymentInstructions.bankName}</p>}
                {paymentInstructions.accountHolder && <p>Titular: {paymentInstructions.accountHolder}</p>}
                {paymentInstructions.clabe && <p>CLABE: {paymentInstructions.clabe}</p>}
                {paymentInstructions.accountNumber && <p>Cuenta: {paymentInstructions.accountNumber}</p>}
                {paymentInstructions.cardLastFourDigits && <p>Tarjeta terminación: ••••{paymentInstructions.cardLastFourDigits}</p>}
                {paymentInstructions.paymentLink && (
                  <a href={paymentInstructions.paymentLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-medium text-medico-accent underline-offset-4 hover:underline">Pagar en línea</a>
                )}
                {paymentInstructions.transferReferenceInstructions && (
                  <p className="mt-2 italic">{paymentInstructions.transferReferenceInstructions}</p>
                )}
              </div>
            )}
          </div>
          <div className="divide-y divide-medico-ink/10 self-start rounded-2xl border border-medico-ink/10 bg-white p-6 text-sm">
            {schedule.map((row) => (
              <div key={row.day} className="flex justify-between py-2">
                <span className="text-medico-ink/70">{row.day}</span>
                <span className={row.hours === "Cerrado" ? "text-medico-ink/40" : "font-medium"}>{row.hours}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Urgencias */}
        <section id="urgencias" className="my-14 rounded-2xl bg-medico-ink px-8 py-10 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-medico-accent-soft">Urgencia ambulatoria</p>
          <h3 className="mt-3 max-w-md text-2xl" style={{ fontFamily: "var(--f-lora)" }}>
            Fiebre alta, dolor agudo o malestar súbito no esperan turno.
          </h3>
          <div className="mt-6 flex gap-4">
            <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="rounded-md bg-medico-urgent px-6 py-3 text-sm font-medium text-white">Llamar ahora</a>
            <a href={`https://wa.me/${business.whatsapp}`} className="rounded-md border border-white/30 px-6 py-3 text-sm font-medium">WhatsApp de urgencias</a>
          </div>
        </section>

        <Pulse className="h-4 w-full text-medico-ink/15" />

        {/* Testimonios */}
        <section id="testimonios" className="py-14">
          <h3 className="text-2xl" style={{ fontFamily: "var(--f-lora)" }}>Lo que cuentan los pacientes</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-medico-ink/10 bg-white p-5">
                <blockquote className="text-medico-ink/80">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-3 text-xs text-medico-ink/50">{t.name} · {t.treatment}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section id="contacto" className="py-14">
          <h3 className="text-2xl" style={{ fontFamily: "var(--f-lora)" }}>Agenda tu consulta</h3>
          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="text-medico-ink/50">Teléfono</div>
              <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="mt-1 block font-medium">{business.phone}</a>
            </div>
            <div>
              <div className="text-medico-ink/50">WhatsApp</div>
              <a href={`https://wa.me/${business.whatsapp}`} className="mt-1 block font-medium">{business.phone}</a>
            </div>
            <div>
              <div className="text-medico-ink/50">Correo</div>
              <a href={`mailto:${business.email ?? ""}`} className="mt-1 block font-medium">{business.email ?? ""}</a>
            </div>
            <div>
              <div className="text-medico-ink/50">Redes sociales</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-medico-accent underline-offset-4 hover:underline">Instagram</a>}
                {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-medico-accent underline-offset-4 hover:underline">Facebook</a>}
                {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-medico-accent underline-offset-4 hover:underline">TikTok</a>}
                {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-medico-accent underline-offset-4 hover:underline">YouTube</a>}
                {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-medico-accent underline-offset-4 hover:underline">LinkedIn</a>}
                {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-medico-accent underline-offset-4 hover:underline">Sitio web</a>}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
