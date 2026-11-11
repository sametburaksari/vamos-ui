"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { ContractView } from "./components/contract-view";

/** Contract record inside the multi-app shell: clauses, proposals, versions, signers, renewal reminders. */
export default function Detail11() {
  return (
    <Shell01 initialPath="/crm/companies">
      <ContractView />
      <Toaster />
    </Shell01>
  );
}
