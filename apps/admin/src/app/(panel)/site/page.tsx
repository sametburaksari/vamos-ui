import { FileText, MessageSquare, Inbox, Image as ImageIcon, MoreHorizontal } from "lucide-react";
import {
  ActivityTimeline,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Field,
  IconButton,
  Input,
  Item,
  PageHeader,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemList,
  ItemMeta,
  ItemTitle,
  Stat,
  StatGroup,
  Textarea,
  type TimelineEntry,
} from "@vamos-cms/ui";
import { TrafficChart } from "@/components/dashboard/traffic-chart";

const kpis = [
  { label: "Visitors", value: 28412, delta: 0.124, trend: [4, 6, 5, 8, 7, 9, 12, 11, 14] },
  { label: "Published posts", value: 144, delta: 6, deltaKind: "number", trend: [2, 3, 3, 4, 5, 5, 6, 7, 8] },
  { label: "Form submissions", value: 312, delta: 0.31, trend: [3, 5, 4, 6, 9, 8, 10, 13, 12] },
  { label: "Avg. read time", value: 167, format: "duration", delta: -0.041, trend: [9, 8, 9, 7, 8, 6, 7, 6, 5] },
] as const;

const posts = [
  { title: "A practical guide to QR menus for restaurants", author: "Samet", status: "Published", tone: "success", date: "Today, 09:00" },
  { title: "How to stand out on Google Business Profile", author: "Meltem", status: "Scheduled", tone: "info", date: "Nov 11, 09:00" },
  { title: "Local SEO checklist for 2026", author: "Samet", status: "Draft", tone: "neutral", date: "Edited yesterday" },
  { title: "NFC business cards vs. paper", author: "Ece", status: "In review", tone: "warning", date: "Nov 8" },
] as const;

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

function activity(): TimelineEntry[] {
  return [
    { id: "a1", at: minutesAgo(4), icon: Inbox, title: <>New submission on <b>Contact form</b></> },
    { id: "a2", at: minutesAgo(38), icon: MessageSquare, title: <><b>Ahmet K.</b> commented on “QR menus guide”</> },
    { id: "a3", at: minutesAgo(120), icon: ImageIcon, title: <><b>12 images</b> uploaded to Media</> },
    { id: "a4", at: minutesAgo(300), icon: FileText, title: <><b>Meltem</b> scheduled a post</> },
  ];
}

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        size="lg"
        eyebrow="Monday, November 10"
        title={<>Good morning, <em className="text-accent-ink">Samet</em>.</>}
        description="A short summary of what happened on your site in the last 30 days."
        actions={<><Button>Export report</Button><Button variant="solid">New post</Button></>}
      />

      <StatGroup>
        {kpis.map((k, i) => (
          <Stat
            key={k.label}
            className="ui-rise"
            style={{ animationDelay: `${i * 60}ms` }}
            label={k.label}
            value={k.value}
            format={"format" in k ? k.format : undefined}
            delta={k.delta}
            deltaKind={"deltaKind" in k ? k.deltaKind : "percent"}
            trend={k.trend}
            comparison="vs previous 30 days"
          />
        ))}
      </StatGroup>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-3">
        <Card className="ui-rise lg:col-span-2" style={{ animationDelay: "240ms" }}>
          <CardHeader
            title="Traffic"
            description="Daily visits and full reads"
            action={<div className="flex rounded-ui-sm border border-field-border p-0.5 text-xs">
              {["7D", "30D", "90D"].map((p) => (
                <button key={p} className={`rounded-[6px] px-2.5 py-1 ${p === "30D" ? "bg-selected font-medium text-fg" : "text-fg-muted hover:text-fg"}`}>{p}</button>
              ))}
            </div>}
          />
          <CardBody className="pt-1"><TrafficChart /></CardBody>
        </Card>

        <Card className="ui-rise flex flex-col" style={{ animationDelay: "300ms" }}>
          <CardHeader title="Quick draft" description="Don't lose the idea." />
          <CardBody className="grid flex-1 gap-3">
            <Field label="Title"><Input placeholder="Post title" /></Field>
            <Field label="Content" hint="You can expand it in the block editor later."><Textarea rows={5} placeholder="Write an idea…" /></Field>
          </CardBody>
          <CardFooter className="justify-end">
            <Button variant="ghost" size="sm">Clear</Button>
            <Button variant="primary" size="sm">Save draft</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-3">
        <Card className="ui-rise lg:col-span-2" style={{ animationDelay: "360ms" }}>
          <CardHeader title="Recent posts" action={<Button variant="link" size="sm">View all</Button>} />
          <ItemList className="border-t border-line">
            {posts.map((p) => (
              <Item key={p.title} interactive>
                <ItemContent>
                  <ItemTitle>{p.title}</ItemTitle>
                  <ItemDescription>{p.author} · {p.date}</ItemDescription>
                </ItemContent>
                <ItemMeta>
                  <Badge tone={p.tone} dot>{p.status}</Badge>
                </ItemMeta>
                <ItemActions reveal="hover">
                  <IconButton size="xs" label={`More actions for “${p.title}”`}><MoreHorizontal /></IconButton>
                </ItemActions>
              </Item>
            ))}
          </ItemList>
        </Card>

        <Card className="ui-rise" style={{ animationDelay: "420ms" }}>
          <CardHeader title="Activity" />
          <CardBody>
            <ActivityTimeline items={activity()} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
