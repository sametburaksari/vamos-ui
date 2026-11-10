import { ex, type DocEntry } from "../types";
import AuditLogDemo from "../examples/audit-log/demo";
import AuditLogEventDetail from "../examples/audit-log/event-detail";
import AuditLogRecordScope from "../examples/audit-log/record-scope";
import AuditLogServerMode from "../examples/audit-log/server-mode";

const entry: DocEntry = {
  slug: "audit-log",
  title: "Audit log",
  group: "Data display",
  description:
    "The full ledger of who did what, when and from where — sign-ins, permission changes, exports, deletes. Filter by text, actor, action and severity, expand an event for its field diff, JSON diff and raw payload, and scroll thousands of rows: long logs are virtualized while keeping native table semantics.",
  source: ["components/audit-log.tsx", "components/version-history.tsx", "styles/data.css"],
  basedOn: "@tanstack/react-virtual + native <table> (one <tbody> per event)",
  usage: `import { AuditLog } from "@vamos-cms/ui";

<AuditLog
  events={events}
  actionLabels={{ "user.role.updated": "Changed role", "export.created": "Exported data" }}
  notice="Showing the last 90 days"
  hasMore={hasMore}
  onLoadMore={fetchOlder}
/>`,
  demo: ex("demo", "Settings › Audit log", "audit-log/demo.tsx", AuditLogDemo, "Times show seconds and the zone; critical events carry a danger edge and an icon, not colour alone."),
  examples: [
    ex("event-detail", "Event detail", "audit-log/event-detail.tsx", AuditLogEventDetail, "Field or JSON diff of the change, ids with copy buttons, client, and the raw event."),
    ex("server-mode", "Server mode, 2,000 events", "audit-log/server-mode.tsx", AuditLogServerMode, "manualFiltering + onFiltersChange for your API; rowCount gives \"250 of 2,000\"; scrolling near the end calls onLoadMore."),
    ex("record-scope", "One record's history", "audit-log/record-scope.tsx", AuditLogRecordScope, "variant=\"timeline\" renders into Activity timeline with the field diff as the body."),
  ],
  api: [
    { name: "AuditLog", props: [
      { name: "events", type: "AuditEvent[]", description: "Events, newest first." },
      { name: "actionLabels", type: "Record<string, string>", description: "\"user.role.updated\" → \"Changed role\". Missing codes are humanized." },
      { name: "changeFields", type: "FieldDiffField[]", description: "Labels and formats for the change diff." },
      { name: "filters / defaultFilters / onFiltersChange", type: "AuditFilters / … / (filters) => void", description: "{ q, actorId, action, severity } — controlled or not." },
      { name: "manualFiltering", type: "boolean", default: "false", description: "Server mode: events are already filtered." },
      { name: "rowCount", type: "number", description: "Server total for \"50 of 12,408 events\"." },
      { name: "showFilters", type: "boolean", default: "true", description: "Built-in filter row." },
      { name: "toolbar", type: "ReactNode", description: "Extra filters (a Date range picker)." },
      { name: "notice", type: "ReactNode", description: "Retention or scope notice." },
      { name: "onExport", type: "(events) => void", description: "Export button with the visible events." },
      { name: "hasMore / onLoadMore", type: "boolean / () => void | Promise<void>", description: "Infinite scroll plus a \"Load older events\" button." },
      { name: "loading", type: "boolean", default: "false", description: "Busy indicator in the summary." },
      { name: "height", type: "string", default: '"32rem"', description: "Scroll viewport height." },
      { name: "virtualizeAfter", type: "number", default: "80", description: "Virtualize above this many events." },
      { name: "variant", type: '"table" | "timeline"', default: '"table"', description: "Full ledger or a compact record feed." },
      { name: "labels", type: "Partial<AuditLogLabels>", description: "All built-in strings." },
    ] },
    { name: "AuditEvent", props: [
      { name: "id / at", type: "string / ISO instant", description: "Identity and time." },
      { name: "actor", type: '{ id; name; type: "user" | "api-key" | "system"; avatar? }', description: "Who did it." },
      { name: "action", type: "string", description: "Dotted code; filtering by \"user\" matches \"user.*\"." },
      { name: "target", type: "{ type; id; label? }", description: "What it was done to." },
      { name: "ip / location / userAgent", type: "string", description: "Where from (mono, left-to-right)." },
      { name: "changes", type: "{ before; after }", description: "Field diff in the detail." },
      { name: "metadata", type: "Record<string, unknown>", description: "requestId gets a copy row; the rest is listed." },
      { name: "severity", type: '"info" | "warning" | "critical"', default: '"info"', description: "Badge and edge marker." },
    ] },
    { name: "Parts and helpers", props: [
      { name: "AuditEventDetail", type: "{ event, changeFields }", description: "The expanded content on its own (drawer, page)." },
      { name: "filterAuditEvents(events, filters, locale?, actionLabels?)", type: "AuditEvent[]", description: "The local filter, also usable on the server." },
    ] },
  ],
  notes: ["Rows expand with a labelled button (aria-expanded + aria-controls). Raw JSON sits in a focusable <pre> with a copy button. No row, header or tooltip is blurred in glass mode."],
  covers: ["Audit log"],
};

export default entry;
