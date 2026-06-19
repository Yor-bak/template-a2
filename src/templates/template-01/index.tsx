"use client";
import type { TemplateComponentProps } from "@/types/template";

export default function Template01({ data }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-extrabold text-[var(--color-text)] mb-2">{data.clinicName}</h1>
        <p className="text-[var(--color-muted-text)] text-lg mb-1">{data.dentistName}</p>
        <p className="text-sm text-[var(--color-muted-text)] mb-6">{data.specialty} · {data.yearsExperience} años de experiencia</p>
        <p className="text-[var(--color-muted-text)] max-w-2xl mx-auto mb-8">{data.shortDescription}</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-[var(--color-muted-text)]">
          <span>📍 {data.city}</span>
          <span>📞 {data.phone}</span>
          <span>✉️ {data.email}</span>
        </div>
      </div>
    </div>
  );
}
