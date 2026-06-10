"use client";
import Link from "next/link";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { useServices } from "@/contexts/ServicesContext";
import { testimonials } from "@/data/testimonials";
import { whatsappLink } from "@/lib/utils";
import { SectionTitle } from "@/components/public/SectionTitle";
import { ServiceCard } from "@/components/public/ServiceCard";
import {
  CalendarDays, MapPin, MessageCircle, ChevronRight, Star,
  Shield, Clock, Phone, CreditCard, AlertCircle, CheckCircle2,
  Award, Sparkles, HeartHandshake, BadgeCheck,
} from "lucide-react";
import { getPaymentMethodLabel, getShortAddress, getShortHoursLabel, getDentistInitials } from "@/utils/clinicUtils";

export default function HomePage() {
  const { config } = useClinicConfig();
  const { getPublicServices } = useServices();
  const services = getPublicServices();
  const featuredServices = services.slice(0, 6);
  const emergency = services.find((s) => s.isEmergency);

  const initials = getDentistInitials(config.dentistName);
  const shortAddress = getShortAddress(config);
  const shortHours = getShortHoursLabel(config.openingHours);
  const paymentLabels = config.acceptedPayments.map(getPaymentMethodLabel);
  const paymentShort = paymentLabels.slice(0, 2).join(" y ") + (paymentLabels.length > 2 ? " y más" : "");

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--color-primary)]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-accent)]/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-primary-dark)]/60 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 text-[var(--color-accent)] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                <BadgeCheck className="w-3.5 h-3.5" />
                Cédula profesional {config.professionalLicense}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-4">
                Tu sonrisa,<br />
                <span className="text-[var(--color-accent)]">nuestra misión.</span>
              </h1>

              <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-md">
                {config.welcomeMessage}
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  href="/agendar"
                  className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-primary-dark)] px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-[var(--color-accent-soft)] transition-colors shadow-lg shadow-[var(--color-accent)]/20"
                >
                  <CalendarDays className="w-4 h-4" />
                  Agendar cita
                </Link>
                <a
                  href={whatsappLink(config.whatsapp, "Hola, me gustaría solicitar información")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/15 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <Link
                  href="/servicios"
                  className="inline-flex items-center gap-2 text-white/60 px-4 py-3.5 rounded-xl font-medium text-sm hover:text-white transition-colors"
                >
                  Ver servicios
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Quick trust bar */}
              <div className="flex flex-wrap gap-5 text-xs text-white/50">
                {[
                  `+${config.yearsExperience} años de experiencia`,
                  `+${config.patientsServed.toLocaleString()} pacientes atendidos`,
                  "Atención personalizada",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — visual card */}
            <div className="hidden md:flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--color-primary-dark)] to-[#1e4a57] border border-[var(--color-accent)]/20 p-8 shadow-2xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-accent)]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-accent)]/30 to-[var(--color-accent-soft)]/20 border-2 border-[var(--color-accent)]/40 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-extrabold text-[var(--color-accent)]">{initials}</span>
                    </div>
                    <p className="text-white font-bold text-xl mb-1">{config.dentistName}</p>
                    <p className="text-[var(--color-accent)] text-sm font-medium mb-1">{config.specialty}</p>
                    <p className="text-white/40 text-xs mb-5">Cédula: {config.professionalLicense}</p>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-white/40 text-xs mb-6">5.0 · Google Reviews</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Años de exp.", value: `+${config.yearsExperience}` },
                        { label: "Pacientes",    value: `+${config.patientsServed >= 1000 ? `${Math.floor(config.patientsServed / 1000)}k` : config.patientsServed}` },
                      ].map((s) => (
                        <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-[var(--color-accent)] font-extrabold text-xl">{s.value}</p>
                          <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[var(--color-accent-soft)] rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text)]">Clínica certificada</p>
                    <p className="text-xs text-[var(--color-muted-text)]">Protocolos de seguridad</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INFO RÁPIDA ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--color-border)]">
            {[
              { icon: MapPin,     label: "Dirección", value: shortAddress },
              { icon: Clock,      label: "Horario",   value: shortHours   },
              { icon: Phone,      label: "Teléfono",  value: config.phone },
              { icon: CreditCard, label: "Pagos",     value: paymentShort || "Efectivo y tarjeta" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-white px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[var(--color-muted-text)] uppercase tracking-wider font-medium">{item.label}</p>
                  <p className="text-xs font-semibold text-[var(--color-text)] truncate leading-tight">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── URGENCIAS ────────────────────────────────────────────── */}
      {config.acceptsEmergencies && emergency && (
        <section className="bg-red-950/5 border-y border-red-200/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-800 text-sm">
                  {config.emergencyDescription ? config.emergencyDescription.slice(0, 60) + (config.emergencyDescription.length > 60 ? "…" : "") : "¿Dolor intenso o fractura dental?"}
                </p>
                <p className="text-red-600 text-sm">Agenda una urgencia hoy — buscamos atenderte el mismo día.</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <a
                href={whatsappLink(config.emergencyWhatsapp || config.whatsapp, "Hola, necesito atención de urgencia dental")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                WhatsApp urgente
              </a>
              <Link
                href={`/agendar?servicio=${emergency.slug}`}
                className="bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Agendar urgencia
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── SERVICIOS ────────────────────────────────────────────── */}
      <section className="py-20 bg-[var(--color-background)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionTitle
            eyebrow="Tratamientos"
            title="Servicios dentales completos"
            subtitle="Desde limpiezas y blanqueamientos hasta implantes y ortodoncia. Todo en un solo lugar."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 bg-white border border-[var(--color-border)] text-[var(--color-primary)] px-6 py-3 rounded-xl font-semibold text-sm hover:border-[var(--color-accent)] hover:shadow-md transition-all"
            >
              Ver todos los servicios
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CONFIANZA ────────────────────────────────────────────── */}
      <section className="py-20 bg-[var(--color-primary)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionTitle
            eyebrow="¿Por qué elegirnos?"
            title="Salud dental de primer nivel"
            subtitle="Combinamos tecnología moderna con un trato cercano para que cada visita sea cómoda y confiable."
            light
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Award,         title: `+${config.yearsExperience} años de experiencia`,   desc: "Formación continua en las últimas técnicas odontológicas." },
              { icon: BadgeCheck,    title: "Cédula profesional",                               desc: `Cédula ${config.professionalLicense} registrada ante la SEP.` },
              { icon: Sparkles,      title: "Ambiente impecable",                               desc: "Equipos esterilizados y protocolos de higiene rigurosos." },
              { icon: HeartHandshake, title: "Trato humano",                                    desc: "Atención personalizada desde la primera llamada." },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[var(--color-accent)]/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/15 flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/25 transition-colors">
                  <item.icon className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIOS ──────────────────────────────────────────── */}
      <section className="py-20 bg-[var(--color-accent-soft)]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionTitle
            eyebrow="Testimonios"
            title="Lo que dicen nuestros pacientes"
            subtitle={`Más de ${config.patientsServed.toLocaleString()} personas han confiado su sonrisa en nosotros.`}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.slice(0, 3).map((t) => (
              <div key={t.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[var(--color-muted-text)] text-sm leading-relaxed mb-5">&ldquo;{t.comment}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border)]">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-primary)] font-bold text-xs flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-text)]">{t.name}</p>
                    {t.service && <p className="text-xs text-[var(--color-muted-text)]">{t.service}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MÉTODOS DE PAGO ──────────────────────────────────────── */}
      {config.acceptedPayments.length > 0 && (
        <section className="py-10 bg-white border-y border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xs text-[var(--color-accent)] font-bold uppercase tracking-widest mb-1">Facilidades de pago</p>
                <h3 className="font-bold text-[var(--color-text)] text-lg">Métodos aceptados</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.acceptedPayments.map((m) => (
                  <div key={m} className="flex items-center gap-1.5 bg-[var(--color-background)] border border-[var(--color-border)] px-4 py-2 rounded-xl text-sm text-[var(--color-muted-text)] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    {getPaymentMethodLabel(m)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA FINAL ────────────────────────────────────────────── */}
      <section className="py-20 bg-[var(--color-primary-dark)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(var(--color-accent) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest mb-4">Agenda hoy</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
            ¿Listo para cuidar<br />tu sonrisa?
          </h2>
          <p className="text-white/50 mb-8 text-lg">
            Agenda tu cita en minutos. Sin filas, sin esperas innecesarias.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/agendar"
              className="bg-[var(--color-accent)] text-[var(--color-primary-dark)] px-8 py-4 rounded-xl font-bold hover:bg-[var(--color-accent-soft)] transition-colors shadow-lg shadow-[var(--color-accent)]/20"
            >
              Agendar cita ahora
            </Link>
            <a
              href={whatsappLink(config.whatsapp, "Hola, me gustaría solicitar información")}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/15 transition-colors"
            >
              Escribir por WhatsApp
            </a>
          </div>
          <p className="mt-6 text-white/30 text-xs flex items-center justify-center gap-4">
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {shortAddress}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {shortHours}</span>
          </p>
        </div>
      </section>
    </>
  );
}
