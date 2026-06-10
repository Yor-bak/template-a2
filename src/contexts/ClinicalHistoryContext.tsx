"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { ClinicalHistory, ClinicalNote } from "@/types/clinical";
import { mockClinicalHistories } from "@/data/mockClinicalHistory";
import { mockClinicalNotes } from "@/data/mockClinicalNotes";

interface ClinicalHistoryContextValue {
  getClinicalHistory: (patientId: string) => ClinicalHistory | undefined;
  getClinicalNotes: (patientId: string) => ClinicalNote[];
  saveClinicalHistory: (patientId: string, data: Partial<Omit<ClinicalHistory, "id" | "clinicId" | "patientId" | "createdAt" | "updatedAt">>) => void;
  addClinicalNote: (note: Omit<ClinicalNote, "id" | "createdAt" | "updatedAt">) => ClinicalNote;
  updateClinicalNote: (id: string, data: Partial<ClinicalNote>) => void;
  deleteClinicalNote: (id: string) => void;
}

const ClinicalHistoryContext = createContext<ClinicalHistoryContextValue | null>(null);

export function ClinicalHistoryProvider({ children }: { children: ReactNode }) {
  const [histories, setHistories] = useState<ClinicalHistory[]>(mockClinicalHistories);
  const [notes, setNotes] = useState<ClinicalNote[]>(mockClinicalNotes);

  function getClinicalHistory(patientId: string): ClinicalHistory | undefined {
    return histories.find((h) => h.patientId === patientId);
  }

  function getClinicalNotes(patientId: string): ClinicalNote[] {
    return notes
      .filter((n) => n.patientId === patientId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  function saveClinicalHistory(
    patientId: string,
    data: Partial<Omit<ClinicalHistory, "id" | "clinicId" | "patientId" | "createdAt" | "updatedAt">>
  ) {
    setHistories((prev) => {
      const existing = prev.find((h) => h.patientId === patientId);
      if (existing) {
        return prev.map((h) =>
          h.patientId === patientId
            ? { ...h, ...data, updatedAt: new Date().toISOString() }
            : h
        );
      }
      const newHistory: ClinicalHistory = {
        id: `ch-${Date.now()}`,
        clinicId: "clinic-001",
        patientId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return [...prev, newHistory];
    });
  }

  function addClinicalNote(note: Omit<ClinicalNote, "id" | "createdAt" | "updatedAt">): ClinicalNote {
    const newNote: ClinicalNote = {
      ...note,
      id: `cn-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }

  function updateClinicalNote(id: string, data: Partial<ClinicalNote>) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n))
    );
  }

  function deleteClinicalNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <ClinicalHistoryContext.Provider
      value={{ getClinicalHistory, getClinicalNotes, saveClinicalHistory, addClinicalNote, updateClinicalNote, deleteClinicalNote }}
    >
      {children}
    </ClinicalHistoryContext.Provider>
  );
}

export function useClinicalHistory() {
  const ctx = useContext(ClinicalHistoryContext);
  if (!ctx) throw new Error("useClinicalHistory must be used inside ClinicalHistoryProvider");
  return ctx;
}
