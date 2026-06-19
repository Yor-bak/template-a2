"use client";
import type { TemplateComponentProps } from "@/types/template";
export default function Template03({ data }: TemplateComponentProps) {
  return (
    <div className="min-h-screen relative bg-gray-900 text-white flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 text-center max-w-2xl px-4">
        <h1 className="text-5xl font-extrabold mb-4">{data.clinicName}</h1>
        <p className="text-white/80 text-xl mb-2">{data.dentistName}</p>
        <p className="text-white/60 mb-6">{data.specialty}</p>
        <p className="text-white/70 mb-8">{data.shortDescription}</p>
        <a href={`https://wa.me/${data.whatsapp}`} className="inline-block bg-white text-gray-900 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors">
          Agendar cita
        </a>
      </div>
    </div>
  );
}
