"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { BulkEditor } from "./components/bulk-editor";

/** Bulk price & stock editor inside the multi-app shell. */
export default function List10() {
  return (
    <Shell01 initialPath="/site">
      <BulkEditor />
      <Toaster />
    </Shell01>
  );
}
