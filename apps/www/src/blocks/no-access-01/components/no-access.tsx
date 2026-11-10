"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  Eye,
  FilePlus2,
  LockKeyhole,
  Send,
} from "lucide-react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Field,
  Item,
  ItemContent,
  ItemDescription,
  ItemLeading,
  ItemList,
  ItemMeta,
  ItemTitle,
  PageHeader,
  RadioGroup,
  Textarea,
} from "@vamos-ui/react";

const admins = [
  {
    name: "Ece Yıldız",
    role: "Owner",
    email: "ece@northpoint.studio",
    status: "online",
  },
  {
    name: "Murat Demir",
    role: "Finance admin",
    email: "murat@northpoint.studio",
    status: "away",
  },
] as const;

/** Access denied: why, who can grant it, and a request form that confirms what happens next. */
export function NoAccess() {
  const [level, setLevel] = React.useState<"view" | "edit">("view");
  const [reason, setReason] = React.useState(
    "I need to check which Q4 invoices for Osteria Luce are still unpaid before Friday’s call.",
  );
  const [state, setState] = React.useState<"idle" | "sending" | "sent">("idle");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setTimeout(() => setState("sent"), 900);
  };

  return (
    <div className="mx-auto max-w-[1080px]">
      <PageHeader
        eyebrow="Work"
        title="Invoices"
        meta={
          <Badge tone="outline">
            <LockKeyhole aria-hidden /> Restricted
          </Badge>
        }
      />
      <div className="grid gap-(--gap) lg:grid-cols-[minmax(0,1fr)_23rem]">
        <Card className="ui-rise lg:row-span-2">
          <EmptyState
            kind="forbidden"
            size="lg"
            as="h2"
            icon={<LockKeyhole />}
            title="You don’t have access to Invoices"
            description={
              <>
                Invoices are visible to the{" "}
                <b className="font-medium text-fg">Owner</b> and{" "}
                <b className="font-medium text-fg">Finance</b> roles. You’re
                signed in as <span className="text-fg">samet@northpoint.studio</span>{" "}
                with the <Badge tone="outline">Editor</Badge> role.
              </>
            }
            actions={
              <>
                <Button asChild>
                  <a href="#work">Go to Work dashboard</a>
                </Button>
                <Button variant="ghost">
                  <ArrowLeftRight /> Switch account
                </Button>
              </>
            }
          />
        </Card>

        <Card className="ui-rise" style={{ animationDelay: "60ms" }}>
          <CardHeader
            titleAs="h2"
            title="Request access"
            description="Your request goes to the people below. Most are answered within a working day."
          />
          <CardBody className="pt-0">
            {state === "sent" ? (
              <Alert
                tone="success"
                live="polite"
                title="Request sent"
                actions={
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setState("idle")}
                  >
                    Withdraw request
                  </Button>
                }
              >
                Ece and Murat were notified. You’ll get an email at
                samet@northpoint.studio when it’s approved — this page will open on
                its own.
              </Alert>
            ) : (
              <form onSubmit={send} className="grid gap-4">
                <Field label="Access level">
                  <RadioGroup
                    value={level}
                    onValueChange={setLevel}
                    items={[
                      {
                        value: "view",
                        label: "View invoices",
                        description: "See amounts, status and PDFs.",
                        icon: <Eye />,
                      },
                      {
                        value: "edit",
                        label: "Create and edit",
                        description: "Also draft, send and record payments.",
                        icon: <FilePlus2 />,
                      },
                    ]}
                  />
                </Field>
                <Field label="Reason" hint="Shown to the approver.">
                  <Textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={280}
                  />
                </Field>
                <Button
                  type="submit"
                  variant="primary"
                  loading={state === "sending"}
                  loadingText="Sending…"
                  className="justify-self-start"
                >
                  <Send /> Send request
                </Button>
              </form>
            )}
          </CardBody>
        </Card>

        <Card
          className="ui-rise self-start"
          style={{ animationDelay: "120ms" }}
        >
          <CardHeader titleAs="h2" title="Who can approve" divider />
          <ItemList aria-label="Workspace admins">
            {admins.map((a) => (
              <Item key={a.email}>
                <ItemLeading>
                  <Avatar name={a.name} size="sm" status={a.status} />
                </ItemLeading>
                <ItemContent>
                  <ItemTitle>{a.name}</ItemTitle>
                  <ItemDescription className="text-fg-muted">{a.email}</ItemDescription>
                </ItemContent>
                <ItemMeta className="text-fg-muted">{a.role}</ItemMeta>
              </Item>
            ))}
          </ItemList>
        </Card>
      </div>
    </div>
  );
}
