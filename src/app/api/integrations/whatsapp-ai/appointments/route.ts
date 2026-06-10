import { NextRequest, NextResponse } from "next/server";
import type { WhatsAppAIPayload, Appointment } from "@/types";
import { services } from "@/data/services";

/**
 * POST /api/integrations/whatsapp-ai/appointments
 *
 * Endpoint para que n8n / IA WhatsApp creen citas automáticamente.
 *
 * TODO cuando haya backend real:
 * - Guardar la cita en base de datos
 * - Buscar o crear el paciente por teléfono/email
 * - Disparar webhook appointment.created_by_ai_whatsapp
 * - Validar disponibilidad del horario
 * - Retornar la cita creada con su ID real
 */
export async function POST(req: NextRequest) {
  let body: WhatsAppAIPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // ── Validación básica ──────────────────────────────────────────────────
  const { patient, appointment } = body;

  if (!patient?.name || !patient?.phone) {
    return NextResponse.json(
      { error: "El paciente debe incluir nombre y teléfono" },
      { status: 422 }
    );
  }

  if (!appointment?.serviceId || !appointment?.date || !appointment?.time) {
    return NextResponse.json(
      { error: "La cita debe incluir serviceId, date y time" },
      { status: 422 }
    );
  }

  if (!appointment.reason?.trim()) {
    return NextResponse.json(
      { error: "El motivo de consulta es requerido" },
      { status: 422 }
    );
  }

  // ── Buscar servicio ────────────────────────────────────────────────────
  const service = services.find((s) => s.id === appointment.serviceId);
  if (!service) {
    return NextResponse.json(
      { error: `Servicio con id "${appointment.serviceId}" no encontrado` },
      { status: 422 }
    );
  }

  // ── Construir cita mock ────────────────────────────────────────────────
  const now = new Date().toISOString();
  const newAppointment: Appointment = {
    id: `ai_${Date.now()}`,
    patientId: `pat_${patient.phone.replace(/\D/g, "")}`,
    patientName: patient.name,
    patientPhone: patient.phone,
    patientEmail: patient.email ?? "",
    serviceId: service.id,
    serviceName: service.name,
    durationMinutes: service.durationMinutes,
    desiredDate: appointment.date,
    desiredTime: appointment.time,
    reason: appointment.reason,
    isEmergency: appointment.isEmergency ?? false,
    isFirstVisit: appointment.isFirstVisit ?? true,
    preferredContact: appointment.preferredContactMethod ?? "whatsapp",
    status: "pending",
    paymentStatus: "unpaid",
    estimatedAmount: service.estimatedPrice,
    internalNotes: "",
    statusHistory: [],
    createdAt: now,
    source: "ai_whatsapp",
    createdBy: "ai",
    aiMetadata: body.aiMetadata
      ? {
          conversationId: body.aiMetadata.conversationId,
          summary: body.aiMetadata.summary,
          confidence: body.aiMetadata.confidence,
        }
      : undefined,
  };

  // ── Log mock (reemplazar con persistencia real) ────────────────────────
  console.log("[IA WhatsApp — MOCK] Nueva cita creada:", {
    event: "appointment.created_by_ai_whatsapp",
    appointment: newAppointment,
  });

  return NextResponse.json(
    {
      success: true,
      message: "Cita registrada correctamente",
      appointment: newAppointment,
    },
    { status: 201 }
  );
}

/** GET — solo para verificar que el endpoint está activo */
export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "POST /api/integrations/whatsapp-ai/appointments",
    description: "Recibe citas creadas automáticamente por IA WhatsApp (n8n).",
  });
}
