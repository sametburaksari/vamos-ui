"use client";

import * as React from "react";
import { FilePen, FileText, Globe, Trash2 } from "lucide-react";
import { ActivityTimeline, Badge, Card, CardBody, CardHeader, type TimelineEntry } from "@vamos-ui/react";

const day = 86_400_000;
const at = (daysAgo: number, hour: number) => new Date(Math.floor(Date.now() / day) * day - daysAgo * day + hour * 3_600_000).toISOString();

const pages: TimelineEntry[][] = [
  [
    { id: "p1", at: at(0, 9), icon: Globe, tone: "success", title: <><b>Samet</b> published the post</> },
    { id: "p2", at: at(1, 16), icon: FilePen, title: <><b>Ece</b> edited the introduction</> },
    { id: "p3", at: at(1, 11), icon: FilePen, title: <><b>Ece</b> changed the featured image</> },
  ],
  [
    { id: "p4", at: at(4, 15), icon: FileText, title: <><b>Meltem</b> requested a review</> },
    { id: "p5", at: at(5, 10), icon: Trash2, tone: "danger", title: <><b>Samet</b> removed 2 paragraphs</> },
    { id: "p6", at: at(6, 9), icon: FileText, title: <><b>Samet</b> created the draft</> },
  ],
];

export default function ActivityTimelineLoadMore() {
  const [loaded, setLoaded] = React.useState(1);
  const [filter, setFilter] = React.useState<"all" | "edits">("all");
  const items = pages.slice(0, loaded).flat().filter((i) => filter === "all" || i.icon === FilePen);
  return (
    <Card className="w-full max-w-md">
      <CardHeader title="Revision history" description="“A practical guide to QR menus”" />
      <CardBody>
        <ActivityTimeline
          items={items}
          groupBy="day"
          filter={
            <>
              {(["all", "edits"] as const).map((f) => (
                <Badge key={f} asChild tone={filter === f ? "accent" : "outline"} size="md">
                  <button type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                    {f === "all" ? "All events" : "Edits only"}
                  </button>
                </Badge>
              ))}
            </>
          }
          hasMore={loaded < pages.length}
          onLoadMore={async () => {
            await new Promise((r) => setTimeout(r, 700));
            setLoaded((n) => n + 1);
          }}
        />
      </CardBody>
    </Card>
  );
}
