"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { MarketingDashboard } from "./components/marketing-dashboard";

/** Marketing campaigns dashboard inside the multi-app shell. */
export default function Dashboard12() {
  return (
    <Shell01 initialPath="/site">
      <MarketingDashboard />
      <Toaster />
    </Shell01>
  );
}
