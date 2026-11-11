"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { LocationsView } from "./components/locations-view";

/** Stores, pickup points and warehouses on a map and in a list, inside the multi-app shell. */
export default function List08() {
  return (
    <Shell01 initialPath="/site">
      <LocationsView />
      <Toaster />
    </Shell01>
  );
}
