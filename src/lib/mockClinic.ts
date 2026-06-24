export type PriceType = "fijo" | "desde" | "valoracion";

export type Service = {
  name: string;
  price: string;
  priceType: PriceType;
  description: string;
  isUrgency?: boolean;
};

export const clinic = {
  name: "Estudio Dental Meridiano",
  doctor: "Dra. Renata Solís Vega",
  specialty: "Rehabilitación Oral y Estética Dental",
  school: "UNAM",
  experienceYears: "12",
  patients: "1,840",
  license: "6512345",
  specialtyLicense: "9871234",
  welcomeMessage:
    "Consultorio de la Dra. Renata Solís Vega en Mixcoac. Diagnóstico medido, tratamiento explicado y seguimiento real — no una promesa genérica de “sonrisa perfecta”.",
  address: {
    street: "Avenida Insurgentes Sur 1457, Int. 302",
    neighborhood: "Col. Insurgentes Mixcoac, Alcaldía Benito Juárez",
    zip: "C.P. 03920, CDMX",
    reference: "A dos cuadras del metro Mixcoac. Torre Cristal, planta baja, acceso directo desde la calle.",
    mapsUrl: "https://maps.google.com/?q=Avenida+Insurgentes+Sur+1457+CDMX",
  },
  phone: "(55) 4821 3360",
  phoneHref: "+525548213360",
  whatsapp: "https://wa.me/525548213360",
  email: "contacto@meridianodental.mx",
  social: {
    facebook: "https://facebook.com/EstudioDentalMeridiano",
    instagram: "https://instagram.com/meridiano.dental",
    instagramHandle: "@meridiano.dental",
  },
};

export const services: Service[] = [
  {
    name: "Valoración inicial y diagnóstico",
    price: "$450",
    priceType: "fijo",
    description: "Revisión clínica completa, radiografía digital y plan de tratamiento por escrito.",
  },
  {
    name: "Limpieza dental profunda",
    price: "$900",
    priceType: "fijo",
    description: "Profilaxis con ultrasonido y pulido. Incluye revisión de encías.",
  },
  {
    name: "Resina estética",
    price: "$1,200",
    priceType: "desde",
    description: "Restauración de color natural, por diente tratado.",
  },
  {
    name: "Blanqueamiento en consultorio",
    price: "$3,800",
    priceType: "fijo",
    description: "Una sesión de 60 minutos con gel de uso profesional.",
  },
  {
    name: "Corona de porcelana",
    price: "$7,500",
    priceType: "desde",
    description: "Diseño y color ajustados a tu mordida y al resto de tu sonrisa.",
  },
  {
    name: "Diseño de sonrisa digital",
    price: "Requiere valoración",
    priceType: "valoracion",
    description: "Simulación fotográfica sobre tu línea media antes de tocar un solo diente.",
  },
  {
    name: "Endodoncia",
    price: "$2,900",
    priceType: "desde",
    description: "Tratamiento de conducto con localizador apical electrónico.",
  },
  {
    name: "Extracción simple",
    price: "$850",
    priceType: "fijo",
    description: "Bajo anestesia local, con indicaciones de cuidado posterior.",
  },
  {
    name: "Urgencia dental",
    price: "$650",
    priceType: "fijo",
    description: "Dolor agudo, fractura o golpe. Respuesta el mismo día.",
    isUrgency: true,
  },
];

export const priceTypeLabel: Record<PriceType, string> = {
  fijo: "Precio fijo",
  desde: "Desde",
  valoracion: "Previa valoración",
};

export const schedule = [
  { day: "Lunes", hours: "9:00 – 19:00" },
  { day: "Martes", hours: "9:00 – 19:00" },
  { day: "Miércoles", hours: "9:00 – 19:00" },
  { day: "Jueves", hours: "9:00 – 19:00" },
  { day: "Viernes", hours: "9:00 – 19:00" },
  { day: "Sábado", hours: "9:00 – 14:00" },
  { day: "Domingo", hours: "Cerrado" },
];

export const paymentMethods = [
  "Efectivo",
  "Tarjeta de crédito / débito",
  "Transferencia bancaria",
  "Meses sin intereses (3 y 6 meses)",
];

export const testimonials = [
  {
    quote: "Llegué con un diente roto un domingo en la noche y me contestaron en diez minutos.",
    name: "Jorge A.",
    treatment: "Urgencia dental",
  },
  {
    quote: "Me explicó cada paso del diseño de sonrisa con fotos y medidas. No improvisó nada.",
    name: "Karla R.",
    treatment: "Diseño de sonrisa digital",
  },
  {
    quote: "Doce años yendo con la misma doctora. Eso ya dice todo.",
    name: "Mauricio T.",
    treatment: "Paciente desde 2014",
  },
];

export const milestones = [
  { value: clinic.experienceYears, label: "años de práctica" },
  { value: clinic.patients, label: "pacientes atendidos" },
  { value: clinic.license, label: "cédula profesional" },
];
