"use client";

import { AdminShell } from "../detail-04/components/admin-shell";
import { EmployeeProfile } from "./components/employee-profile";

/** Employee profile inside the workspace shell. */
export default function Detail06() {
  return (
    <AdminShell path="/people/directory/kerem-yildiz">
      <EmployeeProfile />
    </AdminShell>
  );
}
