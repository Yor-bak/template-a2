"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { NutriologoTemplate02 } from "@/templates/nutriologo/Template02";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <NutriologoTemplate02
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
