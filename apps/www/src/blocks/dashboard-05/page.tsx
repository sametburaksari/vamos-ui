"use client";

import Shell01 from "../shell-01/page";
import { StoreDashboard } from "./components/store-dashboard";

/** E-commerce store dashboard inside the multi-app shell. */
export default function Dashboard05() {
  return (
    <Shell01 initialPath="/site">
      <StoreDashboard />
    </Shell01>
  );
}
