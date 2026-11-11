"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { clinicianById, clinicians, serviceById, type Clinician, type L, type ServiceId, type SiteLocale } from "./content";

export interface Booking {
  service: ServiceId | null;
  /** A clinician id, or "any" for the first available. */
  clinician: string | null;
  day: string | null;
  time: string | null;
}

interface BookingContextValue {
  locale: SiteLocale;
  t: (v: L) => string;
  booking: Booking;
  step: number;
  setStep: (n: number) => void;
  update: (patch: Partial<Booking>) => void;
  /** Start the flow from anywhere on the site, optionally with a service or clinician picked. */
  start: (preset?: Partial<Booking>) => void;
  reset: () => void;
}

const BookingContext = React.createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = React.useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>.");
  return ctx;
}

const EMPTY: Booking = { service: null, clinician: null, day: null, time: null };

/** Clinicians who offer a service. */
export const staffFor = (service: ServiceId | null): Clinician[] => (service ? clinicians.filter((c) => serviceById(service).staff.includes(c.id)) : clinicians);

/** The clinician who will actually see the patient: the chosen one, or the first on duty that day. */
export function assignedClinician(b: Booking): Clinician | undefined {
  if (b.clinician && b.clinician !== "any") return clinicianById(b.clinician);
  if (!b.day) return undefined;
  const dow = new Date(`${b.day}T12:00:00Z`).getUTCDay();
  return staffFor(b.service).find((c) => c.days.includes(dow as Clinician["days"][number]));
}

/** Booking progress, above the EN / TR switch so changing language never loses it. */
export function BookingProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale, navigate } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [booking, setBooking] = React.useState<Booking>(EMPTY);
  const [step, setStep] = React.useState(0);

  const value = React.useMemo<BookingContextValue>(
    () => ({
      locale,
      t: (v) => v[locale],
      booking,
      step,
      setStep,
      update: (patch) => setBooking((b) => ({ ...b, ...patch })),
      start: (preset) => {
        const next = { ...EMPTY, ...preset };
        setBooking(next);
        setStep(next.service ? (next.time ? 4 : next.clinician ? 2 : 1) : 0);
        navigate({ page: "appointment" });
      },
      reset: () => {
        setBooking(EMPTY);
        setStep(0);
      },
    }),
    [locale, booking, step, navigate],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

/** A button-styled link that opens the booking flow with a preset; works as a plain link without JS. */
export function BookLink({ preset, className, children }: { preset?: Partial<Booking>; className?: string; children: React.ReactNode }) {
  const { start } = useBooking();
  return (
    <a
      href="?page=appointment"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        start(preset);
      }}
    >
      {children}
    </a>
  );
}
