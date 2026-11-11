"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { ActivityFeed } from "./components/activity-feed";

/** Workspace activity feed inside the multi-app shell. */
export default function List11() {
  return (
    <Shell01 initialPath="/crm/activities">
      <ActivityFeed />
      <Toaster />
    </Shell01>
  );
}
