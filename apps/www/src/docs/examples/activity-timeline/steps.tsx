import { ActivityTimeline, Card, CardBody, CardHeader } from "@vamos-cms/ui";

export default function ActivityTimelineSteps() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader title="Quote Q-2026-118" description="Harbor & Pine · loyalty app" />
      <CardBody>
        <ActivityTimeline
          variant="steps"
          items={[
            { id: "s1", at: "2026-11-02T09:30:00Z", status: "done", title: "Quote sent" },
            { id: "s2", at: "2026-11-04T14:10:00Z", status: "done", title: "Opened by client" },
            { id: "s3", at: "2026-11-05T10:00:00Z", status: "current", title: "Waiting for scope decision", body: "Native apps or web app first? Native adds two weeks." },
            { id: "s4", at: "2026-11-16T00:00:00Z", status: "upcoming", title: "Deposit invoice" },
            { id: "s5", at: "2026-11-23T00:00:00Z", status: "upcoming", title: "Kick-off" },
          ]}
        />
      </CardBody>
    </Card>
  );
}
