"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { IntegrationsMarketplace } from "./components/integrations-marketplace";

/** Settings → Apps & modules: the integrations marketplace inside the multi-app shell. */
export default function Settings06() {
  return (
    <Shell01 initialPath="/settings/apps">
      <IntegrationsMarketplace />
      <Toaster />
    </Shell01>
  );
}
