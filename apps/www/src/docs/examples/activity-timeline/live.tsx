"use client";

import * as React from "react";
import { Inbox, ShoppingBag, UserPlus } from "lucide-react";
import { ActivityTimeline, Card, CardBody, CardHeader, type TimelineEntry } from "@vamos-cms/ui";

const incoming: Omit<TimelineEntry, "id" | "at">[] = [
  { icon: ShoppingBag, tone: "success", title: <>Order <b>#10483</b> paid · $86.40</> },
  { icon: UserPlus, title: <><b>Zeynep A.</b> joined the newsletter</> },
  { icon: Inbox, title: <>New submission on <b>Catering request</b></> },
];

export default function ActivityTimelineLive() {
  const [items, setItems] = React.useState<TimelineEntry[]>(() => [
    { id: "l0", at: new Date(Date.now() - 6 * 60_000).toISOString(), icon: ShoppingBag, tone: "success", title: <>Order <b>#10482</b> paid · $124.00</> },
  ]);
  const [waiting, setWaiting] = React.useState<TimelineEntry[]>([]);
  const [announcement, setAnnouncement] = React.useState("");

  React.useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      const next = { ...incoming[i % incoming.length]!, id: `n${Date.now()}`, at: new Date().toISOString() };
      i++;
      setWaiting((w) => [next, ...w]);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // One batched, polite announcement per change — not one per event.
  React.useEffect(() => {
    if (waiting.length) setAnnouncement(`${waiting.length} new ${waiting.length === 1 ? "update" : "updates"}`);
  }, [waiting.length]);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader title="Store activity" description="New events wait above the list" />
      <CardBody>
        <ActivityTimeline
          items={items}
          newCount={waiting.length}
          onShowNew={() => {
            setItems((cur) => [...waiting, ...cur]);
            setWaiting([]);
          }}
          announcement={announcement}
        />
      </CardBody>
    </Card>
  );
}
