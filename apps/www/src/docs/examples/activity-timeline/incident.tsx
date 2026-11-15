import { ActivityTimeline, Badge, Card, CardBody, CardHeader, type TimelineEntry, type TimelineTone } from "@vamos-ui/react";

/** Your own status vocabulary: each phase maps to a tone and is always written out as text. */
const phases: Record<string, { label: string; tone: TimelineTone }> = {
  investigating: { label: "Investigating", tone: "warning" },
  identified: { label: "Identified", tone: "info" },
  monitoring: { label: "Monitoring", tone: "accent" },
  resolved: { label: "Resolved", tone: "success" },
};

const updates = [
  { at: "2026-11-11T09:40:00Z", phase: "resolved", text: "Deliveries are back to normal. Every delayed event was delivered in order; none were lost." },
  { at: "2026-11-11T09:05:00Z", phase: "monitoring", text: "The backlog is draining. Median delay is under 40 seconds again." },
  { at: "2026-11-11T08:31:00Z", phase: "identified", text: "A queue node was replaced and its partitions rebalanced slowly. We moved them by hand and added capacity." },
  { at: "2026-11-11T08:12:00Z", phase: "investigating", text: "First-attempt deliveries to one region are delayed by up to 4 minutes." },
];

const items: TimelineEntry[] = updates.map((u, i) => ({
  id: String(i),
  at: u.at,
  tone: phases[u.phase]!.tone,
  title: <b>{phases[u.phase]!.label}</b>,
  body: u.text,
}));

export default function ActivityTimelineIncident() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader
        title="Delayed webhook deliveries"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone="warning" dot>Degraded performance</Badge>
            <span>Affected: Webhooks (EU), Event ingestion</span>
          </span>
        }
      />
      <CardBody>
        <ActivityTimeline items={items} groupBy="day" timeZone="UTC" timeMode="absolute" now="2026-11-11T10:00:00Z" />
      </CardBody>
    </Card>
  );
}
