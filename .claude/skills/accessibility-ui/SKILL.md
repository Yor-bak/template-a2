---
name: accessibility-ui
description: >
  Checklist y guía de accesibilidad visual para J2EC. Actívate automáticamente
  en cualquier trabajo visual o interactivo: botones, formularios, modales,
  tablas, badges, tabs, dropdowns, carga de archivos, estados. Revisa
  contraste, foco, navegación por teclado, labels, aria-label, reduced-motion
  y comunicación de estados sin depender únicamente del color. No modifica
  lógica de permisos, validaciones funcionales ni comportamiento de negocio.
---

# Accessibility UI — J2EC

## Regla absoluta

> **Nunca comunicar un estado únicamente mediante color.**
> Todo estado (activo, pendiente, error, bloqueado) debe tener texto o icono comprensible además del color.

---

## Contraste mínimo (WCAG AA)

| Tipo | Ratio mínimo |
|---|---|
| Texto normal (< 18px / < 14px bold) | 4.5:1 |
| Texto grande (≥ 18px / ≥ 14px bold) | 3:1 |
| Componentes UI (bordes, iconos) | 3:1 |
| Texto deshabilitado | sin requisito |

### Verificar especialmente en Admin (tema oscuro):
- `--text-muted: #9a9ca3` sobre `--bg-surface: #1a1b1f` — ⚠️ verificar ratio
- `--text-primary: #f5f0e8` sobre `--bg-base: #0f0e17` — generalmente ✅ alto contraste
- Badges gris `B_MUTED`: texto `#9a9ca3` sobre `#24262b` — ⚠️ puede ser borderline

### Verificar en dashboard (tema claro variable):
- `--ds-text-muted` sobre `--ds-surface` en cada paleta activa
- Badges en tablas con fondo claro

---

## Foco visible — obligatorio en todos los elementos interactivos

### Problema conocido en Admin
`src/modules/admin/components/adminUi.tsx` usa `focus:outline-none` en inputs y selects sin proporcionar un foco visible alternativo. Esto es una deuda de accesibilidad.

**Solución recomendada para inputs Admin**:
```css
focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:ring-offset-0
```
O alternativamente:
```css
focus:border-[var(--accent)]  /* ya existe — borde visible como indicador de foco */
```

El borde de color puede servir como indicador de foco si el contraste es suficiente (3:1).

### Foco en botones Admin (`S.btn*`)
Los botones usan `bg-transparent` en variantes ghost/rose. Verificar que el foco sea visible:
```css
focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-base)]
```

### Foco en dashboard (`Button.tsx`)
`Button.tsx` ya tiene `focus:outline-none focus:ring-2 focus:ring-offset-2` — ✅ correcto.

### Foco en sidebar
Sidebar ya tiene estilos de hover; verificar que también respondan a `focus-visible`.

**Regla**: No eliminar `outline` sin proporcionar un foco visible alternativo (`ring`, `border` con contraste suficiente, o `outline` personalizado).

---

## Labels y formularios

### Reglas
- Cada `<input>`, `<select>`, `<textarea>` **debe tener** un `<label>` asociado o `aria-label`.
- No usar `placeholder` como sustituto del label (desaparece al escribir).
- Labels siempre **encima** del input, nunca solo como placeholder.

### Verificar en Admin
```tsx
// ✅ Correcto:
<label className={S.label}>Nombre del campo</label>
<input className={S.input} />

// ❌ Sin label — corrección necesaria:
<input className={S.input} placeholder="Nombre" />
```

### Inputs de búsqueda sin label visible
```tsx
<input
  aria-label="Buscar clientes"
  placeholder="Buscar..."
  className={S.input}
/>
```

---

## Botones de solo icono

Todo botón que contenga únicamente un icono (sin texto visible) **debe** tener `aria-label`:

```tsx
// ✅ Correcto:
<button aria-label="Cerrar modal" onClick={onClose}>
  <X className="w-4 h-4" />
</button>

// ❌ Sin aria-label — lector de pantalla no sabe qué hace:
<button onClick={onClose}>
  <X className="w-4 h-4" />
</button>
```

Instancias conocidas que requieren revisión:
- Botón de cierre X en drawers Admin
- Botón hamburger en dashboard (ya tiene `aria-label` implícito por contexto — verificar)
- Botones de acción en filas de tabla (ej. editar, eliminar)

---

## Comunicación de estados

### Regla: estado = texto + color (nunca solo color)

| Estado | Componente | Verificación |
|---|---|---|
| Activo / Inactivo | `AccessBadge` | ✅ tiene texto "Activo" / "Bloqueado" |
| Pendiente / Pagado | `BadgeEl` + META | ✅ tiene texto |
| Error en formulario | inline | ¿tiene texto de error además del borde rojo? |
| Campo deshabilitado | `disabled` attr | ¿tiene `opacity-50` + `cursor-not-allowed`? |
| Cargando | spinner | ¿tiene texto o `aria-busy="true"`? |

---

## Modales y drawers

### Requisitos de accesibilidad
```tsx
// Overlay debe cerrar con Escape
// Foco debe moverse al modal al abrirse
// Foco debe regresar al elemento disparador al cerrarse

<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Título del modal</h2>
  ...
</div>
```

Verificar que:
- [ ] Los drawers/modales del Admin usen `role="dialog"` o equivalente
- [ ] El botón X sea el primer elemento focuseable del modal
- [ ] Pressing `Escape` cierre el modal
- [ ] El overlay con `onClick={onClose}` también tenga `role="presentation"` o similar

---

## Tabs

```tsx
<div role="tablist">
  <button
    role="tab"
    aria-selected={activeTab === "resumen"}
    aria-controls="panel-resumen"
    id="tab-resumen"
  >
    Resumen
  </button>
</div>
<div
  role="tabpanel"
  id="panel-resumen"
  aria-labelledby="tab-resumen"
>
  ...
</div>
```

Los tabs del Admin actualmente no usan `role="tab"` — deuda de accesibilidad documentada.

---

## Dropdowns y selects

- `<select>` nativo: accesible por defecto. Preferir sobre dropdowns custom.
- Dropdown custom: necesita `role="listbox"`, `aria-expanded`, `aria-activedescendant`.
- El dropdown del Admin en TransfersView y otros: verificar si es `<select>` nativo o custom.

---

## Carga de archivos

```tsx
<label htmlFor="pdf-upload" className="...">
  Seleccionar PDF
</label>
<input
  id="pdf-upload"
  type="file"
  accept="application/pdf"
  className="sr-only"  // o className="hidden"
  aria-label="Cargar contrato en PDF, máximo 15 MB"
/>
```

El `ContractsTab.tsx` ya tiene un patrón correcto con `ref` y botón que dispara el click. Verificar que el input tenga descripción accesible.

---

## Estados disabled

```tsx
// ✅ Correcto — disabled funcional + visual:
<button
  disabled={isLocked}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
  Pagar
</button>

// Para inputs:
<input
  disabled={!!isLocked}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
/>
```

---

## Reduced motion

Ver skill `motion-design` para la implementación completa.

Resumen para accesibilidad:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

O en Tailwind: `motion-reduce:transition-none motion-reduce:animate-none`

---

## Checklist de accesibilidad por componente

### Botones
- [ ] Texto visible O `aria-label`
- [ ] Foco visible (`focus-visible:ring-*`)
- [ ] Estado `disabled` con `opacity-50 cursor-not-allowed`
- [ ] Acción destructiva separada y confirmada

### Inputs
- [ ] `<label>` asociado o `aria-label`
- [ ] Foco visible
- [ ] Mensaje de error con texto (no solo borde rojo)
- [ ] Placeholder no es el único label

### Tablas
- [ ] `<th scope="col">` en encabezados
- [ ] Estado vacío con mensaje informativo

### Modales
- [ ] `role="dialog" aria-modal="true" aria-labelledby`
- [ ] Foco va al modal al abrir
- [ ] `Escape` cierra el modal
- [ ] Botón X tiene `aria-label="Cerrar"`

### Badges de estado
- [ ] Texto incluido (no solo color)
- [ ] Contraste ≥ 3:1 entre texto y fondo del badge

---

## No autorizado por esta skill

- Modificar lógica de permisos o autenticación.
- Cambiar validaciones funcionales de formularios.
- Modificar flujos de negocio (orden de pasos, condiciones de activación).
- Cambiar textos de estado si tienen implicación funcional.
- Agregar nuevas reglas de negocio para mejorar la experiencia.
