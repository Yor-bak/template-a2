"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { NutriologoTemplate03 } from "@/templates/nutriologo/Template03";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <NutriologoTemplate03
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
