"use client";
import type { TemplateComponentProps } from "@/types/template";
export default function Template07({ data }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-rose-50">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-rose-400 text-sm mb-2">Testimonios de nuestros pacientes</p>
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 italic text-gray-600 text-lg">
          &ldquo;La mejor atención dental que he recibido. 100% recomendada.&rdquo;
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{data.clinicName}</h1>
        <p className="text-gray-500">{data.dentistName} · {data.specialty}</p>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">{data.shortDescription}</p>
      </div>
    </div>
  );
}
