"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { RealtimeDashboard } from "./components/realtime-dashboard";

/** Realtime web analytics inside the multi-app shell. */
export default function Dashboard15() {
  return (
    <Shell01 initialPath="/site">
      <RealtimeDashboard />
      <Toaster />
    </Shell01>
  );
}
