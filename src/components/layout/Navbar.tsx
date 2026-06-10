"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { whatsappLink } from "@/lib/utils";
import { Menu, X, Phone, CalendarDays, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/",                    label: "Inicio",    exact: true  },
  { href: "/servicios",           label: "Servicios", exact: false },
  { href: "/ubicacion",           label: "Ubicación", exact: false },
  { href: "/preguntas-frecuentes", label: "FAQ",      exact: false },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { config } = useClinicConfig();
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-primary-dark)] border-b border-white/8 shadow-lg shadow-black/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[var(--color-accent)] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:opacity-90 transition-opacity">
              <Stethoscope className="w-4 h-4 text-[var(--color-primary-dark)]" />
            </div>
            <div className="leading-tight">
              <p className="text-white text-sm font-bold leading-none">{config.clinicName}</p>
              <p className="text-[var(--color-accent)] text-[11px] opacity-75 leading-none mt-0.5">{config.dentistName}</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {links.map((l) => {
              const active = isActive(l.href, l.exact);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "relative px-4 py-2 text-sm rounded-lg transition-colors font-medium",
                    active
                      ? "text-white bg-white/8"
                      : "text-white/55 hover:text-white/85 hover:bg-white/5"
                  )}
                >
                  {l.label}
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[var(--color-accent)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href={whatsappLink(config.whatsapp, "Hola, me gustaría solicitar más información")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/50 hover:text-white/80 rounded-lg transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              {config.phone}
            </a>
            <Link
              href="/agendar"
              className="flex items-center gap-1.5 bg-[var(--color-accent)] text-[var(--color-primary-dark)] px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Agendar cita
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Menú"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/8 bg-[var(--color-primary-dark)] px-4 pb-5 pt-3 space-y-1">
          {links.map((l) => {
            const active = isActive(l.href, l.exact);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-white/8 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/8 mt-2 space-y-2">
            <a
              href={whatsappLink(config.whatsapp, "Hola, me gustaría solicitar más información")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-white/55 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4" />
              {config.phone}
            </a>
            <Link
              href="/agendar"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-primary-dark)] px-4 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <CalendarDays className="w-4 h-4" />
              Agendar cita
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
