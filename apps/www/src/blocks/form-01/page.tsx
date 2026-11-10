"use client";

import { WorkspaceShell } from "../settings-01/components/workspace-shell";
import { LeaveRequest } from "./components/leave-request";

/** People → Leave: a four-step leave request with per-step validation and an approval flow. */
export default function Form01() {
  return (
    <WorkspaceShell path="/people/leave/new" app="people">
      <LeaveRequest />
    </WorkspaceShell>
  );
}
