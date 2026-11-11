"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { SaasDashboard } from "./components/saas-dashboard";

/** SaaS metrics dashboard (MRR, retention, cohorts) inside the multi-app shell. */
export default function Dashboard14() {
  return (
    <Shell01 initialPath="/crm">
      <SaasDashboard />
      <Toaster />
    </Shell01>
  );
}
