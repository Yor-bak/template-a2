"use client";
import type { TemplateComponentProps } from "@/types/template";
export default function Template06({ data }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="border-b border-yellow-500/30 pb-10 mb-10">
          <p className="text-yellow-400 text-xs uppercase tracking-widest mb-4">{data.specialty}</p>
          <h1 className="text-5xl font-extrabold text-white mb-3">{data.clinicName}</h1>
          <p className="text-yellow-400/80">{data.dentistName}</p>
        </div>
        <p className="text-white/60 text-lg leading-relaxed max-w-2xl">{data.shortDescription}</p>
        <div className="mt-12 flex gap-6 text-sm text-white/40">
          <span>{data.city}</span>
          <span>{data.phone}</span>
          <span>{data.email}</span>
        </div>
      </div>
    </div>
  );
}
