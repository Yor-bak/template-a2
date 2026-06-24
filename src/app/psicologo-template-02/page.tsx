"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { PsicologoTemplate02 } from "@/templates/psicologo/Template02";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <PsicologoTemplate02
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
