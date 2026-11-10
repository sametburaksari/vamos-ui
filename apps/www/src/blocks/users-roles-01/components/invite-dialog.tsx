"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { Button, CheckboxGroup, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger, Field, Select, TagInput, Textarea } from "@vamos-ui/react";
import { roleOptions, type Member, type RoleId } from "./data";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Not a valid email address";
const nameFromEmail = (email: string) =>
  email
    .split("@")[0]!
    .split(/[._-]/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join(" ");

export function InviteDialog({ existing, onInvite }: { existing: Member[]; onInvite: (people: Member[]) => void }) {
  const [open, setOpen] = React.useState(false);
  const [emails, setEmails] = React.useState<string[]>([]);
  const [role, setRole] = React.useState<RoleId>("editor");
  const [apps, setApps] = React.useState<string[]>(["Site"]);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const taken = new Set(existing.map((m) => m.email));
  const validate = (v: string) => {
    const ok = isEmail(v);
    if (ok !== true) return ok;
    return taken.has(v) ? "Already in the workspace" : true;
  };

  const reset = () => {
    setEmails([]);
    setRole("editor");
    setApps(["Site"]);
    setError(undefined);
  };

  const send = () => {
    const valid = emails.filter((e) => validate(e) === true);
    if (valid.length === 0) {
      setError("Add at least one valid email address.");
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      onInvite(
        valid.map((email, i) => ({
          id: `inv-${Date.now()}-${i}`,
          name: nameFromEmail(email),
          email,
          role,
          apps,
          status: "invited",
          twoFactor: false,
          lastActive: null,
        })),
      );
      setSending(false);
      setOpen(false);
      reset();
    }, 700);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="primary">
          <UserPlus /> Invite people
        </Button>
      </DialogTrigger>
      <DialogContent size="md" dismissible={!sending}>
        <DialogHeader title="Invite people" description="They get an email with a link that works for 7 days." />
        <DialogBody className="grid gap-4">
          <Field label="Email addresses" hint="Paste a list or press Enter after each address." error={error} required>
            <TagInput
              value={emails}
              onValueChange={(v) => {
                setEmails(v);
                setError(undefined);
              }}
              validate={validate}
              delimiters={["Enter", "Tab", ",", " ", ";"]}
              transform={(v) => v.trim().toLowerCase()}
              addOnBlur
              placeholder="name@company.com"
            />
          </Field>
          <Field label="Role">
            <Select value={role} onValueChange={(v) => v && setRole(v as RoleId)} items={roleOptions.filter((r) => r.value !== "owner").map(({ value, label }) => ({ value, label }))} />
          </Field>
          <Field label="Apps">
            <CheckboxGroup
              orientation="horizontal"
              value={apps}
              onValueChange={setApps}
              items={["Site", "CRM", "People", "Work"].map((a) => ({ value: a, label: a }))}
            />
          </Field>
          <Field label="Personal note" optional>
            <Textarea rows={3} placeholder="Hi! I’ve added you to our Northwind workspace — the pipeline is under CRM." />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={sending}>Cancel</Button>
          </DialogClose>
          <Button variant="primary" loading={sending} loadingText="Sending…" onClick={send}>
            {emails.length > 1 ? `Send ${emails.length} invitations` : "Send invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
