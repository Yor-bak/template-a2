"use client";
import { useState } from "react";
import Link from "next/link";
import { clinic } from "@/data/clinic";
import { whatsappLink } from "@/lib/utils";
import { Menu, X, Phone, CalendarDays } from "lucide-react";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/ubicacion", label: "Ubicación" },
  { href: "/preguntas-frecuentes", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0E2F3A] shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#70D6C7] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-[#0E2F3A] text-sm font-extrabold">DS</span>
            </div>
            <div className="leading-tight">
              <p className="text-white text-sm font-bold">{clinic.name}</p>
              <p className="text-[#70D6C7] text-xs opacity-80">{clinic.dentistName}</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={whatsappLink(clinic.whatsapp, "Hola, me gustaría solicitar más información")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/70 hover:text-white rounded-lg font-medium transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              {clinic.phone}
            </a>
            <Link
              href="/agendar"
              className="flex items-center gap-1.5 bg-[#70D6C7] text-[#0E2F3A] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#a0e8de] transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Agendar cita
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Menú"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0E2F3A] px-4 pb-4 pt-2 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/agendar"
            onClick={() => setOpen(false)}
            className="block mt-3 text-center bg-[#70D6C7] text-[#0E2F3A] px-4 py-3 rounded-xl text-sm font-bold hover:bg-[#a0e8de] transition-colors"
          >
            Agendar cita
          </Link>
        </div>
      )}
    </header>
  );
}
