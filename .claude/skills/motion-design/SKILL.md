---
name: motion-design
description: >
  Guía de animaciones y microinteracciones para J2EC. Actívate automáticamente
  cuando se agreguen, modifiquen o revisen animaciones, transiciones, efectos
  hover o cualquier movimiento visual. Define duraciones, propiedades seguras,
  animaciones permitidas y prohibidas, y requiere soporte para
  prefers-reduced-motion. No autoriza instalar librerías nuevas. No autoriza
  modificar lógica, estados, flujos ni datos.
---

# Motion Design — J2EC

## Principio fundamental

> Las animaciones en J2EC son funcionales, no decorativas.
> Deben ser **rápidas**, **discretas** y **consistentes**.
> Si una animación no confirma una acción, indica carga o guía la atención, no existe.

---

## Librería disponible

**No hay librería de animación instalada** (no Framer Motion, no GSAP, no React Spring).

Usa únicamente:
- Clases de transición de **Tailwind CSS 4** (`transition-*`, `duration-*`, `ease-*`)
- Animaciones CSS (`@keyframes` en `globals.css`)
- Propiedad CSS `animation` vía clase Tailwind

**Prohibido**: instalar Framer Motion, GSAP, AutoAnimate o cualquier librería de animación si no existe ya en `package.json`.

---

## Duraciones de referencia

| Tipo de interacción | Duración |
|---|---|
| Hover de botones y microinteracciones | 120–180 ms |
| Dropdowns y tooltips | 140–200 ms |
| Modales y paneles laterales (drawers) | 180–240 ms |
| Tabs y cambios de sección | 160–220 ms |
| Transición de página completa | máximo 250 ms |
| Spinners de carga | continuo (`animate-spin`) |

**Clases Tailwind de referencia**:
```
duration-150   → 150 ms  (microinteracciones)
duration-200   → 200 ms  (dropdowns, tooltips)
duration-300   → 300 ms  (drawers, modales — divide por configuración si Tailwind lo soporta)
```

Nota: La clase `.reveal` existente en `globals.css` usa `0.7s` — **demasiado lenta** para UI operativa. Úsala solo en la página pública. Para el Admin y dashboard, usa duraciones más cortas.

---

## Propiedades seguras para animar

Anima preferentemente estas propiedades (no provocan reflow de layout):

```
opacity
transform (translate, scale, rotate)
background-color
border-color
color
box-shadow
```

**Evita animar**:
```
width
height
top / left / bottom / right
margin
padding
max-height (salvo en acordeones controlados)
```

Animar `width/height/margin/padding` provoca reflow y jank visual.
Usa `opacity + transform` como alternativa en casi todos los casos.

---

## Animaciones permitidas

### Entradas de modales y drawers
```css
/* Drawer lateral */
transform: translateX(100%) → translateX(0)
opacity: 0 → 1
duration: 200–240ms, ease-out
```

```css
/* Modal centrado */
opacity: 0 + scale(0.97) → opacity 1 + scale(1)
duration: 180–220ms, ease-out
```

### Apertura de dropdowns / tooltips
```css
opacity: 0 + translateY(-4px) → opacity 1 + translateY(0)
duration: 140–200ms, ease-out
```

### Hover de botones
Tailwind: `transition-colors duration-150` — solo color y borde, sin transform.

### Hover de filas de tabla
`transition-colors duration-150` — solo fondo, nunca mover la fila.

### Transición entre tabs / secciones
`opacity: 0 → 1` en el contenido entrante, `duration-160` a `duration-200`.
No animar la posición del tab selector (solo `transition-colors`).

### Spinners de carga
`animate-spin` de Tailwind (existente en el proyecto). No agregar más variantes.

### Feedback al guardar / confirmar
Estado de botón `loading`: texto cambia + spinner inline. Sin animación de layout.

### Expansión de secciones acordeón
`max-height` con `overflow-hidden` si es absolutamente necesario. Preferir `opacity + display` con `hidden` class toggle.

### Indicador activo en sidebar
`transition-all duration-150` en el marcador de posición activa. Ya implementado.

---

## Animaciones prohibidas

- **Rebotes** (`ease-bounce`, `cubic-bezier` con overshoot): innecesarios en herramienta operativa.
- **Zoom/scale excesivo** (> 1.05): llamativo y distractor.
- **Cards flotando**: sin `translateY` continuo ni `hover:-translate-y-2` agresivo.
- **Entradas escalonadas largas** (stagger > 3 elementos o delay acumulado > 200ms).
- **Movimiento decorativo permanente**: nada que se mueva en idle.
- **Animar todas las filas de una tabla** simultáneamente al cargar.
- **Parallax** de ningún tipo.
- **Efectos tipo landing page**: fade-in elaborado, reveal con scroll, etc. — solo en página pública si el template lo requiere.
- **Animaciones que bloqueen la interacción**: nunca más de 300ms antes de que el usuario pueda actuar.
- **`transition: all`** — demasiado amplio, puede provocar transiciones en propiedades no deseadas. Usa `transition-colors`, `transition-opacity`, `transition-transform` por separado.

---

## Prefers-reduced-motion — obligatorio

Toda animación no esencial **debe respetar** la preferencia del sistema:

```css
@media (prefers-reduced-motion: reduce) {
  /* Eliminar o reducir a cero las transiciones no esenciales */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

O en Tailwind con la variante `motion-reduce`:
```
motion-reduce:transition-none
motion-reduce:animate-none
```

**Qué mantener incluso con reduced-motion**:
- Spinners de carga (feedback funcional — reducir velocidad, no eliminar)
- Cambios de color en hover (no son movimiento)
- Cambios de estado de checkbox/switch (feedback funcional)
- Foco visible

**Qué eliminar con reduced-motion**:
- Entradas de modales con `transform`
- Transiciones de page/tab con `opacity`
- Cualquier `translateX/Y` de entrada

---

## Animaciones existentes en el proyecto

| Clase/animación | Dónde | Duración | Estado |
|---|---|---|---|
| `transition-colors` | Botones, links, inputs | Tailwind default ~150ms | ✅ correcto |
| `transition-all` | Algunos elementos | Tailwind default ~150ms | ⚠️ demasiado amplio |
| `animate-spin` | Spinners de carga | continuo | ✅ correcto |
| `.reveal` (globals.css) | Página pública | 0.7s ease-out | ⚠️ lenta para Admin/dashboard |
| `transition-transform duration-300` | Sidebar móvil | 300ms | ✅ aceptable para drawer |

---

## Checklist antes de agregar una animación

- [ ] ¿La animación tiene función? (confirmar, cargar, guiar)
- [ ] ¿Dura menos de 250ms en el caso de UI operativa?
- [ ] ¿Solo anima `opacity` y/o `transform`?
- [ ] ¿Respeta `prefers-reduced-motion`?
- [ ] ¿No bloquea la interacción del usuario?
- [ ] ¿No usa rebotes ni efectos de landing page?
- [ ] ¿Es consistente con otras animaciones del mismo tipo en el producto?
- [ ] ¿No requiere una librería nueva?

---

## No autorizado por esta skill

- Modificar lógica de negocio, flujos, estados, props funcionales.
- Instalar librerías de animación no presentes en `package.json`.
- Animar en respuesta a cambios de datos (ej. actualizar balance) sin autorización.
- Cambiar la estructura JSX funcional para implementar una animación.
