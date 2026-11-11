"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { GroupedOrders } from "./components/grouped-orders";

/** Orders grouped by customer inside the multi-app shell. */
export default function List04() {
  return (
    <Shell01 initialPath="/site/catalogue">
      <GroupedOrders />
      <Toaster />
    </Shell01>
  );
}
