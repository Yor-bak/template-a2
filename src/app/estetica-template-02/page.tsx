"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { EsteticaTemplate02 } from "@/templates/estetica/Template02";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <EsteticaTemplate02
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
