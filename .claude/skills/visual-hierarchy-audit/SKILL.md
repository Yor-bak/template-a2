---
name: visual-hierarchy-audit
description: >
  Auditoría visual de pantallas del producto J2EC. Skill manual — se invoca
  explícitamente con /visual-hierarchy-audit [ruta-opcional]. Inspecciona sin
  modificar; entrega un diagnóstico estructurado clasificado en Crítico /
  Importante / Mejora. Diferencia claramente problemas visuales de posibles
  problemas funcionales. No propone cambios funcionales. No modifica archivos
  hasta recibir autorización explícita.
disable-model-invocation: true
---

# Visual Hierarchy Audit

## Modo de uso

```
/visual-hierarchy-audit                    — audita todo el proyecto
/visual-hierarchy-audit src/app/(admin)/   — audita solo el Admin
/visual-hierarchy-audit src/app/(especialista)/dashboard/pagos/page.tsx — archivo específico
```

---

## Fase 1 — Inspección (sin editar)

### Qué leer siempre primero

1. `src/app/globals.css` — tokens y variables
2. `src/modules/admin/components/adminUi.tsx` — sistema de estilos Admin
3. `.claude/skills/j2ec-design-system/SKILL.md` — principios del producto
4. El archivo o conjunto de archivos indicado

### Puntos de inspección

Para cada pantalla o módulo auditado, verifica:

#### Estructura de página
- [ ] ¿Existe un título de página/sección claro?
- [ ] ¿La acción principal es evidente y única?
- [ ] ¿El contenido principal está correctamente jerarquizado?
- [ ] ¿La información secundaria está visualmente subordinada?
- [ ] ¿Hay elementos compitiendo por atención primaria?

#### Botones y acciones
- [ ] ¿Hay más de un botón primario compitiendo?
- [ ] ¿Las acciones destructivas están separadas y en rojo?
- [ ] ¿Los botones son consistentes con el sistema de `S` (Admin) o `Button.tsx` (dashboard)?
- [ ] ¿Hay botones sin estado hover visible?
- [ ] ¿Los botones de icono tienen `aria-label`?

#### Cards
- [ ] ¿Hay cards dentro de cards sin necesidad?
- [ ] ¿Hay bloques que sean cards sin aportar agrupación visual?
- [ ] ¿El padding es consistente entre cards del mismo nivel?

#### Badges y estados
- [ ] ¿Se usa `BadgeEl` + META maps (Admin) en lugar de badges ad-hoc?
- [ ] ¿Los estados equivalentes usan el mismo componente?
- [ ] ¿Algún estado se comunica solo por color?
- [ ] ¿Hay exceso de badges simultáneos en una fila?

#### Tipografía
- [ ] ¿Existe diferencia clara entre título, subtítulo, texto, metadato?
- [ ] ¿Hay negritas en demasiados elementos compitiendo?
- [ ] ¿Hay textos demasiado pequeños (< 10px) en información importante?
- [ ] ¿Las etiquetas tienen contraste adecuado?

#### Tablas
- [ ] ¿Los encabezados tienen menor peso visual que los datos?
- [ ] ¿Hay columnas que no quedan en pantalla sin scroll horizontal?
- [ ] ¿Las acciones de fila son consistentes?
- [ ] ¿El estado vacío existe y es informativo?
- [ ] ¿El hover de fila es visible?

#### Formularios
- [ ] ¿Los campos están agrupados por contexto?
- [ ] ¿Las etiquetas están siempre encima del input?
- [ ] ¿Los errores tienen texto, no solo color?
- [ ] ¿Hay campos obligatorios sin marcar?

#### Modales / drawers
- [ ] ¿Tienen encabezado claro con botón X accesible?
- [ ] ¿El footer tiene acción primaria y secundaria consistentes?
- [ ] ¿El scroll interno funciona cuando el contenido supera la pantalla?

#### Espaciado
- [ ] ¿El espaciado es consistente entre secciones del mismo nivel?
- [ ] ¿Hay elementos demasiado juntos sin separación clara?
- [ ] ¿Hay demasiado espacio desperdiciado en vistas operativas?

#### Responsive
- [ ] ¿Hay scroll horizontal accidental en móvil?
- [ ] ¿Las acciones principales son visibles en pantalla pequeña?
- [ ] ¿Los modales se ven correctamente en móvil?

#### Accesibilidad
- [ ] ¿Los inputs tienen `label` asociado o `aria-label`?
- [ ] ¿El foco es visible en todos los elementos interactivos?
- [ ] ¿Hay botones sin texto ni `aria-label`?

---

## Fase 2 — Diagnóstico

Entrega el reporte en este formato:

```
## Auditoría Visual — [módulo o ruta]

### Resumen
[2-3 líneas del estado general]

### Crítico (bloquea legibilidad o uso)
- [Problema] — [Archivo:línea aproximada] — [Por qué es crítico]

### Importante (afecta consistencia o jerarquía)
- [Problema] — [Archivo] — [Impacto]

### Mejora (refinamiento visual)
- [Problema] — [Archivo] — [Recomendación]

### Posibles problemas funcionales detectados (NO modificar)
- [Descripción] — reportar al usuario, no tocar

### Positivos detectados
- [Qué está bien y debe conservarse]
```

---

## Fase 3 — Aplicar cambios (solo si el usuario lo autoriza)

Cuando el usuario diga "aplica los cambios", procede en este orden:

1. Primero: correcciones críticas de jerarquía (botones, acción principal)
2. Segundo: inconsistencias de componentes (badges, cards, tablas)
3. Tercero: espaciado y tipografía
4. Cuarto: responsive y accesibilidad
5. Último: animaciones y micro-interacciones

**Restricciones al aplicar cambios:**
- Solo modificar: clases CSS, Tailwind classes, estructura JSX visual, tokens, layout visual.
- No modificar: props funcionales, handlers, condiciones de negocio, stores, contextos, validaciones, datos, rutas.
- Si una mejora visual requiere aparentemente cambiar lógica: **detener, reportar, pedir autorización**.
- Si encuentras un bug funcional durante la auditoría: **reportarlo, no corregirlo**.

---

## Módulos a revisar en auditoría completa

```
Admin:
  /admin                     — Dashboard principal Admin
  Clientes (tab)
  Preclientes (tab)
  Transferencias (tab)
  Vendedores (tab)
  Comisiones (tab)
  Finanzas (tab)
  Usuarios (tab)
  Configuración (tab)

Dashboard especialista:
  /dashboard                 — Home
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

Portal trabajador:
  /trabajador
  /trabajador/login

Página pública:
  / (template activo)
  /servicios
  /agendar
  /ubicacion

Transversales:
  /login (admin/especialista)
  /trabajador/login
  Estados vacíos en todas las tablas
  Modales y drawers abiertos
  Formularios con errores visibles
```
