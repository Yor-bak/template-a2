"use client";
import { useState } from "react";
import type { TemplateComponentProps } from "@/types/template";
export default function Template08({ data }: TemplateComponentProps) {
  const [open, setOpen] = useState<number | null>(null);
  const services = ["Limpieza dental", "Blanqueamiento", "Ortodoncia", "Extracciones"];
  return (
    <div className="min-h-screen bg-teal-50">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-extrabold text-teal-900 mb-2">{data.clinicName}</h1>
        <p className="text-teal-600 mb-10">{data.dentistName}</p>
        <div className="space-y-3">
          {services.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-teal-100 overflow-hidden">
              <button className="w-full text-left px-6 py-4 font-semibold text-gray-900 hover:bg-teal-50 transition-colors flex justify-between" onClick={() => setOpen(open === i ? null : i)}>
                {s} <span>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div className="px-6 pb-4 text-gray-500 text-sm">Descripción del servicio de {s.toLowerCase()}. Contáctanos para más información.</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
