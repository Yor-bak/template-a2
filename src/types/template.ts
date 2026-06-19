import type { SpecialistPublicProfile } from "@/types/specialist";

export interface TemplateDefinition {
  id: string;          // "template-01" ... "template-10"
  name: string;
  description: string;
  previewImageUrl?: string;
  isPro: boolean;      // false = disponible en plan básico
}

export interface TemplateComponentProps {
  data: SpecialistPublicProfile;
}
