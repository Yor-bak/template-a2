"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { MedicoTemplate03 } from "@/templates/medico/Template03";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <MedicoTemplate03
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
