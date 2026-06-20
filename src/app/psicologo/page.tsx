import { lora, manrope } from "@/lib/fonts";

// Keeps a conventional header, but the body is not a vertical stack of full-width sections like
// every other template. Instead: a sticky profile card on the left that never scrolls away,
// paired with a single switchable content panel on the right (tabs, not separate sections) —
// closer to a patient-portal layout than a landing page.
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

const services = [
  { name: "Primera sesión", description: "Conversación inicial para entender qué traes.", price: "$750" },
  { name: "Sesión individual", description: "50 minutos, semanal o quincenal.", price: "$850" },
  { name: "Terapia de pareja", description: "Sesiones de 75 minutos.", price: "$1,200" },
  { name: "Acompañamiento de duelo", description: "Proceso breve enfocado en una pérdida reciente.", price: "desde $800" },
  { name: "Sesión en línea", description: "Misma calidad de atención, por videollamada.", price: "$800" },
];

const schedule = [
  { day: "Lunes a viernes", hours: "10:00 – 19:00" },
  { day: "Sábado", hours: "10:00 – 14:00" },
  { day: "Domingo", hours: "Cerrado" },
];

const testimonials = [
  { name: "Andrea P.", quote: "Nunca me sentí apresurada. Fue el primer espacio donde pude hablar sin filtrar lo que decía.", treatment: "Sesión individual" },
  { name: "Sergio L.", quote: "La terapia de pareja nos dio herramientas reales, no solo nos hizo hablar de lo mismo.", treatment: "Terapia de pareja" },
  { name: "Renata G.", quote: "Me acompañó en el duelo de mi padre con mucho respeto por mis tiempos.", treatment: "Acompañamiento de duelo" },
];

const tabs = [
  { id: "servicios", label: "Servicios" },
  { id: "horario", label: "Horario y ubicación" },
  { id: "testimonios", label: "Testimonios" },
];

export default function PsicologoTemplate() {
  return (
    <div
      className={`${lora.variable} ${manrope.variable} min-h-screen bg-[#f6f4ef] text-[#372f2c]`}
      style={{ fontFamily: "var(--f-manrope)" }}
    >
      {/* Conventional header */}
      <header className="sticky top-0 z-20 border-b border-[#372f2c]/10 bg-[#f6f4ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg" style={{ fontFamily: "var(--f-lora)" }}>{clinic.name}</span>
          <a href={clinic.whatsapp} className="rounded-md bg-[#7a5c44] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#624a37]">
            Agendar sesión
          </a>
        </div>
      </header>

      {/* Two-column "portal" layout: sticky profile card + switchable panel, not stacked sections */}
      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-12 md:grid-cols-[280px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="rounded-2xl border border-[#372f2c]/10 bg-white p-6">
            <div className="aspect-square rounded-xl bg-[#7a5c44]/15" aria-hidden />
            <h1 className="mt-5 text-xl" style={{ fontFamily: "var(--f-lora)" }}>{clinic.doctor}</h1>
            <p className="mt-1 text-sm text-[#372f2c]/60">{clinic.specialty}</p>

            <dl className="mt-5 space-y-2 border-t border-[#372f2c]/10 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#372f2c]/50">Cédula profesional</dt>
                <dd className="font-medium">{clinic.license}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#372f2c]/50">Años de práctica</dt>
                <dd className="font-medium">{clinic.experienceYears}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#372f2c]/50">Personas acompañadas</dt>
                <dd className="font-medium">{clinic.patients}</dd>
              </div>
            </dl>

            <a href={clinic.whatsapp} className="mt-6 block rounded-md bg-[#372f2c] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#241e1c]">
              Agendar sesión
            </a>
            <a href={`tel:${clinic.phoneHref}`} className="mt-2 block rounded-md border border-[#372f2c]/20 px-4 py-2.5 text-center text-sm font-medium transition hover:border-[#372f2c]/40">
              Llamar al consultorio
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-[#7a5c44]/30 bg-[#7a5c44]/5 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-[#7a5c44]">Contención en crisis</p>
            <p className="mt-2 text-sm text-[#372f2c]/70">
              Si hoy es un día difícil, no esperes a tu próxima cita.
            </p>
            <a href={clinic.whatsapp} className="mt-3 inline-block text-sm font-medium text-[#7a5c44] underline-offset-4 hover:underline">
              Escribir ahora →
            </a>
          </div>
        </aside>

        <section>
          <p className="mb-6 max-w-md text-[#372f2c]/70">
            Terapia individual y de pareja con un enfoque humanista, en consultorio o en línea.
          </p>

          <nav className="flex gap-1 rounded-lg border border-[#372f2c]/10 bg-white p-1 text-sm">
            {tabs.map((t, i) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className={`flex-1 rounded-md px-4 py-2 text-center font-medium transition hover:bg-[#7a5c44]/10 ${i === 0 ? "bg-[#7a5c44] text-white hover:bg-[#7a5c44]" : "text-[#372f2c]/70"}`}
              >
                {t.label}
              </a>
            ))}
          </nav>

          <div id="servicios" className="mt-8 scroll-mt-24 rounded-2xl border border-[#372f2c]/10 bg-white p-6">
            <h2 className="text-lg" style={{ fontFamily: "var(--f-lora)" }}>Modalidades y honorarios</h2>
            <div className="mt-5 divide-y divide-[#372f2c]/10">
              {services.map((s) => (
                <div key={s.name} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="mt-0.5 text-sm text-[#372f2c]/55">{s.description}</div>
                  </div>
                  <span className="font-semibold text-[#7a5c44]">{s.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div id="horario" className="mt-8 scroll-mt-24 grid gap-6 rounded-2xl border border-[#372f2c]/10 bg-white p-6 sm:grid-cols-2">
            <div>
              <h2 className="text-lg" style={{ fontFamily: "var(--f-lora)" }}>Ubicación</h2>
              <address className="mt-3 not-italic text-sm text-[#372f2c]/70">
                {clinic.address.street}<br />
                {clinic.address.neighborhood}
              </address>
              <p className="mt-2 text-xs text-[#372f2c]/50">{clinic.address.reference}</p>
              <a href={clinic.address.mapsUrl} className="mt-3 inline-block text-sm font-medium text-[#7a5c44] underline-offset-4 hover:underline">
                Ver en Google Maps →
              </a>
            </div>
            <div>
              <h2 className="text-lg" style={{ fontFamily: "var(--f-lora)" }}>Horario</h2>
              <div className="mt-3 divide-y divide-[#372f2c]/10 text-sm">
                {schedule.map((row) => (
                  <div key={row.day} className="flex justify-between py-2">
                    <span className="text-[#372f2c]/70">{row.day}</span>
                    <span className={row.hours === "Cerrado" ? "text-[#372f2c]/40" : "font-medium"}>{row.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="testimonios" className="mt-8 scroll-mt-24 rounded-2xl border border-[#372f2c]/10 bg-white p-6">
            <h2 className="text-lg" style={{ fontFamily: "var(--f-lora)" }}>Lo que comparten quienes vienen aquí</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {testimonials.map((t) => (
                <figure key={t.name} className="rounded-xl bg-[#f6f4ef] p-4">
                  <blockquote className="text-sm text-[#372f2c]/80">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-2 text-xs text-[#372f2c]/45">{t.name} · {t.treatment}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-[#372f2c]/50">
            ¿Dudas antes de agendar? Escribe a <a href={`mailto:${clinic.email}`} className="underline">{clinic.email}</a>
          </p>
        </section>
      </main>
    </div>
  );
}
