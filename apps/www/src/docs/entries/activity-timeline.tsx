import { ex, type DocEntry } from "../types";
import ActivityTimelineDemo from "../examples/activity-timeline/demo";
import ActivityTimelineGrouped from "../examples/activity-timeline/grouped";
import ActivityTimelineSteps from "../examples/activity-timeline/steps";
import ActivityTimelineWithBody from "../examples/activity-timeline/with-body";
import ActivityTimelineLive from "../examples/activity-timeline/live";
import ActivityTimelineLoadMore from "../examples/activity-timeline/load-more";

const entry: DocEntry = {
  slug: "activity-timeline",
  title: "Activity timeline",
  group: "Data display",
  description:
    "Chronological, human-readable history: dashboard activity, record history, approval and order steps. Groups by day (\"Today\", \"Yesterday\", \"Friday, Nov 6\"), shows relative times that stay fresh from one shared ticker, and renders people as Avatars and events as icons.",
  source: ["components/activity-timeline.tsx", "lib/data-islands.tsx", "styles/data.css"],
  basedOn: "Native <ol> + Intl.RelativeTimeFormat",
  usage: `import { ActivityTimeline } from "@vamos-cms/ui";
import { Inbox } from "lucide-react";

<ActivityTimeline groupBy="day" items={[
  { id: "1", at: "2026-11-10T09:12:00Z", icon: Inbox, title: <>New submission on <b>Contact form</b></> },
  { id: "2", at: "2026-11-09T16:40:00Z", avatar: { name: "Ahmet Kaya" }, actor: "Ahmet Kaya", title: "commented on “QR menus guide”" },
]} />`,
  demo: ex("demo", "Dashboard feed (CMS)", "activity-timeline/demo.tsx", ActivityTimelineDemo),
  examples: [
    ex("grouped", "Grouped by day (CRM)", "activity-timeline/grouped.tsx", ActivityTimelineGrouped, "groupBy=\"day\" splits in timeZone (pass your LocaleProvider's); inside groups times show the time of day."),
    ex("steps", "Steps", "activity-timeline/steps.tsx", ActivityTimelineSteps, "variant=\"steps\": done / current / upcoming / failed, aria-current=\"step\" and status text for screen readers."),
    ex("with-body", "Notes and comments", "activity-timeline/with-body.tsx", ActivityTimelineWithBody, "body holds a note or quote; actions add buttons under it."),
    ex("live", "Live feed", "activity-timeline/live.tsx", ActivityTimelineLive, "New events wait behind a \"3 new updates\" pill instead of shifting the list; announcement is a polite live region you batch."),
    ex("load-more", "Paginated history with filters", "activity-timeline/load-more.tsx", ActivityTimelineLoadMore, "hasMore + onLoadMore show a busy load button; filter renders chips above the list."),
  ],
  api: [
    { name: "ActivityTimeline", props: [
      { name: "items", type: "TimelineEntry[]", description: "Events." },
      { name: "variant", type: '"feed" | "steps"', default: '"feed"', description: "Event feed or process steps." },
      { name: "groupBy", type: '"day" | "none"', default: '"none"', description: "Day sections." },
      { name: "order", type: '"desc" | "asc"', default: '"desc" (steps: as given)', description: "Sort by time." },
      { name: "timeZone", type: "string", default: '"UTC"', description: "Day boundaries for grouping." },
      { name: "now", type: "Date | string | number", description: "Pin the reference time (docs, tests)." },
      { name: "timeMode", type: '"relative" | "absolute"', description: "Default: relative, time of day inside groups." },
      { name: "density", type: '"inherit" | "compact" | "comfortable"', default: '"inherit"', description: "Indicator size and spacing." },
      { name: "loading", type: "boolean", default: "false", description: "Three skeleton items." },
      { name: "empty", type: "ReactNode", default: '"No activity yet"', description: "Empty state." },
      { name: "hasMore / onLoadMore", type: "boolean / () => void | Promise<void>", description: "Load-more button with busy state." },
      { name: "newCount / onShowNew", type: "number / () => void", description: "\"3 new updates\" pill for live feeds." },
      { name: "announcement", type: "string", description: "Polite live-region text." },
      { name: "filter", type: "ReactNode", description: "Chips above the list." },
      { name: "labels", type: "Partial<TimelineLabels>", description: "today, yesterday, empty, loadMore, loading, newItems, done, current, upcoming, failed." },
    ] },
    { name: "TimelineEntry", props: [
      { name: "id / at", type: "string / Date | string", description: "Key and time (ISO instant or YYYY-MM-DD)." },
      { name: "title / body", type: "ReactNode", description: "What happened; note under it." },
      { name: "icon", type: "LucideIcon", description: "Indicator icon." },
      { name: "avatar", type: "{ src?: string; name: string }", description: "Actor's Avatar (wins over icon)." },
      { name: "actor", type: "string", description: "Bold name before the title." },
      { name: "tone", type: '"neutral" | "accent" | "success" | "warning" | "danger" | "info"', description: "Indicator tint." },
      { name: "href", type: "string", description: "Title links to the record." },
      { name: "status", type: '"done" | "current" | "upcoming" | "failed"', description: "Steps state." },
      { name: "actions", type: "ReactNode", description: "Buttons under the content." },
    ] },
    { name: "Parts", props: [
      { name: "Timeline", type: "variant, density", description: "The <ol>." },
      { name: "TimelineGroup", type: "date | label, now", description: "Day section with a heading." },
      { name: "TimelineItem", type: "status, highlight", description: "One <li>; highlight briefly tints a new item (not under reduced motion)." },
      { name: "TimelineIndicator", type: "icon | avatar | status, tone", description: "Opaque dot on the connector." },
      { name: "TimelineContent / TimelineTitle / TimelineBody / TimelineActions", type: "HTMLAttributes", description: "Text column parts." },
      { name: "TimelineTime", type: "value, now, mode", description: "<time> with relative text and the full date as title." },
      { name: "TimelineNewItems / TimelineSkeleton", type: "count / count", description: "Live pill and loading rows." },
      { name: "RelativeTime", type: "value, now, display, styleType", description: "Standalone relative <time> (SSR shows absolute, client upgrades)." },
    ] },
  ],
  covers: ["Activity timeline"],
};

export default entry;
