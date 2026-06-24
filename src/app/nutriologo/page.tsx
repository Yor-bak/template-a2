"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { NutriologoTemplate01 } from "@/templates/nutriologo/Template01";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <NutriologoTemplate01
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
