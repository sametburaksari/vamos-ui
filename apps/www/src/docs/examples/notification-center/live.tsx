"use client";

import * as React from "react";
import { Inbox } from "lucide-react";
import { Button, NotificationCenter, createMemoryNotificationAdapter } from "@vamos-cms/ui";
import { inboxSeed } from "./data";

const inbox = createMemoryNotificationAdapter(inboxSeed().slice(3));
const forms = ["Contact", "Book a table", "Newsletter", "Request a quote"];

/** subscribe() pushes live items: they prepend, the badge grows, a toast shows and screen readers hear one polite update per 10 s. */
export default function NotificationLive() {
  const n = React.useRef(0);
  const push = () => {
    const form = forms[n.current++ % forms.length]!;
    inbox.push({ id: `live-${Date.now()}`, title: `New submission on ${form}`, body: "From jane@northwind.io", createdAt: new Date().toISOString(), icon: <Inbox />, tone: "info", app: "Site" });
  };
  return (
    <div className="flex items-center gap-3">
      <Button onClick={push}>Simulate a live notification</Button>
      <NotificationCenter adapter={inbox} toastOnNew />
    </div>
  );
}
