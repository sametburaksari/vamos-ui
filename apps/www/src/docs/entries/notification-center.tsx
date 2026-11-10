import { ex, type DocEntry } from "../types";
import NotificationCenterDemo from "../examples/notification-center/demo";
import NotificationInlineActions from "../examples/notification-center/inline-actions";
import NotificationLive from "../examples/notification-center/live";
import NotificationPage from "../examples/notification-center/page";
import NotificationMultiApp from "../examples/notification-center/multi-app";

const entry: DocEntry = {
  slug: "notification-center",
  title: "Notification center",
  group: "Overlays & feedback",
  description:
    "An in-app inbox: the bell with an unread badge, a panel (popover on desktop, sheet on phones) with filter tabs, a feed grouped by day, read/unread, inline actions and “Mark all as read”. The kit owns the UI; your adapter owns the transport.",
  source: ["components/notification-center.tsx"],
  basedOn: "Radix Popover, Sheet, Toast",
  usage: `import { NotificationCenter, type NotificationAdapter } from "@vamos-cms/ui";

const inbox: NotificationAdapter = {
  list: ({ cursor, filter, signal }) => api.get("/notifications", { cursor, filter, signal }),
  unreadCount: () => api.get("/notifications/unread-count"),
  markRead: (ids) => api.post("/notifications/read", { ids }),
  onAction: (id, action) => api.post(\`/notifications/\${id}/\${action}\`),
  subscribe: (cb) => events.on("notification", cb),
};

<NotificationCenter adapter={inbox} settingsHref="/settings/notifications" toastOnNew />`,
  demo: ex("demo", "Demo", "notification-center/demo.tsx", NotificationCenterDemo),
  examples: [
    ex("inline-actions", "Inline actions", "notification-center/inline-actions.tsx", NotificationInlineActions, "actions render as buttons in the item; onAction shows a spinner and removes them on success. NotificationItem also works on its own."),
    ex("live", "Live updates", "notification-center/live.tsx", NotificationLive, "subscribe() pushes new items: they prepend, the badge count grows, toastOnNew shows a toast and a polite live region announces at most once per 10 seconds."),
    ex("page", "Full page", "notification-center/page.tsx", NotificationPage, "Build a “/notifications” page from NotificationItem and Pagination."),
    ex("multi-app", "Multi-app inbox", "notification-center/multi-app.tsx", NotificationMultiApp, "Shared across apps: items carry an app badge, tabs pass any filter to your adapter."),
  ],
  api: [
    { name: "NotificationCenter", props: [
      { name: "adapter", type: "NotificationAdapter", description: "list, unreadCount, markRead, onAction?, subscribe?." },
      { name: "tabs", type: "{ id, label, filter? }[]", default: "All · Unread · Mentions", description: "Filter buttons; filter is passed to adapter.list." },
      { name: "toastOnNew", type: "boolean | (n) => boolean", default: "false", description: "Toast when a live item arrives." },
      { name: "pollInterval", type: "number", description: "ms between unread-count refreshes without subscribe." },
      { name: "size", type: '"md" | "lg"', default: '"md"', description: "380 / 440 px panel." },
      { name: "settingsHref", type: "string", description: "“Notification settings” link in the footer." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean", description: "Panel state." },
      { name: "children", type: "ReactNode", description: "Custom composition of Trigger, Panel, Tabs, List, Footer." },
      { name: "labels", type: "Partial<NotificationLabels>", description: "Override built-in strings (notifications.*)." },
    ] },
    { name: "AppNotification", props: [
      { name: "id / title / body", type: "string / ReactNode", description: "Content." },
      { name: "createdAt / readAt", type: "Date | string", description: "Relative time via Intl.RelativeTimeFormat; readAt null = unread." },
      { name: "actor / icon / tone", type: "{ name, avatar? } / ReactNode / tone", description: "Avatar, or a tinted icon well." },
      { name: "href", type: "string", description: "Click marks read, navigates and closes the panel." },
      { name: "app / category", type: "string", description: "App badge; tab filtering." },
      { name: "actions", type: "{ id, label, variant? }[]", description: "Inline buttons (Approve / Reject)." },
      { name: "important", type: "boolean", description: "Turns the bell badge red while unread." },
    ] },
    { name: "NotificationItem", props: [
      { name: "notification", type: "AppNotification", description: "The item." },
      { name: "onOpen / onMarkRead", type: "() => void", description: "Link click; the ✓ button." },
      { name: "onAction", type: "(actionId) => void | Promise", description: "Inline action." },
      { name: "pendingAction", type: "string", description: "Spinner on that action." },
      { name: "posinset / setsize", type: "number", description: "Feed position (aria)." },
    ] },
    { name: "Parts & helpers", props: [
      { name: "NotificationTrigger", type: "component", description: "Bell + badge (99+); aria-label “Notifications, 3 unread”." },
      { name: "NotificationPanel", type: "component", description: "Popover ≥768px, end Sheet below; titled “Notifications”." },
      { name: "NotificationTabs · NotificationList · NotificationFooter", type: "component", description: "Filters, grouped feed (Today / Yesterday / Earlier), mark-all + settings." },
      { name: "createMemoryNotificationAdapter(items, { latency, pageSize, onAction })", type: "MemoryNotificationAdapter", description: "In-memory adapter with push(n) for demos and tests." },
      { name: "groupNotifications(items, timeZone)", type: "groups", description: "Day grouping in the provider's time zone." },
    ] },
  ],
  notes: [
    "Pages of 20 with a “Load more” button; no infinite scroll by default.",
    "Per-category delivery preferences (email / in-app) belong on a settings page, not in this component.",
  ],
  covers: ["Notification center"],
};

export default entry;
