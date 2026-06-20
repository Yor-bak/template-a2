import { spectral, publicSans } from "@/lib/fonts";

// Completely different shape from every other specialty: no sidebar, no tabs, no bento, no
// table. This is a vertical "recovery journey" — a thin top progress rail instead of a nav menu,
// alternating left/right milestone rows for services, and a horizontal snap-scroll strip for
// testimonials. The signature motif is a stepped recovery curve (not an arc) used as a recurring
// background watermark instead of a small icon.
const clinic = {
  name: "Núcleo Fisioterapia",
  doctor: "Fis. Tomás Vidal Esparza",
  specialty: "Rehabilitación física y deportiva",
  school: "Escuela Nacional de Medicina y Homeopatía, IPN",
  license: "5390271",
  experienceYears: "10",
  patients: "2,100",
  welcomeMessage:
    "Rehabilitación con objetivos medibles: rango de movimiento, fuerza y vuelta a tu actividad, sesión por sesión.",
  address: {
    street: "Av. Revolución 1450, local 3",
    neighborhood: "San Ángel, Álvaro Obregón",
    zip: "01000 CDMX",
    reference: "Junto al gimnasio Vértice",
    mapsUrl: "https://maps.google.com/?q=Av+Revolucion+1450+CDMX",
  },
  phone: "55 7710 4482",
  phoneHref: "5577104482",
  whatsapp: "https://wa.me/525577104482",
  email: "contacto@nucleofisio.mx",
  social: { facebook: "https://facebook.com", instagram: "https://instagram.com", instagramHandle: "@nucleofisio" },
};

const stages = [
  { code: "01", label: "Valoración" },
  { code: "02", label: "Plan" },
  { code: "03", label: "Terapia" },
  { code: "04", label: "Alta funcional" },
];

type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "por sesión", from: "desde", consult: "a consulta" };

const services: { name: string; description: string; price: string; priceType: PriceType; isUrgency?: boolean }[] = [
  { name: "Valoración inicial", description: "Evaluación de movilidad, fuerza y dolor.", price: "$600", priceType: "fixed" },
  { name: "Sesión de rehabilitación", description: "45 minutos de terapia manual y ejercicio dirigido.", price: "$550", priceType: "fixed" },
  { name: "Terapia post-quirúrgica", description: "Plan progresivo tras cirugía ortopédica.", price: "$650", priceType: "from" },
  { name: "Rehabilitación deportiva", description: "Vuelta al deporte tras lesión, con pruebas de rendimiento.", price: "$700", priceType: "from" },
  { name: "Electroterapia y ultrasonido", description: "Manejo de dolor agudo e inflamación.", price: "$400", priceType: "fixed" },
  { name: "Punción seca", description: "Liberación de puntos gatillo musculares.", price: "$500", priceType: "fixed" },
  { name: "Paquete de 10 sesiones", description: "Continuidad de tratamiento con tarifa preferencial.", price: "$4,800", priceType: "fixed" },
  { name: "Dolor agudo sin cita previa", description: "Esguince, contractura severa o bloqueo reciente.", price: "Consulta", priceType: "consult", isUrgency: true },
];

const schedule = [
  { day: "Lunes a viernes", hours: "7:00 – 20:00" },
  { day: "Sábado", hours: "8:00 – 14:00" },
  { day: "Domingo", hours: "Cerrado" },
];

const paymentMethods = ["Efectivo", "Tarjeta", "Transferencia", "Seguro de gastos médicos"];

const testimonials = [
  { name: "Gabriel O.", quote: "Volví a correr tres meses después de mi cirugía de rodilla, con un plan claro cada semana.", treatment: "Rehabilitación deportiva" },
  { name: "Pilar M.", quote: "La punción seca me quitó un dolor de hombro que llevaba meses arrastrando.", treatment: "Punción seca" },
  { name: "Octavio R.", quote: "Cada sesión empezaba midiendo mi avance, no solo repitiendo ejercicios.", treatment: "Sesión de rehabilitación" },
];

function RecoveryCurve({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 120" className={className} preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 110 L40 110 L40 90 L80 90 L80 75 L120 75 L120 55 L160 55 L160 45 L200 45 L200 30 L240 30 L240 22 L280 22 L280 14 L320 14 L320 8 L360 8 L360 4 L400 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}

export default function FisioterapiaTemplate() {
  return (
    <div
      className={`${spectral.variable} ${publicSans.variable} min-h-screen bg-[#fbfaf7] text-[#22312b]`}
      style={{ fontFamily: "var(--f-public-sans)" }}
    >
      {/* Thin progress rail instead of a header or sidebar nav */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[#22312b]/10 bg-[#fbfaf7]/95 px-6 py-3 backdrop-blur md:px-12">
        <span className="text-sm font-semibold" style={{ fontFamily: "var(--f-spectral)" }}>{clinic.name}</span>
        <div className="hidden items-center gap-0 md:flex">
          {stages.map((s, i) => (
            <div key={s.code} className="flex items-center">
              <a href={`#etapa-${s.code}`} className="flex items-center gap-2 px-3 text-xs uppercase tracking-wide text-[#22312b]/60 hover:text-[#b5562f]">
                <span className="font-mono text-[#b5562f]">{s.code}</span>
                {s.label}
              </a>
              {i < stages.length - 1 && <span className="h-px w-6 bg-[#22312b]/15" />}
            </div>
          ))}
        </div>
        <a href={clinic.whatsapp} className="rounded-full bg-[#22312b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0f1814]">
          Agendar
        </a>
      </div>

      {/* Hero: full-bleed with recovery curve as background watermark, not a small icon */}
      <section className="relative overflow-hidden px-6 py-20 md:px-12">
        <RecoveryCurve className="pointer-events-none absolute -bottom-4 left-0 h-32 w-full text-[#b5562f]/10" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b5562f]">{clinic.specialty}</p>
          <h1 className="mt-5 text-5xl leading-[1.1] md:text-6xl" style={{ fontFamily: "var(--f-spectral)" }}>
            Cada sesión avanza la curva.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-[#22312b]/70">{clinic.welcomeMessage}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href={clinic.whatsapp} className="rounded-full bg-[#b5562f] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#93431f]">
              Agendar sesión
            </a>
            <a href={`tel:${clinic.phoneHref}`} className="rounded-full border border-[#22312b]/25 px-7 py-3.5 text-sm font-semibold transition hover:border-[#22312b]/50">
              Llamar al consultorio
            </a>
          </div>
        </div>
        <div className="relative mt-16 grid grid-cols-3 gap-6 border-t border-[#22312b]/10 pt-8 max-w-2xl">
          <div>
            <p className="text-3xl font-semibold text-[#b5562f]" style={{ fontFamily: "var(--f-spectral)" }}>{clinic.experienceYears}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[#22312b]/50">Años de práctica</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-[#b5562f]" style={{ fontFamily: "var(--f-spectral)" }}>{clinic.patients}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[#22312b]/50">Pacientes rehabilitados</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-[#b5562f]" style={{ fontFamily: "var(--f-spectral)" }}>{clinic.license}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[#22312b]/50">Cédula profesional</p>
          </div>
        </div>
      </section>

      {/* Especialista, woven into the journey as "stage 00" */}
      <section className="border-t border-[#22312b]/10 bg-white px-6 py-16 md:px-12">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[auto_1fr]">
          <div className="aspect-square w-40 rounded-full bg-[#b5562f]/15" aria-hidden />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#b5562f]">Tu fisioterapeuta</p>
            <h2 className="mt-2 text-2xl" style={{ fontFamily: "var(--f-spectral)" }}>{clinic.doctor}</h2>
            <p className="mt-3 max-w-lg text-[#22312b]/70">
              Egresado de la {clinic.school}, especializado en {clinic.specialty.toLowerCase()}.
            </p>
            <ul className="mt-5 space-y-1.5 text-sm text-[#22312b]/70">
              <li>— Medición de rango de movimiento en cada sesión.</li>
              <li>— Plan de ejercicios progresivo, no genérico.</li>
              <li>— Alta cuando recuperas función, no cuando se acaban las sesiones.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Etapas del proceso: horizontal stage markers anchored by the rail above */}
      <section className="border-t border-[#22312b]/10 px-6 py-16 md:px-12">
        <h2 className="text-2xl" style={{ fontFamily: "var(--f-spectral)" }}>El camino de recuperación</h2>
        <div className="mt-10 grid gap-0 md:grid-cols-4">
          {stages.map((s, i) => (
            <div key={s.code} id={`etapa-${s.code}`} className="scroll-mt-24 border-t-2 border-[#b5562f] pt-4 md:border-t-4">
              <span className="font-mono text-xs text-[#b5562f]">{s.code}</span>
              <p className="mt-1 text-lg" style={{ fontFamily: "var(--f-spectral)" }}>{s.label}</p>
              <p className="mt-2 text-sm text-[#22312b]/60">
                {i === 0 && "Medimos movilidad, fuerza y dolor para establecer una línea base."}
                {i === 1 && "Definimos objetivos medibles y el número de sesiones estimado."}
                {i === 2 && "Terapia manual, ejercicio dirigido y ajustes semana a semana."}
                {i === 3 && "Pruebas de rendimiento y alta cuando recuperas función completa."}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios: alternating left/right milestone rows, not a table or card grid */}
      <section id="servicios" className="border-t border-[#22312b]/10 bg-white px-6 py-16 md:px-12">
        <h2 className="text-2xl" style={{ fontFamily: "var(--f-spectral)" }}>Sesiones y tratamientos</h2>
        <div className="mt-10 space-y-10">
          {services.map((s, i) => (
            <div
              key={s.name}
              className={`flex flex-col gap-3 border-b border-[#22312b]/10 pb-8 last:border-0 md:flex-row md:items-baseline md:gap-8 ${
                i % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""
              } ${s.isUrgency ? "bg-[#b5562f]/5 -mx-6 px-6 py-6 md:-mx-12 md:px-12" : ""}`}
            >
              <div className="md:w-1/3">
                <span className={`text-2xl font-semibold ${s.isUrgency ? "text-[#b5562f]" : "text-[#22312b]"}`} style={{ fontFamily: "var(--f-spectral)" }}>
                  {s.price}
                </span>
                <span className="ml-2 text-xs uppercase tracking-wide text-[#22312b]/45">{priceTypeLabel[s.priceType]}</span>
              </div>
              <div className="md:w-2/3">
                <h3 className="font-semibold">{s.name}</h3>
                <p className="mt-1 text-sm text-[#22312b]/60">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ubicación + urgencias combined in one split band */}
      <section id="ubicacion" className="border-t border-[#22312b]/10 px-6 py-16 md:px-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl" style={{ fontFamily: "var(--f-spectral)" }}>Ubicación y horario</h2>
            <address className="mt-4 not-italic text-[#22312b]/70">
              {clinic.address.street}
              <br />
              {clinic.address.neighborhood}
              <br />
              {clinic.address.zip}
            </address>
            <p className="mt-2 text-sm text-[#22312b]/55">{clinic.address.reference}</p>
            <a href={clinic.address.mapsUrl} className="mt-3 inline-block text-sm font-semibold text-[#b5562f] underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-7 divide-y divide-[#22312b]/10 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-2">
                  <span className="text-[#22312b]/70">{row.day}</span>
                  <span className={row.hours === "Cerrado" ? "text-[#22312b]/40" : "font-semibold"}>{row.hours}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border border-[#22312b]/15 px-3 py-1 text-xs text-[#22312b]/70">{m}</span>
              ))}
            </div>
          </div>

          <div id="urgencias" className="rounded-2xl bg-[#22312b] px-8 py-10 text-[#fbfaf7]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#b5562f]">Dolor agudo</p>
            <h2 className="mt-3 text-2xl" style={{ fontFamily: "var(--f-spectral)" }}>
              Un esguince o bloqueo reciente no espera a la próxima cita.
            </h2>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={`tel:${clinic.phoneHref}`} className="rounded-full bg-[#b5562f] px-6 py-3 text-sm font-semibold text-white">
                Llamar ahora
              </a>
              <a href={clinic.whatsapp} className="rounded-full border border-[#fbfaf7]/30 px-6 py-3 text-sm font-semibold">
                WhatsApp directo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios: horizontal snap-scroll strip, not a grid */}
      <section id="testimonios" className="border-t border-[#22312b]/10 bg-white py-16">
        <h2 className="px-6 text-2xl md:px-12" style={{ fontFamily: "var(--f-spectral)" }}>Lo que cuentan los pacientes</h2>
        <div className="mt-8 flex gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:px-12" style={{ scrollSnapType: "x mandatory" }}>
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="min-w-[280px] flex-shrink-0 rounded-2xl border border-[#22312b]/10 bg-[#fbfaf7] p-6 md:min-w-[340px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <blockquote className="text-[#22312b]/80">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-xs text-[#22312b]/50">{t.name} · {t.treatment}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="border-t border-[#22312b]/10 px-6 py-16 md:px-12">
        <h2 className="text-2xl" style={{ fontFamily: "var(--f-spectral)" }}>Agenda tu sesión</h2>
        <div className="mt-7 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="text-[#22312b]/50">Teléfono</div>
            <a href={`tel:${clinic.phoneHref}`} className="mt-1 block font-semibold">{clinic.phone}</a>
          </div>
          <div>
            <div className="text-[#22312b]/50">WhatsApp</div>
            <a href={clinic.whatsapp} className="mt-1 block font-semibold">{clinic.phone}</a>
          </div>
          <div>
            <div className="text-[#22312b]/50">Correo</div>
            <a href={`mailto:${clinic.email}`} className="mt-1 block font-semibold">{clinic.email}</a>
          </div>
          <div>
            <div className="text-[#22312b]/50">Redes</div>
            <div className="mt-1 flex flex-col gap-1">
              <a href={clinic.social.facebook}>Facebook</a>
              <a href={clinic.social.instagram}>Instagram {clinic.social.instagramHandle}</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
