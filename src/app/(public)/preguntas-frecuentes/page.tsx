"use client";
import { useState } from "react";
import Link from "next/link";
import { faqs } from "@/data/faqs";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { whatsappLink } from "@/lib/utils";
import { ChevronDown, MessageCircle, CalendarDays, CheckCircle2 } from "lucide-react";

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null);
  const { config } = useClinicConfig();

  return (
    <div className="bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest mb-3">Resolvemos tus dudas</p>
          <h1 className="text-4xl font-extrabold text-white mb-4">Preguntas frecuentes</h1>
          <p className="text-white/60 text-base">
            Encuentra respuestas a las dudas más comunes. Si no encuentras lo que buscas, escríbenos.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pb-20">
        {/* Accordion */}
        <div className="space-y-2 mb-12">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpen(open === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[var(--color-background)] transition-colors"
              >
                <span className="font-semibold text-[var(--color-text)] text-sm pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--color-accent)] flex-shrink-0 transition-transform duration-200 ${
                    open === faq.id ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === faq.id && (
                <div className="px-6 pb-5 border-t border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-muted-text)] leading-relaxed pt-4">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Políticas */}
        <div className="bg-[var(--color-primary)] rounded-2xl p-6 mb-10">
          <h2 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Políticas de cita</h2>
          <ul className="space-y-2">
            {[
              "Llegar 10 minutos antes de tu cita.",
              "Confirmar tu asistencia 24 horas antes.",
              "Cancelaciones con mínimo 12 horas de anticipación.",
              "En caso de no presentarte sin aviso, el horario puede liberarse para otro paciente.",
              "Algunos tratamientos requieren valoración previa antes de iniciar.",
              "El precio final puede depender del diagnóstico clínico.",
            ].map((p, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-[var(--color-muted-text)] text-sm mb-5">¿Tienes alguna pregunta que no está aquí?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={whatsappLink(config.whatsapp, "Hola, tengo una pregunta")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Preguntar por WhatsApp
            </a>
            <Link
              href="/agendar"
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              Agendar cita
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
