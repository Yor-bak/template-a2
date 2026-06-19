"use client";
import type { TemplateComponentProps } from "@/types/template";
export default function Template02({ data }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      <aside className="w-64 bg-[var(--color-primary)] text-white p-8 flex-shrink-0">
        <h2 className="font-extrabold text-lg mb-1">{data.clinicName}</h2>
        <p className="text-white/70 text-sm">{data.dentistName}</p>
        <p className="text-white/50 text-xs mt-1">{data.specialty}</p>
      </aside>
      <main className="flex-1 p-12">
        <p className="text-[var(--color-muted-text)]">{data.shortDescription}</p>
      </main>
    </div>
  );
}
