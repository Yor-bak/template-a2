// Tipos canónicos — agnósticos a especialidad

export interface Address {
  street: string;
  exteriorNumber?: string;
  interiorNumber?: string;
  neighborhood: string;
  municipality?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  references?: string;
  mapsUrl?: string;
  mapsEmbedUrl?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  website?: string;
}

export interface PaymentInstructions {
  showTransferDetails: boolean;
  bankName?: string;
  accountHolder?: string;
  clabe?: string;
  accountNumber?: string;
  cardLastFourDigits?: string;
  paymentLink?: string;
  transferReferenceInstructions?: string;
}

export interface SpecialistProfile {
  displayName: string;
  professionalTitle?: string;
  specialty: string;
  professionalLicense: string;
  specialtyLicense?: string;
  school?: string;
  certifications?: string[];
  yearsExperience?: number;
  patientsServed?: number;
  shortDescription: string;
  biography?: string;
  photoUrl?: string;
}

export interface BusinessProfile {
  name: string;
  description?: string;
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  email?: string;
  websiteUrl?: string;
  address: Address;
  socialLinks: SocialLinks;
  parkingAvailable?: boolean;
  parkingDetails?: string;
  accessibilityAvailable?: boolean;
  accessibilityDetails?: string;
  acceptsEmergencies?: boolean;
  emergencyPhone?: string;
  emergencyWhatsapp?: string;
  emergencyDescription?: string;
  serviceModalities: {
    inPerson: boolean;
    online: boolean;
    homeVisit: boolean;
  };
}

export type PublicPriceType = "fixed" | "from" | "assessment_required" | "hidden";

export interface PublicService {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  durationMinutes?: number;
  priceType: PublicPriceType;
  estimatedPrice?: number;
  includes?: string[];
  recommendations?: string[];
  whenRecommended?: string;
  imageUrl?: string;
  icon?: string;
  isEmergency: boolean;
  isActive: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface PublicTestimonial {
  id: string;
  name: string;
  comment: string;
  rating?: number;
  serviceId?: string;
  photoUrl?: string;
  isPublished: boolean;
  displayOrder?: number;
}

export interface PublicFAQ {
  id: string;
  question: string;
  answer: string;
  isPublished: boolean;
  displayOrder?: number;
}

export interface Benefit {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  isVisible: boolean;
  displayOrder?: number;
}

export interface ProcessStage {
  id: string;
  title: string;
  description?: string;
  isVisible: boolean;
  displayOrder?: number;
}

export type PublicPaymentMethod =
  | "cash"
  | "card"
  | "credit_card"
  | "debit_card"
  | "transfer"
  | "months_without_interest"
  | "insurance"
  | "other";

export interface OpeningHourBlock {
  dayOfWeek: number;
  dayLabel: string;
  isOpen: boolean;
  blocks: { startTime: string; endTime: string }[];
}

export interface AppearanceConfig {
  selectedTemplateId: string;
  selectedPaletteId: string;
  logoUrl?: string;
  specialistPhotoUrl?: string;
  heroImageUrl?: string;
  galleryUrls: string[];
  beforeAfterGalleryUrls: string[];
}

// Images stored per templateId so switching templates preserves each set
export type TemplateImages = Record<string, Record<string, string | string[]>>;

export interface DashboardColorSet {
  background: string;
  surface: string;
  surfaceMuted: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  text: string;
  textMuted: string;
  border: string;
}

export interface DashboardTheme {
  mode: "light" | "dark" | "system";
  lightColors: DashboardColorSet;
  darkColors: DashboardColorSet;
}

export interface SectionVisibility {
  specialist: boolean;
  services: boolean;
  benefits: boolean;
  testimonials: boolean;
  faqs: boolean;
  gallery: boolean;
  payments: boolean;
  processStages: boolean;
  location: boolean;
  emergencies: boolean;
}

export interface PublicPageConfig {
  status: "draft" | "published";
  slug: string;
  primaryAction: "appointment" | "whatsapp" | "phone";
  primaryButtonLabel: string;
  secondaryButtonLabel?: string;
  whatsappPrefilledMessage?: string;
  showPrices: boolean;
  sectionVisibility: SectionVisibility;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    city?: string;
    neighborhood?: string;
    socialImageUrl?: string;
  };
}

export interface PublicBusinessProfile {
  id: string;
  specialist: SpecialistProfile;
  business: BusinessProfile;
  services: PublicService[];
  testimonials: PublicTestimonial[];
  faqs: PublicFAQ[];
  benefits: Benefit[];
  processStages: ProcessStage[];
  paymentMethods: PublicPaymentMethod[];
  paymentInstructions: PaymentInstructions;
  openingHours: OpeningHourBlock[];
  appearance: AppearanceConfig;
  publicPage: PublicPageConfig;
  updatedAt: string;
}
