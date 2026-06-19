"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { DEFAULT_TEMPLATE_ID } from "@/config/templates";

interface TemplateStoreValue {
  selectedTemplateId: string;
  setTemplate: (id: string) => void;
}

const TemplateStoreContext = createContext<TemplateStoreValue | null>(null);

export function TemplateStoreProvider({ children }: { children: ReactNode }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATE_ID);
  return (
    <TemplateStoreContext.Provider value={{ selectedTemplateId, setTemplate: setSelectedTemplateId }}>
      {children}
    </TemplateStoreContext.Provider>
  );
}

export function useTemplateStore() {
  const ctx = useContext(TemplateStoreContext);
  if (!ctx) throw new Error("useTemplateStore must be used inside TemplateStoreProvider");
  return ctx;
}
