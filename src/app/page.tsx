const specialties = [
  { href: "/dentista", label: "Dentista — Paleta 1", status: "live" as const, note: "Diseño principal (verde meridiano)" },
  { href: "/dentista-paleta-2", label: "Dentista — Paleta 2", status: "live" as const, note: "Mismo diseño, arena cálida (cobre)" },
  { href: "/dentista-paleta-3", label: "Dentista — Paleta 3", status: "live" as const, note: "Mismo diseño, azul clínico" },
  { href: "/medico", label: "Médico — Paleta 1", status: "live" as const, note: "Medicina interna (azul clínico)" },
  { href: "/medico-paleta-2", label: "Médico — Paleta 2", status: "live" as const, note: "Mismo diseño, verde clínico" },
  { href: "/medico-paleta-3", label: "Médico — Paleta 3", status: "live" as const, note: "Mismo diseño, vino cálido" },
  { href: "/template-02", label: "Dentista (alterno B)", status: "live" as const, note: "Expediente clínico" },
  { href: "/template-03", label: "Dentista (alterno C)", status: "live" as const, note: "Revista / asimétrico" },
  { href: "/veterinario", label: "Veterinario", status: "live" as const, note: "Mascotas pequeñas" },
  { href: "/psicologo", label: "Psicólogo", status: "live" as const, note: "Terapia de adultos" },
  { href: "/nutriologo", label: "Nutriólogo", status: "live" as const, note: "Nutrición clínica y deportiva" },
  { href: "/fisioterapia", label: "Fisioterapia", status: "live" as const, note: "Ficha de rehabilitación" },
  { href: "/estetica", label: "Estética", status: "live" as const, note: "Medicina estética facial y corporal" },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">Template A2</p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">Plantillas por especialidad</h1>
      <p className="mt-3 text-ink/60">Cada especialidad tiene un diseño propio, no solo un cambio de color.</p>

      <ul className="mt-10 divide-y divide-steel">
        {specialties.map((s) => (
          <li key={s.href} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">{s.label}</p>
              {s.note && <p className="text-sm text-ink/50">{s.note}</p>}
            </div>
            {s.status === "live" ? (
              <a href={s.href} className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-ivory transition hover:bg-ink/85">
                Ver diseño
              </a>
            ) : (
              <span className="rounded-full border border-steel px-5 py-2 text-sm text-ink/40">Próximamente</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
