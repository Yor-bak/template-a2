---
name: browser-visual-review
description: >
  Revisión visual final del producto J2EC en el navegador. Skill manual — se
  invoca explícitamente con /browser-visual-review. Levanta el servidor de
  desarrollo, recorre las rutas afectadas, revisa consola, temas, responsive,
  modales, formularios, animaciones, foco y accesibilidad. Genera un reporte.
  No modifica código automáticamente a menos que el usuario lo autorice
  explícitamente. No instala herramientas nuevas.
disable-model-invocation: true
---

# Browser Visual Review — J2EC

## Modo de uso

```
/browser-visual-review                        — revisión completa
/browser-visual-review src/app/(admin)/       — solo Admin
/browser-visual-review [lista de rutas]       — rutas específicas
```

---

## Paso 1 — Levantar el servidor

```bash
npm run dev
```

El servidor corre en `http://localhost:3000` (o el puerto configurado por defecto en Next.js).
**No cambiar puertos ni configuración**.

Si el servidor ya está corriendo, omitir este paso.

---

## Paso 2 — Rutas a recorrer

### Admin
```
/login                     — login administrativo
/admin                     — dashboard Admin completo
```
En Admin, verificar manualmente cada tab:
- Clientes
- Preclientes
- Transferencias
- Vendedores / Comisiones
- Finanzas
- Usuarios
- Configuración

### Dashboard especialista
```
/login                     — login del especialista (misma ruta /login)
/dashboard
/dashboard/citas
/dashboard/calendario
/dashboard/pacientes
/dashboard/pagos
/dashboard/equipo
/dashboard/servicios
/dashboard/ingresos
/dashboard/configuracion
/dashboard/planes
/dashboard/reportes
/dashboard/atencion
```

### Portal trabajador
```
/trabajador/login
/trabajador
```

### Página pública
```
/                          — o template activo según configuración
/servicios
/agendar
/ubicacion
/preguntas-frecuentes
```

---

## Paso 3 — Qué revisar en cada ruta

### Jerarquía y consistencia
- [ ] ¿Existe una acción principal clara y única?
- [ ] ¿Los títulos tienen tamaño y peso correcto?
- [ ] ¿El texto secundario es visualmente subordinado?
- [ ] ¿Los badges y estados son consistentes con el sistema?

### Alineación y espaciado
- [ ] ¿Los elementos están alineados en el eje correcto?
- [ ] ¿El espaciado entre secciones es consistente?
- [ ] ¿Hay elementos que se ven "flotando" sin agrupación clara?

### Botones y acciones
- [ ] ¿Solo un botón primario por vista?
- [ ] ¿Las acciones destructivas están en rojo y separadas?
- [ ] ¿Los botones tienen hover visible?
- [ ] ¿Los botones deshabilitados se ven deshabilitados?

### Tablas
- [ ] ¿Los encabezados son visualmente distintos de los datos?
- [ ] ¿El hover de fila es sutil?
- [ ] ¿Las acciones de fila están bien agrupadas?
- [ ] ¿El estado vacío existe y tiene mensaje?

### Formularios
- [ ] ¿Los labels están encima de los inputs?
- [ ] ¿Los errores tienen texto (no solo borde rojo)?
- [ ] ¿Los campos deshabilitados se ven inactivos?

### Modales y drawers
- [ ] ¿El modal/drawer tiene encabezado con botón X?
- [ ] ¿El scroll interno funciona cuando hay mucho contenido?
- [ ] ¿Los botones del footer son correctos?

### Estados vacíos
- [ ] ¿Todas las tablas y listas tienen EmptyState?
- [ ] ¿El EmptyState tiene icono + texto descriptivo?

---

## Paso 4 — Revisión de consola

Abrir DevTools → Console.

- [ ] ¿Hay errores de React (`Cannot read property...`, `key` warnings)?
- [ ] ¿Hay advertencias de hidratación (`Text content does not match`)?
- [ ] ¿Hay errores de tipado en runtime?
- [ ] ¿Hay errores de 404 en assets?

Reportar sin corregir si el error es funcional.

---

## Paso 5 — Revisión de temas

### Admin
El Admin tiene un solo tema oscuro fijo ("Midnight Ink"). No hay light/dark toggle.

### Dashboard especialista
El dashboard tiene paletas configurables. Verificar en al menos 2:
- `dental_premium` (default, teal)
- `beige_boutique` (cálido)

Navegar a `/dashboard/configuracion` → sección de personalización → cambiar paleta.

Verificar:
- [ ] ¿Cambia correctamente sin romper layout?
- [ ] ¿Los textos mantienen contraste suficiente en cada paleta?
- [ ] ¿Los badges mantienen legibilidad?

---

## Paso 6 — Revisión responsive

Usar DevTools → Device toolbar (Cmd+Shift+M en Chrome).

Tamaños a verificar:
- 375px — iPhone SE (móvil pequeño)
- 768px — tablet
- 1280px — desktop estándar

Por cada tamaño verificar:
- [ ] ¿No hay scroll horizontal accidental?
- [ ] ¿Las acciones principales son visibles?
- [ ] ¿Los modales se ven correctamente?
- [ ] ¿Las tablas tienen scroll horizontal controlado?
- [ ] ¿Los botones no están cortados?
- [ ] ¿El sidebar del dashboard funciona como drawer en móvil?

---

## Paso 7 — Revisión de animaciones

- [ ] ¿Las transiciones de hover son suaves y rápidas (< 200ms)?
- [ ] ¿Los spinners de carga aparecen en los lugares correctos?
- [ ] ¿Hay animaciones innecesariamente lentas?
- [ ] ¿Hay rebotes o efectos excesivos?

Activar `prefers-reduced-motion` en DevTools:
Chrome: DevTools → Rendering → Emulate CSS media features → `prefers-reduced-motion: reduce`

- [ ] ¿Desaparecen las transiciones no esenciales?
- [ ] ¿Los spinners siguen funcionando (feedback necesario)?
- [ ] ¿Los cambios de color en hover siguen siendo visibles?

---

## Paso 8 — Revisión de foco y teclado

Navegar con Tab por las pantallas principales.

- [ ] ¿El foco es visible en botones, inputs, links?
- [ ] ¿El orden de foco es lógico (izquierda-derecha, arriba-abajo)?
- [ ] ¿Los modales/drawers atrapan el foco dentro al abrirse?
- [ ] ¿Escape cierra los modales?
- [ ] ¿Los botones de solo icono tienen foco visible?

---

## Paso 9 — Build final

```bash
npm run build
```

El build debe terminar sin errores TypeScript ni de compilación.
Si hay errores, reportarlos antes de dar la revisión por terminada.

---

## Paso 10 — Reporte

Genera el reporte en este formato:

```
## Revisión Visual — [fecha]

### Rutas revisadas
[lista]

### Estado general
[1-2 líneas]

### Hallazgos críticos
[bloqueadores o regresiones]

### Inconsistencias visuales
[badges, botones, espaciado, jerarquía]

### Problemas responsive
[por tamaño de pantalla]

### Problemas de accesibilidad
[foco, labels, aria, contraste]

### Animaciones
[excesivas, lentas, faltantes]

### Consola
[errores encontrados]

### Resultado del build
✅ Limpio / ❌ Errores: [lista]

### Posibles bugs funcionales (no modificados)
[descripción + archivo]
```

---

## No autorizado por esta skill

- Modificar código sin autorización explícita del usuario.
- Instalar Playwright, Cypress, Puppeteer ni herramientas de testing.
- Cambiar puertos, configuración del servidor ni scripts de Next.js.
- Modificar lógica, flujos, datos, stores, contextos ni reglas de negocio.
- Reportar como problema visual lo que es un bug funcional (solo reportar, no tocar).
