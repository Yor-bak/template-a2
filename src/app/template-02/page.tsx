"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { DentistaTemplate02 } from "@/templates/dentista/Template02";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <DentistaTemplate02
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
