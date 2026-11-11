"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { SlaDashboard } from "./components/sla-dashboard";

/** Support SLA dashboard inside the multi-app shell. */
export default function Dashboard10() {
  return (
    <Shell01 initialPath="/crm/activities">
      <SlaDashboard />
      <Toaster />
    </Shell01>
  );
}
