"use client";

import Shell01 from "../shell-01/page";
import { SalesDashboard } from "./components/sales-dashboard";

/** CRM sales dashboard inside the multi-app shell. */
export default function Dashboard02() {
  return (
    <Shell01 initialPath="/crm">
      <SalesDashboard />
    </Shell01>
  );
}
