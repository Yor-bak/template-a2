"use client";
import { EquipoProvider } from "@/contexts/EquipoContext";

export default function TrabajadorLayout({ children }: { children: React.ReactNode }) {
  return <EquipoProvider>{children}</EquipoProvider>;
}
