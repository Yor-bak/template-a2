import type { TemplateDefinition } from "@/types/template";

export const TEMPLATES: TemplateDefinition[] = [
  { id: "template-01", name: "Clásico Limpio", description: "Diseño simple y profesional. Hero centrado, servicios en grid, contacto al pie.", isPro: false },
  { id: "template-02", name: "Lateral Moderno", description: "Barra lateral fija con datos del especialista. Contenido principal a la derecha.", isPro: false },
  { id: "template-03", name: "Tarjeta Hero", description: "Foto del especialista en hero de pantalla completa con overlay oscuro y CTA.", isPro: false },
  { id: "template-04", name: "Minimalista", description: "Solo texto y espacios en blanco. Sin imágenes de fondo. Máximo foco en servicios.", isPro: false },
  { id: "template-05", name: "Magazine", description: "Layout tipo revista con columnas asimétricas y secciones en bloques de color.", isPro: true },
  { id: "template-06", name: "Premium Dark", description: "Fondo oscuro, acentos dorados. Ideal para especialistas de alto nivel.", isPro: true },
  { id: "template-07", name: "Testimonios Destacados", description: "Los testimonios aparecen como protagonistas antes que los servicios.", isPro: true },
  { id: "template-08", name: "Acordeón de Servicios", description: "Servicios en acordeón expandible. Más info sin scroll excesivo.", isPro: true },
  { id: "template-09", name: "Timeline de Pasos", description: "Sección 'Cómo funciona' con pasos numerados y animación sutil.", isPro: true },
  { id: "template-10", name: "Ultra Premium", description: "Animaciones, gradientes y layout asimétrico. La experiencia más premium.", isPro: true },
];

export const DEFAULT_TEMPLATE_ID = "template-01";

export function getTemplate(id: string): TemplateDefinition {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
