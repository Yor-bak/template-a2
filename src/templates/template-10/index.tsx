"use client";
import type { TemplateComponentProps } from "@/types/template";
export default function Template10({ data }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl" />
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-24 grid grid-cols-5 gap-12 items-center">
        <div className="col-span-3">
          <p className="text-purple-300 text-xs uppercase tracking-widest mb-6">{data.specialty}</p>
          <h1 className="text-7xl font-black leading-none mb-6">{data.clinicName}</h1>
          <p className="text-white/60 text-xl leading-relaxed">{data.shortDescription}</p>
        </div>
        <div className="col-span-2 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
          <p className="font-bold text-lg mb-1">{data.dentistName}</p>
          <p className="text-white/50 text-sm mb-6">{data.yearsExperience} años · {data.patientsServed}+ pacientes</p>
          <a href={`https://wa.me/${data.whatsapp}`} className="block text-center bg-white text-purple-900 font-extrabold py-3 rounded-xl hover:bg-purple-50 transition-colors">
            Agendar ahora
          </a>
        </div>
      </div>
    </div>
  );
}
