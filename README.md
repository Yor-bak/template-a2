# Sistema Web para Consultorio Dental

Sistema de captación de pacientes, gestión de citas e ingresos para consultorio dental. Construido con Next.js 16 + TypeScript + Tailwind CSS.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4
- **Íconos:** Lucide React
- **Datos:** Hardcodeados (preparado para conectar backend / API)

## Cómo conectar frontend con backend

### 1. Levanta PostgreSQL

```bash
# Con Docker (recomendado):
docker run --name dental-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dental -p 5432:5432 -d postgres:16
```

### 2. Corre el backend

```bash
cd "Dentista Backend"
python -m venv venv && source venv/bin/activate   # (Windows: venv\Scripts\activate)
pip install -r requirements.txt

# Crea las tablas con Alembic
alembic upgrade head

# Inserta datos demo
python -m scripts.seed
```

El seed imprime algo así:

```
✓ Seed completado exitosamente
───────────────────────────────────────────────────────
  dentista@demo.com / demo123  → Premium  (clinic_id=<uuid>)
  basico@demo.com   / demo123  → Basic    (clinic_id=<uuid>)
───────────────────────────────────────────────────────

📋 Configura el frontend — agrega esto a Dentista Front/.env.local:

  NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
  NEXT_PUBLIC_DEMO_CLINIC_ID=<uuid>
```

Luego inicia FastAPI:

```bash
uvicorn app.main:app --reload
# Corre en http://localhost:8000
# Docs en http://localhost:8000/docs
```

### 3. Configura el frontend

Copia el `clinic_id` que imprimió el seed y crea `.env.local`:

```bash
# Dentista Front/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_DEMO_CLINIC_ID=<clinic_id_copiado_del_seed>
```

### 4. Corre el frontend

```bash
cd "Dentista Front"
npm install
npm run dev
# Abre http://localhost:3000
```

### 5. Prueba login real

- Abre `http://localhost:3000/login`
- Email: `dentista@demo.com` / Contraseña: `demo123`
- Verás los datos reales del backend en el dashboard

### Credenciales demo

| Usuario | Contraseña | Plan |
|---------|-----------|------|
| `dentista@demo.com` | `demo123` | Premium |
| `basico@demo.com` | `demo123` | Basic (sin historial clínico) |

### Modo sin backend (fallback)

Si el backend no está corriendo:
- La página pública usa datos mock hardcodeados
- El login muestra un error visual claro (no crash)
- La consola advierte qué variable falta

---

## Instalación (solo frontend)

```bash
npm install
cp .env.local.example .env.local  # edita con tu clinic_id
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Páginas públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio con hero, servicios, testimonios |
| `/servicios` | Lista de todos los servicios |
| `/servicios/[slug]` | Detalle de cada servicio |
| `/agendar` | Formulario de solicitud de cita |
| `/ubicacion` | Mapa y datos del consultorio |
| `/preguntas-frecuentes` | FAQ + políticas de cita |

## Panel privado (dentista)

| Ruta | Descripción |
|------|-------------|
| `/login` | Acceso al panel |
| `/dashboard` | Resumen del día y mes |
| `/dashboard/citas` | Lista de citas con filtros y acciones |
| `/dashboard/citas/[id]` | Detalle completo de cita |
| `/dashboard/pacientes` | Lista de pacientes |
| `/dashboard/pacientes/[id]` | Historial del paciente |
| `/dashboard/ingresos` | Registro de pagos y resumen |
| `/dashboard/servicios` | Catálogo de servicios |
| `/dashboard/configuracion` | Datos del consultorio y preferencias |

## Credenciales demo

```
Email: admin@clinicasonrisa.com
Contraseña: demo1234
```

## Estructura del proyecto

```
src/
├── app/
│   ├── (public)/          # Rutas públicas (con Navbar + Footer)
│   │   ├── page.tsx       # Inicio
│   │   ├── servicios/
│   │   ├── agendar/
│   │   ├── ubicacion/
│   │   └── preguntas-frecuentes/
│   ├── dashboard/         # Panel privado del dentista
│   │   ├── citas/
│   │   ├── pacientes/
│   │   ├── ingresos/
│   │   ├── servicios/
│   │   └── configuracion/
│   └── login/
├── components/
│   ├── ui/                # Componentes genéricos (Button, Card, Badge, StatCard)
│   ├── public/            # Navbar, Footer
│   └── dashboard/         # Sidebar
├── data/                  # Datos hardcodeados (clinic, services, appointments, patients)
├── lib/                   # Utilidades (formatters, helpers)
└── types/                 # TypeScript types
```

## Datos demo

Los datos están en `src/data/`:

- `clinic.ts` — Datos de la clínica (Dra. Mariana López / Clínica Dental Sonrisa)
- `services.ts` — 11 servicios dentales con descripciones completas
- `appointments.ts` — 8 citas en distintos estados
- `patients.ts` — 5 pacientes con historial
- `testimonials.ts` — 5 testimonios
- `faqs.ts` — 10 preguntas frecuentes

## Cómo activar automatización n8n para un cliente

El sistema usa el patrón de "puertos de conexión": cada acción importante ya dispara un evento interno, independientemente de si la automatización está activa. Cuando el cliente compra el plan de automatización, solo hay que cambiar tres valores de configuración — sin tocar ningún componente ni página.

### Pasos para activar (solo toca `src/data/clinic.ts`)

```ts
// Antes (plan manual)
automationEnabled: false,
automationMode: "none",
n8nWebhookUrl: null,

// Después (automatización activa con n8n)
automationEnabled: true,
automationMode: "n8n",
n8nWebhookUrl: "https://tu-n8n.com/webhook/abc123",
```

### Eventos que llegan a n8n

| Evento | Cuándo se dispara |
|--------|-------------------|
| `appointment.created_public_web` | Paciente agenda desde la web |
| `appointment.created_manual` | Dentista registra cita desde el panel |
| `appointment.created_by_ai_whatsapp` | IA crea cita vía WhatsApp |
| `appointment.confirmed` | Dentista confirma cita |
| `appointment.rejected` | Dentista rechaza cita |
| `appointment.cancelled` | Cita cancelada |
| `appointment.rescheduled` | Cita reagendada |
| `appointment.completed` | Cita finalizada |
| `appointment.no_show` | Paciente no asistió |
| `payment.marked_paid` | Pago registrado como pagado |
| `payment.marked_partial` | Pago registrado como parcial |

### Endpoint para IA WhatsApp

n8n puede crear citas automáticamente enviando un `POST` a:

```
POST /api/integrations/whatsapp-ai/appointments
```

Ver `src/app/api/integrations/whatsapp-ai/appointments/route.ts` para el formato del payload.

### Garantía de no-bloqueo

Si el webhook falla (timeout, red caída, n8n apagado), el flujo principal del dentista **no se interrumpe**. `triggerAutomationEvent()` captura todos los errores internamente. Ver `src/services/automationService.ts`.

## Variables de entorno

Ver `.env.example` para todas las variables disponibles.

## Roadmap

- [ ] Backend con API routes (Next.js) o Express
- [ ] Base de datos PostgreSQL con Prisma
- [ ] Autenticación real (NextAuth / JWT)
- [ ] Webhooks a n8n funcionales
- [ ] Envío de correos (Resend / SendGrid)
- [ ] Calendario visual de citas
- [ ] Exportar reportes a CSV
- [ ] Pagos en línea
- [ ] Panel multi-dentista
- [ ] App móvil
