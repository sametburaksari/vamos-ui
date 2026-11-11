"use client";

import { Toaster } from "@vamos-ui/react";
import { DevConsole } from "./components/console";

/** Developer console where the command palette is the navigation: ⌘K or / for everything. */
export default function Shell10() {
  return (
    <>
      <DevConsole />
      <Toaster />
    </>
  );
}
