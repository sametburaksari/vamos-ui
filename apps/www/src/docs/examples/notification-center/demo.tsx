"use client";

import { NotificationCenter, createMemoryNotificationAdapter } from "@vamos-cms/ui";
import { inboxSeed } from "./data";

// Your adapter talks to your API; the memory adapter is for demos and tests.
const inbox = createMemoryNotificationAdapter(inboxSeed(), { latency: 400 });

export default function NotificationCenterDemo() {
  return <NotificationCenter adapter={inbox} settingsHref="#notification-settings" />;
}
