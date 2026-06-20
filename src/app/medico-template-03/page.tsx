import { manrope, karla } from "@/lib/fonts";

// Alterno C — rediseño inspirado en sitios de clínica institucional (medicasmart.com.mx):
// hero centrado "clínica de confianza", tarjetas de servicio con icono + "Conocer más",
// bloques de Misión/Visión, galería de instalaciones, testimonios con estrellas y un
// bloque de contacto completo. Paleta verde clínica sobre blanco (cálida pero profesional)
// y tipografía Manrope + Karla, distinta del alterno B "tablero" y del médico principal.
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
    "Atención médica integral para adultos, con trato humano y un plan claro: desde el chequeo anual hasta el seguimiento de enfermedades crónicas, explicado en lenguaje simple.",
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

const stats = [
  { value: doctor.experienceYears, label: "años de práctica" },
  { value: doctor.patients, label: "pacientes atendidos" },
  { value: "98%", label: "pacientes que regresan" },
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

export default function MedicoTemplate03() {
  return (
    <div
      className={`${manrope.variable} ${karla.variable} min-h-screen bg-white text-[#15211d]`}
      style={{ fontFamily: "var(--f-karla)" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#15211d]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2 text-[#047857]">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e7f3ee]">
              <IconCross />
            </span>
            <span className="text-base font-bold text-[#15211d]" style={{ fontFamily: "var(--f-manrope)" }}>{doctor.name}</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-[#15211d]/65 lg:flex">
            <a href="#nosotros" className="hover:text-[#047857]">Nosotros</a>
            <a href="#servicios" className="hover:text-[#047857]">Servicios</a>
            <a href="#instalaciones" className="hover:text-[#047857]">Instalaciones</a>
            <a href="#testimonios" className="hover:text-[#047857]">Testimonios</a>
            <a href="#contacto" className="hover:text-[#047857]">Contacto</a>
          </nav>
          <a href={doctor.whatsapp} className="rounded-full bg-[#047857] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#036249]">
            Agendar
          </a>
        </div>
      </header>

      {/* Hero: centrado, banda verde suave */}
      <section className="bg-gradient-to-b from-[#e7f3ee] to-white px-6 py-20 text-center md:py-28">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block rounded-full border border-[#047857]/20 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#047857]">
            {doctor.specialty} · CDMX
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] md:text-6xl" style={{ fontFamily: "var(--f-manrope)" }}>
            Tu clínica de confianza, cerca de casa.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[#15211d]/70">{doctor.welcomeMessage}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a href={doctor.whatsapp} className="rounded-full bg-[#047857] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#036249]">
              Conócenos
            </a>
            <a href={`tel:${doctor.phoneHref}`} className="rounded-full border border-[#15211d]/20 px-7 py-3.5 text-sm font-semibold transition hover:border-[#047857] hover:text-[#047857]">
              Llamar al consultorio
            </a>
          </div>

          <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-[#15211d]/10 pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-3xl font-extrabold text-[#047857]" style={{ fontFamily: "var(--f-manrope)" }}>{s.value}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wide text-[#15211d]/55">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Servicios: 4 tarjetas con icono + "Conocer más" */}
      <section id="servicios" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#047857]">Servicios</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--f-manrope)" }}>Cómo te podemos ayudar</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <div key={c.title} className="flex flex-col rounded-2xl border border-[#15211d]/10 p-6 transition hover:border-[#047857]/40 hover:shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#e7f3ee] text-[#047857]">
                <c.Icon />
              </span>
              <h3 className="mt-5 font-bold" style={{ fontFamily: "var(--f-manrope)" }}>{c.title}</h3>
              <p className="mt-2 flex-1 text-sm text-[#15211d]/65">{c.desc}</p>
              <a href="#contacto" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#047857] hover:gap-2">
                Conocer más
                <span aria-hidden>→</span>
              </a>
            </div>
          ))}
        </div>

        {/* Precios de referencia */}
        <div className="mt-16 rounded-3xl bg-[#f6faf8] p-8 md:p-10">
          <h3 className="text-xl font-bold" style={{ fontFamily: "var(--f-manrope)" }}>Consultas y estudios</h3>
          <div className="mt-6 grid gap-x-10 gap-y-1 md:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.name}
                className={`flex items-baseline justify-between gap-4 border-b border-[#15211d]/10 py-3 ${s.isUrgency ? "text-[#c0462b]" : ""}`}
              >
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-[#15211d]/55">{s.description}</div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className={`text-sm font-bold ${s.isUrgency ? "text-[#c0462b]" : "text-[#047857]"}`}>{s.price}</div>
                  <div className="text-[0.7rem] text-[#15211d]/45">{priceTypeLabel[s.priceType]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nosotros: Misión / Visión + médico */}
      <section id="nosotros" className="bg-[#f6faf8] px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-[#e7f3ee] to-[#cfe7dd]" aria-hidden />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#047857]">Nosotros</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--f-manrope)" }}>Atención personalizada y humana</h2>
            <p className="mt-4 text-[#15211d]/70">
              {doctor.doctor}, médico cirujano con especialidad en {doctor.specialty} por la {doctor.school}
              {" "}(cédula de especialidad {doctor.specialtyLicense}). Cada paciente recibe un plan por escrito,
              estudios explicados y seguimiento real.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#15211d]/10 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#047857]">Misión</p>
                <p className="mt-2 text-sm text-[#15211d]/70">Cuidar la salud del adulto con cercanía, claridad y rigor clínico.</p>
              </div>
              <div className="rounded-2xl border border-[#15211d]/10 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#047857]">Visión</p>
                <p className="mt-2 text-sm text-[#15211d]/70">Ser el consultorio de confianza al que la familia regresa por años.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instalaciones: galería de placeholders etiquetados */}
      <section id="instalaciones" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#047857]">Instalaciones</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--f-manrope)" }}>Un espacio pensado para ti</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {facilities.map((f, i) => (
            <div key={f.label} className={`group relative overflow-hidden rounded-2xl ${i === 0 ? "sm:col-span-2 sm:row-span-2 sm:aspect-auto" : ""}`}>
              <div className={`bg-gradient-to-br from-[#e7f3ee] to-[#cfe7dd] ${i === 0 ? "h-full min-h-[12rem]" : "aspect-[4/3]"}`} aria-hidden />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#15211d]">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Urgencias: banda compacta */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#15211d] px-8 py-10 text-white md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7fd1b5]">Urgencia ambulatoria</p>
            <h2 className="mt-2 max-w-md text-2xl font-bold" style={{ fontFamily: "var(--f-manrope)" }}>
              Fiebre alta, dolor agudo o malestar súbito no esperan turno.
            </h2>
          </div>
          <div className="flex shrink-0 gap-3">
            <a href={`tel:${doctor.phoneHref}`} className="rounded-full bg-[#c0462b] px-6 py-3 text-sm font-semibold text-white">Llamar ahora</a>
            <a href={doctor.whatsapp} className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold">WhatsApp</a>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#047857]">Testimonios</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--f-manrope)" }}>Lo que dicen nuestros pacientes</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-[#15211d]/10 p-6">
              <div className="text-sm tracking-wide text-[#f0a500]">
                <span aria-hidden>{stars}</span>
                <span className="sr-only">5 de 5 estrellas</span>
              </div>
              <blockquote className="mt-3 text-[#15211d]/80">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-xs text-[#15211d]/55">{t.name} · {t.treatment}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="bg-[#f6faf8] px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#047857]">Contacto</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl" style={{ fontFamily: "var(--f-manrope)" }}>Agenda tu consulta</h2>
            <p className="mt-4 max-w-md text-[#15211d]/70">
              Escríbenos o llámanos y te confirmamos disponibilidad el mismo día.
            </p>

            <dl className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[#15211d]/50">Teléfono</dt>
                <dd><a href={`tel:${doctor.phoneHref}`} className="mt-1 block font-semibold text-[#047857]">{doctor.phone}</a></dd>
              </div>
              <div>
                <dt className="text-[#15211d]/50">WhatsApp</dt>
                <dd><a href={doctor.whatsapp} className="mt-1 block font-semibold text-[#047857]">{doctor.phone}</a></dd>
              </div>
              <div>
                <dt className="text-[#15211d]/50">Correo</dt>
                <dd><a href={`mailto:${doctor.email}`} className="mt-1 block font-semibold text-[#047857]">{doctor.email}</a></dd>
              </div>
              <div>
                <dt className="text-[#15211d]/50">Redes</dt>
                <dd className="mt-1 flex flex-col gap-1">
                  <a href={doctor.social.facebook}>Facebook</a>
                  <a href={doctor.social.instagram}>Instagram {doctor.social.instagramHandle}</a>
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#15211d]/50">Formas de pago</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {paymentMethods.map((m) => (
                  <span key={m} className="rounded-full border border-[#15211d]/15 px-3 py-1 text-xs text-[#15211d]/65">{m}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#15211d]/10 bg-white p-6">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#e7f3ee] to-[#cfe7dd]" aria-hidden />
            <address className="mt-5 not-italic text-sm text-[#15211d]/70">
              {doctor.address.street}<br />
              {doctor.address.neighborhood}<br />
              {doctor.address.zip}
            </address>
            <p className="mt-1 text-xs text-[#15211d]/55">{doctor.address.reference}</p>
            <a href={doctor.address.mapsUrl} className="mt-2 inline-block text-sm font-semibold text-[#047857] underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-5 divide-y divide-[#15211d]/10 border-t border-[#15211d]/10 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-2">
                  <span className="text-[#15211d]/70">{row.day}</span>
                  <span className={row.hours === "Cerrado" ? "text-[#15211d]/40" : "font-medium"}>{row.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#15211d]/10 px-6 py-8 text-center text-sm text-[#15211d]/55">
        {doctor.name} · {doctor.doctor} · CDMX
      </footer>
    </div>
  );
}
