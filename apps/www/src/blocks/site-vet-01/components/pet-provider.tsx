"use client";

import * as React from "react";
import { cn, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { Bird, Cat, Dog, Rabbit, type LucideIcon } from "lucide-react";
import { PETS, pets, type L, type PetId, type SiteLocale } from "./content";

interface PetContextValue {
  locale: SiteLocale;
  t: (v: L) => string;
  pet: PetId;
  setPet: (pet: PetId) => void;
  /** Service picked from a list, handed to the appointment request form. */
  service: string | null;
  setService: (id: string | null) => void;
}

const PetContext = React.createContext<PetContextValue | null>(null);

export function usePet() {
  const ctx = React.useContext(PetContext);
  if (!ctx) throw new Error("usePet must be used inside <PetProvider>.");
  return ctx;
}

/**
 * The chosen species, above the EN / TR switch: switching language or page never loses it.
 * The home hero, the services page and the request form all read it.
 */
export function PetProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [pet, setPetState] = React.useState<PetId>("dog");
  const [service, setService] = React.useState<string | null>(null);
  const setPet = React.useCallback((next: PetId) => {
    setPetState(next);
    setService(null);
  }, []);
  const value = React.useMemo<PetContextValue>(() => ({ locale, t: (v) => v[locale], pet, setPet, service, setService }), [locale, pet, setPet, service]);
  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export const PET_ICONS: Record<PetId, LucideIcon> = { dog: Dog, cat: Cat, rabbit: Rabbit, bird: Bird };

/**
 * Signature element: four chunky species buttons. Changing the pet swaps the service list,
 * the photo, the waiting-room note and the first-year plan everywhere on the site.
 */
export function PetSwitch({ label, className, size = "lg" }: { label: string; className?: string; size?: "md" | "lg" }) {
  const { pet, setPet, t } = usePet();
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      aria-label={label}
      value={pet}
      onValueChange={(v) => v && setPet(v as PetId)}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {PETS.map((id) => {
        const Icon = PET_ICONS[id];
        return (
          <ToggleGroupItem
            key={id}
            value={id}
            className={cn(
              "gap-2 rounded-full! border-line px-4 font-semibold text-fg transition-[background-color,color,transform] active:scale-[0.97] motion-reduce:transition-none",
              "data-[state=on]:border-transparent data-[state=on]:bg-accent data-[state=on]:text-accent-fg",
              size === "lg" ? "h-12 text-body" : "h-10 text-small",
            )}
          >
            <Icon aria-hidden className={size === "lg" ? "size-5" : "size-4"} strokeWidth={2.2} />
            {t(pets[id].label)}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
