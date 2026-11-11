"use client";

import { AdminShell } from "./components/admin-shell";
import { Customer360 } from "./components/customer-360";

/** Customer 360 inside the workspace shell. */
export default function Detail04() {
  return (
    <AdminShell path="/crm/companies/lodestar-freight">
      <Customer360 />
    </AdminShell>
  );
}
