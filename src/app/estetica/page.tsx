"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { EsteticaTemplate01 } from "@/templates/estetica/Template01";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <EsteticaTemplate01
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
