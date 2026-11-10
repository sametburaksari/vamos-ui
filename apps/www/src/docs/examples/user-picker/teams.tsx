"use client";

import * as React from "react";
import { Field, UserPicker, type PickerTeam, type PickerUser } from "@vamos-ui/react";

const people: PickerUser[] = [
  { id: "ay", name: "Ayşe Demir", email: "ayse@vamos.studio", meta: "Sales" },
  { id: "me", name: "Mehmet Kaya", email: "mehmet@vamos.studio", meta: "Support" },
  { id: "pr", name: "Priya Raman", email: "priya@vamos.studio", meta: "Design" },
  { id: "to", name: "Tom Hollis", email: "tom@vamos.studio", meta: "Engineering" },
  { id: "le", name: "Léa Martin", email: "lea@vamos.studio", meta: "Marketing" },
  { id: "ca", name: "Can Yıldız", email: "can@vamos.studio", meta: "Engineering" },
];
const teams: PickerTeam[] = [
  { id: "eng", name: "Engineering", memberCount: 2 },
  { id: "gtm", name: "Go-to-market", memberCount: 2 },
];
const members: Record<string, string[]> = { eng: ["to", "ca"], gtm: ["ay", "le"] };

export default function UserPickerTeams() {
  const [shared, setShared] = React.useState<string[]>(["pr"]);
  return (
    <div className="w-full max-w-md">
      <Field label="Share “Q1 roadmap” with" hint="Pick a team to add all of its members.">
        <UserPicker
          multiple
          source={people}
          teams={teams}
          getTeamMembers={async (team) => people.filter((p) => members[team.id]?.includes(p.id))}
          value={shared}
          onValueChange={setShared}
          placeholder="Add people or teams"
        />
      </Field>
    </div>
  );
}
