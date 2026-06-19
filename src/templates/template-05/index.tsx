"use client";
import type { TemplateComponentProps } from "@/types/template";
export default function Template05({ data }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-amber-50">
      <div className="grid grid-cols-3 min-h-screen">
        <div className="col-span-2 p-16">
          <h1 className="text-5xl font-black text-gray-900 mb-6">{data.clinicName}</h1>
          <p className="text-gray-600 text-xl leading-relaxed">{data.shortDescription}</p>
        </div>
        <div className="bg-amber-900 text-white p-12 flex flex-col justify-end">
          <p className="text-amber-300 text-sm mb-2">{data.specialty}</p>
          <p className="font-bold text-lg">{data.dentistName}</p>
          <p className="text-white/60 text-sm mt-1">{data.city}</p>
          <p className="text-white/60 text-sm">{data.phone}</p>
        </div>
      </div>
    </div>
  );
}
