"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { VeterinarioTemplate01 } from "@/templates/veterinario/Template01";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <VeterinarioTemplate01
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
