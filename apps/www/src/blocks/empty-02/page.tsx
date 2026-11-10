"use client";

import Shell01 from "../shell-01/page";
import { ContactsSearch } from "./components/contacts-search";

/** CRM contacts search with no results, inside the multi-app shell. */
export default function Empty02() {
  return (
    <Shell01 initialPath="/crm/contacts">
      <ContactsSearch />
    </Shell01>
  );
}
