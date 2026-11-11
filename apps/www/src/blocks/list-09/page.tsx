"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { AuditView } from "./components/audit-view";

/** Workspace audit log inside the multi-app shell. */
export default function List09() {
  return (
    <Shell01 initialPath="/users">
      <AuditView />
      <Toaster />
    </Shell01>
  );
}
