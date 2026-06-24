// Lucide icon names available per specialist category.
// The value stored in service.icon is always the lucide icon name string.

export type SpecialistCategory =
  | "dentista"
  | "medico"
  | "psicologo"
  | "nutriologo"
  | "fisioterapia"
  | "veterinario"
  | "estetica"
  | "general";

export interface IconOption {
  value: string;   // lucide icon name (PascalCase)
  label: string;   // human label
}

const SHARED: IconOption[] = [
  { value: "Star",          label: "Estrella"         },
  { value: "CheckCircle2",  label: "Verificado"       },
  { value: "Clock",         label: "Reloj"            },
  { value: "Calendar",      label: "Cita"             },
  { value: "BadgeCheck",    label: "Badge"            },
  { value: "Stethoscope",   label: "Estetoscopio"     },
  { value: "Heart",         label: "Corazón"          },
  { value: "ShieldCheck",   label: "Protección"       },
  { value: "Sparkles",      label: "Destellos"        },
];

export const SERVICE_ICONS_BY_CATEGORY: Record<SpecialistCategory, IconOption[]> = {
  dentista: [
    { value: "SmilePlus",      label: "Sonrisa"         },
    { value: "Smile",          label: "Diente"          },
    { value: "Aperture",       label: "Ortodoncia"      },
    { value: "Zap",            label: "Blanqueamiento"  },
    { value: "Shield",         label: "Implante"        },
    { value: "Scissors",       label: "Extracción"      },
    { value: "ScanLine",       label: "Radiografía"     },
    { value: "Baby",           label: "Pediatría"       },
    ...SHARED,
  ],
  medico: [
    { value: "Stethoscope",    label: "Consulta"        },
    { value: "Pill",           label: "Medicamento"     },
    { value: "Activity",       label: "Signos vitales"  },
    { value: "Microscope",     label: "Laboratorio"     },
    { value: "Brain",          label: "Neurología"      },
    { value: "Bone",           label: "Traumatología"   },
    { value: "Eye",            label: "Oftalmología"    },
    { value: "Lungs",          label: "Neumología"      },
    { value: "TestTube",       label: "Análisis"        },
    ...SHARED,
  ],
  psicologo: [
    { value: "Brain",          label: "Mente"           },
    { value: "MessageCircle",  label: "Terapia"         },
    { value: "Heart",          label: "Bienestar"       },
    { value: "Users",          label: "Grupal"          },
    { value: "User",           label: "Individual"      },
    { value: "Moon",           label: "Sueño"           },
    { value: "Smile",          label: "Emociones"       },
    { value: "BookOpen",       label: "Psicoanálisis"   },
    { value: "Puzzle",         label: "TDAH"            },
    ...SHARED,
  ],
  nutriologo: [
    { value: "Apple",          label: "Nutrición"       },
    { value: "Salad",          label: "Dieta"           },
    { value: "Weight",         label: "Control de peso" },
    { value: "Flame",          label: "Metabolismo"     },
    { value: "Droplets",       label: "Hidratación"     },
    { value: "Utensils",       label: "Plan alimenticio"},
    { value: "Baby",           label: "Nutrición infantil"},
    { value: "Activity",       label: "Deporte"         },
    ...SHARED,
  ],
  fisioterapia: [
    { value: "Activity",       label: "Rehabilitación"  },
    { value: "Zap",            label: "Electroterapia"  },
    { value: "Move",           label: "Movilidad"       },
    { value: "Bone",           label: "Columna"         },
    { value: "Hand",           label: "Masaje"          },
    { value: "Target",         label: "Postura"         },
    { value: "Dumbbell",       label: "Ejercicio"       },
    { value: "Waves",          label: "Ultrasonido"     },
    { value: "RotateCcw",      label: "Recuperación"    },
    ...SHARED,
  ],
  veterinario: [
    { value: "PawPrint",       label: "Mascota"         },
    { value: "Dog",            label: "Perro"           },
    { value: "Cat",            label: "Gato"            },
    { value: "Syringe",        label: "Vacuna"          },
    { value: "Scissors",       label: "Estética"        },
    { value: "Stethoscope",    label: "Consulta"        },
    { value: "Microscope",     label: "Laboratorio"     },
    { value: "ShieldCheck",    label: "Prevención"      },
    { value: "AlertTriangle",  label: "Urgencias"       },
    ...SHARED,
  ],
  estetica: [
    { value: "Sparkles",       label: "Tratamiento"     },
    { value: "Sun",            label: "Facial"          },
    { value: "Droplets",       label: "Hidratación"     },
    { value: "Scissors",       label: "Depilación"      },
    { value: "Star",           label: "Premium"         },
    { value: "Zap",            label: "Láser"           },
    { value: "Eye",            label: "Contorno de ojos"},
    { value: "Hand",           label: "Manos"           },
    { value: "Smile",          label: "Rellenos"        },
    ...SHARED,
  ],
  general: [...SHARED],
};

export function getIconsForCategory(category: string): IconOption[] {
  const cat = category as SpecialistCategory;
  return SERVICE_ICONS_BY_CATEGORY[cat] ?? SERVICE_ICONS_BY_CATEGORY.general;
}
