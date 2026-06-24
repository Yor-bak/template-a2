"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { FisioterapiaTemplate03 } from "@/templates/fisioterapia/Template03";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <FisioterapiaTemplate03
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
