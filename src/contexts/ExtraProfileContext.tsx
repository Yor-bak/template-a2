"use client";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type {
  PublicTestimonial, PublicFAQ, Benefit, ProcessStage,
  AppearanceConfig, PublicPageConfig, Address, SocialLinks,
  TemplateImages, DashboardTheme, DashboardColorSet, PaymentInstructions,
  ServiceTemplateMedia,
} from "@/types/profile";
import {
  getThemePreset, DEFAULT_THEME_ID,
  getDarkThemePreset, DEFAULT_DARK_THEME_ID,
  DASHBOARD_DARK_THEME_PRESETS,
} from "@/lib/dashboardThemes";
import { DEFAULT_PUBLIC_PROFILE } from "@/data/defaultProfile";

const STORAGE_KEY = "template-a2-public-profile";

interface SpecialistExtra {
  professionalTitle?: string;
  specialtyLicense?: string;
  school?: string;
  certifications?: string[];
  biography?: string;
}

interface BusinessExtra {
  description?: string;
  websiteUrl?: string;
  address: Partial<Address>;
  socialLinksExtra: Pick<SocialLinks, "instagram" | "facebook" | "tiktok" | "youtube" | "linkedin" | "website">;
  serviceModalities: { inPerson: boolean; online: boolean; homeVisit: boolean };
  accessibilityAvailable?: boolean;
  accessibilityDetails?: string;
}

const _defaultPreset = getThemePreset(DEFAULT_THEME_ID);
const _defaultDarkPreset = getDarkThemePreset(DEFAULT_DARK_THEME_ID);
export const DEFAULT_DASHBOARD_LIGHT: DashboardColorSet = _defaultPreset.light;
export const DEFAULT_DASHBOARD_DARK: DashboardColorSet = _defaultDarkPreset.colors;

const DEFAULT_DASHBOARD_THEME: DashboardTheme = {
  selectedThemeId: DEFAULT_THEME_ID,
  selectedDarkThemeId: DEFAULT_DARK_THEME_ID,
  mode: "light",
  lightColors: _defaultPreset.light,
  darkColors: _defaultDarkPreset.colors,
};

const VALID_DARK_THEME_IDS = new Set(DASHBOARD_DARK_THEME_PRESETS.map((t) => t.id));

/**
 * Migrates a persisted DashboardTheme from the pre-2026-07 model (dark colors
 * derived from the same preset as the light theme) to the 5 approved dark
 * palettes. Idempotent: once selectedDarkThemeId is a valid new id, this is a
 * no-op on every subsequent run. Never touches selectedThemeId/lightColors/mode.
 */
function migrateDashboardTheme(theme: DashboardTheme): DashboardTheme {
  const storedDarkId = theme.selectedDarkThemeId;
  if (storedDarkId && VALID_DARK_THEME_IDS.has(storedDarkId)) {
    return theme; // already migrated — no-op
  }
  const fallback = getDarkThemePreset(DEFAULT_DARK_THEME_ID);
  return { ...theme, selectedDarkThemeId: fallback.id, darkColors: fallback.colors };
}

export interface ExtraProfileState {
  specialistExtra: SpecialistExtra;
  businessExtra: BusinessExtra;
  testimonials: PublicTestimonial[];
  faqs: PublicFAQ[];
  benefits: Benefit[];
  processStages: ProcessStage[];
  paymentInstructions: PaymentInstructions;
  appearance: AppearanceConfig;
  publicPage: PublicPageConfig;
  templateImages: TemplateImages;
  serviceTemplateMedia: ServiceTemplateMedia;
  dashboardTheme: DashboardTheme;
}

interface ExtraProfileContextValue extends ExtraProfileState {
  updateSpecialistExtra: (partial: Partial<SpecialistExtra>) => void;
  updateBusinessExtra: (partial: Partial<BusinessExtra>) => void;
  updatePaymentInstructions: (partial: Partial<PaymentInstructions>) => void;
  updateAppearance: (partial: Partial<AppearanceConfig>) => void;
  updatePublicPage: (partial: Partial<PublicPageConfig>) => void;
  updateServiceTemplateMedia: (templateId: string, serviceId: string, fields: Record<string, string | string[]>) => void;
  upsertTestimonial: (t: PublicTestimonial) => void;
  deleteTestimonial: (id: string) => void;
  upsertFAQ: (f: PublicFAQ) => void;
  deleteFAQ: (id: string) => void;
  upsertBenefit: (b: Benefit) => void;
  deleteBenefit: (id: string) => void;
  upsertProcessStage: (s: ProcessStage) => void;
  deleteProcessStage: (id: string) => void;
  updateTemplateImages: (templateId: string, fields: Record<string, string | string[]>) => void;
  updateDashboardTheme: (partial: Partial<DashboardTheme>) => void;
  resetToDefaults: () => void;
}

const ExtraProfileContext = createContext<ExtraProfileContextValue | null>(null);

const DEF = DEFAULT_PUBLIC_PROFILE;

const DEFAULT_PAYMENT_INSTRUCTIONS: PaymentInstructions = {
  showTransferDetails: false,
};

const DEFAULT_EXTRA: ExtraProfileState = {
  specialistExtra: {},
  paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
  businessExtra: {
    address: {
      street: DEF.business.address.street,
      exteriorNumber: DEF.business.address.exteriorNumber,
      interiorNumber: DEF.business.address.interiorNumber,
      neighborhood: DEF.business.address.neighborhood,
      municipality: DEF.business.address.municipality,
      city: DEF.business.address.city,
      state: DEF.business.address.state,
      postalCode: DEF.business.address.postalCode,
      country: DEF.business.address.country,
      references: DEF.business.address.references,
      mapsUrl: DEF.business.address.mapsUrl,
      mapsEmbedUrl: DEF.business.address.mapsEmbedUrl,
    },
    socialLinksExtra: {},
    serviceModalities: { inPerson: true, online: false, homeVisit: false },
  },
  testimonials: DEF.testimonials,
  faqs: DEF.faqs,
  benefits: DEF.benefits,
  processStages: DEF.processStages,
  appearance: DEF.appearance,
  publicPage: DEF.publicPage,
  templateImages: {},
  serviceTemplateMedia: {},
  dashboardTheme: DEFAULT_DASHBOARD_THEME,
};

function loadFromStorage(): ExtraProfileState {
  if (typeof window === "undefined") return DEFAULT_EXTRA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EXTRA;
    const parsed = JSON.parse(raw) as Partial<ExtraProfileState>;
    const merged = { ...DEFAULT_EXTRA, ...parsed };
    const migratedTheme = migrateDashboardTheme(merged.dashboardTheme);
    if (migratedTheme !== merged.dashboardTheme) {
      merged.dashboardTheme = migratedTheme;
      saveToStorage(merged); // persist the migration immediately, once, idempotently
    }
    return merged;
  } catch {
    return DEFAULT_EXTRA;
  }
}

function saveToStorage(state: ExtraProfileState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function ExtraProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExtraProfileState>(DEFAULT_EXTRA);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration: load persisted profile after mount
    setState(loadFromStorage());
  }, []);

  const updateSpecialistExtra = useCallback((partial: Partial<SpecialistExtra>) => {
    setState((prev) => {
      const next = { ...prev, specialistExtra: { ...prev.specialistExtra, ...partial } };
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateBusinessExtra = useCallback((partial: Partial<BusinessExtra>) => {
    setState((prev) => {
      const next = { ...prev, businessExtra: { ...prev.businessExtra, ...partial } };
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateAppearance = useCallback((partial: Partial<AppearanceConfig>) => {
    setState((prev) => {
      const next = { ...prev, appearance: { ...prev.appearance, ...partial } };
      saveToStorage(next);
      return next;
    });
  }, []);

  const updatePublicPage = useCallback((partial: Partial<PublicPageConfig>) => {
    setState((prev) => {
      const next = { ...prev, publicPage: { ...prev.publicPage, ...partial } };
      saveToStorage(next);
      return next;
    });
  }, []);

  const upsertTestimonial = useCallback((t: PublicTestimonial) => {
    setState((prev) => {
      const list = prev.testimonials.some((x) => x.id === t.id)
        ? prev.testimonials.map((x) => (x.id === t.id ? t : x))
        : [...prev.testimonials, t];
      const next = { ...prev, testimonials: list };
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteTestimonial = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev, testimonials: prev.testimonials.filter((x) => x.id !== id) };
      saveToStorage(next);
      return next;
    });
  }, []);

  const upsertFAQ = useCallback((f: PublicFAQ) => {
    setState((prev) => {
      const list = prev.faqs.some((x) => x.id === f.id)
        ? prev.faqs.map((x) => (x.id === f.id ? f : x))
        : [...prev.faqs, f];
      const next = { ...prev, faqs: list };
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteFAQ = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev, faqs: prev.faqs.filter((x) => x.id !== id) };
      saveToStorage(next);
      return next;
    });
  }, []);

  const upsertBenefit = useCallback((b: Benefit) => {
    setState((prev) => {
      const list = prev.benefits.some((x) => x.id === b.id)
        ? prev.benefits.map((x) => (x.id === b.id ? b : x))
        : [...prev.benefits, b];
      const next = { ...prev, benefits: list };
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteBenefit = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev, benefits: prev.benefits.filter((x) => x.id !== id) };
      saveToStorage(next);
      return next;
    });
  }, []);

  const upsertProcessStage = useCallback((s: ProcessStage) => {
    setState((prev) => {
      const list = prev.processStages.some((x) => x.id === s.id)
        ? prev.processStages.map((x) => (x.id === s.id ? s : x))
        : [...prev.processStages, s];
      const next = { ...prev, processStages: list };
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteProcessStage = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev, processStages: prev.processStages.filter((x) => x.id !== id) };
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateTemplateImages = useCallback((templateId: string, fields: Record<string, string | string[]>) => {
    setState((prev) => {
      const next = { ...prev, templateImages: { ...prev.templateImages, [templateId]: fields } };
      saveToStorage(next);
      return next;
    });
  }, []);

  const updatePaymentInstructions = useCallback((partial: Partial<PaymentInstructions>) => {
    setState((prev) => {
      const next = { ...prev, paymentInstructions: { ...prev.paymentInstructions, ...partial } };
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateServiceTemplateMedia = useCallback((templateId: string, serviceId: string, fields: Record<string, string | string[]>) => {
    setState((prev) => {
      const tpl = prev.serviceTemplateMedia[templateId] ?? {};
      const next = {
        ...prev,
        serviceTemplateMedia: {
          ...prev.serviceTemplateMedia,
          [templateId]: { ...tpl, [serviceId]: fields },
        },
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateDashboardTheme = useCallback((partial: Partial<DashboardTheme>) => {
    setState((prev) => {
      const next = { ...prev, dashboardTheme: { ...prev.dashboardTheme, ...partial } };
      saveToStorage(next);
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setState(DEFAULT_EXTRA);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <ExtraProfileContext.Provider value={{
      ...state,
      updateSpecialistExtra,
      updateBusinessExtra,
      updatePaymentInstructions,
      updateServiceTemplateMedia,
      updateAppearance,
      updatePublicPage,
      upsertTestimonial,
      deleteTestimonial,
      upsertFAQ,
      deleteFAQ,
      upsertBenefit,
      deleteBenefit,
      upsertProcessStage,
      deleteProcessStage,
      updateTemplateImages,
      updateDashboardTheme,
      resetToDefaults,
    }}>
      {children}
    </ExtraProfileContext.Provider>
  );
}

export function useExtraProfile() {
  const ctx = useContext(ExtraProfileContext);
  if (!ctx) throw new Error("useExtraProfile must be used inside ExtraProfileProvider");
  return ctx;
}
