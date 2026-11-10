import { ArrowRightLeft, CircleDollarSign, Mail, PhoneCall } from "lucide-react";
import { ActivityTimeline, Card, CardBody, CardHeader, type TimelineEntry } from "@vamos-ui/react";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const history: TimelineEntry[] = [
  { id: "h1", at: hoursAgo(1), avatar: { name: "Ayşe Kaya" }, actor: "Ayşe Kaya", title: "moved the deal to Negotiation" },
  { id: "h2", at: hoursAgo(3), icon: Mail, title: <>Proposal <b>v3</b> opened by the client (2nd time)</> },
  { id: "h3", at: hoursAgo(26), icon: PhoneCall, tone: "info", title: <>Call with <b>Burak Şen</b> · 18 min</> },
  { id: "h4", at: hoursAgo(30), icon: CircleDollarSign, tone: "success", title: <>Deal value changed to <b>$48,500</b></> },
  { id: "h5", at: hoursAgo(98), icon: ArrowRightLeft, title: <>Owner changed from <b>Can Özkan</b> to <b>Ayşe Kaya</b></> },
];

export default function ActivityTimelineGrouped() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader title="Northwind renewal" description="Record history" />
      <CardBody>
        <ActivityTimeline items={history} groupBy="day" />
      </CardBody>
    </Card>
  );
}
