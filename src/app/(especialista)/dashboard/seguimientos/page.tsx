import { redirect } from "next/navigation";

// Seguimientos fue eliminado del panel. Los seguimientos de pacientes
// están disponibles desde el perfil de cada cliente en /dashboard/pacientes.
export default function SeguimientosPage() {
  redirect("/dashboard/pacientes");
}
