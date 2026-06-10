import type { ClinicConfig } from "@/types/clinic";
import type { Service } from "@/types";
import type { AvailabilityRule } from "@/types/calendar";

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  actionHref?: string;
  actionLabel?: string;
  tab?: string;
}

export function getSetupChecklistStatus(
  config: ClinicConfig,
  services: Service[],
  availabilityRules: AvailabilityRule[]
): ChecklistItem[] {
  return [
    {
      id: "clinic_data",
      label: "Datos del consultorio agregados",
      completed: !!(
        config.clinicName?.trim() &&
        config.dentistName?.trim() &&
        config.professionalLicense?.trim() &&
        config.specialty?.trim()
      ),
      actionHref: "/dashboard/configuracion",
      actionLabel: "Completar",
      tab: "general",
    },
    {
      id: "address",
      label: "Dirección y Google Maps configurados",
      completed: !!(config.address?.trim() && config.googleMapsUrl?.trim()),
      actionHref: "/dashboard/configuracion",
      actionLabel: "Configurar",
      tab: "contacto",
    },
    {
      id: "hours",
      label: "Horarios de atención configurados",
      completed: config.openingHours.some((h) => h.isOpen && h.blocks.length > 0),
      actionHref: "/dashboard/configuracion",
      actionLabel: "Configurar",
      tab: "horarios",
    },
    {
      id: "services",
      label: "Servicios agregados",
      completed: services.filter((s) => s.isActive).length > 0,
      actionHref: "/dashboard/servicios",
      actionLabel: "Agregar",
    },
    {
      id: "palette",
      label: "Paleta visual seleccionada",
      completed: !!config.themePalette,
      actionHref: "/dashboard/configuracion",
      actionLabel: "Elegir",
      tab: "apariencia",
    },
    {
      id: "payments",
      label: "Métodos de pago configurados",
      completed: config.acceptedPayments.length > 0,
      actionHref: "/dashboard/configuracion",
      actionLabel: "Configurar",
      tab: "pagos",
    },
    {
      id: "emergencies",
      label: "Urgencias dentales configuradas",
      completed: config.acceptsEmergencies === true,
      actionHref: "/dashboard/configuracion",
      actionLabel: "Activar",
      tab: "pagos",
    },
    {
      id: "calendar",
      label: "Calendario/disponibilidad configurado",
      completed: availabilityRules.some((r) => r.isActive),
      actionHref: "/dashboard/calendario",
      actionLabel: "Configurar",
    },
    {
      id: "published",
      label: "Página publicada",
      completed: config.publicPageStatus === "published",
      actionHref: "/dashboard/configuracion",
      actionLabel: "Publicar",
    },
    {
      id: "images",
      label: "Fotos principales agregadas",
      completed: !!(config.heroImageUrl?.trim() || config.dentistPhotoUrl?.trim()),
      actionHref: "/dashboard/configuracion",
      actionLabel: "Agregar fotos",
      tab: "imagenes",
    },
    {
      id: "seo",
      label: "SEO local configurado",
      completed: !!(config.seoTitle?.trim() || config.seoDescription?.trim()),
      actionHref: "/dashboard/configuracion",
      actionLabel: "Configurar SEO",
      tab: "seo",
    },
  ];
}
