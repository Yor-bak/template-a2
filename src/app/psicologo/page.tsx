"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { PsicologoTemplate01 } from "@/templates/psicologo/Template01";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <PsicologoTemplate01
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
