// Store temporal para el estado del especialista.
// Será reemplazado por llamadas a API cuando el backend esté listo.
// Por ahora expone el contexto existente de ClinicConfig.
export { useClinicConfig as useSpecialistStore } from "@/contexts/ClinicConfigContext";
