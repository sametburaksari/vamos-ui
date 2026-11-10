"use client";

import { NotificationCenter, createMemoryNotificationAdapter } from "@vamos-ui/react";
import { inboxSeed } from "./data";

const inbox = createMemoryNotificationAdapter(inboxSeed());

/** One inbox across apps: each item carries an app badge, and tabs can filter by app (the memory adapter matches filter to app or category). */
export default function NotificationMultiApp() {
  return (
    <NotificationCenter
      adapter={inbox}
      size="lg"
      tabs={[
        { id: "all", label: "All" },
        { id: "crm", label: "CRM", filter: "CRM" },
        { id: "people", label: "People", filter: "People" },
        { id: "site", label: "Site", filter: "Site" },
      ]}
    />
  );
}
