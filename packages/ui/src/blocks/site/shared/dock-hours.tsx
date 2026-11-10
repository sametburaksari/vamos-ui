"use client";

import * as React from "react";
import { isOpenAt, type OpeningHours } from "./opening-hours";

export interface DockHoursProps {
  hours: OpeningHours;
  /** label: show `text` while closed. hide: hide the whole dock while closed. */
  mode: "label" | "hide";
  text: string;
  /** Fixed "now" for previews. */
  now?: string;
  className?: string;
}

/** Off-hours behaviour of the Contact dock, computed on the client in the business's zone (~0.4 KB). */
export function DockHours({ hours, mode, text, now, className }: DockHoursProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [closed, setClosed] = React.useState(false);
  React.useEffect(() => {
    const check = () => setClosed(!isOpenAt(hours, now ?? Date.now()));
    check();
    if (now) return;
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
  }, [hours, now]);
  React.useEffect(() => {
    if (mode !== "hide") return;
    const dock = ref.current?.closest<HTMLElement>("[data-contact-dock]");
    if (dock) dock.hidden = closed;
  }, [closed, mode]);
  return (
    <span ref={ref} className={className} data-off-hours={closed ? "" : undefined}>
      {mode === "label" && closed ? text : null}
    </span>
  );
}
