"use client";
import { useState } from "react";
import { CheckCircle2, Palette } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { PALETTE_LIST, type ThemePaletteKey, type PaletteColors } from "@/theme/palettes";

// ── Mini preview ──────────────────────────────────────────────────────────────

function ThemePreview({ colors }: { colors: PaletteColors }) {
  return (
    <div
      className="rounded-xl overflow-hidden mb-3"
      style={{ border: `1.5px solid ${colors.border}` }}
    >
      {/* Navbar simulation */}
      <div
        className="h-4 flex items-center px-2 gap-1"
        style={{ backgroundColor: colors.primaryDark }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: colors.accent }}
        />
        <div
          className="h-0.5 rounded-full flex-1"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        />
        <div
          className="h-2.5 w-7 rounded flex-shrink-0"
          style={{ backgroundColor: colors.accent }}
        />
      </div>
      {/* Content simulation */}
      <div className="px-2.5 pt-2 pb-2.5" style={{ backgroundColor: colors.background }}>
        <div
          className="h-1.5 rounded-full w-3/5 mb-1.5"
          style={{ backgroundColor: colors.border }}
        />
        <div
          className="h-1 rounded-full w-2/5 mb-2.5"
          style={{ backgroundColor: colors.border }}
        />
        <div className="flex items-center gap-1.5">
          <div
            className="h-4 rounded flex-1"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
          />
          <div
            className="h-4 w-9 rounded flex-shrink-0"
            style={{ backgroundColor: colors.accent }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Palette card ──────────────────────────────────────────────────────────────

interface CardProps {
  palette: (typeof PALETTE_LIST)[0];
  isActive: boolean;
  onSelect: (key: ThemePaletteKey) => void;
}

function ThemePaletteCard({ palette, isActive, onSelect }: CardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !isActive && onSelect(palette.key)}
      onKeyDown={(e) => e.key === "Enter" && !isActive && onSelect(palette.key)}
      className={[
        "relative rounded-xl border-2 p-3 transition-all select-none",
        isActive
          ? "cursor-default"
          : "cursor-pointer hover:shadow-md",
      ].join(" ")}
      style={{
        borderColor: isActive ? palette.colors.accent : palette.colors.border,
        backgroundColor: isActive
          ? `${palette.colors.accentSoft}40`
          : palette.colors.card,
      }}
    >
      {/* Actual badge */}
      {isActive && (
        <span
          className="absolute top-2 right-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none"
          style={{
            backgroundColor: palette.colors.accent,
            color: palette.colors.primaryDark,
          }}
        >
          Actual
        </span>
      )}

      <ThemePreview colors={palette.colors} />

      {/* Color swatches */}
      <div className="flex gap-1 mb-2">
        {[
          palette.colors.primaryDark,
          palette.colors.accent,
          palette.colors.accentSoft,
          palette.colors.background,
        ].map((c, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: c, border: "1px solid rgba(0,0,0,0.08)" }}
          />
        ))}
      </div>

      <p
        className="text-xs font-bold leading-tight mb-0.5"
        style={{ color: palette.colors.text }}
      >
        {palette.name}
      </p>
      <p
        className="text-[10px] leading-snug line-clamp-2"
        style={{ color: palette.colors.mutedText }}
      >
        {palette.description}
      </p>

      {!isActive && (
        <p
          className="text-[10px] font-semibold mt-2"
          style={{ color: palette.colors.primary }}
        >
          Seleccionar →
        </p>
      )}
    </div>
  );
}

// ── Selector section ──────────────────────────────────────────────────────────

export function ThemePaletteSelector() {
  const { selectedPalette, setPalette } = useTheme();
  const [saved, setSaved] = useState(false);

  function handleSelect(key: ThemePaletteKey) {
    setPalette(key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Palette className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="font-bold text-[var(--color-text)] text-sm uppercase tracking-wide">
              Identidad visual del consultorio
            </h2>
            <p className="text-sm text-[var(--color-muted-text)] mt-0.5">
              Elige una paleta profesional para que tu página y panel reflejen el estilo de tu consultorio.
            </p>
          </div>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            Paleta visual actualizada correctamente.
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PALETTE_LIST.map((palette) => (
          <ThemePaletteCard
            key={palette.key}
            palette={palette}
            isActive={selectedPalette === palette.key}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
