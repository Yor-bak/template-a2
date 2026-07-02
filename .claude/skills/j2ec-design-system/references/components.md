# Componentes — Inventario J2EC

Clasificados como: ✅ existente reutilizable | ⚠️ deuda detectada | ❌ faltante

---

## Componentes shared (`src/components/`)

### Button
- **Ruta**: `src/components/ui/Button.tsx`
- **Variantes**: `primary | secondary | outline | ghost | danger | whatsapp`
- **Tamaños**: `sm | md | lg`
- **Usado en**: dashboard especialista, página pública
- **Estado**: ✅ existente | ⚠️ usa colores hardcoded (`sky-600`, `teal-600`) no tokens `--ds-*`
- **No usar en**: Admin (admin usa el sistema `S` de `adminUi.tsx`)

### Badge
- **Ruta**: `src/components/ui/Badge.tsx`
- **Variantes**: ninguna — solo envuelve children con clase base `rounded-full px-2.5 py-0.5 text-xs`
- **Estado**: ✅ existente | ⚠️ sin variantes de color, muy básico
- **Nota**: No confundir con `BadgeEl` del Admin

### Card / CardHeader / CardBody
- **Ruta**: `src/components/ui/Card.tsx`
- **Estado**: ✅ existente | ⚠️ usa `bg-white` hardcoded; no se adapta a paleta
- **Usado en**: dashboard (algunos lugares)
- **No usar en**: Admin, worker

### StatCard
- **Ruta**: `src/components/ui/StatCard.tsx`
- **Colores disponibles**: `blue | green | amber | red | purple | teal`
- **Estado**: ✅ existente y bien implementado — usa tokens `--ds-*`
- **Usado en**: `dashboard/page.tsx`, `dashboard/ingresos/page.tsx`
- **Reutilizar en**: cualquier pantalla del dashboard con métricas resumen

### EmptyState ⚠️ DUPLICADO
- **Ruta 1**: `src/components/shared/EmptyState.tsx`
- **Ruta 2**: `src/components/feedback/EmptyState.tsx`
- **Estado**: ⚠️ Ambos son idénticos — deuda de consolidación
- **Props**: `icon: LucideIcon, title: string, description?: string`
- **Reutilizar**: Usar cualquiera de las dos rutas de forma consistente por módulo
- **Acción recomendada**: Consolidar en una sola ubicación en tarea futura (sin cambiar API)

### Sidebar (especialista)
- **Ruta**: `src/components/layout/Sidebar.tsx`
- **Estado**: ✅ bien implementado con tokens `--ds-sidebar-*`
- **Responsive**: drawer en móvil con overlay y botón X

### Navbar (pública)
- **Ruta**: `src/components/layout/Navbar.tsx`
- **Estado**: ✅

### Footer (pública)
- **Ruta**: `src/components/layout/Footer.tsx`

---

## Sistema Admin — `adminUi.tsx`

**Ruta**: `src/modules/admin/components/adminUi.tsx`

Este archivo es la fuente única de estilos para el Admin. Contiene:

### Objeto `S` — clases de string para componentes
```ts
S.input         // campo de texto
S.select        // selector
S.label         // etiqueta de campo
S.card          // contenedor card
S.badge         // base de badge
S.section       // título de sección (SectionTitle)
S.btnPrimary    // acción principal
S.btnSecondary  // acción secundaria
S.btnRose       // acción terciaria neutra
S.btnDanger     // acción destructiva
S.btnGhost      // acción de tabla/terciaria
S.btnGreen      // confirmación positiva
S.btnAccent     // pagar/confirmar (amber outlined)
```

### Componentes JSX exportados
| Componente | Descripción |
|---|---|
| `BadgeEl` | Badge con meta `{label, cls}` |
| `PlanBadge` | Badge de plan (usa `PLAN_META`) |
| `AccessBadge` | Badge activo/bloqueado |
| `SectionTitle` | Título de sección estilo `10px uppercase` |
| `Divider` | Línea divisoria `0.5px border` |
| `DRow` | Fila de dato clave/valor |
| `Th` | Encabezado de columna de tabla |
| `fmtDate` | Formateador de fecha `dd MMM yyyy` |
| `fmtDateTime` | Formateador fecha+hora |

### Mapas de estado (META)
| Mapa | Estados cubiertos |
|---|---|
| `PAYMENT_STATUS_META` | paid, unpaid, pending, grace_period, overdue, cancelled |
| `CLIENT_STATUS_META` | active, suspended, cancelled |
| `MONTHLY_STATUS_META` | paid, unpaid, pending, overdue |
| `ONBOARDING_META` | not_started, in_progress, ready |
| `PAGE_META` | published, hidden |
| `PLAN_META` | standard, cowork, intelligence |
| `COMMISSION_META` | waiting_first_monthly_payment, pending, authorized, paid, cancelled |
| `TRANSFER_STATUS_META` | pending, pending_activation, activation_error, verified, rejected, refunded |
| `TRANSFER_TYPE_META` | opening, monthly, unidentified |
| `CONTRACT_DOC_META` | pending_signature, signed, expired, cancelled |

---

## Componentes del Dashboard Especialista

Mayoría son inline en los `page.tsx` correspondientes. Componentes propios:

| Componente | Ruta | Descripción |
|---|---|---|
| `SourceBadge` | `src/components/dashboard/SourceBadge.tsx` | Badge de origen de cita (⚠️ usa clases light hardcoded) |
| `NewAppointmentModal` | `src/components/dashboard/NewAppointmentModal.tsx` | Modal nueva cita |
| `ServiceForm` | `src/components/dashboard/ServiceForm.tsx` | Formulario de servicio |
| `SetupChecklist` | `src/components/dashboard/SetupChecklist.tsx` | Checklist de configuración |
| `WeeklyEditor` | `src/components/calendar/WeeklyEditor.tsx` | Editor horario semanal |
| `BlockTimeModal` | `src/components/calendar/BlockTimeModal.tsx` | Modal bloqueo de tiempo |
| `CloseDayModal` | `src/components/calendar/CloseDayModal.tsx` | Modal cerrar día |
| `PublicDatePicker` | `src/components/calendar/PublicDatePicker.tsx` | Selector de fecha pública |
| `PublicTimeSlotPicker` | `src/components/calendar/PublicTimeSlotPicker.tsx` | Selector de hora |
| `ThemePaletteSelector` | `src/components/theme/ThemePaletteSelector.tsx` | Selector de paleta |

---

## Componentes del Portal Trabajador

Todos inline en `src/app/trabajador/page.tsx`. Sin componentes extraídos propios.
- Usa tokens `--ds-*` para colores
- Tabs mediante estado local (`TabId`)
- Badges via `color-mix(in srgb, ...)` con tokens semánticos

---

## Componentes de Página Pública

| Componente | Ruta |
|---|---|
| `SectionTitle` | `src/components/public/SectionTitle.tsx` |
| `ServiceCard` | `src/components/public/ServiceCard.tsx` |
| `WhatsAppCTA` | `src/components/public/WhatsAppCTA.tsx` |

Templates en `src/templates/{especialidad}/Template0{1,2,3}.tsx`.

---

## Deudas visuales detectadas (no corregir sin tarea específica)

| Deuda | Impacto | Archivo(s) |
|---|---|---|
| Dos `EmptyState` idénticos | Consistencia | `src/components/shared/` y `src/components/feedback/` |
| `Button.tsx` colores hardcoded | Theming | `src/components/ui/Button.tsx` |
| `Card.tsx` fondo blanco fijo | Theming | `src/components/ui/Card.tsx` |
| Admin inputs sin `focus:ring` | Accesibilidad | `adminUi.tsx` |
| Worker portal sin componentes propios | Mantenibilidad | `src/app/trabajador/page.tsx` |
| Dashboard: muchas clases inline repetidas de botones | Consistencia | varios `page.tsx` en dashboard |
| `USER_STATUS_CLS` usa `bg-green-100`/`bg-red-100` (light) en Admin oscuro | **Crítico visual** | `src/app/(admin)/admin/page.tsx:488-493` |
| `PermissionMatrix` usa `bg-blue-50`/`bg-green-50`/`bg-red-50` en Admin oscuro | **Crítico visual** | `src/app/(admin)/admin/page.tsx:555-558` |
| Badge "cambiar pwd" usa `bg-yellow-100 text-yellow-700` en Admin oscuro | **Crítico visual** | `src/app/(admin)/admin/page.tsx:869` |
| `SourceBadge` usa `bg-blue-50`/`bg-gray-100`/`bg-violet-50` (light) | Contexto de uso acotado | `src/components/dashboard/SourceBadge.tsx` |
| Ícono `<Eye>` en botón "Editar" de AdminUsersView — semánticamente incorrecto | Accesibilidad | `src/app/(admin)/admin/page.tsx:901` |
