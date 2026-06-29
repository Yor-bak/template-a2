"use client";
import { useMemo } from "react";
import { useClinicConfig } from "@/contexts/ClinicConfigContext";
import { useServices } from "@/contexts/ServicesContext";
import { useExtraProfile } from "@/contexts/ExtraProfileContext";
import type { PublicBusinessProfile, PublicService, Address } from "@/types/profile";
import type { Service } from "@/types";
import { DEFAULT_PUBLIC_PROFILE } from "@/data/defaultProfile";

function mapService(s: Service): PublicService {
  const pt = s.priceType as PublicService["priceType"];
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    shortDescription: s.shortDescription,
    fullDescription: s.fullDescription,
    durationMinutes: s.durationMinutes,
    priceType: (["fixed", "from", "assessment_required", "hidden"].includes(pt) ? pt : "from") as PublicService["priceType"],
    estimatedPrice: s.estimatedPrice,
    includes: s.includes,
    recommendations: s.recommendations,
    whenRecommended: s.whenRecommended,
    icon: s.icon,
    isEmergency: s.isEmergency,
    isActive: s.isActive,
  };
}

export function usePublicProfile(): PublicBusinessProfile & {
  updateSpecialistExtra: ReturnType<typeof useExtraProfile>["updateSpecialistExtra"];
  updateBusinessExtra: ReturnType<typeof useExtraProfile>["updateBusinessExtra"];
  updatePaymentInstructions: ReturnType<typeof useExtraProfile>["updatePaymentInstructions"];
  updateAppearance: ReturnType<typeof useExtraProfile>["updateAppearance"];
  updatePublicPage: ReturnType<typeof useExtraProfile>["updatePublicPage"];
  upsertTestimonial: ReturnType<typeof useExtraProfile>["upsertTestimonial"];
  deleteTestimonial: ReturnType<typeof useExtraProfile>["deleteTestimonial"];
  upsertFAQ: ReturnType<typeof useExtraProfile>["upsertFAQ"];
  deleteFAQ: ReturnType<typeof useExtraProfile>["deleteFAQ"];
  upsertBenefit: ReturnType<typeof useExtraProfile>["upsertBenefit"];
  deleteBenefit: ReturnType<typeof useExtraProfile>["deleteBenefit"];
  upsertProcessStage: ReturnType<typeof useExtraProfile>["upsertProcessStage"];
  deleteProcessStage: ReturnType<typeof useExtraProfile>["deleteProcessStage"];
  resetToDefaults: ReturnType<typeof useExtraProfile>["resetToDefaults"];
} {
  const { config } = useClinicConfig();
  const { services: rawServices } = useServices();
  const extra = useExtraProfile();

  const profile = useMemo((): PublicBusinessProfile => {
    const DEF = DEFAULT_PUBLIC_PROFILE;

    // Per-template images (set in Configuración → Apariencia → "Imágenes de esta plantilla")
    // take precedence over the global appearance/clinic images so what the user configures
    // for the active template actually reaches it.
    const selectedTemplateId = extra.appearance.selectedTemplateId ?? "dentista-01";
    const tplImg = extra.templateImages[selectedTemplateId] ?? {};
    const imgStr = (v: unknown): string | undefined =>
      typeof v === "string" && v.trim() ? v.trim() : undefined;
    const imgArr = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : [];

    const logoUrl = imgStr(tplImg.logo) ?? extra.appearance.logoUrl ?? config.logoUrl;
    const specialistPhotoUrl = imgStr(tplImg.specialistPhoto) ?? extra.appearance.specialistPhotoUrl ?? config.dentistPhotoUrl;
    const heroImageUrl = imgStr(tplImg.heroImage) ?? extra.appearance.heroImageUrl ?? config.heroImageUrl;
    const backgroundImageUrl = imgStr(tplImg.backgroundImage) ?? extra.appearance.backgroundImageUrl;
    const apprGallery = extra.appearance.galleryUrls ?? [];
    const apprBeforeAfter = extra.appearance.beforeAfterGalleryUrls ?? [];
    const galleryUrls = imgArr(tplImg.gallery).length
      ? imgArr(tplImg.gallery)
      : (apprGallery.length ? apprGallery : (config.clinicGalleryUrls ?? []));
    const beforeAfterGalleryUrls = imgArr(tplImg.beforeAfter).length
      ? imgArr(tplImg.beforeAfter)
      : (apprBeforeAfter.length ? apprBeforeAfter : (config.beforeAfterGalleryUrls ?? []));

    const address: Address = {
      street: extra.businessExtra.address.street ?? DEF.business.address.street,
      exteriorNumber: extra.businessExtra.address.exteriorNumber ?? DEF.business.address.exteriorNumber,
      interiorNumber: extra.businessExtra.address.interiorNumber,
      neighborhood: extra.businessExtra.address.neighborhood ?? config.neighborhood ?? DEF.business.address.neighborhood,
      municipality: extra.businessExtra.address.municipality ?? DEF.business.address.municipality,
      city: extra.businessExtra.address.city ?? config.city ?? DEF.business.address.city,
      state: extra.businessExtra.address.state ?? config.state ?? DEF.business.address.state,
      postalCode: extra.businessExtra.address.postalCode ?? DEF.business.address.postalCode,
      country: extra.businessExtra.address.country ?? config.country ?? DEF.business.address.country,
      references: extra.businessExtra.address.references ?? config.locationReferences,
      mapsUrl: extra.businessExtra.address.mapsUrl ?? config.googleMapsUrl,
      mapsEmbedUrl: extra.businessExtra.address.mapsEmbedUrl ?? config.googleMapsEmbedUrl,
    };

    return {
      id: config.id ?? DEF.id,
      specialist: {
        displayName: config.dentistName ?? DEF.specialist.displayName,
        professionalTitle: extra.specialistExtra.professionalTitle ?? DEF.specialist.professionalTitle,
        specialty: config.specialty ?? DEF.specialist.specialty,
        professionalLicense: config.professionalLicense ?? DEF.specialist.professionalLicense,
        specialtyLicense: extra.specialistExtra.specialtyLicense,
        school: extra.specialistExtra.school ?? DEF.specialist.school,
        certifications: extra.specialistExtra.certifications ?? DEF.specialist.certifications,
        yearsExperience: config.yearsExperience ?? DEF.specialist.yearsExperience,
        patientsServed: config.patientsServed ?? DEF.specialist.patientsServed,
        shortDescription: config.shortDescription ?? DEF.specialist.shortDescription,
        biography: extra.specialistExtra.biography ?? config.welcomeMessage ?? DEF.specialist.biography,
        photoUrl: specialistPhotoUrl,
      },
      business: {
        name: config.clinicName ?? DEF.business.name,
        description: extra.businessExtra.description ?? DEF.business.description,
        logoUrl,
        phone: config.phone ?? DEF.business.phone,
        whatsapp: config.whatsapp ?? DEF.business.whatsapp,
        email: config.email ?? DEF.business.email,
        websiteUrl: extra.businessExtra.websiteUrl,
        address,
        socialLinks: {
          instagram: extra.businessExtra.socialLinksExtra.instagram ?? config.socialMedia?.instagram,
          facebook: extra.businessExtra.socialLinksExtra.facebook ?? config.socialMedia?.facebook,
          tiktok: extra.businessExtra.socialLinksExtra.tiktok,
          youtube: extra.businessExtra.socialLinksExtra.youtube,
          linkedin: extra.businessExtra.socialLinksExtra.linkedin,
          website: extra.businessExtra.socialLinksExtra.website ?? extra.businessExtra.websiteUrl,
        },
        parkingAvailable: config.parkingAvailable,
        parkingDetails: config.parkingDetails,
        accessibilityAvailable: extra.businessExtra.accessibilityAvailable ?? DEF.business.accessibilityAvailable,
        accessibilityDetails: extra.businessExtra.accessibilityDetails ?? DEF.business.accessibilityDetails,
        acceptsEmergencies: config.acceptsEmergencies,
        emergencyPhone: config.emergencyPhone,
        emergencyWhatsapp: config.emergencyWhatsapp,
        emergencyDescription: config.emergencyDescription,
        serviceModalities: extra.businessExtra.serviceModalities,
      },
      services: rawServices.map(mapService),
      testimonials: extra.testimonials,
      faqs: extra.faqs,
      benefits: extra.benefits,
      processStages: extra.processStages,
      paymentMethods: (config.acceptedPayments ?? DEF.paymentMethods) as PublicBusinessProfile["paymentMethods"],
      paymentInstructions: extra.paymentInstructions,
      openingHours: config.openingHours ?? DEF.openingHours,
      appearance: {
        ...extra.appearance,
        selectedTemplateId,
        selectedPaletteId: extra.appearance.selectedPaletteId ?? "",
        logoUrl,
        specialistPhotoUrl,
        heroImageUrl,
        backgroundImageUrl,
        galleryUrls,
        beforeAfterGalleryUrls,
      },
      publicPage: {
        ...extra.publicPage,
        showPrices: config.showPrices ?? extra.publicPage.showPrices,
        status: config.publicPageStatus ?? extra.publicPage.status,
        seo: {
          title: config.seoTitle ?? extra.publicPage.seo.title,
          description: config.seoDescription ?? extra.publicPage.seo.description,
          keywords: config.seoKeywords ?? extra.publicPage.seo.keywords,
          city: config.seoCity ?? extra.publicPage.seo.city,
          neighborhood: config.seoNeighborhood ?? extra.publicPage.seo.neighborhood,
        },
      },
      updatedAt: new Date().toISOString(),
    };
  }, [config, rawServices, extra]);

  return {
    ...profile,
    updateSpecialistExtra: extra.updateSpecialistExtra,
    updateBusinessExtra: extra.updateBusinessExtra,
    updatePaymentInstructions: extra.updatePaymentInstructions,
    updateAppearance: extra.updateAppearance,
    updatePublicPage: extra.updatePublicPage,
    upsertTestimonial: extra.upsertTestimonial,
    deleteTestimonial: extra.deleteTestimonial,
    upsertFAQ: extra.upsertFAQ,
    deleteFAQ: extra.deleteFAQ,
    upsertBenefit: extra.upsertBenefit,
    deleteBenefit: extra.deleteBenefit,
    upsertProcessStage: extra.upsertProcessStage,
    deleteProcessStage: extra.deleteProcessStage,
    resetToDefaults: extra.resetToDefaults,
  };
}
