import { cormorant, figtree } from "@/lib/fonts";

// Alterno C — "Crónica de salud": reimagina /medico como un artículo editorial — cita
// destacada como hero, bio narrada con cifras en línea, servicios como guía numerada de
// revista y un único testimonio protagonista. Paleta cálida y tipografía propias, sin
// relación con las 3 paletas de /medico ni con los alternos de dentista.
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

const featuredTestimonial = {
  name: "Rosa M.",
  quote: "Me explicó mis estudios sin tecnicismos y le dio seguimiento a mi tratamiento mes con mes. Por primera vez sentí que entendía lo que me pasaba.",
  treatment: "Control de hipertensión",
};

const otherTestimonials = [
  { name: "Felipe A.", quote: "Sacó mi certificado médico el mismo día, justo cuando lo necesitaba para el trabajo.", treatment: "Certificado médico" },
  { name: "Diana C.", quote: "El chequeo anual fue completo y me detectaron algo a tiempo gracias a sus estudios.", treatment: "Chequeo anual" },
];

export default function MedicoTemplate03() {
  return (
    <div
      className={`${cormorant.variable} ${figtree.variable} min-h-screen bg-[#f7f2ea] text-[#2c2620]`}
      style={{ fontFamily: "var(--f-figtree)" }}
    >
      {/* Header: minimal masthead, no CTA button up top — this reads as an article, not a sales page */}
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 pt-10">
        <span className="text-sm uppercase tracking-[0.25em] text-[#a8553b]">Crónica de salud</span>
        <a href={doctor.whatsapp} className="text-sm font-medium underline-offset-4 hover:underline">
          Agendar consulta
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Hero: pull-quote style headline */}
        <section className="border-b border-[#2c2620]/15 pb-12">
          <p className="text-sm uppercase tracking-[0.25em] text-[#a8553b]">{doctor.specialty} · CDMX</p>
          <h1
            className="mt-5 text-4xl italic leading-[1.15] md:text-5xl"
            style={{ fontFamily: "var(--f-cormorant)" }}
          >
            &ldquo;Un plan claro vale más que una promesa de salud instantánea.&rdquo;
          </h1>
          <p className="mt-6 max-w-xl text-[#2c2620]/75">{doctor.welcomeMessage}</p>
          <a
            href={`tel:${doctor.phoneHref}`}
            className="mt-6 inline-block rounded-full border border-[#2c2620]/30 px-6 py-3 text-sm font-medium transition hover:border-[#2c2620]/60"
          >
            Llamar al consultorio
          </a>
        </section>

        {/* Especialista: narrativa con drop-cap y cifras en línea */}
        <section id="especialista" className="border-b border-[#2c2620]/15 py-12">
          <p className="text-sm uppercase tracking-[0.25em] text-[#a8553b]">El especialista</p>
          <h2 className="mt-3 text-3xl" style={{ fontFamily: "var(--f-cormorant)" }}>{doctor.doctor}</h2>
          <p className="mt-4 max-w-xl text-[#2c2620]/80">
            <span
              className="float-left mr-2 mt-1 text-6xl leading-none"
              style={{ fontFamily: "var(--f-cormorant)" }}
              aria-hidden
            >
              M
            </span>
            édico cirujano con especialidad en {doctor.specialty} por la {doctor.school}, con cédula de
            especialidad {doctor.specialtyLicense}. Su consulta sigue tres principios: historial clínico
            completo desde la primera visita, resultados de laboratorio explicados —no solo entregados— y
            seguimiento programado para los padecimientos que no se resuelven en una sola cita.
          </p>
          <div className="mt-8 flex gap-10 text-sm">
            <div>
              <div className="text-2xl" style={{ fontFamily: "var(--f-cormorant)" }}>{doctor.experienceYears}</div>
              <div className="mt-1 text-[#2c2620]/55">años de práctica</div>
            </div>
            <div>
              <div className="text-2xl" style={{ fontFamily: "var(--f-cormorant)" }}>{doctor.patients}</div>
              <div className="mt-1 text-[#2c2620]/55">pacientes atendidos</div>
            </div>
            <div>
              <div className="text-2xl" style={{ fontFamily: "var(--f-cormorant)" }}>{doctor.license}</div>
              <div className="mt-1 text-[#2c2620]/55">cédula profesional</div>
            </div>
          </div>
        </section>

        {/* Servicios: guía numerada, no tabla ni tarjetas */}
        <section id="servicios" className="border-b border-[#2c2620]/15 py-12">
          <p className="text-sm uppercase tracking-[0.25em] text-[#a8553b]">Guía de consulta</p>
          <h2 className="mt-3 text-3xl" style={{ fontFamily: "var(--f-cormorant)" }}>Consultas y estudios</h2>
          <ol className="mt-8 divide-y divide-[#2c2620]/10">
            {services.map((s, i) => (
              <li key={s.name} className="flex items-baseline gap-5 py-4">
                <span className="text-sm tabular-nums text-[#a8553b]">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-medium">
                      {s.name}
                      {s.isUrgency && (
                        <span className="ml-2 text-xs uppercase tracking-wide text-[#8c2f2f]">· urgente</span>
                      )}
                    </h3>
                    <span className="whitespace-nowrap text-sm" style={{ fontFamily: "var(--f-cormorant)" }}>{s.price}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#2c2620]/65">{s.description}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-[#2c2620]/40">{priceTypeLabel[s.priceType]}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Ubicación + Urgencias: la urgencia como recuadro de barra lateral, no bloque ancho */}
        <section id="ubicacion" className="grid gap-10 border-b border-[#2c2620]/15 py-12 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#a8553b]">Dónde y cuándo</p>
            <h2 className="mt-3 text-3xl" style={{ fontFamily: "var(--f-cormorant)" }}>Ubicación y horario</h2>
            <address className="mt-4 not-italic text-[#2c2620]/75">
              {doctor.address.street}<br />
              {doctor.address.neighborhood}<br />
              {doctor.address.zip}
            </address>
            <p className="mt-2 text-sm text-[#2c2620]/60">{doctor.address.reference}</p>
            <a href={doctor.address.mapsUrl} className="mt-3 inline-block text-sm font-medium underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-6 divide-y divide-[#2c2620]/10 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-2">
                  <span className="text-[#2c2620]/70">{row.day}</span>
                  <span className={row.hours === "Cerrado" ? "text-[#2c2620]/40" : "font-medium"}>{row.hours}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border border-[#2c2620]/20 px-3 py-1 text-xs text-[#2c2620]/70">{m}</span>
              ))}
            </div>
          </div>

          <aside id="urgencias" className="self-start border-l-2 border-[#8c2f2f] pl-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#8c2f2f]">Urgencia ambulatoria</p>
            <p className="mt-2 text-sm text-[#2c2620]/75">
              Fiebre alta, dolor agudo o malestar súbito no esperan turno.
            </p>
            <a href={`tel:${doctor.phoneHref}`} className="mt-4 inline-block rounded-full border border-[#8c2f2f] px-5 py-2 text-sm font-medium text-[#8c2f2f] transition hover:bg-[#8c2f2f] hover:text-[#f7f2ea]">
              Llamar ahora
            </a>
            <a href={doctor.whatsapp} className="mt-3 block text-sm underline-offset-4 hover:underline">
              WhatsApp de urgencias
            </a>
          </aside>
        </section>

        {/* Testimonios: un protagonista, dos secundarios */}
        <section id="testimonios" className="border-b border-[#2c2620]/15 py-12">
          <p className="text-sm uppercase tracking-[0.25em] text-[#a8553b]">De viva voz</p>
          <blockquote
            className="mt-4 text-2xl italic leading-snug"
            style={{ fontFamily: "var(--f-cormorant)" }}
          >
            &ldquo;{featuredTestimonial.quote}&rdquo;
          </blockquote>
          <p className="mt-3 text-sm text-[#2c2620]/55">{featuredTestimonial.name} · {featuredTestimonial.treatment}</p>

          <div className="mt-8 grid gap-6 border-t border-[#2c2620]/10 pt-8 md:grid-cols-2">
            {otherTestimonials.map((t) => (
              <div key={t.name}>
                <blockquote className="text-sm text-[#2c2620]/75">&ldquo;{t.quote}&rdquo;</blockquote>
                <p className="mt-2 text-xs text-[#2c2620]/50">{t.name} · {t.treatment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section id="contacto" className="py-12">
          <p className="text-sm uppercase tracking-[0.25em] text-[#a8553b]">Para cerrar</p>
          <h2 className="mt-3 text-3xl" style={{ fontFamily: "var(--f-cormorant)" }}>Agenda tu consulta</h2>
          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="text-[#2c2620]/50">Teléfono</div>
              <a href={`tel:${doctor.phoneHref}`} className="mt-1 block font-medium">{doctor.phone}</a>
            </div>
            <div>
              <div className="text-[#2c2620]/50">WhatsApp</div>
              <a href={doctor.whatsapp} className="mt-1 block font-medium">{doctor.phone}</a>
            </div>
            <div>
              <div className="text-[#2c2620]/50">Correo</div>
              <a href={`mailto:${doctor.email}`} className="mt-1 block font-medium">{doctor.email}</a>
            </div>
            <div>
              <div className="text-[#2c2620]/50">Redes</div>
              <div className="mt-1 flex flex-col gap-1">
                <a href={doctor.social.facebook}>Facebook</a>
                <a href={doctor.social.instagram}>Instagram {doctor.social.instagramHandle}</a>
              </div>
            </div>
          </div>
          <a
            href={doctor.whatsapp}
            className="mt-8 inline-block rounded-full bg-[#94462f] px-7 py-3 text-sm font-medium text-[#f7f2ea] transition hover:bg-[#7e3c28]"
          >
            Agendar consulta
          </a>
        </section>
      </main>
    </div>
  );
}
