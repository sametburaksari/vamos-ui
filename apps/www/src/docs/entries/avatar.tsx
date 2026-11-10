import { ex, type DocEntry } from "../types";
import AvatarDemo from "../examples/avatar/demo";
import AvatarSizes from "../examples/avatar/sizes";
import AvatarStatus from "../examples/avatar/status";
import AvatarGroupExample from "../examples/avatar/group";
import AvatarLocaleInitials from "../examples/avatar/locale-initials";
import AvatarContactList from "../examples/avatar/contact-list";

const entry: DocEntry = {
  slug: "avatar",
  title: "Avatar",
  group: "Foundations",
  description:
    "A person or organisation: photo with a locale-correct initials fallback, a colour derived from the name, five sizes, a square shape for logos, a presence dot, and AvatarGroup with a labelled +N overflow.",
  source: ["components/avatar.tsx", "lib/text.ts", "styles/forms.css"],
  basedOn: "Radix Avatar",
  usage: `import { Avatar, AvatarGroup } from "@vamos-cms/ui";

<Avatar name="Selin Aydın" src="/people/selin.jpg" status="online" />

<AvatarGroup max={3} aria-label="Assignees">
  {team.map((p) => <Avatar key={p.id} name={p.name} src={p.photo} />)}
</AvatarGroup>`,
  demo: ex("demo", "Demo", "avatar/demo.tsx", AvatarDemo),
  examples: [
    ex("sizes", "Sizes & shapes", "avatar/sizes.tsx", AvatarSizes, "20 / 24 / 32 / 40 / 56 px. xs shows one initial. square is for organisations and workspaces."),
    ex("status", "Status", "avatar/status.tsx", AvatarStatus, "The dot is announced with the name (\"Zeynep Çelik (In a meeting until 15:30)\"). statusLabel overrides the default text."),
    ex("group", "Group", "avatar/group.tsx", AvatarGroupExample, "max avatars, then +N (\"3 more people\"). spacing sets the overlap; total covers lists already cut on the server; onOverflowClick turns +N into a button."),
    ex("locale-initials", "Locale-correct initials", "avatar/locale-initials.tsx", AvatarLocaleInitials, "Initials use the provider locale: Turkish uppercases i to İ, so \"ilker şahin\" becomes İŞ, not IŞ."),
    ex("contact-list", "CRM accounts list", "avatar/contact-list.tsx", AvatarContactList, "Square avatars for companies, a small group for the deal owners."),
  ],
  api: [
    {
      name: "Avatar",
      props: [
        { name: "name", type: "string", description: "Required. Initials, fallback colour and the accessible name." },
        { name: "src", type: "string | null", description: "Photo URL. Missing or failing → initials." },
        { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', default: '"md"', description: "20 / 24 / 32 / 40 / 56 px." },
        { name: "shape", type: '"circle" | "square"', default: '"circle"', description: "square for organisation logos." },
        { name: "status", type: '"online" | "away" | "busy" | "offline"', description: "Presence dot, announced with the name." },
        { name: "statusLabel", type: "string", description: "Custom status text (\"In a meeting\")." },
        { name: "fallback", type: "ReactNode", description: "Override the initials (or pass an icon)." },
        { name: "delayMs", type: "number", default: "300", description: "Wait before showing the fallback while an image loads." },
        { name: "neutral", type: "boolean", description: "Neutral fallback colour instead of the per-name hue." },
        { name: "labels", type: "Partial<AvatarLabels>", description: "online, away, busy, offline, withStatus, overflow, more." },
      ],
    },
    {
      name: "AvatarGroup",
      props: [
        { name: "max", type: "number", default: "4", description: "Avatars shown before +N." },
        { name: "total", type: "number", description: "Total count when children are already truncated." },
        { name: "size / shape", type: "Avatar size / shape", default: '"md" / "circle"', description: "Applied to every avatar in the group." },
        { name: "spacing", type: '"sm" | "md" | "lg"', default: '"md"', description: "Overlap between avatars." },
        { name: "onOverflowClick", type: "() => void", description: "Makes +N a button (open the full list)." },
        { name: "aria-label", type: "string", description: "Names the group (\"Assignees\")." },
      ],
    },
    {
      name: "AvatarRoot · AvatarImage · AvatarFallback",
      props: [
        { name: "size / shape", type: "AvatarRoot", description: "Same sizes as Avatar." },
        { name: "asChild", type: "AvatarImage", description: "Render a framework image (e.g. Next <Image>)." },
        { name: "delayMs", type: "AvatarFallback", description: "Delay before the fallback renders." },
      ],
    },
  ],
  notes: [
    "avatarColor(name) returns the same soft background + ink colours for your own components (chart-1…6, mixed with the surface).",
    "In glass mode the ring between stacked avatars uses --avatar-ring (opaque), so the overlap never looks hollow.",
  ],
  covers: ["Avatar & avatar group"],
};

export default entry;
