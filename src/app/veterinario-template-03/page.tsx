"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { VeterinarioTemplate03 } from "@/templates/veterinario/Template03";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <VeterinarioTemplate03
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
