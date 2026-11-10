"use client";

import * as React from "react";
import { ArrowLeft, KanbanSquare, Search, Trash2 } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Code,
  Input,
  Item,
  ItemContent,
  ItemDescription,
  ItemLeading,
  ItemList,
  ItemMeta,
  ItemTitle,
  KbdGroup,
  PageHeaderTitle,
} from "@vamos-ui/react";

const missingPath = "/crm/deals/D-1482";

const recent = [
  { id: "D-1479", title: "Website redesign · Phase 2", company: "Brightpath Clinics", stage: "Proposal", tone: "info", value: "$18,400", href: "#deal-1479" },
  { id: "D-1471", title: "NFC cards for 60 staff", company: "Northwind Traders", stage: "Negotiation", tone: "warning", value: "$3,900", href: "#deal-1471" },
  { id: "D-1466", title: "Google Ads retainer · Q1", company: "Osteria Luce", stage: "Won", tone: "success", value: "$2,400/mo", href: "#deal-1466" },
  { id: "D-1458", title: "QR menu + POS integration", company: "Moda Atelier", stage: "Qualified", tone: "neutral", value: "$6,250", href: "#deal-1458" },
] as const;

/** A not-found page for a record inside the app: what was missing, and every useful way forward. */
export function NotFoundPanel() {
  const [q, setQ] = React.useState("D-1482");
  return (
    <div className="mx-auto grid max-w-[1120px] gap-x-12 gap-y-10 py-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:py-10">
      <section aria-labelledby="nf-title" className="ui-rise flex min-w-0 flex-col gap-5">
        <p className="flex flex-wrap items-center gap-3 font-mono text-[12px] uppercase tracking-[0.08em] text-fg-muted">
          <span className="text-fg tabular">404</span>
          <span aria-hidden className="h-px w-8 bg-current opacity-40" />
          <span className="normal-case tracking-normal">Not found</span>
        </p>
        <PageHeaderTitle id="nf-title" size="lg" className="max-w-[18ch]">
          This deal isn’t here <em className="text-accent-ink">anymore</em>.
        </PageHeaderTitle>
        <p className="max-w-[52ch] text-pretty text-[15px] leading-relaxed text-fg-muted">
          Nothing lives at <Code className="break-all">{missingPath}</Code>. It may have been merged into another deal, deleted, or the link was copied incompletely. Deleted deals stay in Trash for 30 days.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button variant="primary">
            <KanbanSquare /> Go to Pipeline
          </Button>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="rtl:-scale-x-100" /> Go back
          </Button>
          <Button variant="ghost">
            <Trash2 /> Open Trash
          </Button>
        </div>

        <form role="search" action="#search" onSubmit={(e) => e.preventDefault()} className="mt-4 grid max-w-xl gap-2 border-t border-line pt-6">
          <label htmlFor="nf-search" className="text-[13px] font-medium text-fg">
            Search deals, contacts and companies
          </label>
          <div className="flex gap-2">
            <Input id="nf-search" type="search" name="q" leading={<Search />} value={q} onChange={(e) => setQ(e.target.value)} clearable onClear={() => setQ("")} className="flex-1" />
            <Button type="submit">Search</Button>
          </div>
          <p className="flex items-center gap-1.5 text-[12.5px] text-fg-subtle">
            Or open the command menu anywhere with <KbdGroup keys={["mod", "k"]} size="sm" />
          </p>
        </form>
      </section>

      <Card className="ui-rise self-start" style={{ animationDelay: "80ms" }}>
        <CardHeader titleAs="h2" title="Recently viewed" description="Deals you opened this week." divider />
        <ItemList aria-label="Recently viewed deals">
          {recent.map((d) => (
            <Item key={d.id} asChild>
              <a href={d.href}>
                <ItemLeading>
                  <Avatar name={d.company} shape="square" size="sm" neutral />
                </ItemLeading>
                <ItemContent>
                  <ItemTitle>{d.title}</ItemTitle>
                  <ItemDescription className="text-fg-muted">
                    {d.company} · <span className="font-mono text-[11.5px]">{d.id}</span>
                  </ItemDescription>
                </ItemContent>
                <ItemMeta className="flex flex-col items-end gap-1">
                  <span className="tabular text-fg">{d.value}</span>
                  <Badge tone={d.tone}>{d.stage}</Badge>
                </ItemMeta>
              </a>
            </Item>
          ))}
        </ItemList>
      </Card>
    </div>
  );
}
