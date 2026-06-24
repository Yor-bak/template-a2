"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { PsicologoTemplate03 } from "@/templates/psicologo/Template03";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <PsicologoTemplate03
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
