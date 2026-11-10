import { CalendarDays } from "lucide-react";
import { Badge, Button, Card, CardAction, CardBody, CardDescription, CardEyebrow, CardTitle } from "@vamos-cms/ui";

const people = [
  { name: "Elif Demir", reason: "Annual leave", until: "Nov 14" },
  { name: "Mert Aksoy", reason: "Sick leave", until: "Today" },
  { name: "Zeynep Arslan", reason: "Remote — Izmir", until: "Nov 12" },
];

export default function CardComposition() {
  return (
    <Card as="section" aria-labelledby="who-is-out" className="w-full max-w-sm">
      <div className="flex items-start justify-between gap-4 px-(--card-p) pt-4 pb-3">
        <div>
          <CardEyebrow>HR · Today</CardEyebrow>
          <CardTitle id="who-is-out">Who&apos;s out</CardTitle>
          <CardDescription>3 of 24 people in the Istanbul team</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="ghost">
            <CalendarDays /> Calendar
          </Button>
        </CardAction>
      </div>
      <CardBody className="grid gap-2.5 text-[13px]">
        {people.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-3">
            <span className="font-medium">{p.name}</span>
            <span className="flex-1 text-fg-muted">{p.reason}</span>
            <Badge tone={p.until === "Today" ? "warning" : "neutral"}>until {p.until}</Badge>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
