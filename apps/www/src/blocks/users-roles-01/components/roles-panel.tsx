"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { Badge, Button, Card, CardHeader, RadioGroup, RadioGroupItem, toast } from "@vamos-ui/react";
import { PermissionMatrix } from "./permission-matrix";
import { roles as initialRoles, type Member, type Role, type RoleId } from "./data";

export function RolesPanel({ members }: { members: Member[] }) {
  const [saved, setSaved] = React.useState<Role[]>(initialRoles);
  const [draft, setDraft] = React.useState<Role[]>(initialRoles);
  const [active, setActive] = React.useState<RoleId>("editor");
  const [saving, setSaving] = React.useState(false);

  const role = draft.find((r) => r.id === active)!;
  const savedRole = saved.find((r) => r.id === active)!;
  const dirty = [...role.permissions].sort().join() !== [...savedRole.permissions].sort().join();
  const count = (id: RoleId) => members.filter((m) => m.role === id).length;

  const setPermissions = (permissions: string[]) => setDraft((list) => list.map((r) => (r.id === active ? { ...r, permissions } : r)));

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaved((list) => list.map((r) => (r.id === active ? role : r)));
      setSaving(false);
      toast.success(`${role.label} permissions updated`, { description: `${count(active)} people get the new access on their next page load.` });
    }, 600);
  };

  return (
    <div className="grid items-start gap-(--gap) lg:grid-cols-[17rem_minmax(0,1fr)]">
      <RadioGroup
        variant="card"
        aria-label="Role"
        value={active}
        onValueChange={(v) => setActive(v as RoleId)}
        className="gap-2"
      >
        {draft.map((r) => (
          <RadioGroupItem
            key={r.id}
            value={r.id}
            label={
              <span className="flex items-center gap-1.5">
                {r.label}
                {r.locked ? (
                  <>
                    <Lock className="size-3 text-fg-subtle" aria-hidden />
                    <span className="sr-only">(locked)</span>
                  </>
                ) : null}
              </span>
            }
            description={r.description}
          >
            <span className="text-[12px] text-fg-subtle tabular">
              {count(r.id)} {count(r.id) === 1 ? "person" : "people"}
            </span>
          </RadioGroupItem>
        ))}
      </RadioGroup>

      <Card>
        <CardHeader
          divider
          title={role.label}
          description={`${role.permissions.length} permissions · ${count(role.id)} ${count(role.id) === 1 ? "person" : "people"}`}
          action={
            role.locked ? (
              <Badge tone="outline">Read-only</Badge>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" disabled={!dirty || saving} onClick={() => setDraft((list) => list.map((r) => (r.id === active ? savedRole : r)))}>
                  Discard
                </Button>
                <Button size="sm" variant="primary" disabled={!dirty} loading={saving} loadingText="Saving…" onClick={save}>
                  Save role
                </Button>
              </div>
            )
          }
        />
        <PermissionMatrix roleLabel={role.label} value={role.permissions} onValueChange={setPermissions} readOnly={role.locked} />
      </Card>
    </div>
  );
}
