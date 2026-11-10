"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Scheduler, type SchedulerEvent } from "@vamos-ui/react/scheduler";

type Channel = "blog" | "instagram" | "newsletter";
const tone: Record<Channel, SchedulerEvent["tone"]> = { blog: "chart-1", instagram: "chart-4", newsletter: "chart-2" };
const at = (day: string, time: string) => new Date(`${day}T${time}:00Z`).toISOString();
const post = (id: string, channel: Channel, title: string, day: string, time: string, status?: SchedulerEvent["status"]): SchedulerEvent => {
  const start = at(day, time);
  const end = new Date(Date.parse(start) + 30 * 60_000).toISOString(); // a 30-minute slot
  return { id, title, start, end, tone: tone[channel], status, data: { channel } };
};

const posts: SchedulerEvent[] = [
  post("1", "blog", "How we cut page weight by 60%", "2026-11-09", "09:00"),
  post("2", "instagram", "Behind the scenes: studio tour", "2026-11-10", "18:00"),
  post("3", "newsletter", "November product digest", "2026-11-11", "08:00"),
  post("4", "blog", "Guide: accessible colour palettes", "2026-11-12", "10:00", "tentative"),
  post("5", "instagram", "Customer story · Lumen Spa", "2026-11-13", "12:00"),
  post("6", "blog", "Year-end pricing update", "2026-11-14", "09:00", "tentative"),
];

export default function SchedulerPublishing() {
  const [channels, setChannels] = React.useState<string[]>(["blog", "instagram", "newsletter"]);
  const visible = posts.filter((p) => channels.includes((p.data as { channel: Channel }).channel));
  return (
    <Scheduler
      className="w-full"
      events={visible}
      defaultDate="2026-11-10"
      defaultView="week"
      views={["week", "month", "list"]}
      timeZone="UTC"
      scrollToTime="07:00"
      height="24rem"
      toolbar={
        <ToggleGroup type="multiple" size="sm" variant="outline" aria-label="Channels" value={channels} onValueChange={setChannels}>
          <ToggleGroupItem value="blog">Blog</ToggleGroupItem>
          <ToggleGroupItem value="instagram">Instagram</ToggleGroupItem>
          <ToggleGroupItem value="newsletter">Newsletter</ToggleGroupItem>
        </ToggleGroup>
      }
      renderEvent={(e, s) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[10.5px] font-semibold tracking-wide text-fg-muted">{s.timeLabel.split(" – ")[0]} · {(e.data as { channel: string }).channel}</span>
          {!s.compact ? <span className="truncate font-medium text-fg">{e.title}</span> : null}
        </span>
      )}
    />
  );
}
