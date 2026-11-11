"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { PeopleDashboard } from "./components/people-dashboard";

/** HR overview inside the multi-app shell. */
export default function Dashboard07() {
  return (
    <Shell01 initialPath="/people">
      <PeopleDashboard />
      <Toaster />
    </Shell01>
  );
}
