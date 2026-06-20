"use client";

import { useState } from "react";

const serviceNames = [
  "Valoración inicial y diagnóstico",
  "Limpieza dental profunda",
  "Resina estética",
  "Blanqueamiento en consultorio",
  "Corona de porcelana",
  "Diseño de sonrisa digital",
  "Endodoncia",
  "Extracción simple",
  "Urgencia dental",
];

export default function BookingForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState(serviceNames[0]);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const whatsappMessage = encodeURIComponent(
    `Hola, soy ${name || "[tu nombre]"}. Quiero más información sobre "${service}"` +
      (date ? ` para el ${date}` : "") +
      (notes ? `. ${notes}` : "."),
  );

  function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <div className="rounded-2xl border border-meridian/30 bg-meridian/5 p-8 text-center">
        <p className="tick-label text-meridian">Solicitud registrada</p>
        <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
          Te confirmamos por WhatsApp en breve, {name || "paciente"}.
        </h3>
        <p className="mt-2 text-sm text-ink/60">
          Pediste {service.toLowerCase()}
          {date ? ` para el ${date}` : ""}. Si quieres adelantar algo, también puedes escribirnos directo.
        </p>
        <a
          href={`https://wa.me/525548213360?text=${whatsappMessage}`}
          className="mt-5 inline-block rounded-full bg-meridian px-6 py-3 text-sm font-medium text-ivory transition hover:bg-meridian-deep"
        >
          Escribir por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleBook} className="rounded-2xl border border-steel p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="tick-label text-ink/50">Nombre</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="mt-1.5 w-full rounded-lg border border-steel bg-white px-3 py-2 text-sm outline-none focus:border-meridian"
          />
        </label>
        <label className="block text-sm">
          <span className="tick-label text-ink/50">Teléfono</span>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="55 0000 0000"
            className="mt-1.5 w-full rounded-lg border border-steel bg-white px-3 py-2 text-sm outline-none focus:border-meridian"
          />
        </label>
        <label className="block text-sm">
          <span className="tick-label text-ink/50">Servicio</span>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-steel bg-white px-3 py-2 text-sm outline-none focus:border-meridian"
          >
            {serviceNames.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="tick-label text-ink/50">Fecha preferida</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-steel bg-white px-3 py-2 text-sm outline-none focus:border-meridian"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="tick-label text-ink/50">¿Algo que debamos saber? (opcional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Dolor, diente específico, dudas sobre precio..."
            className="mt-1.5 w-full rounded-lg border border-steel bg-white px-3 py-2 text-sm outline-none focus:border-meridian"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <button
          type="submit"
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-ivory transition hover:bg-ink/85"
        >
          Agendar cita
        </button>
        <a
          href={`https://wa.me/525548213360?text=${whatsappMessage}`}
          className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition hover:border-ink/50"
        >
          Solo preguntar por WhatsApp
        </a>
      </div>
      <p className="mt-3 text-xs text-ink/40">
        Al agendar, te confirmamos disponibilidad por WhatsApp o llamada.
      </p>
    </form>
  );
}
