import { outfit, ibmPlexSans, jetbrainsMono } from "@/lib/fonts";

// Alterno B — "Tablero clínico": reimagina /medico como un panel de consultorio (estilo EMR),
// con navegación horizontal por pestañas, métricas como widgets de dashboard y servicios
// como tarjetas de módulo en vez de tabla. Paleta y tipografía propias, sin relación con
// las 3 paletas de /medico ni con los alternos de dentista.
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

const navLinks = [
  { href: "#especialista", label: "Especialista" },
  { href: "#servicios", label: "Servicios" },
  { href: "#ubicacion", label: "Ubicación" },
  { href: "#urgencias", label: "Urgencias" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#contacto", label: "Contacto" },
];

export default function MedicoTemplate02() {
  return (
    <div
      className={`${outfit.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} min-h-screen bg-[#f7f9fb] text-[#16202b]`}
      style={{ fontFamily: "var(--f-ibm-plex-sans)" }}
    >
      {/* Header: horizontal tab nav, not a sidebar — this is a "panel" you scan left to right */}
      <header className="sticky top-0 z-30 border-b border-[#16202b]/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-[#0e7c86]">Tablero clínico</p>
            <h1 className="text-base font-semibold" style={{ fontFamily: "var(--f-outfit)" }}>{doctor.name}</h1>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-[#16202b]/60 lg:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="transition hover:text-[#0e7c86]">{l.label}</a>
            ))}
          </nav>
          <a href={doctor.whatsapp} className="rounded-md bg-[#0e7c86] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0b5e66]">
            Agendar consulta
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero: intro + a dashboard panel of stat tiles, side by side like a desk view */}
        <section className="grid gap-8 pb-12 md:grid-cols-[1.2fr_1fr] md:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0e7c86]">{doctor.specialty} · CDMX</p>
            <h2 className="mt-4 max-w-xl text-4xl leading-[1.1] md:text-5xl" style={{ fontFamily: "var(--f-outfit)" }}>
              El panorama completo de tu salud, en un solo lugar.
            </h2>
            <p className="mt-5 max-w-lg text-[#16202b]/70">{doctor.welcomeMessage}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={doctor.whatsapp} className="rounded-md bg-[#0e7c86] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0b5e66]">
                Agendar consulta
              </a>
              <a href={`tel:${doctor.phoneHref}`} className="rounded-md border border-[#16202b]/20 px-6 py-3 text-sm font-medium transition hover:border-[#16202b]/50">
                Llamar al consultorio
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-[#16202b]/10 bg-white p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#16202b]/50">Panorama del consultorio</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {vitals.map((v) => (
                <div key={v.label} className="rounded-xl border border-[#0e7c86]/15 bg-[#0e7c86]/5 p-3">
                  <dd className="text-lg font-semibold text-[#0e7c86]" style={{ fontFamily: "var(--f-jetbrains)" }}>{v.value}</dd>
                  <dt className="mt-1 text-[0.65rem] leading-tight text-[#16202b]/60">{v.label}</dt>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Especialista */}
        <section id="especialista" className="grid gap-10 border-t border-[#16202b]/10 py-12 md:grid-cols-[1fr_1.4fr]">
          <div className="aspect-square rounded-2xl bg-[#0e7c86]/10" aria-hidden />
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#0e7c86]">Perfil del médico</p>
            <h3 className="mt-2 text-2xl" style={{ fontFamily: "var(--f-outfit)" }}>{doctor.doctor}</h3>
            <p className="mt-3 max-w-lg text-[#16202b]/70">
              Médico cirujano con especialidad en {doctor.specialty} por la {doctor.school}. Cédula de
              especialidad {doctor.specialtyLicense}.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-[#16202b]/70">
              <li>· Historial clínico completo desde la primera consulta.</li>
              <li>· Resultados de laboratorio explicados, no solo entregados.</li>
              <li>· Seguimiento programado para padecimientos crónicos.</li>
            </ul>
          </div>
        </section>

        {/* Servicios: módulos de tarjeta en vez de tabla */}
        <section id="servicios" className="border-t border-[#16202b]/10 py-12">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#0e7c86]">Módulos disponibles</p>
          <h3 className="mt-2 text-2xl" style={{ fontFamily: "var(--f-outfit)" }}>Consultas y estudios</h3>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.name}
                className={`rounded-xl border p-5 ${s.isUrgency ? "border-[#d64545]/30 bg-[#d64545]/5" : "border-[#16202b]/10 bg-white"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-medium">{s.name}</h4>
                  <span
                    className="whitespace-nowrap text-base font-semibold text-[#0e7c86]"
                    style={{ fontFamily: "var(--f-jetbrains)" }}
                  >
                    {s.price}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#16202b]/60">{s.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-[#16202b]/40">{priceTypeLabel[s.priceType]}</span>
                  {s.isUrgency && (
                    <span className="rounded-full bg-[#d64545]/15 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-[#d64545]">
                      Urgente
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ubicación */}
        <section id="ubicacion" className="grid gap-10 border-t border-[#16202b]/10 py-12 md:grid-cols-2">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#0e7c86]">Acceso</p>
            <h3 className="mt-2 text-2xl" style={{ fontFamily: "var(--f-outfit)" }}>Ubicación y horario</h3>
            <address className="mt-4 not-italic text-[#16202b]/70">
              {doctor.address.street}<br />
              {doctor.address.neighborhood}<br />
              {doctor.address.zip}
            </address>
            <p className="mt-2 text-sm text-[#16202b]/60">{doctor.address.reference}</p>
            <a href={doctor.address.mapsUrl} className="mt-3 inline-block text-sm font-medium text-[#0e7c86] underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-8 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-md border border-[#16202b]/15 px-3 py-1 text-xs text-[#16202b]/70">{m}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#16202b]/10 bg-white p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#16202b]/50">Disponibilidad</p>
            <div className="mt-3 divide-y divide-[#16202b]/10 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-2">
                  <span className="text-[#16202b]/70">{row.day}</span>
                  <span
                    className={row.hours === "Cerrado" ? "text-[#16202b]/40" : "font-medium"}
                    style={{ fontFamily: "var(--f-jetbrains)" }}
                  >
                    {row.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Urgencias: alerta de panel, no bloque sólido */}
        <section id="urgencias" className="border-t border-[#16202b]/10 py-12">
          <div className="rounded-xl border-l-4 border-[#d64545] bg-[#d64545]/5 px-6 py-6">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#d64545]">Alerta · Urgencia ambulatoria</p>
            <h3 className="mt-2 max-w-md text-xl" style={{ fontFamily: "var(--f-outfit)" }}>
              Fiebre alta, dolor agudo o malestar súbito no esperan turno.
            </h3>
            <div className="mt-5 flex gap-4">
              <a href={`tel:${doctor.phoneHref}`} className="rounded-md bg-[#d64545] px-6 py-3 text-sm font-medium text-white">Llamar ahora</a>
              <a href={doctor.whatsapp} className="rounded-md border border-[#16202b]/20 px-6 py-3 text-sm font-medium">WhatsApp de urgencias</a>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section id="testimonios" className="border-t border-[#16202b]/10 py-12">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#0e7c86]">Registro de pacientes</p>
          <h3 className="mt-2 text-2xl" style={{ fontFamily: "var(--f-outfit)" }}>Lo que cuentan los pacientes</h3>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-xl border border-[#16202b]/10 bg-white p-5">
                <blockquote className="text-sm text-[#16202b]/80">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-3 text-xs text-[#16202b]/50">{t.name} · {t.treatment}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Contacto: panel de cierre */}
        <section id="contacto" className="my-4 rounded-2xl bg-[#16202b] px-8 py-10 text-white">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#7fc6cb]">Contacto</p>
          <h3 className="mt-2 text-2xl" style={{ fontFamily: "var(--f-outfit)" }}>Agenda tu consulta</h3>
          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="text-white/50">Teléfono</div>
              <a href={`tel:${doctor.phoneHref}`} className="mt-1 block font-medium">{doctor.phone}</a>
            </div>
            <div>
              <div className="text-white/50">WhatsApp</div>
              <a href={doctor.whatsapp} className="mt-1 block font-medium">{doctor.phone}</a>
            </div>
            <div>
              <div className="text-white/50">Correo</div>
              <a href={`mailto:${doctor.email}`} className="mt-1 block font-medium">{doctor.email}</a>
            </div>
            <div>
              <div className="text-white/50">Redes</div>
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
