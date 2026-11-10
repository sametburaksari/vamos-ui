"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { DealsBoard } from "./components/deals-board";

/** CRM deals pipeline (Kanban) inside the multi-app shell. */
export default function Board01() {
  return (
    <Shell01 initialPath="/crm/pipeline">
      <DealsBoard />
      <Toaster />
    </Shell01>
  );
}
