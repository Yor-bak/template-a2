import type { ComponentType } from "react";
import type { TemplateProps, TemplatePalette, TemplateImageField, ServiceImageFieldDefinition } from "./types";

import { DentistaTemplate01, PALETTES as DENTISTA_01_PALETTES, DEFAULT_PALETTE_ID as DENTISTA_01_DEFAULT } from "./dentista/Template01";
import { DentistaTemplate02, PALETTES as DENTISTA_02_PALETTES, DEFAULT_PALETTE_ID as DENTISTA_02_DEFAULT } from "./dentista/Template02";
import { DentistaTemplate03, PALETTES as DENTISTA_03_PALETTES, DEFAULT_PALETTE_ID as DENTISTA_03_DEFAULT } from "./dentista/Template03";

import { MedicoTemplate01, PALETTES as MEDICO_01_PALETTES, DEFAULT_PALETTE_ID as MEDICO_01_DEFAULT } from "./medico/Template01";
import { MedicoTemplate02, PALETTES as MEDICO_02_PALETTES, DEFAULT_PALETTE_ID as MEDICO_02_DEFAULT } from "./medico/Template02";
import { MedicoTemplate03, PALETTES as MEDICO_03_PALETTES, DEFAULT_PALETTE_ID as MEDICO_03_DEFAULT } from "./medico/Template03";

import { VeterinarioTemplate01, PALETTES as VETERINARIO_01_PALETTES, DEFAULT_PALETTE_ID as VETERINARIO_01_DEFAULT } from "./veterinario/Template01";
import { VeterinarioTemplate02, PALETTES as VETERINARIO_02_PALETTES, DEFAULT_PALETTE_ID as VETERINARIO_02_DEFAULT } from "./veterinario/Template02";
import { VeterinarioTemplate03, PALETTES as VETERINARIO_03_PALETTES, DEFAULT_PALETTE_ID as VETERINARIO_03_DEFAULT } from "./veterinario/Template03";

import { PsicologoTemplate01, PALETTES as PSICOLOGO_01_PALETTES, DEFAULT_PALETTE_ID as PSICOLOGO_01_DEFAULT } from "./psicologo/Template01";
import { PsicologoTemplate02, PALETTES as PSICOLOGO_02_PALETTES, DEFAULT_PALETTE_ID as PSICOLOGO_02_DEFAULT } from "./psicologo/Template02";
import { PsicologoTemplate03, PALETTES as PSICOLOGO_03_PALETTES, DEFAULT_PALETTE_ID as PSICOLOGO_03_DEFAULT } from "./psicologo/Template03";

import { NutriologoTemplate01, PALETTES as NUTRIOLOGO_01_PALETTES, DEFAULT_PALETTE_ID as NUTRIOLOGO_01_DEFAULT } from "./nutriologo/Template01";
import { NutriologoTemplate02, PALETTES as NUTRIOLOGO_02_PALETTES, DEFAULT_PALETTE_ID as NUTRIOLOGO_02_DEFAULT } from "./nutriologo/Template02";
import { NutriologoTemplate03, PALETTES as NUTRIOLOGO_03_PALETTES, DEFAULT_PALETTE_ID as NUTRIOLOGO_03_DEFAULT } from "./nutriologo/Template03";

import { FisioterapiaTemplate01, PALETTES as FISIOTERAPIA_01_PALETTES, DEFAULT_PALETTE_ID as FISIOTERAPIA_01_DEFAULT } from "./fisioterapia/Template01";
import { FisioterapiaTemplate02, PALETTES as FISIOTERAPIA_02_PALETTES, DEFAULT_PALETTE_ID as FISIOTERAPIA_02_DEFAULT } from "./fisioterapia/Template02";
import { FisioterapiaTemplate03, PALETTES as FISIOTERAPIA_03_PALETTES, DEFAULT_PALETTE_ID as FISIOTERAPIA_03_DEFAULT } from "./fisioterapia/Template03";

import { EsteticaTemplate01, PALETTES as ESTETICA_01_PALETTES, DEFAULT_PALETTE_ID as ESTETICA_01_DEFAULT } from "./estetica/Template01";
import { EsteticaTemplate02, PALETTES as ESTETICA_02_PALETTES, DEFAULT_PALETTE_ID as ESTETICA_02_DEFAULT } from "./estetica/Template02";
import { EsteticaTemplate03, PALETTES as ESTETICA_03_PALETTES, DEFAULT_PALETTE_ID as ESTETICA_03_DEFAULT } from "./estetica/Template03";

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  publicPath: string;
  component: ComponentType<TemplateProps>;
  palettes: readonly TemplatePalette[];
  defaultPaletteId: string;
  imageFields: TemplateImageField[];
  serviceImageFields?: ServiceImageFieldDefinition[];
}

// ── Shared field presets ────────────────────────────────────────────────────────
const FIELD_LOGO: TemplateImageField = {
  key: "logo", label: "Logo / Logotipo", type: "logo", required: false,
  recommendedAspectRatio: "3:1",
  description: "Aparece en la barra de navegación. PNG o SVG con fondo transparente.",
};
const FIELD_SPECIALIST: TemplateImageField = {
  key: "specialistPhoto", label: "Foto del especialista", type: "specialist", required: true,
  recommendedAspectRatio: "1:1",
  description: "Retrato profesional. Cuadrado o vertical, fondo neutro.",
};
const FIELD_HERO: TemplateImageField = {
  key: "heroImage", label: "Imagen principal (hero)", type: "hero", required: false,
  recommendedAspectRatio: "16:9",
  description: "Imagen de portada que aparece en el área superior de la página.",
};
const FIELD_GALLERY: TemplateImageField = {
  key: "gallery", label: "Galería de imágenes", type: "gallery", required: false,
  multiple: true, maxItems: 8,
  recommendedAspectRatio: "4:3",
  description: "Imágenes del consultorio, equipo o instalaciones.",
};
const FIELD_BEFORE_AFTER: TemplateImageField = {
  key: "beforeAfter", label: "Antes / Después", type: "before_after", required: false,
  multiple: true, maxItems: 6,
  recommendedAspectRatio: "1:1",
  description: "Pares de imágenes de resultados de tratamientos.",
};
const FIELD_BG: TemplateImageField = {
  key: "backgroundImage", label: "Imagen de fondo", type: "background", required: false,
  recommendedAspectRatio: "16:9",
  description: "Se usa como fondo de sección o hero. Preferir imagen oscura o con overlay.",
};

// ── Category-specific field sets ───────────────────────────────────────────────
// Template01 (main): full-featured hero + specialist + logo
const T01_FIELDS = [FIELD_LOGO, FIELD_SPECIALIST, FIELD_HERO, FIELD_GALLERY];
// Template02 (clinical/card): specialist + logo
const T02_FIELDS = [FIELD_LOGO, FIELD_SPECIALIST];
// Template03 (marketing): specialist + hero (no logo in most T03 designs)
const T03_FIELDS = [FIELD_SPECIALIST, FIELD_HERO];

// Estética gets before/after
const ESTETICA_01_FIELDS = [FIELD_LOGO, FIELD_SPECIALIST, FIELD_HERO, FIELD_GALLERY, FIELD_BEFORE_AFTER];
const ESTETICA_02_FIELDS = [FIELD_LOGO, FIELD_SPECIALIST, FIELD_GALLERY];
const ESTETICA_03_FIELDS = [FIELD_SPECIALIST, FIELD_BG, FIELD_GALLERY];

// Fisioterapia T03 (app-style) uses background
const FISIO_03_FIELDS = [FIELD_SPECIALIST, FIELD_BG];

// Veterinario T02 (bento grid) benefits from gallery
const VET_02_FIELDS = [FIELD_LOGO, FIELD_SPECIALIST, FIELD_GALLERY];

// ── Service image fields (per template, when that template uses service images) ─
const ESTETICA_SERVICE_FIELDS: ServiceImageFieldDefinition[] = [
  {
    key: "mainImage",
    label: "Imagen principal del servicio",
    description: "Imagen destacada que aparece en la tarjeta del servicio.",
    required: true,
    recommendedAspectRatio: "4:3",
  },
  {
    key: "secondaryImage",
    label: "Imagen adicional (antes/después)",
    description: "Imagen de resultado o comparativa, opcional.",
    required: false,
    recommendedAspectRatio: "1:1",
  },
];

const DENTISTA_01_SERVICE_FIELDS: ServiceImageFieldDefinition[] = [
  {
    key: "mainImage",
    label: "Imagen del tratamiento",
    description: "Foto representativa del tratamiento dental.",
    required: false,
    recommendedAspectRatio: "16:9",
  },
];

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  "dentista-01": {
    id: "dentista-01", name: "Dentista", description: "Rehabilitación oral · switch de paleta en vivo",
    category: "dentista", publicPath: "/dentista",
    component: DentistaTemplate01, palettes: DENTISTA_01_PALETTES, defaultPaletteId: DENTISTA_01_DEFAULT,
    imageFields: T01_FIELDS,
    serviceImageFields: DENTISTA_01_SERVICE_FIELDS,
  },
  "dentista-02": {
    id: "dentista-02", name: "Dentista (alterno B)", description: "Expediente clínico",
    category: "dentista", publicPath: "/template-02",
    component: DentistaTemplate02, palettes: DENTISTA_02_PALETTES, defaultPaletteId: DENTISTA_02_DEFAULT,
    imageFields: T02_FIELDS,
  },
  "dentista-03": {
    id: "dentista-03", name: "Dentista (alterno C)", description: "Marketing dental / acordeón y testimonios",
    category: "dentista", publicPath: "/template-03",
    component: DentistaTemplate03, palettes: DENTISTA_03_PALETTES, defaultPaletteId: DENTISTA_03_DEFAULT,
    imageFields: T03_FIELDS,
  },
  "medico-01": {
    id: "medico-01", name: "Médico", description: "Consulta médica general · switch de paleta",
    category: "medico", publicPath: "/medico",
    component: MedicoTemplate01, palettes: MEDICO_01_PALETTES, defaultPaletteId: MEDICO_01_DEFAULT,
    imageFields: T01_FIELDS,
  },
  "medico-02": {
    id: "medico-02", name: "Médico (alterno B)", description: "Tablero clínico",
    category: "medico", publicPath: "/medico-template-02",
    component: MedicoTemplate02, palettes: MEDICO_02_PALETTES, defaultPaletteId: MEDICO_02_DEFAULT,
    imageFields: T02_FIELDS,
  },
  "medico-03": {
    id: "medico-03", name: "Médico (alterno C)", description: "Landing médica de alto contraste",
    category: "medico", publicPath: "/medico-template-03",
    component: MedicoTemplate03, palettes: MEDICO_03_PALETTES, defaultPaletteId: MEDICO_03_DEFAULT,
    imageFields: T03_FIELDS,
  },
  "veterinario-01": {
    id: "veterinario-01", name: "Veterinario", description: "Clínica veterinaria · switch de paleta",
    category: "veterinario", publicPath: "/veterinario",
    component: VeterinarioTemplate01, palettes: VETERINARIO_01_PALETTES, defaultPaletteId: VETERINARIO_01_DEFAULT,
    imageFields: T01_FIELDS,
  },
  "veterinario-02": {
    id: "veterinario-02", name: "Veterinario (alterno B)", description: "Diseño cálido de mascotas",
    category: "veterinario", publicPath: "/veterinario-template-02",
    component: VeterinarioTemplate02, palettes: VETERINARIO_02_PALETTES, defaultPaletteId: VETERINARIO_02_DEFAULT,
    imageFields: VET_02_FIELDS,
  },
  "veterinario-03": {
    id: "veterinario-03", name: "Veterinario (alterno C)", description: "Hospital veterinario / urgencias",
    category: "veterinario", publicPath: "/veterinario-template-03",
    component: VeterinarioTemplate03, palettes: VETERINARIO_03_PALETTES, defaultPaletteId: VETERINARIO_03_DEFAULT,
    imageFields: T03_FIELDS,
  },
  "psicologo-01": {
    id: "psicologo-01", name: "Psicólogo", description: "Consulta psicológica · switch de paleta",
    category: "psicologo", publicPath: "/psicologo",
    component: PsicologoTemplate01, palettes: PSICOLOGO_01_PALETTES, defaultPaletteId: PSICOLOGO_01_DEFAULT,
    imageFields: T01_FIELDS,
  },
  "psicologo-02": {
    id: "psicologo-02", name: "Psicólogo (alterno B)", description: "Diseño sereno en brumas",
    category: "psicologo", publicPath: "/psicologo-template-02",
    component: PsicologoTemplate02, palettes: PSICOLOGO_02_PALETTES, defaultPaletteId: PSICOLOGO_02_DEFAULT,
    imageFields: T02_FIELDS,
  },
  "psicologo-03": {
    id: "psicologo-03", name: "Psicólogo (alterno C)", description: "Bienestar y acompañamiento",
    category: "psicologo", publicPath: "/psicologo-template-03",
    component: PsicologoTemplate03, palettes: PSICOLOGO_03_PALETTES, defaultPaletteId: PSICOLOGO_03_DEFAULT,
    imageFields: T03_FIELDS,
  },
  "nutriologo-01": {
    id: "nutriologo-01", name: "Nutriólogo", description: "Consulta nutricional · switch de paleta",
    category: "nutriologo", publicPath: "/nutriologo",
    component: NutriologoTemplate01, palettes: NUTRIOLOGO_01_PALETTES, defaultPaletteId: NUTRIOLOGO_01_DEFAULT,
    imageFields: T01_FIELDS,
  },
  "nutriologo-02": {
    id: "nutriologo-02", name: "Nutriólogo (alterno B)", description: "Diseño fresco de alimentos",
    category: "nutriologo", publicPath: "/nutriologo-template-02",
    component: NutriologoTemplate02, palettes: NUTRIOLOGO_02_PALETTES, defaultPaletteId: NUTRIOLOGO_02_DEFAULT,
    imageFields: T02_FIELDS,
  },
  "nutriologo-03": {
    id: "nutriologo-03", name: "Nutriólogo (alterno C)", description: "Planner nutricional",
    category: "nutriologo", publicPath: "/nutriologo-template-03",
    component: NutriologoTemplate03, palettes: NUTRIOLOGO_03_PALETTES, defaultPaletteId: NUTRIOLOGO_03_DEFAULT,
    imageFields: T03_FIELDS,
  },
  "fisioterapia-01": {
    id: "fisioterapia-01", name: "Fisioterapia", description: "Rehabilitación física · switch de paleta",
    category: "fisioterapia", publicPath: "/fisioterapia",
    component: FisioterapiaTemplate01, palettes: FISIOTERAPIA_01_PALETTES, defaultPaletteId: FISIOTERAPIA_01_DEFAULT,
    imageFields: T01_FIELDS,
  },
  "fisioterapia-02": {
    id: "fisioterapia-02", name: "Fisioterapia (alterno B)", description: "Clínica de rehabilitación",
    category: "fisioterapia", publicPath: "/fisioterapia-template-02",
    component: FisioterapiaTemplate02, palettes: FISIOTERAPIA_02_PALETTES, defaultPaletteId: FISIOTERAPIA_02_DEFAULT,
    imageFields: T02_FIELDS,
  },
  "fisioterapia-03": {
    id: "fisioterapia-03", name: "Fisioterapia (alterno C)", description: "Diseño deportivo de alto impacto",
    category: "fisioterapia", publicPath: "/fisioterapia-template-03",
    component: FisioterapiaTemplate03, palettes: FISIOTERAPIA_03_PALETTES, defaultPaletteId: FISIOTERAPIA_03_DEFAULT,
    imageFields: FISIO_03_FIELDS,
  },
  "estetica-01": {
    id: "estetica-01", name: "Estética", description: "Clínica estética · switch de paleta",
    category: "estetica", publicPath: "/estetica",
    component: EsteticaTemplate01, palettes: ESTETICA_01_PALETTES, defaultPaletteId: ESTETICA_01_DEFAULT,
    imageFields: ESTETICA_01_FIELDS,
    serviceImageFields: ESTETICA_SERVICE_FIELDS,
  },
  "estetica-02": {
    id: "estetica-02", name: "Estética (alterno B)", description: "Diseño elegante en tonos nude",
    category: "estetica", publicPath: "/estetica-template-02",
    component: EsteticaTemplate02, palettes: ESTETICA_02_PALETTES, defaultPaletteId: ESTETICA_02_DEFAULT,
    imageFields: ESTETICA_02_FIELDS,
    serviceImageFields: ESTETICA_SERVICE_FIELDS,
  },
  "estetica-03": {
    id: "estetica-03", name: "Estética (alterno C)", description: "Diseño premium noir & oro",
    category: "estetica", publicPath: "/estetica-template-03",
    component: EsteticaTemplate03, palettes: ESTETICA_03_PALETTES, defaultPaletteId: ESTETICA_03_DEFAULT,
    imageFields: ESTETICA_03_FIELDS,
    serviceImageFields: ESTETICA_SERVICE_FIELDS,
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATE_REGISTRY);

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATE_REGISTRY[id];
}

export function getTemplatesByCategory(category: string): TemplateDefinition[] {
  return TEMPLATE_LIST.filter((t) => t.category === category);
}
