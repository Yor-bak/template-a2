import { sourceSerif4, sourceSans3 } from "@/lib/fonts";
import { clinic, services, priceTypeLabel, schedule, paymentMethods, testimonials, milestones } from "@/lib/mockClinic";

// Tab order follows a real patient's first-visit path through the record: who treats you,
// what's offered, where and when, what happens in an emergency, who else has been treated,
// how to reach the office.
const sections = [
  { id: "especialista", code: "01", label: "Especialista" },
  { id: "servicios", code: "02", label: "Servicios" },
  { id: "ubicacion", code: "03", label: "Ubicación" },
  { id: "urgencias", code: "04", label: "Urgencias" },
  { id: "testimonios", code: "05", label: "Testimonios" },
  { id: "contacto", code: "06", label: "Contacto" },
];

export default function Template02() {
  return (
    <div className={`${sourceSerif4.variable} ${sourceSans3.variable} min-h-screen bg-[#f1faee] text-[#1a2332]`} style={{ fontFamily: "var(--f-source-sans)" }}>
      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar: corporate trust register, the consultant's "credentials column" */}
        <aside className="sticky top-0 hidden h-screen w-72 flex-col justify-between border-r border-[#1a2332]/10 bg-[#1a2332] px-8 py-10 text-[#f1faee] lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#a8dadc]">Expediente clínico</p>
            <h1
              className="mt-3 text-2xl leading-tight"
              style={{ fontFamily: "var(--f-source-serif)" }}
            >
              {clinic.name}
            </h1>
            <p className="mt-2 text-sm text-[#f1faee]/70">{clinic.doctor}</p>

            {/* Sidebar as a row of record tabs, numbered because this is the real order of a first visit */}
            <nav className="mt-12 flex flex-col text-sm">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-baseline gap-3 rounded-r-md border-l-2 border-[#1a2332] py-2 pl-4 text-[#f1faee]/70 transition hover:border-[#a8dadc] hover:bg-[#f1faee]/5 hover:text-[#a8dadc]"
                >
                  <span className="font-mono text-[0.7rem] text-[#2d8b8b]">{s.code}</span>
                  {s.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="text-[#a8dadc]">
            <a
              href={clinic.whatsapp}
              className="block rounded-md bg-[#2d8b8b] px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#246f6f]"
            >
              Agendar consulta
            </a>
            <div className="suture mt-6" />
            <div className="mt-4 text-xs text-[#f1faee]/60">
              <p>Cédula profesional {clinic.license}</p>
              <p className="mt-1">{clinic.experienceYears} años de práctica</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-6 py-14 lg:px-14">
          {/* Hero */}
          <section className="pb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d8b8b]">
              {clinic.specialty} · CDMX
            </p>
            <h2
              className="mt-4 max-w-2xl text-4xl leading-[1.15] md:text-5xl"
              style={{ fontFamily: "var(--f-source-serif)" }}
            >
              Una práctica construida sobre confianza, no sobre promesas.
            </h2>
            <p className="mt-5 max-w-xl text-[#1a2332]/70">{clinic.welcomeMessage}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href={clinic.whatsapp} className="rounded-md bg-[#2d8b8b] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#246f6f]">
                Agendar consulta
              </a>
              <a href={`tel:${clinic.phoneHref}`} className="rounded-md border border-[#1a2332]/20 px-6 py-3 text-sm font-medium transition hover:border-[#1a2332]/50">
                Llamar al consultorio
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-8 border-t border-[#1a2332]/10 pt-6">
              {milestones.map((m) => (
                <div key={m.label}>
                  <dt className="text-2xl font-semibold text-[#2d8b8b]">{m.value}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wide text-[#1a2332]/50">{m.label}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="suture text-[#1a2332]/30" />

          {/* Especialista */}
          <section id="especialista" className="grid gap-10 py-14 md:grid-cols-[1fr_1.4fr]">
            <div className="aspect-square rounded-lg bg-[#a8dadc]/40" aria-hidden />
            <div>
              <h3 className="text-2xl" style={{ fontFamily: "var(--f-source-serif)" }}>
                {clinic.doctor}
              </h3>
              <p className="mt-3 max-w-lg text-[#1a2332]/70">
                Cirujana dentista con especialidad en {clinic.specialty} por la {clinic.school}. Cédula de
                especialidad {clinic.specialtyLicense}.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-[#1a2332]/70">
                <li>· Instrumental esterilizado por paciente, sin excepciones.</li>
                <li>· Un solo paciente por horario.</li>
                <li>· Plan de tratamiento por escrito, con precios desglosados.</li>
              </ul>
            </div>
          </section>

          <div className="suture text-[#1a2332]/30" />

          {/* Servicios */}
          <section id="servicios" className="py-14">
            <h3 className="text-2xl" style={{ fontFamily: "var(--f-source-serif)" }}>
              Tratamientos y precios
            </h3>
            <table className="mt-8 w-full border-collapse text-sm">
              <tbody>
                {services.map((s) => (
                  <tr key={s.name} className={`border-b border-[#1a2332]/10 ${s.isUrgency ? "bg-[#2d8b8b]/5" : ""}`}>
                    <td className="py-4 pr-6 align-top">
                      <div className="font-medium">{s.name}</div>
                      <div className="mt-1 text-[#1a2332]/60">{s.description}</div>
                    </td>
                    <td className="py-4 text-right align-top whitespace-nowrap">
                      <div className="font-semibold text-[#2d8b8b]">{s.price}</div>
                      <div className="text-xs text-[#1a2332]/50">{priceTypeLabel[s.priceType]}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="suture text-[#1a2332]/30" />

          {/* Ubicación */}
          <section id="ubicacion" className="grid gap-10 py-14 md:grid-cols-2">
            <div>
              <h3 className="text-2xl" style={{ fontFamily: "var(--f-source-serif)" }}>
                Ubicación y horario
              </h3>
              <address className="mt-4 not-italic text-[#1a2332]/70">
                {clinic.address.street}
                <br />
                {clinic.address.neighborhood}
                <br />
                {clinic.address.zip}
              </address>
              <p className="mt-2 text-sm text-[#1a2332]/60">{clinic.address.reference}</p>
              <a href={clinic.address.mapsUrl} className="mt-3 inline-block text-sm font-medium text-[#2d8b8b] underline-offset-4 hover:underline">
                Ver en Google Maps →
              </a>

              <div className="mt-8 flex flex-wrap gap-2">
                {paymentMethods.map((m) => (
                  <span key={m} className="rounded-md border border-[#1a2332]/15 px-3 py-1 text-xs text-[#1a2332]/70">
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div className="divide-y divide-[#1a2332]/10 self-start rounded-lg border border-[#1a2332]/10 p-6 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-2">
                  <span className="text-[#1a2332]/70">{row.day}</span>
                  <span className={row.hours === "Cerrado" ? "text-[#1a2332]/40" : "font-medium"}>{row.hours}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Urgencias */}
          <section id="urgencias" className="my-14 rounded-lg bg-[#1a2332] px-8 py-10 text-[#f1faee]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#a8dadc]">Urgencias</p>
            <h3 className="mt-3 max-w-md text-2xl" style={{ fontFamily: "var(--f-source-serif)" }}>
              Dolor agudo, fractura o golpe no esperan turno.
            </h3>
            <div className="mt-6 flex gap-4">
              <a href={`tel:${clinic.phoneHref}`} className="rounded-md bg-[#2d8b8b] px-6 py-3 text-sm font-medium text-white">
                Llamar ahora
              </a>
              <a href={clinic.whatsapp} className="rounded-md border border-[#f1faee]/30 px-6 py-3 text-sm font-medium">
                WhatsApp de urgencias
              </a>
            </div>
          </section>

          {/* Testimonios */}
          <section id="testimonios" className="py-14">
            <h3 className="text-2xl" style={{ fontFamily: "var(--f-source-serif)" }}>
              Lo que cuentan los pacientes
            </h3>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.name} className="rounded-lg border border-[#1a2332]/10 p-5">
                  <blockquote className="text-[#1a2332]/80">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-3 text-xs text-[#1a2332]/50">
                    {t.name} · {t.treatment}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* Contacto */}
          <section id="contacto" className="py-14">
            <h3 className="text-2xl" style={{ fontFamily: "var(--f-source-serif)" }}>
              Hablemos de tu sonrisa
            </h3>
            <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
              <div>
                <div className="text-[#1a2332]/50">Teléfono</div>
                <a href={`tel:${clinic.phoneHref}`} className="mt-1 block font-medium">{clinic.phone}</a>
              </div>
              <div>
                <div className="text-[#1a2332]/50">WhatsApp</div>
                <a href={clinic.whatsapp} className="mt-1 block font-medium">{clinic.phone}</a>
              </div>
              <div>
                <div className="text-[#1a2332]/50">Correo</div>
                <a href={`mailto:${clinic.email}`} className="mt-1 block font-medium">{clinic.email}</a>
              </div>
              <div>
                <div className="text-[#1a2332]/50">Redes</div>
                <div className="mt-1 flex flex-col gap-1">
                  <a href={clinic.social.facebook}>Facebook</a>
                  <a href={clinic.social.instagram}>Instagram {clinic.social.instagramHandle}</a>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
