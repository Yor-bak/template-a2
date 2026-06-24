"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { FisioterapiaTemplate01 } from "@/templates/fisioterapia/Template01";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <FisioterapiaTemplate01
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
