"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { MedicoTemplate02 } from "@/templates/medico/Template02";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <MedicoTemplate02
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
