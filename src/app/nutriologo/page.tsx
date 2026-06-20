import { dmSerifDisplay, dmSans } from "@/lib/fonts";

// Structure for this specialty: a "tablero nutricional" bento grid — stats, schedule, location
// and the plate graphic all live as tiles in one mixed grid instead of stacked full-width
// sections, echoing the dashboards nutrition apps use rather than a clinic brochure layout.
const clinic = {
  name: "Plato Consciente",
  doctor: "Nutr. Camila Reyes Aguilar",
  specialty: "Nutrición clínica y deportiva",
  school: "Escuela de Dietética y Nutrición, INCMNSZ",
  license: "6190284",
  experienceYears: "8",
  patients: "1,250",
  welcomeMessage:
    "Planes de alimentación reales, hechos para tu rutina y tus gustos — no dietas genéricas de internet.",
  address: {
    street: "Calle Tamaulipas 66, piso 2",
    neighborhood: "Condesa, Cuauhtémoc",
    zip: "06140 CDMX",
    reference: "Arriba del café Tamaulipas",
    mapsUrl: "https://maps.google.com/?q=Tamaulipas+66+CDMX",
  },
  phone: "55 6671 2290",
  phoneHref: "5566712290",
  whatsapp: "https://wa.me/525566712290",
  email: "hola@platoconsciente.mx",
  social: { facebook: "https://facebook.com", instagram: "https://instagram.com", instagramHandle: "@platoconsciente" },
};

type PriceType = "fixed" | "from" | "consult";
const priceTypeLabel: Record<PriceType, string> = { fixed: "sesión", from: "desde", consult: "a consulta" };

const services: { name: string; description: string; price: string; priceType: PriceType; isUrgency?: boolean }[] = [
  { name: "Primera consulta", description: "Historial, composición corporal y objetivos.", price: "$700", priceType: "fixed" },
  { name: "Plan de alimentación personalizado", description: "Menú semanal ajustado a tu rutina.", price: "$1,100", priceType: "from" },
  { name: "Seguimiento mensual", description: "Ajustes de plan y medición de avances.", price: "$550", priceType: "fixed" },
  { name: "Nutrición deportiva", description: "Planes para rendimiento y composición corporal.", price: "$1,300", priceType: "from" },
  { name: "Asesoría en línea", description: "Misma atención, por videollamada.", price: "$650", priceType: "fixed" },
  { name: "Antropometría e Inbody", description: "Medición de % de grasa, músculo y agua.", price: "$450", priceType: "fixed" },
  { name: "Plan para condiciones médicas", description: "Diabetes, hipertensión, SOP, entre otras.", price: "$1,200", priceType: "from" },
  { name: "Orientación urgente prequirúrgica", description: "Ajuste nutricional antes de una cirugía próxima.", price: "Consulta", priceType: "consult", isUrgency: true },
];

const schedule = [
  { day: "Lunes a viernes", hours: "9:00 – 18:00" },
  { day: "Sábado", hours: "9:00 – 13:00" },
  { day: "Domingo", hours: "Cerrado" },
];

const paymentMethods = ["Efectivo", "Tarjeta", "Transferencia"];

const testimonials = [
  { name: "Paola N.", quote: "El plan se adaptó a que como fuera de casa casi siempre, no a una dieta imposible.", treatment: "Plan personalizado" },
  { name: "Iván S.", quote: "Bajé de peso sin pasar hambre y entendiendo por qué comía lo que comía.", treatment: "Seguimiento mensual" },
];

export default function NutriologoTemplate() {
  return (
    <div
      className={`${dmSerifDisplay.variable} ${dmSans.variable} min-h-screen bg-[#fdf6ec] text-[#2c3a2e]`}
      style={{ fontFamily: "var(--f-dm-sans)" }}
    >
      <header className="border-b border-[#2c3a2e]/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-lg" style={{ fontFamily: "var(--f-dm-serif)" }}>{clinic.name}</h1>
          <a href={clinic.whatsapp} className="rounded-full bg-[#3f7a52] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#326341]">
            Agendar consulta
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero */}
        <section className="pb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3f7a52]">{clinic.specialty}</p>
            <h2 className="mt-4 max-w-xl text-4xl leading-[1.15] md:text-5xl" style={{ fontFamily: "var(--f-dm-serif)" }}>
              Comer bien, sin reglas imposibles de seguir.
            </h2>
            <p className="mt-5 max-w-lg text-[#2c3a2e]/70">{clinic.welcomeMessage}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={clinic.whatsapp} className="rounded-full bg-[#3f7a52] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#326341]">
                Agendar consulta
              </a>
              <a href={`tel:${clinic.phoneHref}`} className="rounded-full border border-[#2c3a2e]/20 px-6 py-3 text-sm font-medium transition hover:border-[#2c3a2e]/50">
                Llamar al consultorio
              </a>
            </div>
          </div>
        </section>

        {/* Bento "tablero nutricional" — mixed grid of tiles, not stacked sections */}
        <section className="grid gap-5 py-10 md:grid-cols-4 md:grid-rows-2">
          <div className="rounded-3xl bg-[#3f7a52] p-6 text-white md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Especialista</p>
            <h3 className="mt-2 text-xl" style={{ fontFamily: "var(--f-dm-serif)" }}>{clinic.doctor}</h3>
            <p className="mt-2 text-sm text-white/80">
              Nutrióloga clínica egresada de {clinic.school}. Cédula profesional {clinic.license}.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6">
            <p className="text-3xl" style={{ fontFamily: "var(--f-dm-serif)" }}>{clinic.experienceYears}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[#2c3a2e]/50">Años de práctica</p>
          </div>

          <div className="rounded-3xl bg-white p-6">
            <p className="text-3xl" style={{ fontFamily: "var(--f-dm-serif)" }}>{clinic.patients}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[#2c3a2e]/50">Pacientes atendidos</p>
          </div>

          <div id="ubicacion" className="rounded-3xl bg-[#e8754a]/10 p-6 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#e8754a]">Ubicación</p>
            <address className="mt-2 not-italic text-sm text-[#2c3a2e]/75">
              {clinic.address.street}, {clinic.address.neighborhood}, {clinic.address.zip}
            </address>
            <a href={clinic.address.mapsUrl} className="mt-2 inline-block text-sm font-medium text-[#e8754a] underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
          </div>

          <div className="rounded-3xl bg-white p-6 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#3f7a52]">Horario</p>
            <div className="mt-2 divide-y divide-[#2c3a2e]/10 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-1.5">
                  <span className="text-[#2c3a2e]/70">{row.day}</span>
                  <span className={row.hours === "Cerrado" ? "text-[#2c3a2e]/40" : "font-medium"}>{row.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Servicios — accordion grouped by category, so only one plan's detail is open at a time */}
        <section id="servicios" className="py-10">
          <h3 className="text-2xl" style={{ fontFamily: "var(--f-dm-serif)" }}>Planes y consultas</h3>
          <div className="mt-8 space-y-3">
            {services.map((s) => (
              <details
                key={s.name}
                className={`group rounded-2xl border ${s.isUrgency ? "border-[#e8754a] bg-[#e8754a]/5" : "border-[#2c3a2e]/10 bg-white"}`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4">
                  <span className="font-medium" style={{ fontFamily: "var(--f-dm-serif)" }}>{s.name}</span>
                  <span className="flex items-center gap-3">
                    <span className="whitespace-nowrap font-semibold text-[#3f7a52]">{s.price}</span>
                    <span className="text-[#2c3a2e]/40 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <div className="px-6 pb-5 text-sm text-[#2c3a2e]/65">
                  {s.description}
                  <span className="ml-2 text-xs uppercase tracking-wide text-[#2c3a2e]/40">· {priceTypeLabel[s.priceType]}</span>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {paymentMethods.map((m) => (
              <span key={m} className="rounded-full border border-[#2c3a2e]/15 px-3 py-1 text-xs text-[#2c3a2e]/70">{m}</span>
            ))}
          </div>
        </section>

        {/* Testimonios */}
        <section id="testimonios" className="border-t border-[#2c3a2e]/10 py-10">
          <h3 className="text-2xl" style={{ fontFamily: "var(--f-dm-serif)" }}>Lo que cuentan los pacientes</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-[#2c3a2e]/10 bg-white p-5">
                <blockquote className="text-[#2c3a2e]/80">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-3 text-xs text-[#2c3a2e]/50">{t.name} · {t.treatment}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section id="contacto" className="border-t border-[#2c3a2e]/10 py-10">
          <h3 className="text-2xl" style={{ fontFamily: "var(--f-dm-serif)" }}>Agenda tu consulta</h3>
          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="text-[#2c3a2e]/50">Teléfono</div>
              <a href={`tel:${clinic.phoneHref}`} className="mt-1 block font-medium">{clinic.phone}</a>
            </div>
            <div>
              <div className="text-[#2c3a2e]/50">WhatsApp</div>
              <a href={clinic.whatsapp} className="mt-1 block font-medium">{clinic.phone}</a>
            </div>
            <div>
              <div className="text-[#2c3a2e]/50">Correo</div>
              <a href={`mailto:${clinic.email}`} className="mt-1 block font-medium">{clinic.email}</a>
            </div>
            <div>
              <div className="text-[#2c3a2e]/50">Redes</div>
              <div className="mt-1 flex flex-col gap-1">
                <a href={clinic.social.facebook}>Facebook</a>
                <a href={clinic.social.instagram}>Instagram {clinic.social.instagramHandle}</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
