import type { MessageTemplates } from "@/types/clinic";

export const DEFAULT_MESSAGE_TEMPLATES: MessageTemplates = {
  appointmentRequestReceived:
    "Hola, [nombre]. Recibimos tu solicitud de cita para [servicio] el día [fecha] a las [hora]. Te confirmaremos la disponibilidad en breve.",
  appointmentConfirmed:
    "Hola, [nombre]. Tu cita con [clinica] para [servicio] fue confirmada para el día [fecha] a las [hora]. Dirección: [direccion].",
  appointmentCancelled:
    "Hola, [nombre]. Tu cita fue cancelada. Si deseas reagendar, contáctanos por WhatsApp.",
  appointmentRescheduled:
    "Hola, [nombre]. Necesitamos reagendar tu cita de [servicio]. Contáctanos para elegir un nuevo horario.",
  reminder24h:
    "Hola, [nombre]. Te recordamos tu cita dental mañana a las [hora] en [clinica].",
  emergencyMessage:
    "Si tienes dolor intenso, inflamación o fractura dental, contáctanos por WhatsApp para revisar disponibilidad.",
  outOfHoursMessage:
    "Gracias por escribirnos. En este momento estamos fuera de horario, pero responderemos lo antes posible.",
};

export const MESSAGE_TEMPLATE_LABELS: Record<keyof MessageTemplates, string> = {
  appointmentRequestReceived: "Solicitud de cita recibida",
  appointmentConfirmed:       "Cita confirmada",
  appointmentCancelled:       "Cita cancelada",
  appointmentRescheduled:     "Cita reagendada",
  reminder24h:                "Recordatorio 24h antes",
  emergencyMessage:           "Mensaje de urgencias",
  outOfHoursMessage:          "Fuera de horario",
};

export type MessageVariables = Partial<{
  nombre:   string;
  servicio: string;
  fecha:    string;
  hora:     string;
  clinica:  string;
  dentista: string;
  direccion: string;
  telefono: string;
  whatsapp: string;
}>;

/** Replaces [variable] placeholders in a template string. */
export function renderMessageTemplate(
  template: string,
  variables: MessageVariables = {}
): string {
  return template.replace(/\[(\w+)\]/g, (match, key) => {
    const v = variables[key as keyof MessageVariables];
    return v !== undefined ? v : match;
  });
}

/** Returns the resolved template, falling back to the default. */
export function getTemplate(
  templates: Partial<MessageTemplates> | undefined,
  key: keyof MessageTemplates
): string {
  return templates?.[key] ?? DEFAULT_MESSAGE_TEMPLATES[key];
}
