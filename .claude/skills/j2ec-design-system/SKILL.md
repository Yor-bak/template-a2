---
name: j2ec-design-system
description: >
  Sistema visual de referencia del producto J2EC. Actívate automáticamente
  cada vez que Claude modifique UI, cree o edite componentes visuales, cambie
  layouts, trabaje en botones, formularios, tablas, modales, cards o badges,
  o trabaje en cualquiera de los tres paneles (Admin, dashboard especialista,
  portal trabajador) o en la página pública. Antes de crear cualquier estilo o
  componente nuevo, consulta este documento para reutilizar lo que ya existe.
  Esta skill NO autoriza modificar lógica, flujos, cálculos, estados, stores,
  contextos, hooks funcionales, permisos ni datos de dominio.
---

# J2EC Design System

## Regla principal

> **Antes de crear un estilo o componente nuevo, busca si ya existe uno reutilizable.**
> Ver `references/components.md` para el inventario completo.

---

## Tres contextos visuales distintos

El producto tiene tres paneles con sistemas de tokens separados. No mezcles tokens entre contextos.

### 1. Admin — "Midnight Ink" (oscuro fijo)
**Tokens CSS** (definidos en `src/app/globals.css`):
```
--bg-base:     #0f0e17   (fondo más profundo)
--bg-surface:  #1a1b1f   (cards, paneles)
--bg-elevated: #24262b   (elevated surfaces, table headers)
--accent:      #c9a84c   (dorado — acción principal, badges positivos)
--accent-muted:#c9a84c44 (dorado translúcido — fondos de badges accent)
--text-primary:#f5f0e8   (texto principal)
--text-muted:  #9a9ca3   (texto secundario, etiquetas)
--border:      #34373e   (bordes, divisores)
--danger:      #e05a5a   (rojo — errores y acciones destructivas)
```
**Sistema de estilos**: objeto `S` en `src/modules/admin/components/adminUi.tsx`.
Ver referencias completas en `references/current-tokens.md`.

### 2. Dashboard del especialista — tokens `--ds-*` (paleta configurable)
**Tokens CSS** (definidos en `src/app/globals.css`, sobrescritos por JS vía `applyThemePalette`):
```
--ds-bg, --ds-surface, --ds-surface-muted, --ds-surface-elevated
--ds-primary, --ds-primary-fg
--ds-accent
--ds-text, --ds-text-muted
--ds-border
--ds-success, --ds-success-fg
--ds-warning
--ds-error
--ds-ring
--ds-sidebar-bg, --ds-sidebar-fg, --ds-sidebar-accent, ...
```
La paleta activa se gestiona por `ExtraProfileContext` → `dashboardTheme` y se aplica vía JS en `src/app/(especialista)/dashboard/layout.tsx` con `applyDashboardColors()`. Hay **6 presets** en `src/lib/dashboardThemes.ts`: marfil, marino, verde, rosa, grafito, arena. Cada preset tiene variante `light` y `dark`.

⚠️ `src/config/themes.ts` y `src/contexts/ThemeContext.tsx` son el sistema de temas de la **página pública**, no del dashboard especialista.

### 3. Portal del trabajador
Reutiliza los tokens `--ds-*`. El layout `src/app/trabajador/layout.tsx` aplica colores vía JS (`applyDashboardColors`) usando el tema del especialista logueado. Sin selector de tema propio.

### 4. Página pública
Tokens `--color-*` por template. Cada template mantiene su identidad visual.
No homogenices los templates.

---

## Personalidad visual J2EC

- **Profesional y sobrio**: sin decoración excesiva, sin efectos llamativos.
- **Compacto y operativo**: el Admin es una herramienta de trabajo; la densidad importa.
- **Jerarquía clara**: siempre existe una acción principal evidente por pantalla.
- **Poco ruido**: menos bordes innecesarios, menos sombras, menos badges.
- **Moderno pero sin alardes**: animaciones discretas, transiciones funcionales.

---

## Botones — Admin ("Midnight Ink")

Fuente única: objeto `S` en `adminUi.tsx`. **Usa estas clases, no inventes nuevas.**

| Variante | Cuándo usar | Clase en `S` |
|---|---|---|
| Primary | Acción principal única | `S.btnPrimary` |
| Secondary | Acción secundaria | `S.btnSecondary` |
| Ghost | Acción terciaria, acciones de tabla | `S.btnGhost` |
| Rose | Alternativa ghost neutra | `S.btnRose` |
| Danger | Acción destructiva | `S.btnDanger` |
| Accent | Pagar / confirmar (amber outlined) | `S.btnAccent` |
| Green | Confirmación positiva | `S.btnGreen` |

**Reglas de uso:**
- Un solo botón primario por pantalla/modal.
- Botones secundarios con menor énfasis visual.
- Acciones destructivas separadas de las acciones normales.
- No usar `S.btnPrimary` múltiples veces compitiendo en la misma vista.

---

## Botones — Dashboard (`Button.tsx`)

Componente: `src/components/ui/Button.tsx`
Variantes: `primary | secondary | outline | ghost | danger | whatsapp`
Tamaños: `sm | md | lg`

⚠️ **Deuda visual detectada**: `Button.tsx` usa colores hardcoded (`sky-600`, `teal-600`) en lugar de tokens `--ds-*`. No agrava este problema; documenta si lo ves pero no corrijas sin autorización funcional.

---

## Badges

**Admin**: usa `BadgeEl` de `adminUi.tsx` con la meta correspondiente:
```tsx
<BadgeEl meta={COMMISSION_META[c.status]} />
<BadgeEl meta={PLAN_META[plan]} />
<PlanBadge plan={plan} />
<AccessBadge active={active} />
```

Clases base de badges admin:
```
B_ACCENT = bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]
B_MUTED  = bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]
B_DANGER = bg-[var(--bg-elevated)] text-[var(--danger)] border-[var(--danger)]
```

Semántica de color de badge:
- **Dorado (ACCENT)**: estado positivo (activo, pagado, verificado, publicado)
- **Gris (MUTED)**: estado neutro (pendiente, inactivo, oculto)
- **Rojo (DANGER)**: estado negativo (vencido, cancelado, rechazado, error)

**Regla**: Nunca comunicar un estado solo mediante color. Los badges siempre tienen texto.

---

## Inputs y Selects — Admin

```
S.input  — campo de texto
S.select — selector
S.label  — etiqueta de campo
```

Focus: `focus:outline-none focus:border-[var(--accent)]` — ⚠️ sin `focus:ring` visible.
Esta es una deuda de accesibilidad conocida; documenta pero no cambies sin aplicar `accessibility-ui`.

---

## Cards

**Admin**: fondo `bg-[var(--bg-surface)]`, borde `border-[0.5px] border-[var(--border)]`, radio `rounded-xl`.
**Dashboard**: `bg-[var(--ds-surface)] rounded-2xl border border-[var(--ds-border)]` (ver `Card.tsx`).

Reglas:
- No crear cards dentro de cards sin necesidad funcional.
- No convertir cada bloque de información en una card.
- Agrupar mediante espacio cuando no se requiere un contorno.

---

## Tablas — Admin

Componentes: `Th` (encabezado) de `adminUi.tsx`.
- Encabezados: `Th` con `bg-[var(--bg-elevated)]`, texto `10px uppercase tracking-wide muted`.
- Filas: `hover:bg-[var(--bg-surface)]` o similar, `transition-colors`.
- Texto secundario en celdas: `text-[var(--text-muted)] text-xs`.
- Acciones en fila: botones ghost pequeños.
- Scroll horizontal: `overflow-x-auto` cuando la tabla no quepa en móvil.

---

## Modales y Drawers — Admin

Patrón existente: panel lateral (drawer) con overlay oscuro.
- Ancho: fijo (ej. `w-[440px]` o similar).
- Header: título + botón X.
- Scroll interno: `overflow-y-auto`.
- Footer: acción primaria + secundaria.
- No convertir modales funcionales en páginas.

---

## Estados vacíos

Componentes existentes (⚠️ duplicados):
- `src/components/shared/EmptyState.tsx`
- `src/components/feedback/EmptyState.tsx`

Ambos son idénticos. Usa cualquiera de los dos; unifica en una futura tarea de consolidación.

---

## Tipografía

El proyecto usa tres familias (configuradas en `layout.tsx`):
- `--font-display`: Space Grotesk (títulos)
- `--font-body`: Inter (texto principal)
- `--font-data`: IBM Plex Mono (datos, códigos, monoespaciado)

**Jerarquía tipográfica Admin** (tamaños aproximados en la práctica):
```
Título de tab/sección:  text-sm font-semibold text-[var(--text-primary)]
Subtítulo/SectionTitle: text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]
Texto principal:        text-sm text-[var(--text-primary)]
Texto secundario:       text-xs text-[var(--text-muted)]
Metadato/etiqueta:      text-[10px] text-[var(--text-muted)]
Dato monetario/número:  font-mono text-sm
```

---

## Espaciado y densidad

Admin (herramienta operativa — densidad alta):
- Padding de cards/secciones: `px-4 py-3` o `px-5 py-4`
- Gap entre elementos: `gap-2` a `gap-4`
- Altura de fila de tabla: `py-3` a `py-3.5`
- Separación entre secciones: `space-y-4` o `space-y-5`

Dashboard (densidad media):
- Padding de cards: `p-5` o `p-6`
- Gap entre cards: `gap-4` a `gap-6`

No aumentar todos los espacios indiscriminadamente.

---

## Animaciones existentes

Ver skill `motion-design` para instrucciones detalladas.

Actualmente:
- `transition-colors` en botones e inputs (instantáneo o ~150ms por Tailwind por defecto)
- `transition-all` en algunos elementos interactivos
- `animate-spin` en spinners de carga
- `.reveal` en `globals.css`: `opacity 0 → 1 + translateY 10px → 0`, `0.7s ease-out`, respeta `prefers-reduced-motion`

No existen librerías de animación instaladas (sin Framer Motion, sin GSAP).

---

## Scrollbar

Clases de scrollbar personalizado:
- Admin: `.adm-scroll` (scrollbar oscuro sutil, 5px)
- Global: scrollbar thin gris (#9ca3af) sobre track semitransparente

---

## Lo que está prohibido en esta skill

- Crear nuevas paletas de color no basadas en tokens.
- Inventar variantes de botón cuando ya existe una equivalente en `S`.
- Duplicar clases de badges en lugar de usar `BadgeEl`.
- Cards dentro de cards sin necesidad.
- Estilos inline (`style={{}}`) evitables cuando existe clase Tailwind equivalente.
- Componentes visuales duplicados.
- Modificar lógica para resolver problemas estéticos.
- Instalar nuevas librerías de UI.
- Modificar tipos de dominio, stores, contextos, hooks funcionales, validaciones, rutas, datos o backend.
