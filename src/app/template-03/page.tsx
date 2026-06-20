import { fraunces, workSans } from "@/lib/fonts";
import { clinic, services, priceTypeLabel, schedule, paymentMethods, testimonials, milestones } from "@/lib/mockClinic";

export default function Template03() {
  return (
    <div className={`${fraunces.variable} ${workSans.variable} min-h-screen bg-[#264653] text-[#e9c46a]`} style={{ fontFamily: "var(--f-work-sans)" }}>
      {/* Asymmetric diagonal hero */}
      <header className="relative overflow-hidden px-6 pb-32 pt-10 md:px-16">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: "linear-gradient(135deg, #e76f51 0%, #f4a261 45%, transparent 46%)",
          }}
        />
        <nav className="flex items-center justify-between text-sm text-[#264653]">
          <span className="font-semibold">{clinic.name}</span>
          <a href={clinic.whatsapp} className="rounded-full bg-[#264653] px-5 py-2 text-[#e9c46a]">
            Agendar consulta
          </a>
        </nav>

        <div className="mt-20 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.25em] text-[#264653]/80">
            {clinic.specialty}
          </p>
          <h1
            className="mt-4 text-5xl italic leading-[1.05] text-[#264653] md:text-6xl"
            style={{ fontFamily: "var(--f-fraunces)" }}
          >
            &ldquo;Una sonrisa diseñada, no improvisada.&rdquo;
          </h1>
          <p className="mt-6 max-w-lg text-[#264653]/80">{clinic.welcomeMessage}</p>
          <div className="mt-8 flex gap-4">
            <a href={`tel:${clinic.phoneHref}`} className="rounded-full bg-[#264653] px-6 py-3 text-sm font-medium text-[#e9c46a]">
              Llamar al consultorio
            </a>
          </div>
        </div>
      </header>

      <main className="bg-[#e9c46a] text-[#264653]">
        {/* Especialista */}
        <section id="especialista" className="grid gap-10 px-6 py-20 md:grid-cols-[1.2fr_1fr] md:px-16">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#e76f51]">La especialista</p>
            <h2 className="mt-3 text-4xl" style={{ fontFamily: "var(--f-fraunces)" }}>
              {clinic.doctor}
            </h2>
            <p className="mt-4 max-w-lg text-[#264653]/80">
              Especialidad en {clinic.specialty} por la {clinic.school}. Cédula profesional {clinic.license},
              cédula de especialidad {clinic.specialtyLicense}.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6">
              {milestones.map((m) => (
                <div key={m.label}>
                  <div className="text-3xl font-semibold text-[#e76f51]">{m.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-[#264653]/60">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="aspect-[4/5] rounded-[2.5rem] bg-[#264653]/10" aria-hidden />
        </section>

        {/* Servicios */}
        <section id="servicios" className="bg-[#264653] px-6 py-20 text-[#e9c46a] md:px-16">
          <p className="text-sm uppercase tracking-[0.25em] text-[#f4a261]">Servicios</p>
          <h2 className="mt-3 text-4xl" style={{ fontFamily: "var(--f-fraunces)" }}>
            Tratamientos y precios
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.name}
                className={`rounded-2xl border p-5 ${s.isUrgency ? "border-[#e76f51] bg-[#e76f51]/10" : "border-[#e9c46a]/20"}`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-medium">{s.name}</h3>
                  <span className="whitespace-nowrap text-lg font-semibold text-[#f4a261]">{s.price}</span>
                </div>
                <p className="mt-1 text-sm text-[#e9c46a]/70">{s.description}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-[#e9c46a]/50">{priceTypeLabel[s.priceType]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ubicación */}
        <section id="ubicacion" className="grid gap-10 px-6 py-20 md:grid-cols-2 md:px-16">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#e76f51]">Ubicación</p>
            <h2 className="mt-3 text-4xl" style={{ fontFamily: "var(--f-fraunces)" }}>
              Mixcoac, CDMX
            </h2>
            <address className="mt-4 not-italic text-[#264653]/80">
              {clinic.address.street}
              <br />
              {clinic.address.neighborhood}
              <br />
              {clinic.address.zip}
            </address>
            <p className="mt-2 text-sm text-[#264653]/60">{clinic.address.reference}</p>
            <a href={clinic.address.mapsUrl} className="mt-3 inline-block text-sm font-medium underline-offset-4 hover:underline">
              Ver en Google Maps →
            </a>
            <div className="mt-8 flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full bg-[#264653]/10 px-3 py-1 text-xs">{m}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-[#264653]/10 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-[#e76f51]">Horario</p>
            <div className="mt-4 divide-y divide-[#264653]/15 text-sm">
              {schedule.map((row) => (
                <div key={row.day} className="flex justify-between py-2">
                  <span>{row.day}</span>
                  <span className={row.hours === "Cerrado" ? "text-[#264653]/40" : "font-medium"}>{row.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Urgencias */}
        <section id="urgencias" className="bg-[#e76f51] px-6 py-16 text-[#264653] md:px-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.25em]">Urgencias</p>
              <h2 className="mt-2 max-w-md text-3xl" style={{ fontFamily: "var(--f-fraunces)" }}>
                Dolor agudo, fractura o golpe no esperan turno.
              </h2>
            </div>
            <div className="flex gap-4">
              <a href={`tel:${clinic.phoneHref}`} className="rounded-full bg-[#264653] px-6 py-3 text-sm font-medium text-[#e9c46a]">
                Llamar ahora
              </a>
              <a href={clinic.whatsapp} className="rounded-full border border-[#264653]/40 px-6 py-3 text-sm font-medium">
                WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section id="testimonios" className="px-6 py-20 md:px-16">
          <p className="text-sm uppercase tracking-[0.25em] text-[#e76f51]">Testimonios</p>
          <h2 className="mt-3 text-4xl" style={{ fontFamily: "var(--f-fraunces)" }}>
            Lo que cuentan los pacientes
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl bg-[#264653]/10 p-6">
                <blockquote className="italic" style={{ fontFamily: "var(--f-fraunces)" }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-xs text-[#264653]/60">{t.name} · {t.treatment}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section id="contacto" className="bg-[#264653] px-6 py-16 text-[#e9c46a] md:px-16">
          <h2 className="text-3xl" style={{ fontFamily: "var(--f-fraunces)" }}>
            Hablemos de tu sonrisa
          </h2>
          <div className="mt-6 grid gap-6 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div><div className="text-[#e9c46a]/50">Teléfono</div><a href={`tel:${clinic.phoneHref}`} className="mt-1 block">{clinic.phone}</a></div>
            <div><div className="text-[#e9c46a]/50">WhatsApp</div><a href={clinic.whatsapp} className="mt-1 block">{clinic.phone}</a></div>
            <div><div className="text-[#e9c46a]/50">Correo</div><a href={`mailto:${clinic.email}`} className="mt-1 block">{clinic.email}</a></div>
            <div>
              <div className="text-[#e9c46a]/50">Redes</div>
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
