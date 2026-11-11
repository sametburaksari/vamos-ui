"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { CampaignWizard } from "./components/campaign-wizard";

/** New marketing campaign: a four-step wizard with a live preview, inside the multi-app shell. */
export default function Form02() {
  return (
    <Shell01 initialPath="/crm/contacts">
      <CampaignWizard />
      <Toaster />
    </Shell01>
  );
}
