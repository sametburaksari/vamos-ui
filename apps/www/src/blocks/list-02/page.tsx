"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { ContactsList } from "./components/contacts-list";

/** CRM contacts list inside the multi-app shell. */
export default function List02() {
  return (
    <Shell01 initialPath="/crm/contacts">
      <ContactsList />
      <Toaster />
    </Shell01>
  );
}
