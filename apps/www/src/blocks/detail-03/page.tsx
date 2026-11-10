"use client";

import { WorkspaceShell } from "../detail-01/components/workspace-shell";
import { InvoiceDetail } from "./components/invoice-detail";

/** Invoice detail inside the responsive workspace shell. */
export default function Detail03() {
  return (
    <WorkspaceShell path="/work/invoices/inv-2026-0418">
      <InvoiceDetail />
    </WorkspaceShell>
  );
}
