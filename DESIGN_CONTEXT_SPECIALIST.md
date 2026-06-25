# DESIGN_CONTEXT_SPECIALIST.md
## Contexto de diseño — Dashboard del especialista · Template A2

> **Instrucción de uso:** Este documento está preparado para que una instancia de Claude especializada en diseño UI/UX pueda mejorar exclusivamente el dashboard privado del especialista. No modificar templates públicos, backend, lógica de datos ni contratos de componentes.

---

## 1. Arquitectura visible

### Rutas del especialista

| Ruta | Propósito |
|---|---|
| `/dashboard` | Página principal — saludo, métricas del día y del mes, citas recientes, checklist de configuración |
| `/dashboard/citas` | Listado completo de citas con filtros de estado, origen y acciones rápidas |
| `/dashboard/citas/[id]` | Detalle de una cita — gestión de estado, pago, notas internas |
| `/dashboard/calendario` | Calendario de agenda — vista diaria, bloqueos de horario, cierre de día |
| `/dashboard/pacientes` | Listado de clientes con búsqueda, filtros por etiqueta, orden |
| `/dashboard/pacientes/[id]` | Ficha de cliente en 6 pestañas: Resumen · Historial clínico · Planes · Pagos · Seguimientos · Fotos y archivos |
| `/dashboard/planes` | Vista global de planes de atención — creación, filtros por estado |
| `/dashboard/pagos` | Registro y listado de pagos vinculados a clientes y planes |
| `/dashboard/seguimientos` | Seguimientos agrupados por Vencidos / Hoy / Próximos / Completados |
| `/dashboard/ingresos` | Ingresos derivados de citas — métricas de periodo y tabla detallada |
| `/dashboard/reportes` | Reportes de desempeño — servicios top, asistencia, gate premium |
| `/dashboard/servicios` | Gestión de servicios o tratamientos ofrecidos |
| `/dashboard/configuracion` | Configuración en pestañas: General · Especialista · Contacto · Redes · Horarios · Pagos · Apariencia · Página pública · Testimonios · Preguntas · Imágenes · SEO · Mensajes · Automatización · Datos y respaldo |
| `/dashboard/atencion` | Datos de contacto de soporte técnico de la plataforma |

### Navegación principal

El sidebar tiene **12 ítems** en este orden:
1. Dashboard
2. Citas
3. Calendario
4. Clientes
5. Planes de atención *(nuevo)*
6. Pagos *(nuevo)*
7. Seguimientos *(nuevo)*
8. Ingresos
9. Reportes
10. Servicios
11. Configuración
12. Atención a cliente

### Relación entre páginas

```
Dashboard
  ├── → Citas (link "Ver todas")
  ├── → Configuración (upsell "Conocer plan Pro")
  └── SetupChecklist → Configuración (por tab)

Clientes (listado)
  └── → Pacientes/[id] (ficha completa)
        ├── Historial clínico (contexto clínico)
        ├── Planes → crea / edita localmente
        ├── Pagos → registra, vincula plan
        ├── Seguimientos → crea, completa
        └── Fotos y archivos

Planes (global)
  └── → Pacientes/[id]?tab=planes (link de cliente)

Pagos (global)
  └── → Pacientes/[id] (link de cliente)

Seguimientos (global)
  └── → Pacientes/[id] (link de cliente)

Citas/[id]
  └── → Citas (volver)

Configuración
  └── Tab "Datos y respaldo" → exportaciones CSV/JSON
```

---

## 2. Archivos relevantes

### Layout y navegación

| Archivo | Responsabilidad | Controla |
|---|---|---|
| `src/app/(especialista)/dashboard/layout.tsx` | Shell del dashboard — tema, autenticación, sidebar, header móvil | CSS variables `--ds-*` via `applyDashboardColors()`, contenedor flex, `ClientDataProvider` |
| `src/components/layout/Sidebar.tsx` | Navegación lateral fija (desktop) y drawer (móvil) | Fondo primario, estados activo/inactivo, avatar de usuario, logout |
| `src/app/globals.css` | Tokens CSS base, tipografía, scrollbar, animaciones | Variables `--ds-*`, `--color-*`, fuentes, scroll suave |
| `src/lib/dashboardThemes.ts` | Definición de los 6 temas con sus versiones clara y oscura | 15 tokens de color por tema/modo |

### Dashboard principal

| Archivo | Responsabilidad | Componentes importantes |
|---|---|---|
| `src/app/(especialista)/dashboard/page.tsx` | Página home — saludo hero, métricas, tabla reciente | `SetupChecklist`, `StatCard`, `SectionLabel`, `OriginRow`, bloque de upgrade |
| `src/modules/especialista/components/SetupChecklist.tsx` | Barra de progreso de configuración inicial | Barra de progreso con `--ds-accent`, íconos `CheckCircle2` / `Circle`, links a tabs de configuración |

### Clientes y gestión clínica

| Archivo | Responsabilidad |
|---|---|
| `src/app/(especialista)/dashboard/pacientes/page.tsx` | Listado con búsqueda, filtros de etiqueta, orden, export CSV |
| `src/app/(especialista)/dashboard/pacientes/[id]/page.tsx` | Ficha cliente — 6 pestañas, formularios inline, historial clínico integrado |
| `src/modules/especialista/components/NewClientModal.tsx` | Modal centrado para crear clientes |

### Planes, pagos, seguimientos

| Archivo | Responsabilidad |
|---|---|
| `src/app/(especialista)/dashboard/planes/page.tsx` | Vista global de planes con filtros de estado |
| `src/app/(especialista)/dashboard/pagos/page.tsx` | Vista global de pagos con filtros y resumen |
| `src/app/(especialista)/dashboard/seguimientos/page.tsx` | Follow-ups agrupados por urgencia temporal |

### Citas y calendario

| Archivo | Responsabilidad |
|---|---|
| `src/app/(especialista)/dashboard/citas/page.tsx` | Listado con filtros combinados y acciones en línea |
| `src/app/(especialista)/dashboard/citas/[id]/page.tsx` | Detalle con gestión de estado, pago y notas |
| `src/app/(especialista)/dashboard/calendario/page.tsx` | Mini-calendario + agenda diaria, bloqueos |
| `src/components/calendar/BlockTimeModal.tsx` | Modal para bloquear horario |
| `src/components/calendar/CloseDayModal.tsx` | Modal para cerrar día completo |
| `src/modules/especialista/components/NewAppointmentModal.tsx` | Drawer lateral derecho para crear cita manualmente |

### Configuración

| Archivo | Responsabilidad |
|---|---|
| `src/app/(especialista)/dashboard/configuracion/page.tsx` | 15 pestañas de configuración — cada una con su propio `SaveRow` |

### Componentes compartidos

| Archivo | Responsabilidad |
|---|---|
| `src/components/ui/StatCard.tsx` | Tarjeta de métrica con ícono, valor, etiqueta, sub-texto |
| `src/components/ui/Badge.tsx` | Chip de etiqueta genérico |
| `src/components/ui/Button.tsx` | Botón base (escasamente usado; la mayoría son clases inline) |
| `src/components/ui/Card.tsx` | Card base (escasamente usado; mayoría son divs inline) |
| `src/modules/especialista/appointments/components/ActionButton.tsx` | Botón de acción de cita con color semántico |
| `src/modules/especialista/appointments/components/AppointmentStatusBadge.tsx` | Badge de estado de cita |
| `src/modules/especialista/appointments/components/PaymentStatusBadge.tsx` | Badge de estado de pago |
| `src/modules/especialista/components/ServiceForm.tsx` | Drawer de creación/edición de servicios |
| `src/modules/especialista/components/SourceBadge.tsx` | Badge de origen de cita (Web / Manual / IA) |

---

## 3. Sistema visual actual

### Tipografías

Definidas en `globals.css` vía `@theme inline`:

| Variable | Uso previsto |
|---|---|
| `--font-display` → `Space Grotesk` | Títulos y encabezados |
| `--font-body` → `Inter` | Texto general e interfaz |
| `--font-data` → `IBM Plex Mono` | Datos tabulares, código, etiquetas técnicas |

En la práctica el dashboard usa **Inter** como fuente dominante. `Space Grotesk` aparece en algunos títulos de templates públicos. `IBM Plex Mono` se usa en `.tick-label` del CSS pero no se aplica consistentemente en el dashboard.

### Escala tipográfica observada (Tailwind)

| Clase | Uso |
|---|---|
| `text-2xl font-extrabold` | H1 de sección (ej. "Clientes", "Pagos") |
| `text-lg / text-xl font-bold` | Sub-encabezados de cards |
| `text-sm font-bold` | Encabezados de secciones dentro de cards (UPPERCASE tracking-wide) |
| `text-sm` | Cuerpo de texto principal |
| `text-xs` | Labels, metadatos, badges, notas, fechas |
| `text-[10px]` | Etiquetas muy pequeñas (sidebar sub-label) |
| `text-2xl font-bold` | Valor en StatCard |
| `text-xs font-bold uppercase tracking-widest` | Sección labels del dashboard home |

### Espaciado principal

- Padding de página: `p-6` (24px)
- Max-width de contenido: `max-w-5xl mx-auto` (la mayoría) / `max-w-7xl` (dashboard home) / `max-w-4xl` (ficha cliente, configuración)
- Gap entre cards: `gap-4` / `gap-5` / `gap-6`
- Padding interno de cards: `p-5` / `p-4`
- Padding de filas de lista: `px-5 py-4`
- Margen inferior entre secciones: `mb-5` / `mb-6` / `mb-7`

### Radios de borde

| Clase | Uso |
|---|---|
| `rounded-2xl` | Cards principales, modales, drawers, tablas con overflow |
| `rounded-xl` | Inputs, botones, badges de estado, avatares cuadrados, dropdowns, sub-secciones internas |
| `rounded-lg` | Botones secundarios pequeños, acciones en línea |
| `rounded-full` | Avatares circulares, badges de etiqueta/estado, barra de progreso |

### Sombras

- Cards: `shadow-sm` — el estándar en todo el dashboard
- Modales: `shadow-2xl` — único uso
- Drawer (NewAppointmentModal): `shadow-2xl`
- Tab activo: `shadow-sm`
- No hay `shadow-md`, `shadow-lg` ni `shadow-xl` en el dashboard del especialista (salvo modales)

### Variables CSS del dashboard (`--ds-*`)

Estos tokens se aplican dinámicamente por `layout.tsx` desde el tema activo. Los valores de fallback (en `globals.css`) corresponden al tema **Marfil claro**:

```
--ds-bg               #f7f6f1   Fondo de página
--ds-surface          #fdfcf9   Superficie de cards
--ds-surface-muted    #efeee9   Superficie secundaria / hovers
--ds-surface-elevated #ffffff   Superficie elevada (modales, dropdowns)
--ds-primary          #173B45   Color principal (sidebar, H1 en hero, botones CTA)
--ds-primary-fg       #ffffff   Foreground sobre primario (texto en sidebar)
--ds-accent           #3fb8a8   Acento (íconos activos, links, borders de énfasis)
--ds-text             #102A33   Texto principal
--ds-text-muted       #5a6e76   Texto secundario / labels
--ds-border           #dddbd4   Bordes
--ds-success          #2e6e48   Verde semántico
--ds-success-fg       #d6f0e2   Foreground sobre success (rara vez usado)
--ds-warning          #8a5e14   Ámbar semántico
--ds-error            #a83030   Rojo semántico
--ds-ring             #3fb8a8   Color de focus ring (= accent por defecto)
```

Los alias `--color-*` también se establecen en layout para compatibilidad con código heredado:
```
--color-background → --ds-bg
--color-card       → --ds-surface
--color-primary    → --ds-primary
--color-accent     → --ds-accent
--color-text       → --ds-text
--color-muted-text → --ds-text-muted
--color-border     → --ds-border
--color-accent-soft → --ds-surface-muted
```

### Los 6 temas predefinidos (light / dark)

| ID | Nombre | Primary (light) | Accent (light) | Bg (light) | Primary (dark) | Accent (dark) |
|---|---|---|---|---|---|---|
| `marfil` | Marfil | `#173B45` | `#3fb8a8` | `#f7f6f1` | `#3fb8a8` | `#5fd0c0` |
| `marino` | Marino | `#1e3a5f` | `#3a7ec4` | `#f2f5f8` | `#5a9ad8` | `#7ab8f0` |
| `verde` | Verde | `#1a5c3a` | `#2ea86a` | `#f1f6f2` | `#3ab87a` | `#5ed096` |
| `rosa` | Rosa | `#7a3050` | `#c86890` | `#f8f2f4` | `#c87898` | `#e098b0` |
| `grafito` | Grafito | `#27272a` | `#52525b` | `#f3f4f5` | `#a0a8b4` | `#c0c8d4` |
| `arena` | Arena | `#6a4c2e` | `#c49060` | `#f6f3ee` | `#c49060` | `#dab07a` |

**Observación importante sobre el modo oscuro:** En todos los temas oscuros el sidebar cambia a usar el color de acento como `--ds-primary` (el sidebar, que siempre usa `bg-[var(--ds-primary)]`, pasa de un tono oscuro a un tono vibrante). Esto puede generar un efecto visual inesperado.

### Biblioteca de íconos

**Lucide React** — se usa exclusivamente en todo el dashboard del especialista. No hay otros sistemas de íconos. Los íconos tienen tamaños estándar: `w-4 h-4` (nav e interfaces), `w-5 h-5` (alertas), `w-6 h-6` (StatCard), `w-8 h-8` (empty states), `w-3 h-3` (badges y chips pequeños).

---

## 4. Inventario de componentes

### Sidebar
- **Archivo:** `src/components/layout/Sidebar.tsx`
- **Estructura:** Logo-brandmark + nav scrollable + footer con usuario e íconos
- **Ancho fijo:** `w-64` (256px)
- **Fondo:** `bg-[var(--ds-primary)]` — el sidebar *siempre* es del color primario
- **Item activo:** borde izquierdo `bg-[var(--ds-accent)]` h-5 w-0.5 + texto/ícono `text-[var(--ds-accent)]` + fondo `bg-[var(--ds-primary-fg)]/10`
- **Item inactivo:** `text-[var(--ds-primary-fg)]/50` + hover `bg-[var(--ds-primary-fg)]/6`
- **Responsive:** drawer con overlay negro en móvil; `md:static` en desktop
- **Problema:** No existe separación visual entre grupos de navegación (ej. gestión clínica vs. configuración)

### Header (móvil)
- **Solo visible en móvil** (`md:hidden`)
- Altura: `h-14`, fondo `bg-[var(--ds-surface)]`
- Contiene: botón hamburguesa + logo DS + label "Panel dental"
- **No existe header en desktop** — las páginas empiezan directamente con el contenido bajo el sidebar

### Hero del dashboard
- `bg-[var(--ds-primary)]`, `rounded-2xl`, `p-6`
- Grid decorativo de fondo con `opacity-[0.04]` usando `--color-accent`
- Texto blanco con jerarquía: etiqueta accent > H1 > subtitle > fecha
- Área de acciones: badge de plan + botón "Nueva cita"
- **Único lugar del dashboard donde hay un fondo de color primario como contenido** (no sidebar)

### Cards de métricas (StatCard)
- **Archivo:** `src/components/ui/StatCard.tsx`
- Estructura: icono cuadrado (12×12) + texto vertical (label, valor, sub)
- Fondo: `bg-[var(--ds-surface)]`, borde `border-[var(--ds-border)]`, `rounded-2xl`
- El ícono usa opacidad 12% del color semántico como fondo: `bg-[var(--ds-accent)]/12`, `bg-[var(--ds-success)]/12`, etc.
- **Solo 6 variantes de color:** blue, teal, green, amber, red, purple
- **Reutilizado en:** dashboard home, ingresos

### Cards de información general
- Patrón inline (sin componente extraído): `bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl p-5 shadow-sm`
- Usado en: ficha de cliente, detalle de cita, configuración (`SectionCard`), planes, seguimientos
- `SectionCard` en configuración agrega título uppercase tracking-wide

### Formularios
- **Input estándar:**
  ```
  w-full border border-[var(--ds-border)] rounded-xl px-3 py-2.5 text-sm
  text-[var(--ds-text)] bg-[var(--ds-bg)]
  placeholder:text-[var(--ds-text-muted)]/40
  focus:outline-none focus:ring-2 focus:ring-[var(--ds-ring)]/40 focus:border-[var(--ds-ring)]
  ```
- **Label estándar:** `text-xs font-semibold text-[var(--ds-text-muted)] uppercase tracking-wide block mb-1.5`
- **Errores:** texto `text-red-500 text-xs mt-1` (hardcoded, no usa `--ds-error`)
- **Select:** mismas clases que input, sin flecha personalizada
- **Textarea:** `resize-none` + mismas clases
- **Problemas:**
  - Los colores de error están hardcoded en `text-red-500` y `border-red-300`, no usan `--ds-error`
  - No existe estado `:disabled` explícito más allá de `disabled:opacity-40 disabled:cursor-not-allowed`
  - Algunos formularios usan `bg-[var(--ds-bg)]` y otros `bg-[var(--ds-surface)]` para el fondo del input — inconsistente

### Botones

No existe un sistema de botón centralizado. Los botones se definen inline en cada página:

| Variante | Clases observadas | Dónde |
|---|---|---|
| **Primario CTA** | `bg-[var(--ds-primary)] text-white px-4 py-2 rounded-xl text-sm font-bold` | Toda la interfaz |
| **Secundario outline** | `border border-[var(--ds-border)] text-[var(--ds-text-muted)] px-3 py-2 rounded-xl text-sm font-medium hover:bg-[var(--ds-bg)]` | Toda la interfaz |
| **Primario pequeño** | `text-xs text-[var(--ds-primary)] border border-[var(--ds-border)] px-3 py-1.5 rounded-lg` | Fichas, acciones secundarias |
| **Danger** | `text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50` | Eliminar (hardcoded, no usa `--ds-error`) |
| **Success inline** | `text-[var(--ds-success)] border border-[var(--ds-success)]/30 px-3 py-1.5 rounded-lg` | Completar seguimiento |
| **Destructivo de citas** | `bg-red-100 text-red-700 hover:bg-red-200` | ActionButton de citas (hardcoded) |
| **Acciones de citas** | Color semántico hardcoded en ActionButton | `bg-green-100`, `bg-teal-100`, `bg-orange-100`, `bg-gray-100`, `bg-blue-100`, `bg-purple-100`, `bg-yellow-100` |
| **Hover de primario** | `hover:bg-[var(--ds-primary)]` — sin cambio visible | Problema generalizado |
| **Upgrade** | `from-violet-600 to-indigo-600` | Bloque de upgrade — hardcoded, no usa sistema de tokens |

**Problema crítico:** `hover:bg-[var(--ds-primary)]` en el botón primario no cambia nada (mismo color) → sin retroalimentación visual al hover.

### Tabs

Patrón estándar en dos variantes:

**Variante A — Pestañas en pill horizontal:**
```
flex gap-1 bg-[var(--ds-bg)] p-1 rounded-xl border border-[var(--ds-border)]
```
- Activo: `bg-[var(--ds-surface-elevated)] shadow-sm text-[var(--ds-primary)]`
- Inactivo: `text-[var(--ds-text-muted)] hover:text-[var(--ds-text)]`
- Usado en: ficha de cliente (`pacientes/[id]`), algunas sub-secciones

**Variante B — Pestañas en barra scrollable (configuración):**
```
flex gap-1 bg-[var(--ds-bg)] border border-[var(--ds-border)] rounded-2xl p-1 overflow-x-auto
```
- Activo: `bg-[var(--ds-surface)] shadow-sm text-[var(--ds-primary)] border border-[var(--ds-border)]`
- Inactivo: `text-[var(--ds-text-muted)] hover:text-[var(--ds-text)] hover:bg-white/60`
- Usado en: configuración, detalle de cita

**Variante C — Filtros como pill-buttons (chips):**
```
text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors
```
- Activo: `bg-[var(--ds-primary)] text-white border-[var(--ds-primary)]`
- Inactivo: `border-[var(--ds-border)] text-[var(--ds-text-muted)] hover:bg-[var(--ds-bg)]`
- Usado en: planes (filtro de estado), seguimientos, archivos (filtro de categoría)

### Tablas

Patrón consistente:
```html
<div class="bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full text-sm min-w-[600px]">
      <thead class="bg-[var(--ds-bg)] text-xs text-[var(--ds-text-muted)] uppercase tracking-wide border-b border-[var(--ds-border)]">
      <tbody class="divide-y divide-[var(--ds-border)]">
        <tr class="hover:bg-[var(--ds-bg)] transition-colors">
```
- Usado en: dashboard (citas recientes), ingresos, citas (detalle)
- Las listas tipo "tabla sin `<table>`" usan `divide-y divide-[var(--ds-border)]` y `flex items-center gap-4 px-5 py-4 hover:bg-[var(--ds-bg)]`

### Modales

**Modal centrado** (NewClientModal):
- Overlay: `fixed inset-0 bg-black/40 backdrop-blur-sm`
- Contenedor: `relative w-full max-w-md bg-[var(--ds-surface-elevated)] rounded-2xl shadow-2xl overflow-hidden`
- Estructura: Header + Contenido + Footer con botones Cancel/Save
- Estado éxito: overlay interno con icono y mensaje + auto-cierre 1.2s

**Drawer lateral derecho** (NewAppointmentModal, ServiceForm):
- Panel deslizable desde la derecha
- `fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--ds-surface-elevated)]`
- Overlay oscuro a la izquierda

**No existe sistema Toast/Snackbar** — la retroalimentación de éxito usa estados inline con `CheckCircle2` y texto visible temporalmente.

### Estados vacíos

Patrón consistente en todas las secciones:
```html
<div class="py-16 text-center text-[var(--ds-text-muted)]">
  <Icon class="w-8 h-8 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
  <p class="font-semibold text-sm">Mensaje de estado vacío.</p>
  <button>Acción primaria</button>  <!-- cuando aplica -->
</div>
```
Mensajes definidos: "Aún no tienes clientes registrados.", "No hay planes de atención.", "No tienes pagos registrados.", "No hay seguimientos pendientes.", "Este cliente todavía no tiene fotos o archivos."

### Badges y estados

**Badges de estado de cita** (de `constants.ts`):
- pending: `bg-yellow-100 text-yellow-700`
- confirmed: `bg-green-100 text-green-700`
- rejected: `bg-red-100 text-red-600`
- rescheduled: `bg-purple-100 text-purple-700`
- completed: `bg-teal-100 text-teal-700`
- cancelled: `bg-red-50 text-red-500`
- no_show: `bg-gray-100 text-gray-500`

**Todos estos colores son hardcoded** — no usan variables `--ds-*` y no se adaptan al tema ni al modo oscuro.

**Badges de pago:**
- unpaid: `bg-red-100 text-red-600`
- paid: `bg-[var(--ds-success)]/15 text-[var(--ds-success)]` ✓ usa tokens
- partial: `bg-yellow-100 text-yellow-700` — hardcoded
- courtesy: `bg-purple-100 text-purple-700` — hardcoded

**Badges de planes, seguimientos y pagos de clientes** (los nuevos de `clientData.ts`): **sí usan `--ds-*` tokens** correctamente.

### Avisos y alertas

Patrón de alerta inline (ej. aviso de privacidad en historial clínico):
```
flex items-start gap-3 bg-[var(--ds-warning)]/10 border border-[var(--ds-warning)]/30 rounded-2xl p-4 text-sm text-[var(--ds-warning)]
```

Insight mensual:
```
bg-[var(--ds-surface-muted)]/50 border border-[var(--color-accent)]/30 rounded-2xl p-4
```
Mezcla de `--ds-*` y `--color-*` en la misma regla — inconsistente.

### SetupChecklist
- Card elevada con barra de progreso `h-2` en `--ds-accent`
- Ítems incompletos: `Circle` icon + texto muted + link aparece en hover
- Ítems completos: `CheckCircle2` accent + texto con line-through + opacidad 50%
- Se oculta automáticamente al llegar al 100%
- **Usa `--color-border` para el track de la barra** en lugar de `--ds-border` — inconsistente

---

## 5. Problemas visuales actuales

### Modo oscuro

**Problema crítico — el sidebar en modo oscuro:**
En todos los temas oscuros, `--ds-primary` cambia a un color vibrante (ej. teal, azul, verde, rosa). El sidebar usa `bg-[var(--ds-primary)]` como fondo, lo que causa que en modo oscuro el sidebar aparezca de un color saturado en lugar de oscuro. Esto rompe la expectativa del modo oscuro y genera un contraste inconsistente.

**Colores hardcoded que no responden al modo oscuro:**
- Todos los badges de estado de cita: `bg-yellow-100`, `bg-green-100`, `bg-red-100`, etc.
- Badges de pago parcial y cortesía
- Botones de acción en citas: `bg-green-100`, `bg-red-100`, etc.
- Colores de prioridad de seguimientos (solo los heredados del sistema viejo): `bg-amber-50 text-amber-700`, `bg-green-50 text-green-700`
- Colores de error en formularios: `text-red-500`, `border-red-300`
- Bloque de upgrade: `from-violet-600 to-indigo-600`

**Contraste potencial en modo oscuro:**
- `--ds-text-muted` a opacidades bajas (`/40`, `/30`, `/50`) puede caer muy por debajo de WCAG AA en fondos oscuros
- Placeholder con `placeholder:text-[var(--ds-text-muted)]/40` — mínimamente legible incluso en claro, invisible en oscuro

### Consistencia

**Inconsistencias de token:**
- `--color-border` vs `--ds-border` usados intercambiablemente (SetupChecklist, alertas insight)
- `--color-accent` vs `--ds-accent` mezclados
- `--color-primary-dark` referenciado en algunos botones del hero (legado)
- El `bg-[var(--ds-surface-muted)]/50` en el insight mensual aplica opacidad sobre una variable — resultado dependiente del fondo subyacente

**Inconsistencias de estilo de botón:**
- El hover del botón primario (`hover:bg-[var(--ds-primary)]`) es el mismo color — no hay retroalimentación
- Tres sistemas paralelos de color: tokens `--ds-*`, Tailwind hardcoded, y alias `--color-*`
- La "acción peligrosa" (eliminar) usa `text-red-500` / `border-red-200` en unos lugares y `bg-red-100 text-red-700` en otros

**Componentes que parecen de sistemas distintos:**
- Los ActionButtons de citas (Tailwind hardcoded) vs los status badges de planes (tokens semánticos)
- El bloque de upgrade con gradiente `violet-indigo` es visualmente ajeno al resto del dashboard
- El StatCard usa `rounded-2xl` con `p-5` pero los valores custom del dashboard como "Origen" y "Servicios top" usan el mismo contenedor pero sin el componente StatCard — duplicación de estilos

### Jerarquía visual

- La página del dashboard tiene **demasiada información de igual peso** — el hero, el checklist, las métricas de hoy, las métricas del mes, y las citas recientes compiten visualmente
- El `SectionLabel` (texto xs uppercase) separa secciones pero es de peso muy bajo para el volumen de contenido que introduce
- En páginas como Clientes, Planes, Pagos: el header de página (H1 + descripción) y los controles (búsqueda + botones) están en la misma fila horizontal, lo que puede estrecharse en pantallas medianas

### Formularios largos

- La ficha de cliente (`pacientes/[id]`) tiene formularios inline dentro de pestañas que crecen indefinidamente sin paginación ni secciones colapsables
- La página de Configuración tiene **15 pestañas** — la barra de tabs requiere scroll horizontal que no es visible ni indicado
- Los formularios de creación de planes y pagos son formularios largos dentro de la misma página (no modal) sin separación visual clara entre campos

### Espaciado y responsive

- En móvil el header tiene solo `h-14` con el sidebar como drawer. No hay breakpoints intermedios (`sm`, `md`) consistentes en todas las páginas
- Las grillas de métricas `grid-cols-2 lg:grid-cols-4` saltan de 2 a 4 columnas sin estado intermedio de 3 columnas
- El sidebar de Configuración (15 pestañas) en desktop puede desbordar visualmente si el usuario tiene fuente grande
- La tabla de detalle (`min-w-[600px]`) fuerza scroll horizontal en móvil sin indicación visual

### Estados de interacción

**Hover:**
- Botón primario: sin cambio visible (`hover:bg-[var(--ds-primary)]`)
- Links de navegación del sidebar: cambio de opacidad (sutil pero funcional)
- Filas de lista: `hover:bg-[var(--ds-bg)]` ✓ funciona bien

**Focus:**
- `focus:ring-2 focus:ring-[var(--ds-ring)]/40` — correcto pero la opacidad 40% puede ser insuficiente en algunos temas
- Los botones no tienen `focus-visible` explícito — dependen del outline del navegador

**Disabled:**
- `disabled:opacity-40 disabled:cursor-not-allowed` — estándar pero sin indicación adicional del porqué está deshabilitado

---

## 6. Funcionalidad que no debe romperse

### Interacciones críticas

1. **Cambio de tema:** El selector de tema en Configuración → Apariencia llama a `setDashboardTheme()` y el layout.tsx aplica inmediatamente los colores via `applyDashboardColors()`. Cualquier cambio de color debe seguir usando `--ds-*` variables para que esto funcione.

2. **Sidebar activo:** La función `isActive(href, exact?)` usa `pathname.startsWith(href)` — el estado activo depende de la URL exacta. No alterar las rutas.

3. **SetupChecklist:** Se oculta automáticamente al 100% de configuración. Depende de `getSetupChecklistStatus()` sobre el contexto de clínica, servicios y calendario.

4. **Botones de estado de citas:** Los ActionButtons de citas son functions con color semántico según la acción — tocar las clases puede romper el significado semántico.

5. **Formularios con botón Guardar explícito:** Cada formulario (configuración, cliente, plan, pago, seguimiento, archivo) tiene su botón Guardar. No convertir a auto-save. No usar Enter para guardar salvo donde ya funciona.

6. **Modal NewClientModal:** Validación inline de nombre y teléfono, estado de éxito de 1.2s, y cierre automático. No eliminar el estado `done`.

7. **Drawer NewAppointmentModal:** Drawer desde la derecha con scroll interno. La estructura de secciones (paciente, cita, notas) tiene validación por campo. No alterar la secuencia.

8. **Tabs de paciente/[id]:** Las 6 pestañas contienen formularios con estado local. El estado no persiste entre pestañas — esto es intencional.

9. **Tema oscuro / claro / sistema:** El modo "system" escucha `prefers-color-scheme` en tiempo real con un event listener. El cambio de modo no debe requerir recarga.

10. **Persistencia en localStorage:** El contexto `ClientDataContext` guarda en `template-a2-client-data-v1` automáticamente en cada mutación. No afectar el ciclo de vida del contexto.

11. **Exportación CSV/JSON:** Las funciones de export usan `URL.createObjectURL` + click simulado. Funcionan en el browser; no requieren backend.

12. **Citas no crean clientes automáticamente:** El `NewClientModal` es la única vía de alta manual. No agregar hooks que creen clientes desde citas.

### Comportamientos que conservar

- El sidebar en mobile es un drawer con overlay — el botón hamburguesa lo abre, el overlay lo cierra
- El hero del dashboard tiene un grid decorativo con `opacity-[0.04]` — efecto sutil intencional
- Los estados vacíos tienen mensajes específicos en español — conservar el copy
- Las etiquetas de formulario en UPPERCASE tracking-wide son intencionales (jerarquía visual)
- El `backdrop-blur-sm` en el overlay del modal centrado es intencional

---

## 7. Límites del rediseño

### Puede cambiar (visual únicamente)

- ✅ Estilos del sidebar (espaciado, bordes, tipografía, separadores entre grupos de nav)
- ✅ Estilos del header móvil
- ✅ Estilo del hero del dashboard (puede cambiar layout, tipografía, separación de elementos)
- ✅ Componente StatCard (tamaño del ícono, tipografía del valor, padding)
- ✅ Estilo de cards (radio, sombra, padding — manteniendo `--ds-*` tokens)
- ✅ Estilo de inputs, labels, selects (conservando clases `focus:ring-*` funcionales)
- ✅ Sistema de botones (puede extraerse a componente con hover/focus correctos)
- ✅ Estilo de tabs (las tres variantes pueden unificarse)
- ✅ Estilo de badges (pueden migrar a usar `--ds-*` tokens en lugar de Tailwind hardcoded)
- ✅ Estilo de tablas (cabecera, hover, padding)
- ✅ Estilo de modales (padding, sombra, radio)
- ✅ Estado de éxito de formularios (puede cambiar a toast si se mantiene la funcionalidad)
- ✅ Estados vacíos (ícono más grande, copy opcional en distinto peso)
- ✅ Espaciado entre secciones del dashboard home
- ✅ `SectionLabel` puede tener más peso visual
- ✅ Los temas oscuros pueden mejorar el `--ds-primary` del sidebar (ej. usar `--ds-bg` o un dark específico)
- ✅ Separadores / grupos en sidebar
- ✅ Tipografía — puede introducirse `Space Grotesk` en H1s y valores de StatCard
- ✅ El bloque de upgrade puede adoptar los tokens del sistema en lugar del gradiente hardcoded

### No puede cambiar (funcional)

- ❌ Rutas de navegación
- ❌ Props y API de componentes de datos
- ❌ Nombres de variables `--ds-*` (son los que usa layout.tsx para inyectar el tema)
- ❌ Los 6 temas predefinidos (puede mejorar sus colores pero no eliminarlos)
- ❌ Modo claro / oscuro / sistema (el selector de 3 estados debe persistir)
- ❌ Estructuras de formulario (campos, orden, validaciones)
- ❌ Botón Guardar en cada sección de configuración
- ❌ Lógica de cierre del modal de cliente (estado done + 1.2s)
- ❌ Estructura de tabs en ficha de cliente (las 6 pestañas con su contenido)
- ❌ Lógica de persistencia en localStorage
- ❌ Exportaciones CSV/JSON
- ❌ Comportamiento del sidebar activo
- ❌ Comportamiento del SetupChecklist (ocultarse a 100%)
- ❌ El sidebar tiene `w-64` fijo — puede cambiar a `w-60` o `w-72` pero no a sidebar colapsable sin refactorizar el layout

---

## 8. Capturas recomendadas

Para que Claude Design pueda ver el estado visual real del sistema, se recomienda capturar las siguientes rutas con el servidor en ejecución (`npm run dev`):

### Pantallas esenciales

| # | URL | Propósito |
|---|---|---|
| 1 | `/dashboard` | Hero, StatCards, SetupChecklist, tabla reciente |
| 2 | `/dashboard/citas` | Listado con filtros, badges de estado, ActionButtons |
| 3 | `/dashboard/pacientes` | Listado con tags, búsqueda, columnas enriquecidas |
| 4 | `/dashboard/pacientes/[id]` (tab Resumen) | Ficha cliente — datos, tags, stats |
| 5 | `/dashboard/pacientes/[id]` (tab Historial clínico) | Aviso de privacidad, ficha médica, notas |
| 6 | `/dashboard/pacientes/[id]` (tab Planes) | Formulario de plan inline, items de servicio |
| 7 | `/dashboard/pacientes/[id]` (tab Pagos) | Resumen pagado/pendiente, lista de pagos |
| 8 | `/dashboard/pacientes/[id]` (tab Seguimientos) | Follow-up cards con prioridad |
| 9 | `/dashboard/pacientes/[id]` (tab Fotos y archivos) | Grid de archivos con filtros de categoría |
| 10 | `/dashboard/planes` | Lista de planes con filtros de estado |
| 11 | `/dashboard/pagos` | Resumen + filtros + tabla de pagos |
| 12 | `/dashboard/seguimientos` | Vista agrupada: Vencidos / Hoy / Próximos / Completados |
| 13 | `/dashboard/ingresos` | StatCards + tabla de detalle |
| 14 | `/dashboard/servicios` | Lista de servicios en tabla |
| 15 | `/dashboard/calendario` | Mini calendario + agenda diaria |
| 16 | `/dashboard/configuracion` (tab General) | Formulario de configuración con SaveRow |
| 17 | `/dashboard/configuracion` (tab Apariencia) | Selector de tema y modo oscuro |
| 18 | `/dashboard/configuracion` (tab Datos y respaldo) | Botones de exportación |
| 19 | `/dashboard/reportes` | Gate premium visible |
| 20 | `/dashboard/atencion` | Página de soporte |

### Variaciones de entorno

| # | Condición | Propósito |
|---|---|---|
| A | Tema **Marfil claro** (default) | Estado base del sistema |
| B | Tema **Marfil oscuro** | Problemas de sidebar y badges hardcoded |
| C | Tema **Grafito oscuro** | El tema más monocromático en oscuro |
| D | Tema **Rosa claro** | Verificar contraste en paleta cálida |
| E | Viewport móvil ~390px | Header móvil, sidebar drawer, grillas de 2 col |
| F | Modal "Nuevo cliente" abierto | Overlay, formulario, botones |
| G | Drawer "Nueva cita" abierto | Panel lateral con secciones |
| H | Estado vacío en Planes | Sin planes registrados |
| I | Estado vacío en Seguimientos | Sin seguimientos |

---

## 9. Resumen listo para otra IA

---

### CONTEXTO PARA CLAUDE DESIGN

**Proyecto:** Template A2 — Dashboard privado del especialista médico/wellness  
**Stack:** Next.js 16 (App Router) · React · Tailwind CSS v4 · Lucide React · TypeScript

---

**QUÉ ES ESTE SISTEMA**

Un dashboard privado para especialistas de salud y bienestar (dentistas, médicos, fisioterapeutas, psicólogos, nutriólogos, veterinarios, estética). Permite gestionar citas, clientes, planes de tratamiento, pagos, seguimientos y configuración. Debe sentirse premium, profesional y sobrio — no como CRM genérico.

**SISTEMA DE TEMAS**

- 15 variables CSS `--ds-*` controlan todos los colores del dashboard
- Layout.tsx las inyecta en JS al montar y al cambiar tema
- 6 temas predefinidos × 2 modos (claro / oscuro) = 12 configuraciones
- El especialista solo puede elegir tema y modo — sin colores libres
- El sidebar siempre usa `bg-[var(--ds-primary)]` como fondo

**ARCHIVOS CLAVE**

```
src/app/(especialista)/dashboard/layout.tsx   → shell, inyección de tokens CSS
src/components/layout/Sidebar.tsx             → navegación (w-64)
src/lib/dashboardThemes.ts                    → 6 presets × 2 modos, 15 tokens c/u
src/app/globals.css                           → fallbacks CSS, tipografías, scrollbar
src/components/ui/StatCard.tsx                → único componente UI central reutilizado
```

**PROBLEMAS PRIORITARIOS**

1. **Modo oscuro roto:** `--ds-primary` en oscuro es el acento (ej. teal `#3fb8a8`), y el sidebar usa ese color como fondo → sidebar vibrante en oscuro
2. **Badges hardcoded:** Todos los badges de estado de cita y pago usan Tailwind hardcoded (`bg-yellow-100 text-yellow-700`) — no responden al modo oscuro ni al tema
3. **Hover del botón primario:** `hover:bg-[var(--ds-primary)]` = sin cambio — botón sin retroalimentación
4. **Tres sistemas de color paralelos:** `--ds-*` (tokens), `--color-*` (alias heredados), Tailwind hardcoded — sin jerarquía clara
5. **Formularios de error en rojo hardcoded:** `text-red-500 / border-red-300` en lugar de `--ds-error`
6. **Configuración con 15 tabs:** overflow horizontal sin indicación visual en desktop
7. **Dashboard home demasiado denso:** hero + checklist + métricas hoy + métricas mes + tabla reciente + upgrade — todo con igual peso visual
8. **Tipografía subutilizada:** Space Grotesk y IBM Plex Mono declarados pero no usados en el dashboard

**PATRONES FRECUENTES**

```css
/* Card estándar */
bg-[var(--ds-surface)] border border-[var(--ds-border)] rounded-2xl shadow-sm

/* Input estándar */
border border-[var(--ds-border)] rounded-xl px-3 py-2.5 text-sm bg-[var(--ds-bg)]
focus:ring-2 focus:ring-[var(--ds-ring)]/40 focus:border-[var(--ds-ring)]

/* Label estándar */
text-xs font-semibold text-[var(--ds-text-muted)] uppercase tracking-wide

/* Botón primario (con problema de hover) */
bg-[var(--ds-primary)] text-white px-4 py-2 rounded-xl text-sm font-bold
hover:bg-[var(--ds-primary)]  ← sin cambio

/* Botón secundario */
border border-[var(--ds-border)] text-[var(--ds-text-muted)] rounded-xl hover:bg-[var(--ds-bg)]

/* Fila de lista */
flex items-center gap-4 px-5 py-4 hover:bg-[var(--ds-bg)] divide-y divide-[var(--ds-border)]

/* Empty state */
py-16 text-center text-[var(--ds-text-muted)]
Icon w-8 h-8 opacity-30 + p text-sm font-semibold + button acción
```

**LO QUE PUEDE CAMBIAR**

Estilos de sidebar, header móvil, StatCard, cards, inputs, botones (con sistema centralizado), badges (migrar a `--ds-*`), tabs (unificar las 3 variantes), tablas, modales, estados vacíos, espaciado, tipografía, hover/focus/disabled en todos los interactivos, agrupación del sidebar, ajuste de tokens oscuros para sidebar, el bloque de upgrade.

**LO QUE NO PUEDE CAMBIAR**

Rutas, props de componentes de datos, nombres de variables `--ds-*`, los 6 temas predefinidos, los 3 modos (claro/oscuro/sistema), estructura de formularios y campos, botón Guardar en formularios, lógica de modales, pestañas de ficha de cliente, persistencia localStorage, exportaciones.

**ÍCONOS**

Solo Lucide React. Tamaños: `w-3 h-3` (micro), `w-4 h-4` (estándar), `w-5 h-5` (alertas), `w-6 h-6` (StatCard), `w-8 h-8` (empty states).

**RESTRICCIONES DE TEMA**

- Máximo 6 temas predefinidos
- Solo claro / oscuro / sistema como modos
- Sin inputs de color libre (HEX, RGB, picker)
- Paletas públicas (de los templates de clientes) son independientes del tema del dashboard
- El especialista elige el tema en Configuración → Apariencia

---

*Documento generado por revisión directa del código fuente. Estado: post-implementación de módulos Clientes, Planes, Pagos, Seguimientos, Fotos y archivos, y Exportación.*
