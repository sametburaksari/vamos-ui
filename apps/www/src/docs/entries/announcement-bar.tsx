import { ex, type DocEntry } from "../types";
import Demo from "../examples/announcement-bar/demo";
import Dismissible from "../examples/announcement-bar/dismissible";
import Warning from "../examples/announcement-bar/warning";
import Scheduled from "../examples/announcement-bar/scheduled";

const entry: DocEntry = {
  slug: "announcement-bar",
  title: "Announcement bar",
  group: "Site blocks",
  description:
    "A one-line, time-boxed notice at the very top of a site — “Closed 1–3 April for the holiday”, “v2.4 is out”. Server component; the optional dismiss button is a ~0.5 KB island that writes a cookie your server can read. Always solid, even in glass mode.",
  source: ["blocks/site/announcement-bar.tsx", "blocks/site/announcement-dismiss.tsx", "blocks/site/registry-1.ts", "styles/blocks.css"],
  usage: `import { AnnouncementBar, Navbar } from "@vamos-ui/react/blocks";

<AnnouncementBar
  text="Closed 1–3 April for Eid — open again Thursday from noon."
  link={{ href: "/hours", label: "Holiday hours" }}
  dismissible
  dismissed={cookies().has(cookieName)}   // optional: server-side read
/>
<Navbar … />

// JSON (layout.header): { "type": "announcement", "variant": "inline", "props": { "text": "…", "tone": "accent" } }`,
  demo: ex("demo", "Holiday closure", "announcement-bar/demo.tsx", Demo),
  examples: [
    ex("dismissible", "Centred, dismissible release notice", "announcement-bar/dismissible.tsx", Dismissible, "Dismissing hides the bar, writes vb_ann_<hash> and moves focus to #content. New copy produces a new hash, so the next notice shows again."),
    ex("warning", "Warning tone", "announcement-bar/warning.tsx", Warning, "neutral = ink strip, accent = accent strip, warning = a 14% warning tint with a hairline."),
    ex("scheduled", "Scheduled", "announcement-bar/scheduled.tsx", Scheduled, "from / until (ISO, until exclusive). In JSON use the node's schedule. Cached pages need revalidation at the boundaries — the bar can't change a page that isn't re-rendered."),
  ],
  api: [
    {
      name: "AnnouncementBar",
      props: [
        { name: "variant", type: '"inline" | "centered"', default: '"inline"', description: "inline: text at the start, link right after it, dismiss at the end. centered: a mono label, centred text + link." },
        { name: "text", type: "ReactNode", description: "One line, ≤ 120 characters (schema)." },
        { name: "link", type: "{ href; label; newTab? }", description: "Underlined link with a mirrored-in-RTL arrow." },
        { name: "tone", type: '"neutral" | "accent" | "warning"', default: '"neutral"', description: "Strip colour. Always solid." },
        { name: "dismissible", type: "boolean", default: "false", description: "Adds the dismiss island (labelled “Dismiss announcement”)." },
        { name: "dismissed", type: "boolean", default: "false", description: "The app read the cookie server-side: render nothing." },
        { name: "storageKey", type: "string", default: "vb_ann_<hash>", description: "Cookie name. Defaults to a hash of the text + link label." },
        { name: "from / until", type: "string (ISO datetime)", description: "Hidden before from and from until (exclusive)." },
        { name: "now", type: "Date | string", default: "render time", description: "Pin the clock for previews and tests." },
        { name: "label", type: "ReactNode", default: '"Notice"', description: "Mono label in centered." },
        { name: "labels", type: "Partial<BlockLabels & Site1Labels>", description: "announcement, notice, dismiss strings (site1LabelsTr for Turkish)." },
        { name: "anchor / id / className / editMode / components / locale", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
  ],
  notes: ["role=\"region\" with a localized name; the bar sits above the skip link target so focus lands on #content after dismissing."],
  covers: ["Announcement bar"],
};

export default entry;
