---
name: component-consistency
description: >
  Guía de consistencia de componentes visuales para J2EC. Actívate
  automáticamente cada vez que Claude modifique, cree o revise componentes
  visuales. Obliga a buscar primero un componente existente antes de crear uno
  nuevo, a reutilizar variantes, a no copiar clases entre módulos, y a
  mantener coherencia visual entre Admin, dashboard del especialista, portal
  del trabajador y página pública. No autoriza consolidar componentes si cambia
  su API funcional o comportamiento. No modifica lógica, props funcionales ni
  handlers.
---

# Component Consistency — J2EC

## Regla principal

> **Antes de crear un componente visual nuevo, busca uno existente.**
> Si existe uno equivalente, reutilízalo o extiéndelo.
> Si creas uno nuevo, documenta por qué no era posible reutilizar uno existente.

---

## Inventario de búsqueda obligatoria

Antes de crear cualquier elemento de estos tipos, busca en esta lista:

| Componente | Dónde buscar primero |
|---|---|
| **Button** | `src/components/ui/Button.tsx` (dashboard/público) · Objeto `S` en `adminUi.tsx` (Admin) |
| **Card** | `src/components/ui/Card.tsx` (dashboard) · Patrón inline de Admin (`bg-[var(--bg-surface)] rounded-xl border-[0.5px]...`) |
| **Badge** | `BadgeEl` + META maps en `adminUi.tsx` (Admin) · `src/components/ui/Badge.tsx` (básico) |
| **StatusBadge** | `BadgeEl` con `PAYMENT_STATUS_META`, `CLIENT_STATUS_META`, `COMMISSION_META`, etc. en `adminUi.tsx` |
| **StatCard** | `src/components/ui/StatCard.tsx` — solo para dashboard |
| **Input** | `S.input` en `adminUi.tsx` (Admin) · Inline con tokens `--ds-*` (dashboard) |
| **Select** | `S.select` en `adminUi.tsx` (Admin) · `<select>` nativo con tokens (dashboard) |
| **Label** | `S.label` en `adminUi.tsx` |
| **EmptyState** | `src/components/shared/EmptyState.tsx` OR `src/components/feedback/EmptyState.tsx` (idénticos) |
| **SectionTitle** | `SectionTitle` de `adminUi.tsx` (Admin) |
| **Divider** | `Divider` de `adminUi.tsx` (Admin) |
| **Table header** | `Th` de `adminUi.tsx` (Admin) |
| **Modal/Dialog** | Patrón de drawer/modal existente en el módulo correspondiente |
| **Spinner** | `animate-spin` de Tailwind (ya implementado en múltiples lugares) |
| **Sidebar** | `src/components/layout/Sidebar.tsx` (solo dashboard) |
| **Tabs** | Patrón de estado local + `className` condicional (existente en Admin y dashboard) |

---

## Reglas de reutilización

### Regla 1: Reutiliza el componente existente
Si el componente existe y cumple la función visual, úsalo sin modificar su API.

```tsx
// ✅ Correcto — reutilizar BadgeEl existente:
<BadgeEl meta={COMMISSION_META[commission.status]} />

// ❌ Incorrecto — crear badge ad-hoc para el mismo propósito:
<span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
  Pendiente
</span>
```

### Regla 2: Reutiliza la variante existente
Si el componente tiene variantes, usa la que corresponde.

```tsx
// ✅ Correcto — variante ghost para acción de tabla:
<button className={S.btnGhost} onClick={...}>Ver</button>

// ❌ Incorrecto — crear clase ad-hoc para el mismo caso:
<button className="px-3 py-1 text-xs border rounded text-gray-500" onClick={...}>Ver</button>
```

### Regla 3: No copies clases entre módulos
Si necesitas el mismo patrón en otro módulo, crea un componente compartido o usa el existente.

```tsx
// ❌ Incorrecto — copiar string de clases a otro archivo:
// En archivo A:
const rowStyle = "flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-surface)]"
// En archivo B (copia exacta):
const rowStyle = "flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-surface)]"

// ✅ Correcto — extraer a una constante compartida o componente
```

### Regla 4: Documenta nuevos componentes
Si creas un componente nuevo, el commit/PR debe explicar por qué ningún componente existente era reutilizable.

### Regla 5: No consolides si cambia la API
Si consolidar dos componentes requeriría cambiar sus props, handlers o comportamiento funcional, **no consolides** — solo documenta la deuda.

---

## Comparación entre paneles

El objetivo es que los tres paneles se sientan como el mismo producto, sin ser idénticos.

### Lo que debe ser consistente entre paneles
- Uso de iconos de la misma librería (`lucide-react`)
- Semántica de estados (activo = positivo, cancelado = negativo, pendiente = neutro)
- Patrones de formulario (label encima, error debajo, help text en gris)
- Patrones de tabla (encabezado gris/muted, hover sutil, acciones al final)
- Patrones de empty state (`EmptyState` con icono y texto)
- Spinners de carga (`animate-spin`)
- Mensaje de error en formulario (texto rojo bajo el campo)

### Lo que puede diferir entre paneles
- Colores y tokens (cada panel tiene su propio contexto visual)
- Densidad (Admin más compacto que dashboard, worker más espacioso)
- Sistema de botones (`S.*` en Admin vs `Button.tsx` en dashboard)
- Sidebar vs. no-sidebar
- Tamaño y estilo de cards

---

## Deudas de consistencia detectadas (no corregir sin tarea específica)

| Deuda | Descripción | Archivos |
|---|---|---|
| Dos `EmptyState` idénticos | Duplicado exacto | `src/components/shared/EmptyState.tsx` y `src/components/feedback/EmptyState.tsx` |
| `Button.tsx` con colores hardcoded | No usa tokens `--ds-*`, no se adapta a paleta | `src/components/ui/Button.tsx` |
| `Card.tsx` con fondo blanco fijo | No usa `--ds-surface` | `src/components/ui/Card.tsx` |
| Dashboard usa clases inline de botones | Muchos `page.tsx` repiten las mismas clases de botón | `dashboard/*.page.tsx` |
| Worker portal sin componentes propios | Todo inline en un archivo largo | `src/app/trabajador/page.tsx` |
| Admin inputs sin `focus:ring` | Foco solo por borde de color | `adminUi.tsx` |
| Dos patrones distintos de tabs | Admin usa string classes, dashboard usa Badge-style pills | Varios |

---

## Checklist antes de crear un componente nuevo

- [ ] ¿Busqué en `src/components/ui/`?
- [ ] ¿Busqué en `src/modules/admin/components/adminUi.tsx`?
- [ ] ¿Busqué en el módulo actual (especialista, trabajador)?
- [ ] ¿El componente existente cumple la función visual aunque el nombre sea diferente?
- [ ] ¿Puedo extender el componente existente con una prop nueva sin cambiar su comportamiento?
- [ ] ¿Documenté por qué no pude reutilizar uno existente?
- [ ] ¿El nuevo componente sigue los tokens del contexto correcto (`--bg-*` para Admin, `--ds-*` para dashboard)?
- [ ] ¿El nuevo componente funciona en todos los tamaños de pantalla relevantes?
- [ ] ¿El nuevo componente tiene foco visible?

---

## No autorizado por esta skill

- Modificar props funcionales (`onClick`, `onChange`, handlers) al consolidar.
- Cambiar comportamiento de componentes al refactorizar.
- Eliminar componentes que tengan usuarios activos sin migración completa.
- Modificar lógica de negocio, stores, contextos, validaciones, estados o datos.
- Instalar librerías de componentes (shadcn/ui, Radix, Headless UI) si no están ya instaladas.
