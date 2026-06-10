/**
 * automationService — Punto único de integración con automatizaciones externas (n8n, IA WhatsApp).
 *
 * Principio clave:
 *   - Ninguna página o componente llama directamente a n8n.
 *   - Toda acción importante pasa por `triggerAutomationEvent`.
 *   - Si `automationEnabled = false` o no hay URL, la función retorna silenciosamente.
 *   - Si la automatización falla, el flujo principal NO se interrumpe.
 *
 * Para activar automatización en un cliente:
 *   1. Cambiar `automationEnabled: true` en src/data/clinic.ts
 *   2. Cambiar `automationMode: "n8n"` (o "ai_whatsapp")
 *   3. Pegar la URL del webhook en `n8nWebhookUrl`
 *   4. Listo — todos los eventos empiezan a llegar a n8n sin tocar más código.
 */

import { clinic } from "@/data/clinic";
import type { Appointment } from "@/types";

// ── Catálogo de eventos ──────────────────────────────────────────────────────

export const AUTOMATION_EVENTS = {
  // Creación de citas (por distintos orígenes)
  APPOINTMENT_CREATED_PUBLIC_WEB:    "appointment.created_public_web",
  APPOINTMENT_CREATED_MANUAL:        "appointment.created_manual",
  APPOINTMENT_CREATED_BY_AI_WHATSAPP:"appointment.created_by_ai_whatsapp",
  // Cambios de estado
  APPOINTMENT_CONFIRMED:             "appointment.confirmed",
  APPOINTMENT_REJECTED:              "appointment.rejected",
  APPOINTMENT_CANCELLED:             "appointment.cancelled",
  APPOINTMENT_RESCHEDULED:           "appointment.rescheduled",
  APPOINTMENT_COMPLETED:             "appointment.completed",
  APPOINTMENT_NO_SHOW:               "appointment.no_show",
  // Pagos
  PAYMENT_MARKED_PAID:               "payment.marked_paid",
  PAYMENT_MARKED_PARTIAL:            "payment.marked_partial",
  // Recordatorios (preparado; la lógica de scheduling va en el futuro backend)
  REMINDER_24H_BEFORE_APPOINTMENT:   "reminder.24h_before_appointment",
} as const;

export type AutomationEventType =
  (typeof AUTOMATION_EVENTS)[keyof typeof AUTOMATION_EVENTS];

// ── Payload estándar ─────────────────────────────────────────────────────────

export interface AppointmentAutomationPayload {
  appointmentId: string;
  source: string;
  patient: {
    name: string;
    phone: string;
    email?: string;
  };
  clinic: {
    name: string;
    dentistName: string;
    professionalLicense: string;
    address: string;
    phone: string;
    whatsapp: string;
  };
  service: {
    id: string;
    name: string;
    durationMinutes?: number;
  };
  appointment: {
    date: string;
    time: string;
    status: string;
    isEmergency: boolean;
    reason: string;
  };
  payment: {
    status: string;
    estimatedAmount?: number;
    chargedAmount?: number;
  };
}

/**
 * Construye el payload estándar a partir de un Appointment.
 * Incluye datos del consultorio para que n8n no tenga que pedirlos por separado.
 */
export function buildAppointmentPayload(
  appointment: Appointment
): AppointmentAutomationPayload {
  return {
    appointmentId: appointment.id,
    source: appointment.source,
    patient: {
      name: appointment.patientName,
      phone: appointment.patientPhone,
      ...(appointment.patientEmail ? { email: appointment.patientEmail } : {}),
    },
    clinic: {
      name: clinic.name,
      dentistName: clinic.dentistName,
      professionalLicense: clinic.professionalLicense,
      address: clinic.address,
      phone: clinic.phone,
      whatsapp: clinic.whatsapp,
    },
    service: {
      id: appointment.serviceId,
      name: appointment.serviceName,
      durationMinutes: appointment.durationMinutes,
    },
    appointment: {
      date: appointment.desiredDate,
      time: appointment.desiredTime,
      status: appointment.status,
      isEmergency: appointment.isEmergency,
      reason: appointment.reason,
    },
    payment: {
      status: appointment.paymentStatus,
      estimatedAmount: appointment.estimatedAmount,
      chargedAmount: appointment.chargedAmount,
    },
  };
}

// ── Función central ──────────────────────────────────────────────────────────

/**
 * Dispara un evento de automatización hacia n8n (o el sistema configurado).
 *
 * Comportamiento:
 * - Si `automationEnabled = false` → retorna sin hacer nada (silencioso).
 * - Si `n8nWebhookUrl` es null → retorna sin hacer nada (silencioso).
 * - Si el fetch falla → captura el error y retorna sin romper el flujo principal.
 *
 * Llamar siempre con `void` para no bloquear el flujo principal:
 *   void triggerAutomationEvent(AUTOMATION_EVENTS.APPOINTMENT_CONFIRMED, payload)
 */
export async function triggerAutomationEvent(
  eventType: AutomationEventType,
  payload: AppointmentAutomationPayload
): Promise<void> {
  const { automationEnabled, n8nWebhookUrl, automationMode } = clinic;

  if (!automationEnabled || !n8nWebhookUrl) {
    // Silencio en producción; log útil en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Automation skipped — ${!automationEnabled ? "disabled" : "no webhook URL"}]`,
        eventType
      );
    }
    return;
  }

  const body = {
    event: eventType,
    automationMode,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  try {
    const res = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`[Automation sent — ${res.status}]`, eventType);
    }
  } catch (err) {
    // NUNCA bloquear el flujo principal si la automatización falla
    console.error("[Automation failed — not blocking main flow]", eventType, err);
  }
}
