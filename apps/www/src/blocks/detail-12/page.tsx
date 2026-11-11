"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { PartnerView } from "./components/partner-view";

/** Partner record (PRM) inside the multi-app shell: tier, deal registrations, MDF and certifications. */
export default function Detail12() {
  return (
    <Shell01 initialPath="/work/partners">
      <PartnerView />
      <Toaster />
    </Shell01>
  );
}
