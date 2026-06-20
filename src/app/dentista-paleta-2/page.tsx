import BookingForm from "../dentista/BookingForm";

// Paleta 2 — "Arena cálida": mismo diseño que /dentista, solo cambia la paleta de color
// (terracota/cobre sobre crema) mediante variables CSS heredadas, sin duplicar el layout.
const paletteVars = {
  "--color-ivory": "#fbf6ef",
  "--color-ink": "#2b2118",
  "--color-meridian": "#b3552f",
  "--color-meridian-deep": "#8f3f20",
  "--color-steel": "#ddd0bd",
  "--color-steel-soft": "#f0e7d8",
  "--color-urgent": "#b3302f",
  "--color-urgent-deep": "#8f2420",
} as React.CSSProperties;

type PriceType = "fijo" | "desde" | "valoracion";

type Service = {
  name: string;
  price: string;
  priceType: PriceType;
  description: string;
  isUrgency?: boolean;
};

const services: Service[] = [
  {
    name: "Valoración inicial y diagnóstico",
    price: "$450",
    priceType: "fijo",
    description: "Revisión clínica completa, radiografía digital y plan de tratamiento por escrito.",
  },
  {
    name: "Limpieza dental profunda",
    price: "$900",
    priceType: "fijo",
    description: "Profilaxis con ultrasonido y pulido. Incluye revisión de encías.",
  },
  {
    name: "Resina estética",
    price: "$1,200",
    priceType: "desde",
    description: "Restauración de color natural, por diente tratado.",
  },
  {
    name: "Blanqueamiento en consultorio",
    price: "$3,800",
    priceType: "fijo",
    description: "Una sesión de 60 minutos con gel de uso profesional.",
  },
  {
    name: "Corona de porcelana",
    price: "$7,500",
    priceType: "desde",
    description: "Diseño y color ajustados a tu mordida y al resto de tu sonrisa.",
  },
  {
    name: "Diseño de sonrisa digital",
    price: "Requiere valoración",
    priceType: "valoracion",
    description: "Simulación fotográfica sobre tu línea media antes de tocar un solo diente.",
  },
  {
    name: "Endodoncia",
    price: "$2,900",
    priceType: "desde",
    description: "Tratamiento de conducto con localizador apical electrónico.",
  },
  {
    name: "Extracción simple",
    price: "$850",
    priceType: "fijo",
    description: "Bajo anestesia local, con indicaciones de cuidado posterior.",
  },
  {
    name: "Urgencia dental",
    price: "$650",
    priceType: "fijo",
    description: "Dolor agudo, fractura o golpe. Respuesta el mismo día.",
    isUrgency: true,
  },
];

const priceTypeLabel: Record<PriceType, string> = {
  fijo: "Precio fijo",
  desde: "Desde",
  valoracion: "Previa valoración",
};

const schedule = [
  { day: "Lunes", hours: "9:00 – 19:00" },
  { day: "Martes", hours: "9:00 – 19:00" },
  { day: "Miércoles", hours: "9:00 – 19:00" },
  { day: "Jueves", hours: "9:00 – 19:00" },
  { day: "Viernes", hours: "9:00 – 19:00" },
  { day: "Sábado", hours: "9:00 – 14:00" },
  { day: "Domingo", hours: "Cerrado" },
];

const paymentMethods = ["Efectivo", "Tarjeta de crédito / débito", "Transferencia bancaria", "Meses sin intereses (3 y 6 meses)"];

const testimonials = [
  {
    quote: "Llegué con un diente roto un domingo en la noche y me contestaron en diez minutos.",
    name: "Jorge A.",
    treatment: "Urgencia dental",
  },
  {
    quote: "Me explicó cada paso del diseño de sonrisa con fotos y medidas. No improvisó nada.",
    name: "Karla R.",
    treatment: "Diseño de sonrisa digital",
  },
  {
    quote: "Doce años yendo con la misma doctora. Eso ya dice todo.",
    name: "Mauricio T.",
    treatment: "Paciente desde 2014",
  },
];

const milestones = [
  { value: "12", label: "años de práctica" },
  { value: "1,840", label: "pacientes atendidos" },
  { value: "6512345", label: "cédula profesional" },
];

const navLinks = [
  { href: "#agendar", label: "Agendar" },
  { href: "#especialista", label: "Especialista" },
  { href: "#servicios", label: "Servicios" },
  { href: "#ubicacion", label: "Ubicación" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#contacto", label: "Contacto" },
];

export default function DentistaPaleta2() {
  return (
    <div className="flex flex-col" style={paletteVars}>
      <header className="sticky top-0 z-30 border-b border-steel/60 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="font-display text-lg font-bold tracking-tight">
            Estudio Dental Meridiano
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
              Consultorio de la Dra. Renata Solís Vega en Mixcoac. Diagnóstico medido, tratamiento explicado y
              seguimiento real — no una promesa genérica de &ldquo;sonrisa perfecta&rdquo;.
            </p>

            <div className="reveal mt-10 flex flex-wrap gap-4">
              <a
                href="#agendar"
                className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-ivory transition hover:bg-ink/85"
              >
                Agendar consulta
              </a>
              <a
                href="https://wa.me/525548213360"
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
            <div className="aspect-[4/5] w-full rounded-2xl bg-steel-soft" aria-hidden />
            <div>
              <p className="tick-label text-meridian">La especialista</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Dra. Renata Solís Vega</h2>
              <p className="mt-4 max-w-xl text-ink/70">
                Cirujana dentista con especialidad en Rehabilitación Oral y Estética Dental por la UNAM. Atiende
                cada caso con el mismo principio: medir antes de proponer, y proponer antes de tocar un diente.
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-steel pt-6 sm:grid-cols-4">
                <div>
                  <dt className="tick-label text-ink/70">Experiencia</dt>
                  <dd className="font-data mt-1 text-sm">12 años</dd>
                </div>
                <div>
                  <dt className="tick-label text-ink/70">Cédula profesional</dt>
                  <dd className="font-data mt-1 text-sm">6512345</dd>
                </div>
                <div>
                  <dt className="tick-label text-ink/70">Cédula de especialidad</dt>
                  <dd className="font-data mt-1 text-sm">9871234</dd>
                </div>
                <div>
                  <dt className="tick-label text-ink/70">Pacientes atendidos</dt>
                  <dd className="font-data mt-1 text-sm">1,840</dd>
                </div>
              </dl>

              <ul className="mt-8 space-y-2 text-sm text-ink/70">
                <li>· Instrumental esterilizado por paciente, sin excepciones.</li>
                <li>· Consultorio con luz natural y un solo paciente por horario — sin sala de espera llena.</li>
                <li>· Cada plan de tratamiento se entrega por escrito, con precios desglosados.</li>
              </ul>
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
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Mixcoac, Ciudad de México</h2>
              <address className="mt-4 not-italic text-ink/70">
                Avenida Insurgentes Sur 1457, Int. 302
                <br />
                Col. Insurgentes Mixcoac, Alcaldía Benito Juárez
                <br />
                C.P. 03920, CDMX
              </address>
              <p className="mt-3 text-sm text-ink/70">
                A dos cuadras del metro Mixcoac. Torre Cristal, planta baja, acceso directo desde la calle.
              </p>
              <a
                href="https://maps.google.com/?q=Avenida+Insurgentes+Sur+1457+CDMX"
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
                href="tel:+525548213360"
                className="rounded-full bg-urgent px-6 py-3 text-sm font-medium text-ivory transition hover:bg-urgent-deep"
              >
                Llamar ahora
              </a>
              <a
                href="https://wa.me/525548213360"
                className="rounded-full border border-ivory/30 px-6 py-3 text-sm font-medium text-ivory transition hover:border-ivory/60"
              >
                WhatsApp de urgencias
              </a>
            </div>
          </div>
        </section>

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
                <a href="tel:+525548213360" className="font-data mt-1 block">
                  (55) 4821 3360
                </a>
              </div>
              <div>
                <div className="tick-label text-ink/70">WhatsApp</div>
                <a href="https://wa.me/525548213360" className="font-data mt-1 block">
                  (55) 4821 3360
                </a>
              </div>
              <div>
                <div className="tick-label text-ink/70">Correo</div>
                <a href="mailto:contacto@meridianodental.mx" className="font-data mt-1 block">
                  contacto@meridianodental.mx
                </a>
              </div>
              <div>
                <div className="tick-label text-ink/70">Redes</div>
                <div className="mt-1 flex flex-col gap-1">
                  <a href="https://facebook.com/EstudioDentalMeridiano">Facebook</a>
                  <a href="https://instagram.com/meridiano.dental">Instagram @meridiano.dental</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-steel/60 px-6 py-8 text-center text-sm text-ink/70">
        Estudio Dental Meridiano · Dra. Renata Solís Vega · CDMX
      </footer>
    </div>
  );
}
