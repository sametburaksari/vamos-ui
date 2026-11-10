import { Button, ActivityTimeline, Card, CardBody, CardHeader, type TimelineEntry } from "@vamos-cms/ui";
import { StickyNote } from "lucide-react";

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const items: TimelineEntry[] = [
  {
    id: "n1",
    at: ago(12),
    avatar: { name: "Meltem Aydın" },
    actor: "Meltem Aydın",
    title: "left a note",
    body: "Client prefers WhatsApp over email. Best time to call is after 14:00.",
  },
  {
    id: "n2",
    at: ago(95),
    avatar: { name: "İlker Şahin" },
    actor: "İlker Şahin",
    title: "commented on “Local SEO checklist for 2026”",
    body: <blockquote className="border-s-2 border-line ps-3 text-fg-muted">Can we add a section about Google Business Profile posts? Half our calls ask about it.</blockquote>,
    actions: (
      <>
        <Button size="xs">Reply</Button>
        <Button size="xs" variant="ghost">Resolve</Button>
      </>
    ),
  },
  { id: "n3", at: ago(380), icon: StickyNote, tone: "warning", title: "Reminder: renew harborpine.com before Nov 19" },
];

export default function ActivityTimelineWithBody() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader title="Notes & comments" />
      <CardBody>
        <ActivityTimeline items={items} />
      </CardBody>
    </Card>
  );
}
