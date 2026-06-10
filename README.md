# Sistema Web para Consultorio Dental

Sistema de captación de pacientes, gestión de citas e ingresos para consultorio dental. Construido con Next.js 16 + TypeScript + Tailwind CSS.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4
- **Íconos:** Lucide React
- **Datos:** Hardcodeados (preparado para conectar backend / API)

## Instalación

```bash
# Clonar e instalar
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Iniciar en desarrollo
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

## Conexión con n8n

El sistema está preparado para enviar webhooks a n8n.

Configura la variable en `.env.local`:
```
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/xxx
```

Eventos a implementar cuando se conecte el backend:
- `appointment.created`
- `appointment.confirmed`
- `appointment.rejected`
- `appointment.rescheduled`
- `appointment.completed`
- `appointment.reminder_24h`
- `payment.marked_paid`

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
