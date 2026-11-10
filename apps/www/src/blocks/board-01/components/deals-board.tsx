"use client";

import * as React from "react";
import { Building2, CalendarClock, Columns3, Flame, Plus, Rows3, Upload } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  DropdownMenuItem,
  ListContent,
  ListLayout,
  ListToolbar,
  ListViewSwitch,
  PageHeader,
  Stat,
  StatGroup,
  toast,
  useFormat,
  useLocale,
} from "@vamos-ui/react";
import { FilterBar, applyFilters, emptyFilterGroup, hasActiveFilters, searchRows, type FilterGroup } from "@vamos-ui/react/data-table";
import { Kanban, KanbanCardFooter, KanbanCardMeta, KanbanCardTitle, applyKanbanMove, sumBy, weightedSum, type KanbanMoveEvent } from "@vamos-ui/react/sortable";
import { fields, initialDeals, me, owners, stages, type Deal } from "./deals-data";

const lanes = owners.map((o) => ({ key: o.id, label: o.name, icon: <Avatar name={o.name} size="xs" /> }));
let seq = 200;

/** CRM deals pipeline: drag between stages (or use the card menu / keyboard), swimlanes by owner, filters and live totals. */
export function DealsBoard() {
  const { locale } = useLocale();
  const f = useFormat();
  const money = (v: string) => f.currency(v, { currency: "USD" }, { maximumFractionDigits: 0 });

  const [deals, setDeals] = React.useState(initialDeals);
  const [filters, setFilters] = React.useState<FilterGroup>(emptyFilterGroup());
  const [q, setQ] = React.useState("");
  const [layout, setLayout] = React.useState("stages");

  const visible = searchRows(applyFilters(deals, filters, fields, { locale, me: me.id }), q, (d) => `${d.title} ${d.company}`, locale);
  const filtered = hasActiveFilters(filters) || q.trim() !== "";

  const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const weighted = stages.reduce((sum, s) => sum + Number(weightedSum(open.filter((d) => d.stage === s.key), s, (d) => d.value)), 0);
  const won = deals.filter((d) => d.stage === "won");
  const closed = deals.filter((d) => d.stage === "won" || d.stage === "lost").length;

  const canMove = (e: KanbanMoveEvent) => {
    if (e.to !== "won") return true;
    const deal = deals.find((d) => d.id === e.id);
    return deal && !deal.value ? "Add a deal value before marking it as won" : true;
  };

  const move = (e: KanbanMoveEvent) => {
    setDeals((all) =>
      applyKanbanMove(all, e, {
        getId: (d) => d.id,
        getStageKey: (d) => d.stage,
        getLaneKey: (d) => d.owner.id,
        update: (d, stage, lane) => ({ ...d, stage, owner: lane ? (owners.find((o) => o.id === lane) ?? d.owner) : d.owner }),
      }),
    );
    if (e.to === "won" && e.from !== "won") {
      const deal = deals.find((d) => d.id === e.id);
      if (deal) toast.success(`${deal.company} closed — ${money(deal.value)}`);
    }
  };

  return (
    <ListLayout width="full" stickyToolbar={false}>
      <PageHeader
        eyebrow="Sales"
        title="Pipeline"
        meta={<Badge tone="outline" className="tabular">{open.length} open</Badge>}
        description="Q4 2026 · drag a card to move it, or focus it and press Space."
        actions={
          <>
            <Button>
              <Upload /> Import
            </Button>
            <Button variant="primary">
              <Plus /> New deal
            </Button>
          </>
        }
      />

      <StatGroup columns={4} variant="plain" className="mb-2">
        <Stat variant="plain" size="sm" label="Open pipeline" value={Number(sumBy(open, (d) => d.value))} format={{ type: "currency", currency: "USD", options: { maximumFractionDigits: 0 } }} delta={0.082} comparison="vs last month" />
        <Stat variant="plain" size="sm" label="Weighted forecast" value={weighted} format={{ type: "currency", currency: "USD", options: { maximumFractionDigits: 0 } }} delta={0.041} comparison="vs last month" />
        <Stat variant="plain" size="sm" label="Won this quarter" value={Number(sumBy(won, (d) => d.value))} format={{ type: "currency", currency: "USD", options: { maximumFractionDigits: 0 } }} target={{ value: 120000, label: "of $120k goal" }} />
        <Stat variant="plain" size="sm" label="Win rate" value={closed ? won.length / closed : null} format="percent" delta={-0.03} comparison="vs last quarter" />
      </StatGroup>

      <ListToolbar
        filters={<FilterBar fields={fields} value={filters} onChange={setFilters} q={q} onQChange={setQ} searchPlaceholder="Search deals or companies" resultCount={visible.length} me={me} className="w-full" />}
        filterCount={filters.clauses.length}
        viewSwitch={
          <ListViewSwitch
            label="Group by"
            value={layout}
            onValueChange={setLayout}
            options={[
              { value: "stages", label: "Stages", icon: <Columns3 /> },
              { value: "owners", label: "By owner", icon: <Rows3 /> },
            ]}
          />
        }
      />

      <ListContent>
        <h2 className="sr-only">Deals by stage</h2>
        <Kanban
          aria-label="Deals pipeline"
          stages={stages}
          items={visible}
          filtered={filtered}
          getStageKey={(d) => d.stage}
          getLabel={(d) => `${d.company} — ${d.title}`}
          lanes={layout === "owners" ? lanes : undefined}
          getLaneKey={(d) => d.owner.id}
          canMove={canMove}
          onMove={move}
          onQuickAdd={(stage, title, lane) => {
            const owner = owners.find((o) => o.id === lane) ?? me;
            const deal: Deal = { id: `d-${++seq}`, title, company: "New company", stage, value: "", owner, closeDate: "2026-12-31" };
            setDeals((all) => [...all, deal]);
          }}
          summary={(items, stage) => (
            <>
              <span className="tabular">{money(sumBy(items, (d) => d.value))}</span>
              {stage.category === "open" || stage.category === "active" ? (
                <span className="text-fg-subtle"> · weighted {money(weightedSum(items, stage, (d) => d.value))}</span>
              ) : null}
            </>
          )}
          cardMenu={(d) => (
            <DropdownMenuItem icon={<Flame />} onSelect={() => setDeals((all) => all.map((x) => (x.id === d.id ? { ...x, priority: x.priority === "hot" ? undefined : "hot" } : x)))}>
              {d.priority === "hot" ? "Remove hot flag" : "Mark as hot"}
            </DropdownMenuItem>
          )}
          renderCard={(d, state) => (
            <>
              <KanbanCardTitle>
                <a href={`#/crm/deals/${d.id}`}>{d.title}</a>
              </KanbanCardTitle>
              <KanbanCardMeta>
                <span className="inline-flex min-w-0 items-center gap-1">
                  <Building2 aria-hidden className="size-3.5 shrink-0" />
                  <span className="truncate">{d.company}</span>
                </span>
              </KanbanCardMeta>
              {d.nextStep && !state.compact ? <p className="mt-1.5 line-clamp-1 text-[12px] text-fg-subtle">Next: {d.nextStep}</p> : null}
              <KanbanCardFooter>
                <span className="flex min-w-0 items-center gap-1.5">
                  {d.value ? <span className="tabular text-[13px] font-semibold">{money(d.value)}</span> : <span className="text-[12px] text-fg-subtle">No value yet</span>}
                  {d.priority === "hot" ? <Badge tone="warning">Hot</Badge> : d.priority === "at-risk" ? <Badge tone="danger">At risk</Badge> : null}
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-fg-subtle">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock aria-hidden className="size-3.5" />
                    <time dateTime={d.closeDate}>{f.date(d.closeDate, { month: "short", day: "numeric" })}</time>
                  </span>
                  {layout === "owners" ? null : <Avatar name={d.owner.name} size="xs" />}
                </span>
              </KanbanCardFooter>
            </>
          )}
        />
      </ListContent>
    </ListLayout>
  );
}
