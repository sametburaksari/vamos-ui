"use client";

import Shell01 from "../shell-01/page";
import { PeopleDashboard } from "./components/people-dashboard";

/** HR people dashboard inside the multi-app shell. */
export default function Dashboard03() {
  return (
    <Shell01 initialPath="/people">
      <PeopleDashboard />
    </Shell01>
  );
}
