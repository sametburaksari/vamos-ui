"use client";

import * as React from "react";
import { PageHeader, Stat, Tabs, TabsContent, TabsList, TabsTrigger, toast } from "@vamos-ui/react";
import { InviteDialog } from "./invite-dialog";
import { MembersTable } from "./members-table";
import { RolesPanel } from "./roles-panel";
import { members as initialMembers, roles } from "./data";

export function UsersRoles() {
  const [members, setMembers] = React.useState(initialMembers);
  const [tab, setTab] = React.useState("members");

  const active = members.filter((m) => m.status === "active").length;
  const invited = members.filter((m) => m.status === "invited").length;
  const without2fa = members.filter((m) => m.status === "active" && !m.twoFactor).length;

  return (
    <Tabs value={tab} onValueChange={setTab} className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow="Workspace"
        title="Users & roles"
        description="Who can sign in to Northwind Studio, and what each role can see and change."
        actions={
          <InviteDialog
            existing={members}
            onInvite={(people) => {
              setMembers((list) => [...people, ...list]);
              toast.success(people.length === 1 ? `Invitation sent to ${people[0]!.email}` : `${people.length} invitations sent`);
            }}
          />
        }
        tabs={
          <TabsList aria-label="Users and roles">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="roles">Roles & permissions</TabsTrigger>
          </TabsList>
        }
        className="mb-6"
      />

      <TabsContent value="members" className="grid gap-(--gap)">
        <div className="grid gap-(--gap) sm:grid-cols-3">
          <Stat variant="card" label="Active members" value={active} target={{ value: 25, label: "seats on the Team plan" }} />
          <Stat variant="card" label="Pending invitations" value={invited} comparison="Links expire after 7 days" />
          <Stat variant="card" label="Active without two-step" value={without2fa} intent="lower-is-better" comparison="Asked to set it up at next sign-in" />
        </div>
        <MembersTable data={members} onChange={setMembers} />
      </TabsContent>

      <TabsContent value="roles">
        <RolesPanel members={members} />
        <p className="mt-4 text-[12.5px] text-fg-subtle">{roles.length} roles · changes apply to everyone with the role and are written to the audit log.</p>
      </TabsContent>
    </Tabs>
  );
}
