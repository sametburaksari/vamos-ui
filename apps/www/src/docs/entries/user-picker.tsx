import { ex, type DocEntry } from "../types";
import UserPickerDemo from "../examples/user-picker/demo";
import UserPickerAvatars from "../examples/user-picker/avatars";
import UserPickerTeams from "../examples/user-picker/teams";
import UserPickerMe from "../examples/user-picker/me";
import UserPickerInline from "../examples/user-picker/inline";

const entry: DocEntry = {
  slug: "user-picker",
  title: "User picker",
  group: "Pickers",
  description:
    "Assign or mention people and teams: task assignee, approvers, deal owner, reviewers, shift staff, share-with. A Record picker for people — avatars with presence, role line, “Assign to me”, deactivated users, teams that expand to their members, and an avatar-stack trigger for table cells.",
  source: ["components/user-picker.tsx", "components/record-picker.tsx", "components/avatar.tsx"],
  basedOn: "Record picker",
  usage: `import { Field, UserPicker } from "@vamos-ui/react";

<Field label="Assignee">
  <UserPicker source={people} currentUserId={me.id} value={assigneeId} onValueChange={setAssigneeId} />
</Field>`,
  demo: ex("demo", "Demo", "user-picker/demo.tsx", UserPickerDemo),
  examples: [
    ex("avatars", "Avatar stack in a table", "user-picker/avatars.tsx", UserPickerAvatars, 'trigger="avatars" shows the people as a stack plus “+”. The button is named “Assignees of T-482: Priya Raman, Tom Hollis”.'),
    ex("teams", "People and teams", "user-picker/teams.tsx", UserPickerTeams, "teams adds a Teams group. With getTeamMembers a team expands to its active members; without it the team id (team:<id>) is selected."),
    ex("me", "Assign to me", "user-picker/me.tsx", UserPickerMe, "currentUserId pins an “Assign to me” row and marks you with “(you)”."),
    ex("inline", "Inline list (shift staff)", "user-picker/inline.tsx", UserPickerInline, 'trigger="inline" keeps the list open in a side panel. max limits the positions.'),
  ],
  api: [
    {
      name: "UserPicker",
      props: [
        { name: "source", type: "PickerUser[] | RecordSource<PickerUser>", description: "People. An array is searched in memory (name, email, role; locale-folded) and sorted by name with the locale collator." },
        { name: "multiple", type: "boolean", default: "false", description: "Pick many (value becomes string[])." },
        { name: "value / defaultValue / onValueChange", type: "as Record picker", description: "Controlled or uncontrolled id(s)." },
        { name: "max", type: "number", description: "Multi: most people." },
        { name: "trigger", type: '"field" | "avatars" | "inline"', default: '"field"', description: "Field box, avatar-stack button or an always-open list." },
        { name: "currentUserId", type: "string", description: "Adds “Assign to me” and the “(you)” suffix." },
        { name: "teams", type: "PickerTeam[] | RecordSource<PickerTeam>", description: "Teams in their own group ({ id, name, memberCount })." },
        { name: "getTeamMembers", type: "(team, signal) => Promise<PickerUser[]>", description: "Resolve a picked team to people (deactivated members are skipped)." },
        { name: "maxAvatars", type: "number", default: "3", description: "Avatars before “+N” in the avatar trigger." },
        { name: "roleLabel", type: "string", default: '"Assignees"', description: "Role in the avatar trigger's accessible name." },
        { name: "selectedRecords", type: "PickerUser[]", description: "People for the initial value with a server source." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Trigger size." },
        { name: "placeholder", type: "string", default: '"Unassigned" / "Assign"', description: "Trigger text when empty." },
        { name: "name / disabled / readOnly / invalid / required", type: "…", description: "As Record picker; also read from Field." },
        { name: "labels", type: "Partial<UserPickerLabels>", description: "Built-in strings (namespace userPicker)." },
      ],
    },
    {
      name: "PickerUser",
      props: [
        { name: "id / name", type: "string", description: "Identity and display name (initials come from it, locale-aware)." },
        { name: "email", type: "string", description: "Searchable; shown when there is no meta." },
        { name: "avatarUrl", type: "string | null", description: "Photo; falls back to initials." },
        { name: "status", type: '"online" | "away" | "busy" | "offline"', description: "Presence dot." },
        { name: "meta", type: "string", description: "Role or department line." },
        { name: "disabled", type: "boolean", description: "Deactivated: dimmed and not selectable, still shown when already assigned." },
      ],
    },
  ],
  notes: ["For @mentions in comments, reuse PickerUser and the row look; the mention menu itself belongs to the Comment thread."],
  covers: ["User picker"],
};

export default entry;
