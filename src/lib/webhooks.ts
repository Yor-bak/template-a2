/**
 * Webhook service para n8n.
 *
 * TODO: cuando haya backend real, reemplazar el console.log por un fetch a la URL del webhook.
 * La URL debe venir de la variable de entorno N8N_WEBHOOK_URL (ver .env.example).
 */

export type WebhookEventType =
  | "appointment.created"
  | "appointment.confirmed"
  | "appointment.rejected"
  | "appointment.rescheduled"
  | "appointment.completed"
  | "appointment.reminder_24h"
  | "payment.marked_paid";

export interface WebhookPayload {
  event: WebhookEventType;
  appointmentId: string;
  patient: {
    name: string;
    phone: string;
    email?: string;
  };
  service: {
    name: string;
  };
  appointment: {
    date: string;
    time: string;
    status: string;
    isEmergency: boolean;
  };
  payment?: {
    status: string;
    amount?: number;
  };
}

export async function triggerN8nWebhook(payload: WebhookPayload): Promise<void> {
  const webhookUrl =
    typeof window !== "undefined"
      ? undefined // en el cliente no hay acceso a env, el hook iría server-side en el futuro
      : process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    // TODO: quitar este console.log cuando haya URL real configurada
    console.log("[n8n webhook — MOCK]", payload.event, payload);
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[n8n webhook] Error al enviar evento:", err);
  }
}
