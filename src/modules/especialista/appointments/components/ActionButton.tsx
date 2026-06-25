"use client";
import type { CSSProperties } from "react";

type Color = "green" | "red" | "teal" | "orange" | "gray" | "blue" | "purple" | "yellow";

const colorStyles: Record<Color, CSSProperties> = {
  green:  { background: "color-mix(in srgb, var(--ds-success) 12%, transparent)", color: "var(--ds-success)",     borderColor: "color-mix(in srgb, var(--ds-success) 25%, transparent)" },
  teal:   { background: "color-mix(in srgb, var(--ds-success) 12%, transparent)", color: "var(--ds-success)",     borderColor: "color-mix(in srgb, var(--ds-success) 25%, transparent)" },
  blue:   { background: "color-mix(in srgb, var(--ds-success) 12%, transparent)", color: "var(--ds-success)",     borderColor: "color-mix(in srgb, var(--ds-success) 25%, transparent)" },
  red:    { background: "color-mix(in srgb, var(--ds-error) 10%, transparent)",   color: "var(--ds-error)",       borderColor: "color-mix(in srgb, var(--ds-error) 24%, transparent)" },
  orange: { background: "color-mix(in srgb, var(--ds-warning) 12%, transparent)", color: "var(--ds-warning)",     borderColor: "color-mix(in srgb, var(--ds-warning) 25%, transparent)" },
  yellow: { background: "color-mix(in srgb, var(--ds-warning) 12%, transparent)", color: "var(--ds-warning)",     borderColor: "color-mix(in srgb, var(--ds-warning) 25%, transparent)" },
  gray:   { background: "var(--ds-surface-muted)",                                color: "var(--ds-text-muted)",   borderColor: "var(--ds-border)" },
  purple: { background: "var(--ds-surface-muted)",                                color: "var(--ds-text-muted)",   borderColor: "var(--ds-border)" },
};

interface Props {
  children: React.ReactNode;
  onClick: () => void;
  color?: Color;
  fullWidth?: boolean;
}

export function ActionButton({ children, onClick, color = "gray", fullWidth = false }: Props) {
  return (
    <button
      onClick={onClick}
      style={colorStyles[color]}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-opacity hover:opacity-80 active:opacity-70 ${fullWidth ? "w-full text-left" : ""}`}
    >
      {children}
    </button>
  );
}
