import { lora, nunitoSans } from "@/lib/fonts";

// Paleta 3 — "Vino cálido": mismo diseño que /medico, solo cambia la paleta de color
// (vino/burdeos sobre arena cálida) mediante variables CSS heredadas, sin duplicar el layout.
const paletteVars = {
  "--color-medico-bg": "#f8f3ef",
  "--color-medico-ink": "#2a1c20",
  "--color-medico-accent": "#7c2d44",
  "--color-medico-accent-deep": "#5c2032",
  "--color-medico-accent-soft": "#d9a8b8",
  "--color-medico-urgent": "#a23d28",
} as React.CSSProperties;

const doctor = {
  name: "Centro Médico Altavista",
  doctor: "Dr. Joaquín Lemus Ortega",
  specialty: "Medicina Interna",
  school: "Facultad de Medicina, UNAM",
  license: "5821093",
  specialtyLicense: "8834201",
  experienceYears: "16",
  patients: "9,200",
  welcomeMessage:
    "Atención médica integral para adultos: desde el chequeo anual hasta el seguimiento de enfermedades crónicas, con un plan claro y explicado en lenguaje simple.",
  address: {
    street: "Av. Altavista 142, int. 3",
    neighborhood: "San Ángel, Álvaro Obregón",
    zip: "01060 CDMX",
    reference: "A dos cuadras del Parque de la Bombilla",
    mapsUrl: "https://maps.google.com/?q=Av+Altavista+142+CDMX",
  },
  phone: "55 2210 4477",
  phoneHref: "5522104477",
  whatsapp: "https://wa.me/525522104477",
  email: "contacto@centromedicoaltavista.mx",
  social: { facebook: "https://facebook.com", instagram: "https://instagram.com", instagramHandle: "@centroaltavista" },
};

const vitals = [
  { label: "Años de práctica", value: doctor.experienceYears },
  { label: "Pacientes atendidos", value: doctor.patients },
  { label: "Cédula profesional", value: doctor.license },
];

type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "precio fijo", from: "desde", consult: "a consulta" };

const services: { name: string; description: string; price: string; priceType: PriceType; isUrgency?: boolean }[] = [
  { name: "Consulta general", description: "Valoración, historial clínico y diagnóstico inicial.", price: "$650", priceType: "fixed" },
  { name: "Chequeo anual completo", description: "Biometría hemática, química sanguínea y revisión física.", price: "$1,800", priceType: "from" },
  { name: "Control de diabetes e hipertensión", description: "Seguimiento trimestral con ajuste de tratamiento.", price: "$700", priceType: "fixed" },
  { name: "Electrocardiograma", description: "Lectura e interpretación el mismo día.", price: "$450", priceType: "fixed" },
  { name: "Certificado médico", description: "Para trámites escolares, laborales o deportivos.", price: "$400", priceType: "fixed" },
  { name: "Vacunación del adulto", description: "Influenza, neumococo, tétanos y refuerzos.", price: "$350", priceType: "from" },
  { name: "Valoración prequirúrgica", description: "Dictamen de riesgo para cirugía programada.", price: "$900", priceType: "fixed" },
  { name: "Urgencia ambulatoria", description: "Fiebre alta, dolor agudo o malestar súbito.", price: "Consulta", priceType: "consult", isUrgency: true },
];

const schedule = [
  { day: "Lunes a viernes", hours: "8:00 – 19:00" },
  { day: "Sábado", hours: "9:00 – 14:00" },
  { day: "Domingo", hours: "Cerrado" },
];

const paymentMethods = ["Efectivo", "Tarjeta", "Transferencia", "Seguro de gastos médicos"];

const testimonials = [
  { name: "Rosa M.", quote: "Me explicó mis estudios sin tecnicismos y le dio seguimiento a mi tratamiento mes con mes.", treatment: "Control de hipertensión" },
  { name: "Felipe A.", quote: "Sacó mi certificado médico el mismo día, justo cuando lo necesitaba para el trabajo.", treatment: "Certificado médico" },
  { name: "Diana C.", quote: "El chequeo anual fue completo y me detectaron algo a tiempo gracias a sus estudios.", treatment: "Chequeo anual" },
];

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

export default function MedicoPaleta3() {
  return (
    <div
      className={`${lora.variable} ${nunitoSans.variable} min-h-screen bg-medico-bg text-medico-ink`}
      style={{ ...paletteVars, fontFamily: "var(--f-nunito-sans)" }}
    >
      {/* Header */}
      <header className="border-b border-medico-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-medico-accent">Consulta médica</p>
            <h1 className="text-lg font-semibold" style={{ fontFamily: "var(--f-lora)" }}>{doctor.name}</h1>
          </div>
          <a href={doctor.whatsapp} className="rounded-md bg-medico-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-medico-accent-deep">
            Agendar consulta
          </a>
        </div>
        <Pulse className="h-3 w-full text-medico-accent/30" />
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        {/* Hero */}
        <section className="grid gap-10 pb-14 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-medico-accent">{doctor.specialty} · CDMX</p>
            <h2 className="mt-4 max-w-xl text-4xl leading-[1.15] md:text-5xl" style={{ fontFamily: "var(--f-lora)" }}>
              Medicina interna con seguimiento real, no solo recetas.
            </h2>
            <p className="mt-5 max-w-lg text-medico-ink/70">{doctor.welcomeMessage}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={doctor.whatsapp} className="rounded-md bg-medico-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-medico-accent-deep">
                Agendar consulta
              </a>
              <a href={`tel:${doctor.phoneHref}`} className="rounded-md border border-medico-ink/20 px-6 py-3 text-sm font-medium transition hover:border-medico-ink/50">
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
            <h3 className="text-2xl" style={{ fontFamily: "var(--f-lora)" }}>{doctor.doctor}</h3>
            <p className="mt-3 max-w-lg text-medico-ink/70">
              Médico cirujano con especialidad en {doctor.specialty} por la {doctor.school}. Cédula de
              especialidad {doctor.specialtyLicense}.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-medico-ink/70">
              <li>· Historial clínico completo desde la primera consulta.</li>
              <li>· Resultados de laboratorio explicados, no solo entregados.</li>
              <li>· Seguimiento programado para padecimientos crónicos.</li>
            </ul>
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
              {doctor.address.street}<br />
              {doctor.address.neighborhood}<br />
              {doctor.address.zip}
            </address>
            <p className="mt-2 text-sm text-medico-ink/60">{doctor.address.reference}</p>
            <a href={doctor.address.mapsUrl} className="mt-3 inline-block text-sm font-medium text-medico-accent underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-8 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-md border border-medico-ink/15 px-3 py-1 text-xs text-medico-ink/70">{m}</span>
              ))}
            </div>
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
            <a href={`tel:${doctor.phoneHref}`} className="rounded-md bg-medico-urgent px-6 py-3 text-sm font-medium text-white">Llamar ahora</a>
            <a href={doctor.whatsapp} className="rounded-md border border-white/30 px-6 py-3 text-sm font-medium">WhatsApp de urgencias</a>
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
              <a href={`tel:${doctor.phoneHref}`} className="mt-1 block font-medium">{doctor.phone}</a>
            </div>
            <div>
              <div className="text-medico-ink/50">WhatsApp</div>
              <a href={doctor.whatsapp} className="mt-1 block font-medium">{doctor.phone}</a>
            </div>
            <div>
              <div className="text-medico-ink/50">Correo</div>
              <a href={`mailto:${doctor.email}`} className="mt-1 block font-medium">{doctor.email}</a>
            </div>
            <div>
              <div className="text-medico-ink/50">Redes</div>
              <div className="mt-1 flex flex-col gap-1">
                <a href={doctor.social.facebook}>Facebook</a>
                <a href={doctor.social.instagram}>Instagram {doctor.social.instagramHandle}</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
