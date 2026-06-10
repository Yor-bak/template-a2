import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServicesProvider } from "@/contexts/ServicesContext";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ClinicConfigProvider } from "@/contexts/ClinicConfigContext";
import { ClinicalHistoryProvider } from "@/contexts/ClinicalHistoryContext";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clínica Dental Sonrisa | Dra. Mariana López",
  description:
    "Atención dental profesional, clara y segura para ti y tu familia. Agenda tu cita en línea.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geist.className} antialiased`}>
        <ClinicConfigProvider>
          <ClinicalHistoryProvider>
            <ThemeProvider>
              <AuthProvider>
                <ServicesProvider>
                  <CalendarProvider>{children}</CalendarProvider>
                </ServicesProvider>
              </AuthProvider>
            </ThemeProvider>
          </ClinicalHistoryProvider>
        </ClinicConfigProvider>
      </body>
    </html>
  );
}
