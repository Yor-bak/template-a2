import type { PublicBusinessProfile } from "@/types/profile";

export interface TemplatePalette {
  id: string;
  name: string;
  swatch: string;
  surface: string;
  ink: string;
  vars: Record<string, string>;
}

export type ImageFieldType =
  | "logo"
  | "specialist"
  | "hero"
  | "background"
  | "gallery"
  | "before_after";

export interface TemplateImageField {
  key: string;
  label: string;
  description?: string;
  required: boolean;
  type: ImageFieldType;
  multiple?: boolean;
  maxItems?: number;
  recommendedAspectRatio?: string;
}

export interface TemplateProps {
  profile: PublicBusinessProfile;
  onPaletteChange?: (paletteId: string) => void;
  isPreview?: boolean;
}
