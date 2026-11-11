"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { InventoryDashboard } from "./components/inventory-dashboard";

/** Warehouse inventory dashboard inside the multi-app shell. */
export default function Dashboard13() {
  return (
    <Shell01 initialPath="/work">
      <InventoryDashboard />
      <Toaster />
    </Shell01>
  );
}
