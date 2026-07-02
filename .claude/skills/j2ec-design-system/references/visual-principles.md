# Principios Visuales — J2EC

Estas reglas aplican a los tres paneles y a la página pública, con diferencias de densidad.

---

## Carácter del producto

J2EC es una plataforma SaaS para especialistas de salud. Su interfaz debe transmitir:

- **Confianza profesional**: sin elementos llamativos, sin colores saturados sin función.
- **Eficiencia operativa**: el Admin y el dashboard son herramientas de trabajo, no landing pages.
- **Claridad**: cada pantalla tiene una acción principal evidente.
- **Sobriedad**: menos es más. Cada elemento visual debe tener una razón de estar.

---

## Jerarquía visual por pantalla

Toda pantalla debe seguir este orden de lectura:

```
1. Título de sección / panel
2. Descripción breve — solo si aporta, nunca texto decorativo
3. Acción principal (un solo botón primario)
4. Métricas o resumen — cuando existan
5. Filtros o búsqueda
6. Contenido principal (tabla, lista, cards)
7. Acciones secundarias
8. Información poco frecuente o técnica al final
```

**Reglas absolutas**:
- Un solo botón primario por vista.
- Acciones secundarias con menor énfasis visual.
- Acciones destructivas separadas, en rojo `--danger` / `--ds-error`.
- No usar rojo para estados normales ni informativos.
- No usar dorado/accent para más de un tipo de acción por vista.

---

## Densidad por panel

### Admin — Alta densidad (herramienta operativa)
- Filas de tabla compactas (`py-3`)
- Cards con padding contenido (`px-4 py-3`)
- Fuentes pequeñas permitidas hasta `text-[10px]` en metadatos
- Drawers laterales en lugar de páginas completas

### Dashboard especialista — Densidad media
- Cards más espaciadas (`p-5` o `p-6`)
- Texto más legible en pantallas de trabajo diario
- Modales centrados, no drawers

### Portal trabajador — Densidad media-baja
- Vista orientada a móvil
- Áreas táctiles generosas (mínimo 44px de altura efectiva)
- Información bien espaciada

### Página pública — Espaciado generoso
- Cada template mantiene su identidad propia
- No homogenizar entre templates

---

## Uso del color

### Regla semántica de color

| Color | Significado | Cuándo usar |
|---|---|---|
| **Dorado** `--accent` | Positivo / principal | Estado activo, pagado, acción principal Admin |
| **Teal** `--ds-accent` | Interactivo / principal | Acciones principales en dashboard |
| **Rojo** `--danger` / `--ds-error` | Destructivo / error | Errores, acciones irreversibles, estado cancelado/vencido |
| **Amber** `--ds-warning` | Atención / advertencia | Pagos pendientes, estados de alerta |
| **Verde** `--ds-success` | Confirmación positiva | Pagos confirmados, tareas completadas |
| **Gris muted** | Inactivo / secundario | Información de apoyo, estados neutros |

### Prohibido
- Usar rojo para información neutral (no es error ni acción destructiva).
- Inventar nuevos amarillos, grises o rojos fuera de los tokens.
- Usar color como único medio para comunicar un estado (siempre acompañar con texto).

---

## Borders y sombras

**Admin**: solo `border-[0.5px]` — bordes muy sutiles. Evitar `border-2` o bordes gruesos.
**Dashboard**: `border border-[var(--ds-border)]` — un pixel neutro.
**Sombras**: `shadow-sm` máximo en cards del dashboard. Admin sin sombras (contexto oscuro).

**Regla**: Agrupa con espacio, no con bordes. Si no hay razón para el borde, elimínalo.

---

## Iconos

Librería única: `lucide-react` (instalada).
- Tamaño estándar en Admin: `w-4 h-4`
- Tamaño estándar en dashboard: `w-5 h-5`
- `strokeWidth={1.5}` para iconos decorativos/empty states
- Botones de solo icono **deben** tener `aria-label`

---

## Tablas

- Encabezados: `10px uppercase tracking-wide text-muted` — nunca del mismo peso que datos.
- Datos: `text-sm text-primary` para información principal, `text-xs text-muted` para secundarios.
- Hover de fila: `transition-colors` sutil, no resaltar agresivamente.
- Acciones en fila: agrupadas al final, botones ghost pequeños.
- Estado vacío: `EmptyState` con icono y texto descriptivo.

---

## Formularios

- Campos obligatorios: marcados visualmente (asterisco o texto en etiqueta).
- Grupos de campos: separados por espacio o `Divider`, no por cards adicionales.
- Errores: texto rojo bajo el campo, nunca solo borde rojo.
- Campos deshabilitados: `opacity-50` o `cursor-not-allowed`.
- Etiquetas: siempre encima del input, nunca como placeholder sustituto.

---

## Animaciones y movimiento

Ver skill `motion-design` para instrucciones detalladas.

Principio: **Las animaciones son funcionales, no decorativas.**
- Confirman una acción.
- Indican carga.
- Guían la atención.
- Nunca son el foco de la experiencia.

---

## Accesibilidad como principio visual

- Foco visible en todos los elementos interactivos.
- Contraste mínimo WCAG AA (4.5:1 texto / 3:1 componentes UI).
- Nunca comunicar estado solo por color.
- Botones de icono con `aria-label`.
- Ver skill `accessibility-ui` para checklist completo.

---

## Lo que diferencia Admin, dashboard y página pública

| Aspecto | Admin | Dashboard | Público |
|---|---|---|---|
| Tema | Oscuro fijo | Claro configurable | Por template |
| Densidad | Alta | Media | Baja/generosa |
| Botones | Sistema `S` de adminUi | `Button.tsx` + inline | Inline por template |
| Sidebar | No existe (tabs en header) | Sidebar colapsable | Navbar pública |
| Cards | Poco padding, muchas filas | Más espacio, menos filas | Por template |
| Tipografía dominante | Datos/mono | Inter legible | Por template |

Los tres deben sentirse como partes del mismo producto, no como proyectos distintos, pero tampoco deben ser visualmente idénticos.
