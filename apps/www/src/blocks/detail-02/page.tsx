"use client";

import { WorkspaceShell } from "../detail-01/components/workspace-shell";
import { EmployeeProfile } from "./components/employee-profile";

/** HR employee profile inside the responsive workspace shell. */
export default function Detail02() {
  return (
    <WorkspaceShell path="/people/employees/deniz-aydin">
      <EmployeeProfile />
    </WorkspaceShell>
  );
}
