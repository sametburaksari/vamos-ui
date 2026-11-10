"use client";

import * as React from "react";
import { ArrowLeft, ChevronRight, Plus, Search, Ticket } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Input,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemLeading,
  ItemList,
  ItemMeta,
  ItemTitle,
  matchText,
  useFormat,
} from "@vamos-ui/react";
import { AuthHeading } from "../../login-02/components/auth-frame";
import { apps, invitations as initialInvites, workspaces as initialWorkspaces, type AppId, type Workspace } from "./data";

function PlanBadge({ ws }: { ws: Workspace }) {
  if (ws.plan === "Trial") return <Badge tone="warning">Trial · {ws.trialDays} days left</Badge>;
  return <Badge tone={ws.plan === "Enterprise" ? "accent" : "neutral"}>{ws.plan}</Badge>;
}

/** Workspace list (search, invitations) → app chooser for the picked workspace. */
export function WorkspaceChooser() {
  const f = useFormat();
  const [workspaces, setWorkspaces] = React.useState(initialWorkspaces);
  const [invites, setInvites] = React.useState(initialInvites);
  const [query, setQuery] = React.useState("");
  const [picked, setPicked] = React.useState<Workspace | null>(null);
  const [opening, setOpening] = React.useState<AppId | null>(null);
  const headingRef = React.useRef<HTMLDivElement>(null);

  const focusHeading = () => window.requestAnimationFrame(() => headingRef.current?.querySelector("h1")?.focus());
  const pick = (ws: Workspace | null) => {
    setPicked(ws);
    setOpening(null);
    focusHeading();
  };

  const visible = workspaces.filter((w) => matchText(`${w.name} ${w.domain}`, query));

  if (picked) {
    return (
      <div key="apps" className="ui-rise grid gap-6">
        <div ref={headingRef} className="flex items-start gap-4">
          <Avatar name={picked.name} shape="square" size="lg" aria-hidden />
          <AuthHeading title={<>Open an app in <em>{picked.name}</em></>}>
            {picked.role} · {picked.domain}
          </AuthHeading>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2" aria-label={`Apps in ${picked.name}`}>
          {(Object.keys(apps) as AppId[]).map((id) => {
            const app = apps[id];
            const Icon = app.icon;
            const enabled = picked.apps.includes(id);
            return (
              <li key={id} className="grid">
                {enabled ? (
                  <Card asChild interactive className="group grid gap-4 p-5 text-start">
                    <button type="button" onClick={() => setOpening(id)} aria-busy={opening === id || undefined}>
                      <span className="flex items-center justify-between">
                        <span aria-hidden className="grid size-10 place-items-center rounded-ui bg-accent-soft text-accent-ink [&_svg]:size-5">
                          <Icon />
                        </span>
                        <ChevronRight aria-hidden className="size-4 text-fg-subtle transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                      </span>
                      <span className="grid gap-0.5">
                        <span className="text-[15px] font-semibold text-fg">{opening === id ? `Opening ${app.name}…` : app.name}</span>
                        <span className="text-[13px] text-fg-muted">{app.description}</span>
                      </span>
                    </button>
                  </Card>
                ) : (
                  <Card variant="outline" className="grid gap-4 p-5 opacity-70" aria-disabled="true">
                    <span className="flex items-center justify-between">
                      <span aria-hidden className="grid size-10 place-items-center rounded-ui bg-surface-2 text-fg-subtle [&_svg]:size-5">
                        <Icon />
                      </span>
                      <Badge tone="outline">Not in plan</Badge>
                    </span>
                    <span className="grid gap-0.5">
                      <span className="text-[15px] font-semibold text-fg">{app.name}</span>
                      <span className="text-[13px] text-fg-muted">{app.description}</span>
                    </span>
                  </Card>
                )}
              </li>
            );
          })}
        </ul>
        <Button variant="ghost" className="-ms-3 justify-self-start text-fg-muted" onClick={() => pick(null)}>
          <ArrowLeft className="rtl:rotate-180" /> All workspaces
        </Button>
      </div>
    );
  }

  return (
    <div key="list" className="ui-rise grid gap-6">
      <div ref={headingRef}>
        <AuthHeading title={<>Choose a <em>workspace</em></>}>
          Signed in as <span className="font-medium text-fg">maya.chen@northwind.io</span>.{" "}
          <a href="#" className="rounded-ui-sm text-fg underline decoration-line underline-offset-4 hover:decoration-fg focus-ring">
            Not you?
          </a>
        </AuthHeading>
      </div>

      {invites.length > 0 ? (
        <Card as="section" aria-labelledby="ws-invites">
          <CardHeader titleAs="h2" titleId="ws-invites" title="Pending invitation" />
          <ItemList>
            {invites.map((inv) => (
              <Item key={inv.id} size="lg" className="flex-wrap sm:flex-nowrap">
                <ItemLeading>
                  <Avatar name={inv.workspace.name} shape="square" size="md" aria-hidden />
                </ItemLeading>
                <ItemContent>
                  <ItemTitle>{inv.workspace.name}</ItemTitle>
                  <ItemDescription>
                    {inv.invitedBy} invited you as {inv.workspace.role} · {f.number(inv.workspace.members)} members
                  </ItemDescription>
                </ItemContent>
                <ItemActions className="ms-auto w-full justify-end sm:w-auto">
                  <Button size="sm" variant="ghost" aria-label={`Decline invitation to ${inv.workspace.name}`} onClick={() => setInvites((l) => l.filter((x) => x.id !== inv.id))}>
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    variant="soft"
                    aria-label={`Accept invitation to ${inv.workspace.name}`}
                    onClick={() => {
                      setInvites((l) => l.filter((x) => x.id !== inv.id));
                      setWorkspaces((l) => [{ ...inv.workspace, lastOpened: new Date().toISOString() }, ...l]);
                    }}
                  >
                    Accept
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemList>
        </Card>
      ) : null}

      <Card as="section" aria-labelledby="ws-list">
        <CardHeader
          titleAs="h2"
          titleId="ws-list"
          title="Your workspaces"
          description={`${f.number(workspaces.length)} ${workspaces.length === 1 ? "workspace" : "workspaces"}`}
        />
        {workspaces.length > 3 ? (
          <div className="px-(--card-p) pb-3">
            <Input
              size="sm"
              leading={<Search />}
              placeholder="Find a workspace"
              aria-label="Find a workspace"
              clearable
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery("")}
            />
          </div>
        ) : null}
        <ItemList
          className="border-t border-line"
          empty={
            <EmptyState
              kind="no-results"
              size="sm"
              title={`No workspace matches “${query}”`}
              description="Check the spelling, or ask an admin for an invite."
              actions={<Button size="sm" onClick={() => setQuery("")}>Clear search</Button>}
            />
          }
        >
          {visible.map((ws) => (
            <Item key={ws.id} asChild size="lg">
              <button type="button" onClick={() => pick(ws)}>
                <ItemLeading>
                  <Avatar name={ws.name} shape="square" size="md" aria-hidden />
                </ItemLeading>
                <ItemContent>
                  <ItemTitle>{ws.name}</ItemTitle>
                  <ItemDescription>
                    {ws.role} · {f.number(ws.members)} members
                    <span className="hidden sm:inline"> · opened {f.relative(ws.lastOpened)}</span>
                  </ItemDescription>
                </ItemContent>
                <ItemMeta className="hidden sm:flex">
                  <PlanBadge ws={ws} />
                </ItemMeta>
                <ChevronRight aria-hidden className="size-4 shrink-0 self-center text-fg-subtle rtl:rotate-180" />
              </button>
            </Item>
          ))}
        </ItemList>
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="secondary">
          <Plus /> Create a workspace
        </Button>
        <Button variant="ghost">
          <Ticket /> Join with an invite code
        </Button>
      </div>
    </div>
  );
}
