"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { MedicoTemplate01 } from "@/templates/medico/Template01";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <MedicoTemplate01
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
