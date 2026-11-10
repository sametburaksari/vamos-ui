"use client";

import Shell01 from "../shell-01/page";
import { WorkDashboard } from "./components/work-dashboard";

/** Operations dashboard (projects, time, invoices) inside the multi-app shell. */
export default function Dashboard04() {
  return (
    <Shell01 initialPath="/work">
      <WorkDashboard />
    </Shell01>
  );
}
