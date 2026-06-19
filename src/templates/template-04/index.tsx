"use client";
import type { TemplateComponentProps } from "@/types/template";
export default function Template04({ data }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">{data.specialty}</p>
        <h1 className="text-6xl font-black mb-4">{data.clinicName}</h1>
        <p className="text-gray-500 text-lg mb-8">{data.dentistName}</p>
        <hr className="border-gray-200 mb-8" />
        <p className="text-gray-600 leading-relaxed text-lg">{data.shortDescription}</p>
        <div className="mt-12 space-y-2 text-sm text-gray-400">
          <p>{data.address}</p>
          <p>{data.phone} · {data.email}</p>
        </div>
      </div>
    </div>
  );
}
