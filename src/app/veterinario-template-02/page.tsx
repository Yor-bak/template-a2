"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { VeterinarioTemplate02 } from "@/templates/veterinario/Template02";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <VeterinarioTemplate02
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
