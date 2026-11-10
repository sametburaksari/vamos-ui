"use client";

import { Avatar, Card, CardBody, CardHeader, Progress, useFormat } from "@vamos-ui/react";
import { leaveTypes, teamAway, type LeaveTypeId } from "./data";

const ALLOWANCE = 20;

/** Balance for the chosen type (with this request pencilled in) and who else is away. */
export function LeaveSidebar({ typeId, days }: { typeId: LeaveTypeId | null; days: number }) {
  const f = useFormat();
  const annual = leaveTypes.find((t) => t.id === "annual")!;
  const used = ALLOWANCE - annual.balance!;
  const pending = typeId === "annual" ? days : 0;

  return (
    <div className="grid gap-(--gap)">
      <Card>
        <CardHeader title="Annual leave 2026" description="Resets on 1 January. Up to 5 days roll over." />
        <CardBody className="grid gap-4">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[32px] font-medium leading-none tracking-[-0.03em] tabular">{f.number(annual.balance! - pending)}</span>
            <span className="text-[13px] text-fg-muted">of {ALLOWANCE} days left</span>
          </div>
          <Progress
            value={used + pending}
            max={ALLOWANCE}
            display="fraction"
            label="Used"
            showValue
            hint={pending ? `Includes ${f.number(pending)} from this request` : `${used} taken: May, August and October`}
          />
          <dl className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-[12.5px]">
            <div>
              <dt className="text-fg-subtle">Work from elsewhere</dt>
              <dd className="font-mono text-fg tabular">11 / 20</dd>
            </div>
            <div>
              <dt className="text-fg-subtle">Sick days taken</dt>
              <dd className="font-mono text-fg tabular">3</dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Team · Site" description="Who is away in the next 4 weeks" />
        <CardBody>
          <ul className="grid gap-3">
            {teamAway.map((p) => (
              <li key={p.name} className="flex items-center gap-3">
                <Avatar size="sm" name={p.name} />
                <div className="min-w-0 text-[13px]">
                  <p className="truncate font-medium text-fg">{p.name}</p>
                  <p className="truncate text-fg-muted">
                    {p.type} · {f.dateRange(p.from, p.to, "medium")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
