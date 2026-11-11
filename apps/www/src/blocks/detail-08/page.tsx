"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { QuoteBuilder } from "./components/quote-builder";

/** Quote / proposal builder inside the multi-app shell. */
export default function Detail08() {
  return (
    <Shell01 initialPath="/crm/quotes">
      <QuoteBuilder />
      <Toaster />
    </Shell01>
  );
}
