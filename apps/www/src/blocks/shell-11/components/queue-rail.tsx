"use client";

import * as React from "react";
import { AlarmClock, CheckCheck, CircleDashed, Inbox, Layers, UserRound } from "lucide-react";
import { Avatar, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { agent, agents, queues, queueTest, views, type Ticket, type ViewKey } from "./data";

const viewIcon: Record<string, React.ReactNode> = {
  mine: <UserRound />,
  unassigned: <CircleDashed />,
  "at-risk": <AlarmClock />,
  all: <Inbox />,
  solved: <CheckCheck />,
};

/** Left pane: personal views, team queues and who is on shift. Sits on the navigation surface. */
export function QueueRail({ tickets, view, onView, className }: { tickets: Ticket[]; view: ViewKey; onView: (v: ViewKey) => void; className?: string }) {
  const { t, c } = useBlockFormat();
  const row = (key: ViewKey, label: string, icon: React.ReactNode, count: number, alert = false) => {
    const active = view === key;
    return (
      <li key={key}>
        <button
          type="button"
          onClick={() => onView(key)}
          aria-current={active ? "page" : undefined}
          className={cn(
            "group flex h-8 w-full items-center gap-2.5 rounded-ui-sm px-2.5 text-[13px] text-nav-fg outline-none transition-colors focus-ring [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:opacity-70",
            active ? "bg-nav-active text-nav-fg-strong [&_svg]:opacity-100" : "hover:bg-nav-hover hover:text-nav-fg-strong",
          )}
        >
          {icon}
          <span className="min-w-0 flex-1 truncate text-start">{label}</span>
          <span className={cn("tabular text-xs", alert && count > 0 ? "font-semibold text-danger" : "text-nav-fg opacity-80")}>{count}</span>
        </button>
      </li>
    );
  };

  return (
    <nav aria-label={c("Ticket views", "Talep görünümleri")} className={cn("flex min-h-0 flex-col bg-nav text-nav-fg", className)}>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-4 pb-3">
        <p className="px-2.5 pb-1.5 text-[11px] font-medium tracking-[0.08em] text-nav-fg uppercase opacity-70">{c("Views", "Görünümler")}</p>
        <ul className="grid gap-px">{views.map((v) => row(v.key, t(v.label), viewIcon[v.key], tickets.filter(v.test).length, v.key === "at-risk"))}</ul>

        <p className="mt-5 px-2.5 pb-1.5 text-[11px] font-medium tracking-[0.08em] text-nav-fg uppercase opacity-70">{c("Queues", "Kuyruklar")}</p>
        <ul className="grid gap-px">
          {queues.map((q) => row(`queue:${q.key}`, t(q.label), <Layers />, tickets.filter(queueTest(q.key)).length))}
        </ul>
      </div>

      <div className="border-t border-nav-line px-3 py-3">
        <p className="px-2.5 pb-2 text-[11px] font-medium tracking-[0.08em] text-nav-fg uppercase opacity-70">{c("On shift", "Vardiyada")}</p>
        <ul className="grid gap-1.5 px-2.5">
          {agents.map((p) => {
            const load = tickets.filter((x) => x.assigneeId === p.id && x.status !== "solved" && x.status !== "closed").length;
            return (
              <li key={p.id} className="flex items-center gap-2.5 text-[13px]">
                <Avatar name={p.name} size="xs" status={p.status} />
                <span className="min-w-0 flex-1 truncate text-nav-fg-strong">
                  {p.name}
                  {p.id === agent.id && <span className="text-nav-fg"> · {c("you", "siz")}</span>}
                </span>
                <span className="tabular text-xs text-nav-fg" aria-label={c(`${load} open tickets`, `${load} açık talep`)}>
                  {load}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
