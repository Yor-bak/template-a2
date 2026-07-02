---
name: responsive-ui
description: >
  Guía de diseño responsive para J2EC. Actívate automáticamente al modificar
  layouts, grids, tablas, modales, sidebars, formularios o cualquier componente
  que afecte cómo se ve la interfaz en diferentes tamaños de pantalla. Define
  breakpoints, prioridades de contenido, reglas para tablas y sidebars, y
  áreas táctiles. No autoriza cambiar contenido, flujos ni lógica funcional.
---

# Responsive UI — J2EC

## Breakpoints Tailwind (heredados del framework)

```
sm:  640px  — móvil grande / tablet pequeña
md:  768px  — tablet
lg:  1024px — laptop
xl:  1280px — escritorio
2xl: 1536px — pantalla amplia
```

El Admin está diseñado principalmente para escritorio (`lg+`).
El dashboard y el portal trabajador deben funcionar en tablet y móvil.
La página pública debe funcionar perfectamente en móvil.

---

## Prioridades de contenido en pantallas pequeñas

### Conservar primero (nunca ocultar)
1. Identificador de la entidad (nombre, número, ID)
2. Estado (activo, pendiente, vencido...)
3. Monto o dato numérico crítico
4. Acción principal disponible

### Ocultar primero en móvil
1. Metadatos secundarios (fechas de creación, IDs internos)
2. Textos auxiliares o de ayuda
3. Columnas de tabla con información redundante
4. Descripciones largas

---

## Admin — Reglas responsive

El Admin es una herramienta de escritorio. Sin embargo:

### Layout principal
- Sidebar: no existe (Admin usa tabs/header en `admin/page.tsx`)
- Drawers laterales: deben funcionar en `md` con ancho máximo controlado
- En móvil: drawers a ancho completo (`w-full`) o casi completo (`max-w-full`)

### Tablas en Admin
```tsx
<div className="overflow-x-auto">
  <table className="w-full min-w-[640px]">
    ...
  </table>
</div>
```
- Siempre envolver en `overflow-x-auto`
- Definir `min-w-` para evitar compresión de columnas críticas
- En móvil aceptar scroll horizontal **controlado** (no accidental)
- Las columnas de acciones al final, nunca cortadas

### Grid de métricas Admin
```tsx
className="grid grid-cols-2 md:grid-cols-3 gap-3"
```
- 2 columnas en móvil, 3+ en desktop
- Cards de métricas nunca a una sola columna (pierden comparabilidad)

### Modales / formularios en drawers Admin
- Ancho máximo `max-w-[440px]` en desktop
- En móvil: `w-full` sin máximo, con `max-h-[90vh]` y scroll interno
- Botones en footer: `flex gap-2`, nunca `grid` fijo que rompa en móvil

---

## Dashboard especialista — Reglas responsive

### Sidebar
Ya implementada: drawer en móvil con overlay y botón X.
Verificar que el botón de hamburger sea visible y táctil (≥ 44px).

### Tablas del dashboard
Misma regla: `overflow-x-auto` + `min-w-[...]`
En móvil, priorizar: nombre del paciente, estado, fecha, acción.

### Cards de estadísticas
```tsx
className="grid grid-cols-2 sm:grid-cols-4 gap-4"
```
- 2 columnas en móvil, 4 en desktop

### Modales del dashboard
- Ancho: `max-w-md` o `max-w-lg`
- Altura: `max-h-[90vh] overflow-y-auto`
- En móvil: considerar `w-full sm:w-auto`

### Formularios
- Campos largos: `w-full` siempre
- Grids de formulario: `grid-cols-1 sm:grid-cols-2`
- Nunca forzar dos columnas en móvil (400px por columna mínimo)

---

## Portal trabajador — Reglas responsive

Diseñado primariamente para móvil (trabajadores usan teléfono).

### Layout
- Sin sidebar, solo header fijo con tabs de navegación
- Contenido en columna única
- Máximo ancho: `max-w-lg mx-auto` en desktop

### Áreas táctiles
- Botones y elementos interactivos: mínimo `44px × 44px` de área táctil efectiva
- Links de lista: `py-3` mínimo
- Checkbox/toggle: área extendida con `label` clickeable

### Tablas
Preferir listas en tarjeta en lugar de tablas en móvil.
Si hay tabla, scroll horizontal controlado.

---

## Página pública — Reglas responsive

Cada template tiene su responsive propio. Reglas generales:

- El booking form funciona en móvil sin scroll horizontal.
- La navbar colapsa en móvil (menú hamburger).
- Las imágenes del hero: `object-cover w-full h-[...]`
- Las cards de servicios: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`

---

## Reglas globales

### Nunca permitido
- Scroll horizontal accidental (sin razón): usar `overflow-x-hidden` en el layout root si es necesario
- Botones cortados por el borde de pantalla
- Modales fuera de pantalla en cualquier tamaño
- Texto que desborde su contenedor sin `truncate` o `break-words`
- Inputs más anchos que la pantalla en móvil

### Siempre requerido
- `overflow-x-auto` en todos los contenedores de tablas
- `w-full` en todos los inputs de formulario
- `min-w-0` en elementos `flex` con texto que puede truncarse
- `flex-wrap` en grupos de botones que puedan desbordar
- `flex-col sm:flex-row` en headers con acciones cuando hay riesgo de overflow

---

## Checklist antes de entregar cambios responsive

- [ ] ¿Revisado en 375px (iPhone SE)?
- [ ] ¿Revisado en 768px (tablet)?
- [ ] ¿Revisado en 1280px (desktop estándar)?
- [ ] ¿No hay scroll horizontal accidental?
- [ ] ¿Las acciones principales son accesibles en móvil?
- [ ] ¿Los modales no se salen de pantalla?
- [ ] ¿Las tablas tienen `overflow-x-auto`?
- [ ] ¿Las áreas táctiles miden al menos 44px?
- [ ] ¿Los grids colapsan correctamente?
- [ ] ¿El texto no desborda sin truncado?

---

## No autorizado por esta skill

- Cambiar columnas ni datos de tablas para resolver responsive.
- Cambiar flujos, navegación o comportamiento funcional.
- Crear vistas alternativas para móvil (páginas nuevas).
- Ocultar acciones que son necesarias operativamente.
- Modificar lógica, stores, contextos, validaciones o datos.
