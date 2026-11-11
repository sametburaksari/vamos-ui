"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { PortfolioDashboard } from "./components/portfolio-dashboard";

/** Project portfolio dashboard inside the multi-app shell. */
export default function Dashboard11() {
  return (
    <Shell01 initialPath="/work/projects">
      <PortfolioDashboard />
      <Toaster />
    </Shell01>
  );
}
