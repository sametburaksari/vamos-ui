"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { CompareView } from "./components/compare-view";

/** Side-by-side candidate comparison inside the multi-app shell. */
export default function Detail13() {
  return (
    <Shell01 initialPath="/people/employees">
      <CompareView />
      <Toaster />
    </Shell01>
  );
}
