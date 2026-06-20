"use client";

import type { CSSProperties } from "react";

// Switch de paleta reutilizable entre especialidades. Es agnóstico a los nombres de las
// variables CSS de cada especialidad: recibe los colores ya resueltos (swatch/surface/ink)
// por paleta, así el mismo widget sirve a dentista, médico y los que sigan. Incorpora las
// correcciones de la auditoría: área táctil de 44px, superficie y anillo activo temáticos
// según la paleta activa, ícono siempre visible y posición que no tapa el contenido.
export type SwitchablePalette = {
  name: string;
  swatch: string; // color del punto (acento de la paleta)
  surface: string; // fondo del contenedor y separación del anillo activo
  ink: string; // color de borde, ícono, texto y anillo activo
};

function PaletteIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={color} strokeWidth="1.8" aria-hidden>
      <path d="M12 3a9 9 0 1 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.39-.61-.39-1 0-.83.67-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.42-4.03-8-9-8Z" />
      <circle cx="7.5" cy="10.5" r="1" fill={color} stroke="none" />
      <circle cx="12" cy="7.5" r="1" fill={color} stroke="none" />
      <circle cx="16.5" cy="10.5" r="1" fill={color} stroke="none" />
    </svg>
  );
}

export function PaletteSwitcher({
  palettes,
  active,
  onSelect,
}: {
  palettes: readonly SwitchablePalette[];
  active: number;
  onSelect: (index: number) => void;
}) {
  const { surface, ink } = palettes[active];
  return (
    <div
      className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5 rounded-full border px-3 py-2 shadow-lg sm:bottom-6 sm:left-6"
      style={{ backgroundColor: surface, borderColor: `${ink}26` }}
    >
      <PaletteIcon color={`${ink}99`} />
      <span className="hidden text-xs sm:inline" style={{ color: `${ink}b3` }}>
        Paleta
      </span>
      {palettes.map((p, i) => {
        const isActive = i === active;
        return (
          <button
            key={p.name}
            type="button"
            title={`Ver paleta ${p.name}`}
            aria-label={`Ver paleta ${p.name}`}
            aria-pressed={isActive}
            onClick={() => onSelect(i)}
            className="grid h-11 w-11 place-items-center rounded-full"
          >
            <span
              className={`block h-6 w-6 rounded-full transition ${isActive ? "" : "opacity-70 hover:opacity-100"}`}
              style={
                {
                  backgroundColor: p.swatch,
                  // Anillo con "offset" del color de la superficie, dibujado con box-shadow
                  // para no depender de las utilidades de ring de Tailwind (que fijarían un
                  // offset blanco que no combina con las paletas cálidas/oscuras).
                  boxShadow: isActive ? `0 0 0 2px ${surface}, 0 0 0 4px ${ink}` : undefined,
                } as CSSProperties
              }
            />
          </button>
        );
      })}
    </div>
  );
}
