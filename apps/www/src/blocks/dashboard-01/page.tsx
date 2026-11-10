"use client";

import Shell01 from "../shell-01/page";
import { Dashboard } from "./components/dashboard";

/** Site analytics dashboard inside the multi-app shell. */
export default function Dashboard01() {
  return (
    <Shell01 initialPath="/site">
      <Dashboard />
    </Shell01>
  );
}
