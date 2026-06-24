"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { DentistaTemplate03 } from "@/templates/dentista/Template03";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <DentistaTemplate03
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
