# Tokens y Variables CSS — J2EC

Archivo fuente: `src/app/globals.css`

---

## Admin — "Midnight Ink" (oscuro fijo)

Definido en bloque `:root` en `globals.css` (líneas ~54-65):

```css
--bg-base:     #0f0e17   /* fondo más oscuro, base de pantalla */
--bg-surface:  #1a1b1f   /* surfaces, drawers, cards */
--bg-elevated: #24262b   /* elevated, table headers, inputs */
--accent:      #c9a84c   /* dorado — acción principal */
--accent-muted:#c9a84c44 /* dorado translúcido — fondo de badges accent */
--text-primary:#f5f0e8   /* texto principal */
--text-muted:  #9a9ca3   /* texto secundario, etiquetas, placeholders */
--border:      #34373e   /* bordes de cards, inputs, dividers */
--danger:      #e05a5a   /* errores, acciones destructivas */
```

**Dónde se consumen**:
- `src/modules/admin/components/adminUi.tsx` — objeto `S`, constantes `B_ACCENT/B_MUTED/B_DANGER`
- `src/app/(admin)/admin/page.tsx` — layout, tabs, drawers
- `src/modules/admin/components/*.tsx` — todos los módulos admin

**Clases de badge** (definidas en `adminUi.tsx`):
```ts
B_ACCENT = "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]"
B_MUTED  = "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]"
B_DANGER = "bg-[var(--bg-elevated)] text-[var(--danger)] border-[var(--danger)]"
```

**Scrollbar Admin** (clase `.adm-scroll`):
```css
scrollbar: thin, thumb #52575f / hover #71767f, track rgba(255,255,255,0.04)
```

---

## Dashboard Especialista — tokens `--ds-*` (configurable)

Definido en bloque `:root` en `globals.css` (líneas ~35-52). Sobrescritos en runtime por `applyThemePalette()` en `src/config/themes.ts`.

```css
--ds-bg:               #f7f6f1   /* fondo de página */
--ds-surface:          #fdfcf9   /* cards, panels */
--ds-surface-muted:    #efeee9   /* inputs, subtle surfaces */
--ds-surface-elevated: #ffffff   /* modales, dropdown */
--ds-primary:          #173B45   /* color primario (teal oscuro) */
--ds-primary-fg:       #ffffff   /* texto sobre primary */
--ds-accent:           #3fb8a8   /* acento teal */
--ds-text:             #102A33   /* texto principal */
--ds-text-muted:       #5a6e76   /* texto secundario */
--ds-border:           #dddbd4   /* bordes */
--ds-success:          #2e6e48   /* verde */
--ds-success-fg:       #d6f0e2   /* texto sobre success */
--ds-warning:          #8a5e14   /* amber/warning */
--ds-error:            #a83030   /* rojo */
--ds-ring:             #3fb8a8   /* focus ring */
```

**Sidebar tokens** (inyectados por JS en `dashboard/layout.tsx`):
```css
--ds-sidebar-bg, --ds-sidebar-fg, --ds-sidebar-muted
--ds-sidebar-accent, --ds-sidebar-active-bg
--ds-sidebar-hover-bg, --ds-sidebar-border
```

**Presets del dashboard** (`src/lib/dashboardThemes.ts`) — cada uno con variante `light` y `dark`:
| ID | Nombre | Primary (light) | Accent (light) |
|---|---|---|---|
| `marfil` | Marfil | #173B45 | #3fb8a8 |
| `marino` | Marino | #1e3a5f | #3a7ec4 |
| `verde` | Verde | #1a5c3a | #2ea86a |
| `rosa` | Rosa | #7a3050 | #c86890 |
| `grafito` | Grafito | #27272a | #52525b |
| `arena` | Arena | #6a4c2e | #c49060 |

Default: `marfil`. Aplicado en runtime desde `ExtraProfileContext → dashboardTheme`.

⚠️ **No confundir** con `src/config/themes.ts` — esas 5 paletas (`dental_premium`, `beige_boutique`, etc.) pertenecen al sistema de **página pública** y son aplicadas por `ThemeContext` / `applyThemePalette()`.

---

## Página pública — tokens `--color-*`

Definido en bloque `:root` inicial en `globals.css`:

```css
--color-primary:      #173B45
--color-primary-dark: #0E2F3A
--color-accent:       #70D6C7
--color-accent-soft:  #BFEAF5
--color-background:   #FAFAF7
--color-card:         #FFFFFF
--color-border:       #E8ECEF
--color-text:         #102A33
--color-muted-text:   #5F737C
```

**Templates especiales** (tokens propios en Tailwind `@theme inline`):
```css
--color-ivory, --color-ink, --color-meridian, --color-meridian-deep
--color-steel, --color-steel-soft, --color-calibration
--color-urgent, --color-urgent-deep
```

**Templates médico**:
```css
--color-medico-bg, --color-medico-ink, --color-medico-accent, ...
```

---

## Tipografía — fuentes globales

Definidas en `src/app/layout.tsx` (Next.js font system) y referenciadas en `globals.css`:

```css
--font-display: var(--font-space-grotesk)   /* Space Grotesk — títulos */
--font-body:    var(--font-inter)            /* Inter — texto principal */
--font-data:    var(--font-plex-mono)        /* IBM Plex Mono — datos, monoespaciado */
```

---

## Scrollbar global

```css
--scrollbar-track:       rgba(0, 0, 0, 0.06)
--scrollbar-thumb:       #9ca3af
--scrollbar-thumb-hover: #6b7280
```

---

## Animaciones globales

`.reveal` class (en `globals.css`, respeta `prefers-reduced-motion`):
```css
animation: reveal 0.7s ease-out both;
/* from: opacity:0 translateY(10px) → to: opacity:1 translateY(0) */
```

Nota: Esta duración (0.7s) es **demasiado lenta** para microinteracciones operativas. Ver skill `motion-design` para duraciones recomendadas.

---

## Deudas visuales de tokens detectadas

| Problema | Archivo | Prioridad |
|---|---|---|
| `Button.tsx` usa `sky-600`/`teal-600` hardcoded, no tokens `--ds-*` | `src/components/ui/Button.tsx` | Mejora |
| `Card.tsx` usa `bg-white` hardcoded, no `--ds-surface` | `src/components/ui/Card.tsx` | Mejora |
| Focus en inputs admin solo cambia borde, sin `focus:ring` visible | `adminUi.tsx` línea ~35 | Accesibilidad |
| `.reveal` dura 0.7s — lenta para UI operativa | `globals.css` | Mejora |
