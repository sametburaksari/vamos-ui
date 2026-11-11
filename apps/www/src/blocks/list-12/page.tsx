"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { TreeManager } from "./components/tree-manager";

/** Category and department trees inside the multi-app shell. */
export default function List12() {
  return (
    <Shell01 initialPath="/site/catalogue/categories">
      <TreeManager />
      <Toaster />
    </Shell01>
  );
}
