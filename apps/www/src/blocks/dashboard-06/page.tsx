"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { ForecastDashboard } from "./components/forecast-dashboard";

/** CRM quarter forecast inside the multi-app shell. */
export default function Dashboard06() {
  return (
    <Shell01 initialPath="/crm">
      <ForecastDashboard />
      <Toaster />
    </Shell01>
  );
}
