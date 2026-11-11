"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { AgendaView } from "./components/agenda-view";

/** Coworking room bookings as an agenda inside the multi-app shell. */
export default function List06() {
  return (
    <Shell01 initialPath="/work">
      <AgendaView />
      <Toaster />
    </Shell01>
  );
}
