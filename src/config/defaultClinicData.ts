import type { ClinicConfig } from "@/types/clinic";

export const DEFAULT_CLINIC_CONFIG: ClinicConfig = {
  id: "clinic-001",
  clinicName: "Clínica Dental Sonrisa",
  dentistName: "Dra. Mariana López",
  professionalLicense: "12345678",
  specialty: "Odontología Integral",
  yearsExperience: 8,
  patientsServed: 1200,
  shortDescription:
    "Atención dental profesional, cercana y segura para cuidar tu salud bucal desde la primera cita.",
  welcomeMessage:
    "Atención dental profesional, clara y segura para ti y tu familia. Tu sonrisa es nuestra prioridad.",

  address: "Av. Insurgentes Sur 1234, Col. Del Valle, Ciudad de México, CP 03100",
  neighborhood: "Col. Del Valle",
  city: "Ciudad de México",
  state: "CDMX",
  country: "México",
  locationReferences: "A una cuadra del metro Del Valle, frente al parque central",

  phone: "55 1234 5678",
  whatsapp: "5512345678",
  email: "contacto@clinicasonrisa.com",

  googleMapsUrl:
    "https://maps.google.com/?q=Av.+Insurgentes+Sur+1234+Ciudad+de+Mexico",
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3763.9!2d-99.1795!3d19.3836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDIzJzAwLjgiTiA5OcKwMTAnNDYuMiJX!5e0!3m2!1ses!2smx!4v1680000000000!5m2!1ses!2smx",

  parkingAvailable: true,
  parkingDetails: "Estacionamiento disponible frente al consultorio.",

  acceptsEmergencies: true,
  emergencyDescription:
    "¿Dolor intenso, inflamación o fractura dental? Contáctanos para revisar disponibilidad de atención el mismo día.",
  emergencyPhone: "55 1234 5678",
  emergencyWhatsapp: "5512345678",

  acceptedPayments: ["cash", "credit_card", "debit_card", "transfer"],

  openingHours: [
    { dayOfWeek: 0, dayLabel: "Domingo",   isOpen: false, blocks: [] },
    { dayOfWeek: 1, dayLabel: "Lunes",     isOpen: true,  blocks: [{ startTime: "09:00", endTime: "14:00" }, { startTime: "16:00", endTime: "19:00" }] },
    { dayOfWeek: 2, dayLabel: "Martes",    isOpen: true,  blocks: [{ startTime: "09:00", endTime: "14:00" }, { startTime: "16:00", endTime: "19:00" }] },
    { dayOfWeek: 3, dayLabel: "Miércoles", isOpen: true,  blocks: [{ startTime: "09:00", endTime: "14:00" }, { startTime: "16:00", endTime: "19:00" }] },
    { dayOfWeek: 4, dayLabel: "Jueves",    isOpen: true,  blocks: [{ startTime: "09:00", endTime: "14:00" }, { startTime: "16:00", endTime: "19:00" }] },
    { dayOfWeek: 5, dayLabel: "Viernes",   isOpen: true,  blocks: [{ startTime: "09:00", endTime: "14:00" }, { startTime: "16:00", endTime: "19:00" }] },
    { dayOfWeek: 6, dayLabel: "Sábado",    isOpen: true,  blocks: [{ startTime: "09:00", endTime: "14:00" }] },
  ],

  showPrices: true,
  socialMedia: {
    facebook: "https://facebook.com/clinicasonrisa",
    instagram: "https://instagram.com/clinicasonrisa",
  },

  publicPageStatus: "published",
  plan: "basic",

  logoUrl: "",
  heroImageUrl: "",
  dentistPhotoUrl: "",
  clinicGalleryUrls: [],
  beforeAfterGalleryUrls: [],

  seoTitle: "Clínica Dental Sonrisa | Dra. Mariana López — Del Valle, CDMX",
  seoDescription: "Atención dental profesional en Col. Del Valle, CDMX. Citas en línea, urgencias y más de 8 años de experiencia. Agenda hoy.",
  seoKeywords: ["dentista del valle", "clínica dental cdmx", "limpieza dental", "ortodoncia"],
  seoCity: "Ciudad de México",
  seoNeighborhood: "Col. Del Valle",
  seoMainServices: ["Limpieza dental", "Blanqueamiento", "Ortodoncia", "Extracciones"],

  messageTemplates: {},

  subdomain: "clinicasonrisa",
  customDomain: "",

  themePalette: "dental_premium",
  automationEnabled: false,
  automationMode: "none",
  n8nWebhookUrl: null,

  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-06-10T00:00:00Z",
};
