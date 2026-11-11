"use client";

import { Toaster } from "@vamos-ui/react";
import { SupportDesk } from "./components/support-desk";

/** Three-pane support desk: queues, ticket list and conversation, with SLA clocks on every ticket. */
export default function Shell11() {
  return (
    <>
      <SupportDesk />
      <Toaster />
    </>
  );
}
