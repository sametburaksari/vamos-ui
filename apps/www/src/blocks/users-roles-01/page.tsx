"use client";

import { WorkspaceShell } from "../settings-01/components/workspace-shell";
import { UsersRoles } from "./components/users-roles";

/** Users & roles: members Data Table with bulk actions, invite dialog, and a role permission matrix. */
export default function UsersRoles01() {
  return (
    <WorkspaceShell path="/users" app="crm">
      <UsersRoles />
    </WorkspaceShell>
  );
}
