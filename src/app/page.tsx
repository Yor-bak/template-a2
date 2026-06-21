// Una entrada por diseño. Las paletas de color ya no se listan como rutas aparte:
// /medico trae el switch de paleta en vivo, y los archivos *-paleta-* siguen en disco
// para reubicarlos más adelante.
const specialties = [
  { href: "/dentista", label: "Dentista", status: "live" as const, note: "Rehabilitación oral · switch de paleta en vivo" },
  { href: "/template-02", label: "Dentista (alterno B)", status: "live" as const, note: "Expediente clínico" },
  { href: "/template-03", label: "Dentista (alterno C)", status: "live" as const, note: "Marketing dental / acordeón y testimonios" },
  { href: "/medico", label: "Médico", status: "live" as const, note: "Medicina interna · switch de paleta en vivo" },
  { href: "/medico-template-02", label: "Médico (alterno B)", status: "live" as const, note: "Tablero clínico" },
  { href: "/medico-template-03", label: "Médico (alterno C)", status: "live" as const, note: "Clínica institucional / servicios e instalaciones" },
  { href: "/veterinario", label: "Veterinario", status: "live" as const, note: "Mascotas pequeñas · switch de paleta en vivo" },
  { href: "/veterinario-template-02", label: "Veterinario (alterno B)", status: "live" as const, note: "Bento grid / modular" },
  { href: "/veterinario-template-03", label: "Veterinario (alterno C)", status: "live" as const, note: "Hospital institucional / especialidades" },
  { href: "/psicologo", label: "Psicólogo", status: "live" as const, note: "Terapia de adultos · switch de paleta en vivo" },
  { href: "/psicologo-template-02", label: "Psicólogo (alterno B)", status: "live" as const, note: "Línea de tiempo del proceso" },
  { href: "/psicologo-template-03", label: "Psicólogo (alterno C)", status: "live" as const, note: "Carta íntima / FAQ" },
  { href: "/nutriologo", label: "Nutriólogo", status: "live" as const, note: "Nutrición clínica · switch de paleta en vivo" },
  { href: "/nutriologo-template-02", label: "Nutriólogo (alterno B)", status: "live" as const, note: "Carta de menú / degustación" },
  { href: "/nutriologo-template-03", label: "Nutriólogo (alterno C)", status: "live" as const, note: "Planner semanal de hábitos" },
  { href: "/fisioterapia", label: "Fisioterapia", status: "live" as const, note: "Rehabilitación · switch de paleta en vivo" },
  { href: "/fisioterapia-template-02", label: "Fisioterapia (alterno B)", status: "live" as const, note: "Mapa del cuerpo / zonas" },
  { href: "/fisioterapia-template-03", label: "Fisioterapia (alterno C)", status: "live" as const, note: "Programa tipo app de ejercicio" },
  { href: "/estetica", label: "Estética", status: "live" as const, note: "Medicina estética · switch de paleta en vivo" },
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
