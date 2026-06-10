import type { Clinic } from "@/types";

export const clinic: Clinic = {
  name: "Clínica Dental Sonrisa",
  dentistName: "Dra. Mariana López",
  professionalLicense: "12345678",
  address: "Av. Insurgentes Sur 1234, Col. Del Valle, Ciudad de México, CP 03100",
  phone: "55 1234 5678",
  whatsapp: "5512345678",
  email: "contacto@clinicasonrisa.com",
  googleMapsUrl: "https://maps.google.com/?q=Av.+Insurgentes+Sur+1234+Ciudad+de+Mexico",
  googleMapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3763.9!2d-99.1795!3d19.3836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDIzJzAwLjgiTiA5OcKwMTAnNDYuMiJX!5e0!3m2!1ses!2smx!4v1680000000000!5m2!1ses!2smx",
  welcomeMessage:
    "Atención dental profesional, clara y segura para ti y tu familia. Tu sonrisa es nuestra prioridad.",
  showPrices: true,
  openingHours: [
    { days: "Lunes — Viernes", hours: "9:00 am — 7:00 pm" },
    { days: "Sábado", hours: "9:00 am — 2:00 pm" },
    { days: "Domingo", hours: "Cerrado" },
  ],
  socialMedia: {
    facebook: "https://facebook.com/clinicasonrisa",
    instagram: "https://instagram.com/clinicasonrisa",
  },
  parkingAvailable: true,
  parkingNotes: "Estacionamiento disponible frente al consultorio",
  locationReferences: "A una cuadra del metro Del Valle, frente al parque central",
};
