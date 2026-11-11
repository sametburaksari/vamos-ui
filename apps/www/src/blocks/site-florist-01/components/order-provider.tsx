"use client";

import * as React from "react";
import { Button, cn } from "@vamos-ui/react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { CUTOFF, type Size } from "./content";

interface OrderContextValue {
  bouquet: string | null;
  size: Size;
  setBouquet: (id: string | null) => void;
  setSize: (s: Size) => void;
}

const OrderContext = React.createContext<OrderContextValue | null>(null);

export function useOrder() {
  const ctx = React.useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside <OrderProvider>.");
  return ctx;
}

/** The bouquet being ordered, shared by every page and both languages (survives a language switch). */
export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [bouquet, setBouquet] = React.useState<string | null>("apricot");
  const [size, setSize] = React.useState<Size>("m");
  const value = React.useMemo(() => ({ bouquet, size, setBouquet, setSize }), [bouquet, size]);
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

/** "Order this" from any page: picks the bouquet (and size) and opens the order page. */
export function ChooseBouquet({ id, size, label, variant = "primary", className }: { id: string; size?: Size; label: string; variant?: "primary" | "secondary" | "ghost"; className?: string }) {
  const { setBouquet, setSize } = useOrder();
  const { navigate, hrefFor } = useSiteShell();
  return (
    <Button asChild variant={variant} className={cn("vm-press rounded-full", className)}>
      <a
        href={hrefFor("order")}
        onClick={(e) => {
          e.preventDefault();
          setBouquet(id);
          if (size) setSize(size);
          navigate({ page: "order" });
        }}
      >
        {label}
        <ArrowRight aria-hidden className="rtl:rotate-180" />
      </a>
    </Button>
  );
}

/** Minutes since midnight in Istanbul, and the ISO day there. */
export function istanbulNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short" }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: `${get("year")}-${get("month")}-${get("day")}`, minutes: Number(get("hour")) * 60 + Number(get("minute")), sunday: get("weekday") === "Sun", saturday: get("weekday") === "Sat" };
}
export const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/**
 * Live same-day status for the hero: "Order in the next 2 h 14 min for delivery this evening",
 * or when the next delivery is. Rendered after mount (it depends on the clock).
 */
export function CutoffNote({ copy }: { copy: { left: string; closed: string; closedSat: string; sunday: string } }) {
  const [now, setNow] = React.useState<ReturnType<typeof istanbulNow> | null>(null);
  React.useEffect(() => {
    const tick = () => setNow(istanbulNow());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return <span className="opacity-0">…</span>;
  if (now.sunday) return <>{copy.sunday}</>;
  const left = toMinutes(CUTOFF) - now.minutes;
  if (left <= 0) return <>{now.saturday ? copy.closedSat : copy.closed}</>;
  const h = Math.floor(left / 60);
  const m = left % 60;
  return <>{copy.left.replace("{h}", String(h)).replace("{m}", String(m))}</>;
}
