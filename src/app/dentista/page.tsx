"use client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { DentistaTemplate01 } from "@/templates/dentista/Template01";

export default function Page() {
  const profile = usePublicProfile();
  return (
    <DentistaTemplate01
      profile={profile}
      onPaletteChange={(paletteId) =>
        profile.updateAppearance({ selectedPaletteId: paletteId })
      }
    />
  );
}
