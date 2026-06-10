import type { PlanTier } from "@/types/clinic";

export type PlanFeature =
  | "public_page"
  | "manual_appointments"
  | "calendar"
  | "income_reports"
  | "csv_export"
  | "n8n_automation"
  | "message_templates"
  | "ai_whatsapp"
  | "clinical_history"
  | "advanced_reports"
  | "multi_user";

const PLAN_FEATURES: Record<PlanTier, PlanFeature[]> = {
  basic: [
    "public_page",
    "manual_appointments",
    "calendar",
    "income_reports",
    "csv_export",
  ],
  pro: [
    "public_page",
    "manual_appointments",
    "calendar",
    "income_reports",
    "csv_export",
    "n8n_automation",
    "message_templates",
  ],
  premium: [
    "public_page",
    "manual_appointments",
    "calendar",
    "income_reports",
    "csv_export",
    "n8n_automation",
    "message_templates",
    "ai_whatsapp",
    "clinical_history",
    "advanced_reports",
    "multi_user",
  ],
};

export const PLAN_NAMES: Record<PlanTier, string> = {
  basic:   "Básico · Página + Agenda Manual",
  pro:     "Pro · Automatización WhatsApp",
  premium: "Premium · Clínica Inteligente",
};

export const PLAN_DESCRIPTIONS: Record<PlanTier, string[]> = {
  basic: [
    "Página pública configurable",
    "Servicios editables",
    "Agenda manual",
    "Calendario de disponibilidad",
    "Citas e ingresos básicos",
    "Exportación CSV",
  ],
  pro: [
    "Todo el plan Básico",
    "Confirmaciones automáticas por WhatsApp",
    "Recordatorios de citas",
    "Integración con n8n",
    "Mensajes configurables",
  ],
  premium: [
    "Todo el plan Pro",
    "Agenda con IA por WhatsApp",
    "Historial clínico básico",
    "Reportes avanzados",
    "Multiusuario",
    "Recuperación de pacientes inactivos",
  ],
};

export function hasFeature(plan: PlanTier, feature: PlanFeature): boolean {
  return PLAN_FEATURES[plan]?.includes(feature) ?? false;
}
