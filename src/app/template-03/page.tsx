import { bitter, plusJakarta } from "@/lib/fonts";
import { clinic, services, priceTypeLabel, schedule, paymentMethods, testimonials, milestones } from "@/lib/mockClinic";

// Alterno C — rediseño completo: panel dividido (split-screen), no revista diagonal.
// El panel izquierdo es fijo en escritorio (identidad + contacto siempre visible)
// mientras la columna derecha es la única que hace scroll, como un portafolio.
// Paleta casi monocromática con un solo acento vivo, y tipografía propia
// (Bitter + Plus Jakarta Sans), sin relación con ninguna otra plantilla.
export default function Template03() {
  return (
    <div
      className={`${bitter.variable} ${plusJakarta.variable} min-h-screen bg-[#fafafa] text-[#111111] lg:flex`}
      style={{ fontFamily: "var(--f-plus-jakarta)" }}
    >
      {/* Panel izquierdo: identidad y contacto, fijo en escritorio */}
      <aside className="flex flex-col justify-between bg-[#111111] px-8 py-10 text-[#fafafa] lg:sticky lg:top-0 lg:h-screen lg:w-[40%] lg:py-14">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#ff5a36]">Estudio dental</p>
          <h1 className="mt-4 text-4xl leading-[1.05] md:text-5xl" style={{ fontFamily: "var(--f-bitter)" }}>
            {clinic.doctor}
          </h1>
          <p className="mt-3 max-w-sm text-[#fafafa]/70">{clinic.specialty}</p>

          <div className="mt-10 aspect-[4/5] w-full max-w-xs rounded-2xl bg-[#ff5a36]/15" aria-hidden>
            <div className="flex h-full items-center justify-center text-7xl" style={{ fontFamily: "var(--f-bitter)" }}>
              <span className="text-[#ff5a36]">RS</span>
            </div>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-3 gap-4 border-t border-[#fafafa]/15 pt-6">
            {milestones.map((m) => (
              <div key={m.label}>
                <div className="text-xl font-semibold text-[#ff5a36]" style={{ fontFamily: "var(--f-bitter)" }}>{m.value}</div>
                <div className="mt-1 text-[0.65rem] uppercase tracking-wide text-[#fafafa]/55">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={clinic.whatsapp} className="rounded-full bg-[#ff5a36] px-6 py-3 text-sm font-medium text-[#111111] transition hover:bg-[#d6431f] hover:text-[#fafafa]">
              Agendar por WhatsApp
            </a>
            <a href={`tel:${clinic.phoneHref}`} className="rounded-full border border-[#fafafa]/30 px-6 py-3 text-sm font-medium transition hover:border-[#fafafa]/60">
              Llamar
            </a>
          </div>
        </div>
      </aside>

      {/* Columna derecha: la única que hace scroll */}
      <main className="flex-1 lg:w-[60%]">
        {/* Intro */}
        <section className="border-b border-[#111111]/10 px-8 py-16 md:px-16">
          <p className="text-sm uppercase tracking-[0.3em] text-[#ff5a36]">Filosofía de consulta</p>
          <h2 className="mt-4 max-w-xl text-3xl leading-[1.2] md:text-4xl" style={{ fontFamily: "var(--f-bitter)" }}>
            Un diagnóstico medido, no una promesa de sonrisa perfecta.
          </h2>
          <p className="mt-5 max-w-lg text-[#111111]/70">{clinic.welcomeMessage}</p>
        </section>

        {/* Especialista */}
        <section id="especialista" className="border-b border-[#111111]/10 px-8 py-16 md:px-16">
          <p className="text-sm uppercase tracking-[0.3em] text-[#ff5a36]">La especialista</p>
          <h3 className="mt-4 text-2xl" style={{ fontFamily: "var(--f-bitter)" }}>{clinic.doctor}</h3>
          <p className="mt-3 max-w-lg text-[#111111]/70">
            Especialidad en {clinic.specialty} por la {clinic.school}. Cédula profesional {clinic.license},
            cédula de especialidad {clinic.specialtyLicense}.
          </p>
        </section>

        {/* Servicios: lista a gran escala con numeración tipográfica */}
        <section id="servicios" className="border-b border-[#111111]/10 px-8 py-16 md:px-16">
          <p className="text-sm uppercase tracking-[0.3em] text-[#ff5a36]">Tratamientos</p>
          <h3 className="mt-4 text-2xl" style={{ fontFamily: "var(--f-bitter)" }}>Tratamientos y precios</h3>
          <ul className="mt-8 divide-y divide-[#111111]/10">
            {services.map((s, i) => (
              <li key={s.name} className="flex items-baseline gap-6 py-5">
                <span
                  className={`text-3xl ${s.isUrgency ? "text-[#c81e3a]" : "text-[#111111]/15"}`}
                  style={{ fontFamily: "var(--f-bitter)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h4 className="font-medium">
                      {s.name}
                      {s.isUrgency && <span className="ml-2 text-xs uppercase tracking-wide text-[#c81e3a]">Urgencia</span>}
                    </h4>
                    <span className="whitespace-nowrap text-lg font-semibold text-[#ff5a36]">{s.price}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#111111]/60">{s.description}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-[#111111]/40">{priceTypeLabel[s.priceType]}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Ubicación */}
        <section id="ubicacion" className="grid gap-10 border-b border-[#111111]/10 px-8 py-16 md:grid-cols-2 md:px-16">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#ff5a36]">Visítanos</p>
            <h3 className="mt-4 text-2xl" style={{ fontFamily: "var(--f-bitter)" }}>Ubicación y horario</h3>
            <address className="mt-4 not-italic text-[#111111]/70">
              {clinic.address.street}<br />
              {clinic.address.neighborhood}<br />
              {clinic.address.zip}
            </address>
            <p className="mt-2 text-sm text-[#111111]/55">{clinic.address.reference}</p>
            <a href={clinic.address.mapsUrl} className="mt-3 inline-block text-sm font-medium text-[#ff5a36] underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-8 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border border-[#111111]/15 px-3 py-1 text-xs text-[#111111]/65">{m}</span>
              ))}
            </div>
          </div>
          <div className="self-start rounded-2xl border border-[#111111]/10 p-6 text-sm">
            {schedule.map((row) => (
              <div key={row.day} className="flex justify-between border-b border-[#111111]/10 py-2 last:border-0">
                <span className="text-[#111111]/70">{row.day}</span>
                <span className={row.hours === "Cerrado" ? "text-[#111111]/35" : "font-medium"}>{row.hours}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Urgencias: bloque de color sólido, no banner ancho */}
        <section id="urgencias" className="bg-[#c81e3a] px-8 py-14 text-[#fafafa] md:px-16">
          <p className="text-sm uppercase tracking-[0.3em] text-[#fafafa]/70">Urgencias</p>
          <h3 className="mt-3 max-w-md text-2xl" style={{ fontFamily: "var(--f-bitter)" }}>
            Dolor agudo, fractura o golpe no esperan turno.
          </h3>
          <div className="mt-6 flex gap-4">
            <a href={`tel:${clinic.phoneHref}`} className="rounded-full bg-[#fafafa] px-6 py-3 text-sm font-medium text-[#c81e3a]">
              Llamar ahora
            </a>
            <a href={clinic.whatsapp} className="rounded-full border border-[#fafafa]/40 px-6 py-3 text-sm font-medium">
              WhatsApp
            </a>
          </div>
        </section>

        {/* Testimonios: tipografía a gran tamaño, sin tarjetas */}
        <section id="testimonios" className="border-b border-[#111111]/10 px-8 py-16 md:px-16">
          <p className="text-sm uppercase tracking-[0.3em] text-[#ff5a36]">Testimonios</p>
          <div className="mt-8 space-y-10">
            {testimonials.map((t) => (
              <figure key={t.name}>
                <blockquote className="max-w-xl text-2xl leading-snug" style={{ fontFamily: "var(--f-bitter)" }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-2 text-sm text-[#111111]/50">{t.name} · {t.treatment}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section id="contacto" className="px-8 py-16 md:px-16">
          <h3 className="text-2xl" style={{ fontFamily: "var(--f-bitter)" }}>Hablemos de tu sonrisa</h3>
          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div><div className="text-[#111111]/50">Teléfono</div><a href={`tel:${clinic.phoneHref}`} className="mt-1 block font-medium">{clinic.phone}</a></div>
            <div><div className="text-[#111111]/50">WhatsApp</div><a href={clinic.whatsapp} className="mt-1 block font-medium">{clinic.phone}</a></div>
            <div><div className="text-[#111111]/50">Correo</div><a href={`mailto:${clinic.email}`} className="mt-1 block font-medium">{clinic.email}</a></div>
            <div>
              <div className="text-[#111111]/50">Redes</div>
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
