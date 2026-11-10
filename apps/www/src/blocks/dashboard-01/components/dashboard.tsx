import { ArrowUpRight, ArrowDownRight, FileText, MessageSquare, Inbox, Image as ImageIcon, MoreHorizontal } from "lucide-react";
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Field, IconButton, Input, Textarea } from "@vamos-ui/react";
import { TrafficChart } from "./traffic-chart";
import { Sparkline } from "./sparkline";

const kpis = [
  { label: "Visitors", value: "28,412", delta: "+12.4%", up: true, spark: [4, 6, 5, 8, 7, 9, 12, 11, 14] },
  { label: "Published posts", value: "144", delta: "+6", up: true, spark: [2, 3, 3, 4, 5, 5, 6, 7, 8] },
  { label: "Form submissions", value: "312", delta: "+31.0%", up: true, spark: [3, 5, 4, 6, 9, 8, 10, 13, 12] },
  { label: "Avg. read time", value: "2:47", delta: "−4.1%", up: false, spark: [9, 8, 9, 7, 8, 6, 7, 6, 5] },
];

const posts = [
  { title: "A practical guide to QR menus for restaurants", author: "Samet", status: "Published", tone: "success", date: "Today, 09:00" },
  { title: "How to stand out on Google Business Profile", author: "Meltem", status: "Scheduled", tone: "info", date: "Nov 11, 09:00" },
  { title: "Local SEO checklist for 2026", author: "Samet", status: "Draft", tone: "neutral", date: "Edited yesterday" },
  { title: "NFC business cards vs. paper", author: "Ece", status: "In review", tone: "warning", date: "Nov 8" },
] as const;

const activity = [
  { icon: Inbox, text: <>New submission on <b className="font-medium text-fg">Contact form</b></>, time: "4 min" },
  { icon: MessageSquare, text: <><b className="font-medium text-fg">Ahmet K.</b> commented on “QR menus guide”</>, time: "38 min" },
  { icon: ImageIcon, text: <><b className="font-medium text-fg">12 images</b> uploaded to Media</>, time: "2 h" },
  { icon: FileText, text: <><b className="font-medium text-fg">Meltem</b> scheduled a post</>, time: "5 h" },
];

function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="mb-1.5 text-[11.5px] font-medium uppercase tracking-[0.14em] text-fg-subtle">{eyebrow}</div>}
        <h1 className="font-display text-[length:calc(40px*var(--display-scale))] leading-[1.05] tracking-[-0.01em] text-fg">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-[14px] text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow="Monday, November 10"
        title={<>Good morning, <em className="text-accent-ink">Samet</em>.</>}
        description="A short summary of what happened on your site in the last 30 days."
        actions={<><Button>Export report</Button><Button variant="solid">New post</Button></>}
      />

      <div className="grid gap-(--gap) sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <Card key={k.label} className="ui-rise p-5" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between">
              <span className="text-[13px] text-fg-muted">{k.label}</span>
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium tabular ${k.up ? "text-success" : "text-danger"}`}>
                {k.up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}{k.delta}
              </span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <span className="font-mono text-[28px] font-medium leading-none tracking-[-0.03em] tabular">{k.value}</span>
              <Sparkline values={k.spark} className={k.up ? "text-accent-ink" : "text-fg-subtle"} />
            </div>
          </Card>
        ))}
      </div>

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
            <Field label="Title" id="quick-draft-title"><Input name="title" placeholder="Post title" /></Field>
            <Field label="Content" id="quick-draft-content" hint="You can expand it in the block editor later."><Textarea name="content" rows={5} placeholder="Write an idea…" /></Field>
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
          <ul className="border-t border-line">
            {posts.map((p) => (
              <li key={p.title} className="group flex items-center gap-4 border-b border-line px-5 py-3 last:border-0 hover:bg-hover">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-fg">{p.title}</div>
                  <div className="mt-0.5 text-xs text-fg-subtle">{p.author} · {p.date}</div>
                </div>
                <Badge tone={p.tone} dot>{p.status}</Badge>
                <IconButton size="xs" label="More actions" className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"><MoreHorizontal /></IconButton>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="ui-rise" style={{ animationDelay: "420ms" }}>
          <CardHeader title="Activity" />
          <CardBody>
            <ol className="relative grid gap-4 before:absolute before:start-[13px] before:top-2 before:bottom-2 before:w-px before:bg-line">
              {activity.map((a, i) => (
                <li key={i} className="relative flex gap-3">
                  <span className="z-10 grid size-7 shrink-0 place-items-center rounded-full border border-line bg-surface-2 text-fg-muted"><a.icon className="size-3.5" /></span>
                  <div className="pt-1 text-[13px] text-fg-muted">{a.text}<div className="mt-0.5 text-[11.5px] text-fg-subtle">{a.time} ago</div></div>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
