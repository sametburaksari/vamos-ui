import { FileText, Image as ImageIcon, Inbox, MessageSquare } from "lucide-react";
import { ActivityTimeline, Card, CardBody, CardHeader, type TimelineEntry } from "@vamos-ui/react";

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const activity: TimelineEntry[] = [
  { id: "a1", at: ago(4), icon: Inbox, title: <>New submission on <b>Contact form</b></> },
  { id: "a2", at: ago(38), icon: MessageSquare, title: <><b>Ahmet K.</b> commented on “QR menus guide”</> },
  { id: "a3", at: ago(122), icon: ImageIcon, title: <><b>12 images</b> uploaded to Media</> },
  { id: "a4", at: ago(300), icon: FileText, title: <><b>Meltem</b> scheduled a post</> },
];

export default function ActivityTimelineDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader title="Activity" />
      <CardBody>
        <ActivityTimeline items={activity} />
      </CardBody>
    </Card>
  );
}
