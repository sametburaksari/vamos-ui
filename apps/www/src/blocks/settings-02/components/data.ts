import type { SelectOption } from "@vamos-ui/react";

export interface PreferencesForm {
  /** BCP 47 locale — drives the interface language and the default formats. */
  locale: string;
  currency: string;
  timeZone: string;
  hourCycle: "auto" | "h12" | "h23";
  weekStart: "auto" | "monday" | "sunday";
  theme: "light" | "dark" | "system";
  material: "glass" | "solid";
  accent: string;
  density: "compact" | "comfortable" | "spacious";
  /** A built-in pairing id, or "custom" to use the three families below. */
  pairing: string;
  heading: string;
  body: string;
  mono: string;
}

export const savedPreferences: PreferencesForm = {
  locale: "en-GB",
  currency: "TRY",
  timeZone: "Europe/Istanbul",
  hourCycle: "h23",
  weekStart: "monday",
  theme: "system",
  material: "glass",
  accent: "lime",
  density: "comfortable",
  pairing: "editorial",
  heading: "Fraunces",
  body: "Figtree",
  mono: "DM Mono",
};

export const languages: SelectOption[] = [
  { value: "en-US", label: "English (United States)", description: "Interface · 100% translated" },
  { value: "en-GB", label: "English (United Kingdom)", description: "Interface · 100% translated" },
  { value: "tr-TR", label: "Türkçe (Türkiye)", description: "Interface · 100% translated" },
  { value: "de-DE", label: "Deutsch (Deutschland)", description: "Formats only · interface in English" },
  { value: "fr-FR", label: "Français (France)", description: "Formats only · interface in English" },
  { value: "es-ES", label: "Español (España)", description: "Formats only · interface in English" },
  { value: "ar-AE", label: "العربية (الإمارات)", description: "Formats only · right-to-left" },
];

export const currencies: SelectOption[] = [
  { value: "TRY", label: "Turkish lira · TRY" },
  { value: "USD", label: "US dollar · USD" },
  { value: "EUR", label: "Euro · EUR" },
  { value: "GBP", label: "Pound sterling · GBP" },
  { value: "AED", label: "UAE dirham · AED" },
];

export const timeZones: SelectOption[] = [
  { value: "Europe/Istanbul", label: "Istanbul (GMT+3)", group: "Europe" },
  { value: "Europe/London", label: "London (GMT+0)", group: "Europe" },
  { value: "Europe/Berlin", label: "Berlin (GMT+1)", group: "Europe" },
  { value: "Asia/Dubai", label: "Dubai (GMT+4)", group: "Asia" },
  { value: "Asia/Singapore", label: "Singapore (GMT+8)", group: "Asia" },
  { value: "America/New_York", label: "New York (GMT−5)", group: "Americas" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT−8)", group: "Americas" },
];

/** The accents shipped in styles.css. The swatch is painted by the accent token itself. */
export const accents = [
  { value: "lime", label: "Lime" },
  { value: "ocean", label: "Ocean" },
  { value: "ember", label: "Ember" },
  { value: "rose", label: "Rose" },
  { value: "graphite", label: "Graphite" },
];

/** A fixed moment so the preview reads the same on server and client. */
export const SAMPLE_INSTANT = "2026-11-10T14:30:00Z";
