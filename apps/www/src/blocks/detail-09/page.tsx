"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { TicketView } from "./components/ticket-view";

/** Support ticket conversation inside the multi-app shell. */
export default function Detail09() {
  return (
    <Shell01 initialPath="/crm/activities">
      <TicketView />
      <Toaster />
    </Shell01>
  );
}
