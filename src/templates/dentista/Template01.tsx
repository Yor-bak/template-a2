"use client";

import BookingForm from "@/app/dentista/BookingForm";
import { PaletteSwitcher } from "@/components/PaletteSwitcher";
import type { TemplateProps, TemplatePalette } from "@/templates/types";
import {
  PAYMENT_METHOD_LABEL,
  formatPriceString,
  scheduleFromOpeningHours,
} from "@/lib/profileUtils";

// Las 3 paletas se aplican en el cliente sobreescribiendo las variables CSS heredadas.
// Los archivos /dentista-paleta-2 y /dentista-paleta-3 conservan cada paleta como ruta
// propia para reubicarlas más adelante. swatch/surface/ink alimentan al PaletteSwitcher.
export const PALETTES: readonly TemplatePalette[] = [
  {
    id: "azul-clinico",
    name: "Azul clínico",
    swatch: "#2a5f96",
    surface: "#f4f8fb",
    ink: "#15202c",
    vars: {
      "--color-ivory": "#f4f8fb",
      "--color-ink": "#15202c",
      "--color-meridian": "#2a5f96",
      "--color-meridian-deep": "#1f4f80",
      "--color-steel": "#c9d6e0",
      "--color-steel-soft": "#e6edf3",
      "--color-urgent": "#d8543e",
      "--color-urgent-deep": "#b6402d",
    },
  },
  // Menta cyan: el cyan neón vive en steel-soft (bloques decorativos sin texto) y el
  // acento de texto/botón es un teal oscuro seguro en AA; urgent baja a ladrillo.
  {
    id: "menta-cyan",
    name: "Menta cyan",
    swatch: "#16e0e0",
    surface: "#f0fbfb",
    ink: "#0c2226",
    vars: {
      "--color-ivory": "#f0fbfb",
      "--color-ink": "#0c2226",
      "--color-meridian": "#08707a",
      "--color-meridian-deep": "#05545c",
      "--color-steel": "#bcdada",
      "--color-steel-soft": "#16e0e0",
      "--color-urgent": "#c0462b",
      "--color-urgent-deep": "#9e3821",
    },
  },
  {
    id: "arena-calida",
    name: "Arena cálida",
    swatch: "#b3552f",
    surface: "#fbf6ef",
    ink: "#2b2118",
    vars: {
      "--color-ivory": "#fbf6ef",
      "--color-ink": "#2b2118",
      "--color-meridian": "#b3552f",
      "--color-meridian-deep": "#8f3f20",
      "--color-steel": "#ddd0bd",
      "--color-steel-soft": "#f0e7d8",
      "--color-urgent": "#b3302f",
      "--color-urgent-deep": "#8f2420",
    },
  },
] as const;

export const DEFAULT_PALETTE_ID = PALETTES[0].id;

type PriceType = "fijo" | "desde" | "valoracion";

type Service = {
  name: string;
  price: string;
  priceType: PriceType;
  description: string;
  isUrgency?: boolean;
};

const priceTypeLabel: Record<PriceType, string> = {
  fijo: "Precio fijo",
  desde: "Desde",
  valoracion: "Previa valoración",
};

export function DentistaTemplate01({ profile, onPaletteChange, isPreview = false }: TemplateProps) {
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

  const activePalette = PALETTES.find((p) => p.id === appearance.selectedPaletteId) ?? PALETTES[0];
  const active = PALETTES.indexOf(activePalette);
  const setActive = (idx: number) => {
    if (!isPreview && onPaletteChange) onPaletteChange(PALETTES[idx].id);
  };

  const localPriceType = (pt: string): PriceType =>
    pt === "fixed" ? "fijo" : pt === "assessment_required" ? "valoracion" : "desde";

  const services: Service[] = profileServices
    .filter((s) => s.isActive)
    .map((s) => ({
      name: s.name,
      price:
        s.priceType === "assessment_required"
          ? "Requiere valoración"
          : formatPriceString(s.priceType, s.estimatedPrice) || "Consultar",
      priceType: localPriceType(s.priceType),
      description: s.shortDescription,
      isUrgency: s.isEmergency,
    }));

  const schedule = scheduleFromOpeningHours(openingHours);

  const paymentMethods = profilePayments.map((m) => PAYMENT_METHOD_LABEL[m]);

  const testimonials = profileTestimonials
    .filter((t) => t.isPublished)
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99))
    .map((t) => ({
      quote: t.comment,
      name: t.name,
      treatment: profileServices.find((s) => s.id === t.serviceId)?.name ?? "Paciente",
    }));

  const milestones = [
    { value: specialist.yearsExperience?.toString() ?? "–", label: "años de práctica" },
    { value: specialist.patientsServed?.toLocaleString("es-MX") ?? "–", label: "pacientes atendidos" },
    { value: specialist.professionalLicense, label: "cédula profesional" },
  ];

  const navLinks = [
    { href: "#agendar", label: "Agendar" },
    { href: "#especialista", label: "Especialista" },
    { href: "#servicios", label: "Servicios" },
    { href: "#ubicacion", label: "Ubicación" },
    { href: "#testimonios", label: "Testimonios" },
    { href: "#contacto", label: "Contacto" },
  ];

  const socialLinks = business.socialLinks ?? {};

  return (
    <div className="flex flex-col" style={PALETTES[active].vars as React.CSSProperties}>
      {isPreview && (
        <PaletteSwitcher palettes={PALETTES} active={active} onSelect={setActive} />
      )}
      <header className="sticky top-0 z-30 border-b border-steel/60 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            {appearance.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={appearance.logoUrl} alt={business.name} className="h-9 w-auto object-contain" />
            ) : (
              business.name
            )}
          </a>
          <nav className="hidden gap-8 text-sm md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-ink/70 transition hover:text-ink">
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="#agendar"
            className="rounded-full bg-meridian px-5 py-2 text-sm font-medium text-ivory transition hover:bg-meridian-deep"
          >
            Agendar consulta
          </a>
        </div>
      </header>

      <main id="top" className="flex flex-col">
        {/* HERO */}
        <section className="relative overflow-hidden px-6 pt-20 pb-24">
          <div className="mx-auto max-w-6xl">
            <p className="tick-label reveal text-meridian">Rehabilitación oral · Estética dental · CDMX</p>
            <h1 className="reveal mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Cada sonrisa tiene una línea media. Encontramos la suya.
            </h1>
            <p className="reveal mt-6 max-w-xl text-lg text-ink/70">
              {specialist.shortDescription}
            </p>

            <div className="reveal mt-10 flex flex-wrap gap-4">
              <a
                href="#agendar"
                className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-ivory transition hover:bg-ink/85"
              >
                Agendar consulta
              </a>
              <a
                href={`https://wa.me/${business.whatsapp}`}
                className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition hover:border-ink/50"
              >
                Preguntar por WhatsApp
              </a>
            </div>

            {/* Signature: the calibration / midline rule, annotated with the clinic's measured facts */}
            <div className="reveal mt-16">
              <div className="rule" />
              <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {milestones.map((m) => (
                  <div key={m.label}>
                    <div className="font-data text-2xl font-medium text-meridian-deep">{m.value}</div>
                    <div className="tick-label mt-1 text-ink/70">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {appearance.heroImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={appearance.heroImageUrl}
                alt={business.name}
                className="reveal mt-12 aspect-[16/9] w-full rounded-3xl object-cover"
              />
            )}
          </div>
        </section>

        {/* AGENDAR */}
        <section id="agendar" className="border-t border-steel/60 bg-ivory px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <p className="tick-label text-meridian">Agendar</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Reserva tu cita</h2>
            <p className="mt-3 text-ink/70">
              Llena tus datos y te confirmamos disponibilidad. Si prefieres resolver dudas antes de agendar,
              también puedes escribirnos directo por WhatsApp.
            </p>
            <div className="mt-8">
              <BookingForm />
            </div>
          </div>
        </section>

        {/* ESPECIALISTA */}
        <section id="especialista" className="border-t border-steel/60 bg-ivory px-6 py-20">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.4fr]">
            {appearance.specialistPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={appearance.specialistPhotoUrl}
                alt={specialist.displayName}
                className="aspect-[4/5] w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="aspect-[4/5] w-full rounded-2xl bg-steel-soft" aria-hidden />
            )}
            <div>
              <p className="tick-label text-meridian">La especialista</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">{specialist.displayName}</h2>
              <p className="mt-4 max-w-xl text-ink/70">
                Cirujana dentista con especialidad en Rehabilitación Oral y Estética Dental por la UNAM. Atiende
                cada caso con el mismo principio: medir antes de proponer, y proponer antes de tocar un diente.
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-steel pt-6 sm:grid-cols-4">
                <div>
                  <dt className="tick-label text-ink/70">Experiencia</dt>
                  <dd className="font-data mt-1 text-sm">{specialist.yearsExperience?.toString() ?? "–"} años</dd>
                </div>
                <div>
                  <dt className="tick-label text-ink/70">Cédula profesional</dt>
                  <dd className="font-data mt-1 text-sm">{specialist.professionalLicense}</dd>
                </div>
                <div>
                  <dt className="tick-label text-ink/70">Cédula de especialidad</dt>
                  <dd className="font-data mt-1 text-sm">{specialist.specialtyLicense}</dd>
                </div>
                <div>
                  <dt className="tick-label text-ink/70">Pacientes atendidos</dt>
                  <dd className="font-data mt-1 text-sm">{specialist.patientsServed?.toLocaleString("es-MX") ?? "–"}</dd>
                </div>
              </dl>

              <ul className="mt-8 space-y-2 text-sm text-ink/70">
                <li>· Instrumental esterilizado por paciente, sin excepciones.</li>
                <li>· Consultorio con luz natural y un solo paciente por horario — sin sala de espera llena.</li>
                <li>· Cada plan de tratamiento se entrega por escrito, con precios desglosados.</li>
              </ul>

              {specialist.biography && (
                <p className="mt-6 text-sm leading-relaxed text-ink/70">{specialist.biography}</p>
              )}
              {specialist.school && (
                <p className="mt-3 text-sm text-ink/70">Formación: {specialist.school}</p>
              )}
              {specialist.certifications && specialist.certifications.length > 0 && (
                <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-ink/70">
                  {specialist.certifications.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* SERVICIOS */}
        <section id="servicios" className="border-t border-steel/60 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <p className="tick-label text-meridian">Servicios</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Tratamientos y precios</h2>
            <p className="mt-4 max-w-xl text-ink/70">
              Precios de referencia en pesos mexicanos. El costo final se confirma en la valoración inicial.
            </p>

            <div className="mt-10 divide-y divide-steel border-y border-steel">
              {services.map((service) => (
                <div
                  key={service.name}
                  className={`flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:justify-between ${
                    service.isUrgency ? "bg-urgent/5" : ""
                  }`}
                >
                  <div className="sm:max-w-md">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{service.name}</h3>
                      {service.isUrgency && (
                        <span className="tick-label rounded-full bg-urgent/15 px-2 py-0.5 text-urgent-deep">
                          Urgencia
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink/70">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-data text-lg">{service.price}</div>
                    <div className="tick-label text-ink/70">{priceTypeLabel[service.priceType]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* UBICACIÓN, HORARIO, PAGOS */}
        <section id="ubicacion" className="border-t border-steel/60 bg-ivory px-6 py-20">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
            <div>
              <p className="tick-label text-meridian">Ubicación</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">{business.address.neighborhood}</h2>
              <address className="mt-4 not-italic text-ink/70">
                {business.address.street}
                <br />
                {business.address.neighborhood}
                <br />
                {`${business.address.postalCode ?? ""} ${business.address.city}`.trim()}
              </address>
              <p className="mt-3 text-sm text-ink/70">
                {business.address.references}
              </p>
              <a
                href={business.address.mapsUrl}
                className="mt-4 inline-block text-sm font-medium text-meridian underline-offset-4 hover:underline"
              >
                Ver en Google Maps →
              </a>

              <div className="mt-10">
                <p className="tick-label text-meridian">Formas de pago</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {paymentMethods.map((method) => (
                    <li key={method} className="rounded-full border border-steel px-3 py-1 text-sm text-ink/70">
                      {method}
                    </li>
                  ))}
                </ul>
                {paymentInstructions.showTransferDetails && (
                  <div className="mt-6 rounded-xl border border-steel bg-steel-soft/40 p-4 text-sm text-ink/70">
                    <p className="font-bold text-ink">Transferencia bancaria</p>
                    {paymentInstructions.bankName && <p className="mt-1">Banco: {paymentInstructions.bankName}</p>}
                    {paymentInstructions.accountHolder && <p>Titular: {paymentInstructions.accountHolder}</p>}
                    {paymentInstructions.clabe && <p>CLABE: {paymentInstructions.clabe}</p>}
                    {paymentInstructions.accountNumber && <p>Cuenta: {paymentInstructions.accountNumber}</p>}
                    {paymentInstructions.cardLastFourDigits && <p>Tarjeta terminación: ••••{paymentInstructions.cardLastFourDigits}</p>}
                    {paymentInstructions.paymentLink && (
                      <a href={paymentInstructions.paymentLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-meridian underline-offset-4 hover:underline">Pagar en línea</a>
                    )}
                    {paymentInstructions.transferReferenceInstructions && (
                      <p className="mt-2 italic">{paymentInstructions.transferReferenceInstructions}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="aspect-[4/3] w-full rounded-2xl bg-steel-soft" aria-hidden />
              <div className="mt-8">
                <p className="tick-label text-meridian">Horario</p>
                <div className="mt-3 divide-y divide-steel border-y border-steel font-data text-sm">
                  {schedule.map((row) => (
                    <div key={row.day} className="flex items-center justify-between py-2">
                      <span className="text-ink/70">{row.day}</span>
                      <span className={row.hours === "Cerrado" ? "text-ink/70" : ""}>{row.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* URGENCIAS */}
        <section className="border-t border-steel/60 bg-ink px-6 py-16 text-ivory">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="tick-label text-urgent">Atención de urgencias</p>
              <h2 className="mt-3 max-w-md font-display text-2xl font-bold tracking-tight">
                Dolor agudo, fractura o golpe no esperan turno.
              </h2>
              <p className="mt-3 max-w-md text-ivory/70">
                Escríbenos y te decimos en minutos si necesitas venir hoy mismo.
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href={`tel:${business.phone.replace(/\D/g, "")}`}
                className="rounded-full bg-urgent px-6 py-3 text-sm font-medium text-ivory transition hover:bg-urgent-deep"
              >
                Llamar ahora
              </a>
              <a
                href={`https://wa.me/${business.whatsapp}`}
                className="rounded-full border border-ivory/30 px-6 py-3 text-sm font-medium text-ivory transition hover:border-ivory/60"
              >
                WhatsApp de urgencias
              </a>
            </div>
          </div>
        </section>

        {/* GALERÍA — solo se muestra si hay imágenes configuradas */}
        {appearance.galleryUrls.length > 0 && (
          <section id="galeria" className="border-t border-steel/60 bg-ivory px-6 py-20">
            <div className="mx-auto max-w-6xl">
              <p className="tick-label text-meridian">Galería</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Nuestro consultorio</h2>
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {appearance.galleryUrls.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`${business.name} — foto ${i + 1}`}
                    className="aspect-square w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TESTIMONIOS */}
        <section id="testimonios" className="border-t border-steel/60 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <p className="tick-label text-meridian">Testimonios</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Lo que cuentan los pacientes</h2>

            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.name} className="rounded-2xl border border-steel p-6">
                  <blockquote className="text-ink/80">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-4 font-data text-sm text-ink/70">
                    {t.name} · {t.treatment}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACTO */}
        <section id="contacto" className="border-t border-steel/60 bg-ivory px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <p className="tick-label text-meridian">Contacto</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Hablemos de tu sonrisa</h2>

            <div className="mt-8 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
              <div>
                <div className="tick-label text-ink/70">Teléfono</div>
                <a href={`tel:${business.phone.replace(/\D/g, "")}`} className="font-data mt-1 block">
                  {business.phone}
                </a>
              </div>
              <div>
                <div className="tick-label text-ink/70">WhatsApp</div>
                <a href={`https://wa.me/${business.whatsapp}`} className="font-data mt-1 block">
                  {business.phone}
                </a>
              </div>
              <div>
                <div className="tick-label text-ink/70">Correo</div>
                <a href={`mailto:${business.email ?? ""}`} className="font-data mt-1 block">
                  {business.email ?? ""}
                </a>
              </div>
              <div>
                <div className="tick-label text-ink/70">Redes sociales</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-meridian underline-offset-4 hover:underline">Instagram</a>
                  )}
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-meridian underline-offset-4 hover:underline">Facebook</a>
                  )}
                  {socialLinks.tiktok && (
                    <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm text-meridian underline-offset-4 hover:underline">TikTok</a>
                  )}
                  {socialLinks.youtube && (
                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-sm text-meridian underline-offset-4 hover:underline">YouTube</a>
                  )}
                  {socialLinks.linkedin && (
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-meridian underline-offset-4 hover:underline">LinkedIn</a>
                  )}
                  {socialLinks.website && (
                    <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-sm text-meridian underline-offset-4 hover:underline">Sitio web</a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-steel/60 px-6 pt-8 pb-28 text-center text-sm text-ink/70">
        {business.name} · {specialist.displayName} · CDMX
      </footer>
    </div>
  );
}
