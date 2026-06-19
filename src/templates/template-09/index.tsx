"use client";
import type { TemplateComponentProps } from "@/types/template";
export default function Template09({ data }: TemplateComponentProps) {
  const steps = ["Agenda tu cita en línea", "Consulta inicial sin costo", "Plan de tratamiento personalizado", "Sonrisa perfecta"];
  return (
    <div className="min-h-screen bg-sky-50">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-extrabold text-sky-900 mb-2">{data.clinicName}</h1>
        <p className="text-sky-600 mb-12">{data.dentistName}</p>
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-extrabold flex-shrink-0">{i + 1}</div>
              <p className="text-gray-700 text-lg pt-1">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
