"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { EsteticaTemplate03 } from "@/templates/estetica/Template03";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <EsteticaTemplate03
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
