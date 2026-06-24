import type { Metadata } from "next";
import { Geist, Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServicesProvider } from "@/contexts/ServicesContext";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ClinicConfigProvider } from "@/contexts/ClinicConfigContext";
import { ClinicalHistoryProvider } from "@/contexts/ClinicalHistoryContext";
import { ExtraProfileProvider } from "@/contexts/ExtraProfileContext";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Clínica Dental Sonrisa | Dra. Mariana López",
  description:
    "Atención dental profesional, clara y segura para ti y tu familia. Agenda tu cita en línea.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className={`${geist.className} min-h-full flex flex-col`}>
        <ClinicConfigProvider>
          <ClinicalHistoryProvider>
            <ThemeProvider>
              <AuthProvider>
                <ServicesProvider>
                  <ExtraProfileProvider>
                    <CalendarProvider>{children}</CalendarProvider>
                  </ExtraProfileProvider>
                </ServicesProvider>
              </AuthProvider>
            </ThemeProvider>
          </ClinicalHistoryProvider>
        </ClinicConfigProvider>
      </body>
    </html>
  );
}
