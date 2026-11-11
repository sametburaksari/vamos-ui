"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { ContactsViews } from "./components/contacts-views";

/** CRM contacts with shareable saved views inside the multi-app shell. */
export default function List05() {
  return (
    <Shell01 initialPath="/crm/contacts">
      <ContactsViews />
      <Toaster />
    </Shell01>
  );
}
