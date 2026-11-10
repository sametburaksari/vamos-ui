"use client";

import { WorkspaceShell } from "./components/workspace-shell";
import { ContactDetail } from "./components/contact-detail";

/** CRM contact detail inside the responsive workspace shell. */
export default function Detail01() {
  return (
    <WorkspaceShell path="/crm/contacts/laura-callahan">
      <ContactDetail />
    </WorkspaceShell>
  );
}
