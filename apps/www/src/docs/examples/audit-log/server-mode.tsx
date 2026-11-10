"use client";

import * as React from "react";
import { AuditLog, filterAuditEvents, type AuditEvent, type AuditFilters } from "@vamos-ui/react";
import { actionLabels, auditEvents } from "./data";

// 2,000 generated events stand in for a paginated API.
const all: AuditEvent[] = Array.from({ length: 2000 }, (_, i) => {
  const base = auditEvents[i % auditEvents.length]!;
  return { ...base, id: `evt_${(900000 - i).toString(16)}`, at: new Date(Date.UTC(2026, 10, 10, 9) - i * 7 * 60_000).toISOString() };
});

export default function AuditLogServerMode() {
  const [filters, setFilters] = React.useState<AuditFilters>({});
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const matching = React.useMemo(() => filterAuditEvents(all, filters, "en", actionLabels), [filters]);
  const events = matching.slice(0, pages * 250);

  return (
    <AuditLog
      className="w-full"
      events={events}
      rowCount={matching.length}
      manualFiltering
      filters={filters}
      onFiltersChange={(f) => {
        setFilters(f);
        setPages(1);
      }}
      actionLabels={actionLabels}
      loading={loading}
      hasMore={events.length < matching.length}
      onLoadMore={async () => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 400));
        setPages((p) => p + 1);
        setLoading(false);
      }}
      height="26rem"
      notice="Virtualized · loads 250 at a time"
    />
  );
}
