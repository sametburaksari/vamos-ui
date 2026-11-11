"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { OrdersDashboard } from "./components/orders-dashboard";

/** E-commerce orders desk inside the multi-app shell. */
export default function Dashboard08() {
  return (
    <Shell01 initialPath="/site">
      <OrdersDashboard />
      <Toaster />
    </Shell01>
  );
}
