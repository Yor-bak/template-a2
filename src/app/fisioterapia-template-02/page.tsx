"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { FisioterapiaTemplate02 } from "@/templates/fisioterapia/Template02";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <FisioterapiaTemplate02
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
