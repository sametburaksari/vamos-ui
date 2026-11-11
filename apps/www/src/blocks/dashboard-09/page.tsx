"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { CashDashboard } from "./components/cash-dashboard";

/** Finance cash-flow dashboard inside the multi-app shell. */
export default function Dashboard09() {
  return (
    <Shell01 initialPath="/work/invoices">
      <CashDashboard />
      <Toaster />
    </Shell01>
  );
}
