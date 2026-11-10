import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { AuditLog, filterAuditEvents, type AuditEvent } from "./audit-log";

const events: AuditEvent[] = [
  {
    id: "evt_01",
    at: "2026-11-10T09:14:07Z",
    actor: { id: "u1", name: "Ayşe Kaya", type: "user" },
    action: "user.role.updated",
    target: { type: "user", id: "usr_482", label: "Daniel Brooks" },
    ip: "88.230.14.7",
    location: "Istanbul, TR",
    userAgent: "Chrome 131 on macOS",
    severity: "warning",
    changes: { before: { role: "Editor" }, after: { role: "Admin" } },
    metadata: { requestId: "req_9f2c41" },
  },
  { id: "evt_02", at: "2026-11-10T08:02:55Z", actor: { id: "k1", name: "Zapier sync", type: "api-key" }, action: "contact.created", target: { type: "contact", id: "con_1209", label: "Jane Cooper" }, ip: "54.86.50.139" },
  { id: "evt_03", at: "2026-11-09T22:41:10Z", actor: { id: "sys", name: "System", type: "system" }, action: "export.created", target: { type: "export", id: "exp_77", label: "All contacts (CSV)" }, severity: "critical" },
];
const actionLabels = { "user.role.updated": "Changed role", "contact.created": "Created contact", "export.created": "Exported data" };

describe("AuditLog", () => {
  it("renders a table with time (seconds + zone), actor, action, target and source (a11y)", async () => {
    const { container } = render(<AuditLog events={events} actionLabels={actionLabels} notice="Showing the last 90 days" />);
    const table = screen.getByRole("table", { name: "Audit log" });
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Details", "Time", "Actor", "Action", "Target", "Source"]);
    expect(screen.getByText("09:14:07 AM UTC")).toBeInTheDocument();
    expect(screen.getByText("Changed role")).toBeInTheDocument();
    expect(screen.getByText("user.role.updated")).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("API key")).toBeInTheDocument();
    expect(within(table).getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("3 events")).toBeInTheDocument();
    expect(screen.getByText("Showing the last 90 days")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("expands an event: aria-expanded/controls, field diff, request id, raw JSON", async () => {
    const user = userEvent.setup();
    const { container } = render(<AuditLog events={events} actionLabels={actionLabels} />);
    const btn = screen.getByRole("button", { name: "Show details for Changed role by Ayşe Kaya" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    const detail = document.getElementById(btn.getAttribute("aria-controls")!)!;
    expect(within(detail).getByText("Editor").tagName).toBe("DEL");
    expect(within(detail).getByText("Admin").tagName).toBe("INS");
    expect(within(detail).getByText("req_9f2c41")).toBeInTheDocument();
    await user.click(within(detail).getByRole("radio", { name: "JSON" }));
    expect(within(detail).getByRole("region", { name: /Differences/ })).toBeInTheDocument();
    await user.click(within(detail).getByRole("button", { name: "View raw JSON" }));
    expect(within(detail).getByLabelText("Raw event")).toHaveTextContent('"id": "evt_01"');
    expect(await axe(container)).toHaveNoViolations();
  });

  it("filters by text, actor and severity; clears", async () => {
    const user = userEvent.setup();
    render(<AuditLog events={events} actionLabels={actionLabels} />);
    await user.type(screen.getByRole("searchbox", { name: "Search events" }), "jane");
    expect(screen.getByText("1 event")).toBeInTheDocument();
    await user.clear(screen.getByRole("searchbox"));
    await user.selectOptions(screen.getByRole("combobox", { name: "Severity" }), "critical");
    expect(screen.getByText("1 event")).toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox", { name: "Actor" }), "u1");
    expect(screen.getByText("No events match these filters")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("3 events")).toBeInTheDocument();
  });

  it("filterAuditEvents matches action prefixes and Turkish case folding", () => {
    expect(filterAuditEvents(events, { action: "user" }).map((e) => e.id)).toEqual(["evt_01"]);
    expect(filterAuditEvents(events, { q: "AYŞE" }, "tr-TR").map((e) => e.id)).toEqual(["evt_01"]);
  });

  it("server mode reports filter changes, load more and export", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    const onLoadMore = vi.fn();
    const onExport = vi.fn();
    render(<AuditLog events={events} rowCount={1240} manualFiltering onFiltersChange={onFiltersChange} hasMore onLoadMore={onLoadMore} onExport={onExport} />);
    expect(screen.getByText("3 of 1,240 events")).toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox", { name: "Action" }), "export");
    expect(onFiltersChange).toHaveBeenLastCalledWith({ action: "export" });
    expect(screen.getAllByRole("row")).toHaveLength(4);
    await user.click(screen.getByRole("button", { name: "Load older events" }));
    expect(onLoadMore).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Export" }));
    expect(onExport).toHaveBeenCalledWith(events);
  });

  it("timeline variant renders a record-scoped feed", () => {
    render(<AuditLog variant="timeline" showFilters={false} events={events} actionLabels={actionLabels} now="2026-11-10T12:00:00Z" />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText(/changed role/)).toBeInTheDocument();
  });

  it("virtualizes long logs (renders a window, keeps table semantics)", () => {
    const many: AuditEvent[] = Array.from({ length: 500 }, (_, i) => ({ ...events[1]!, id: `evt_${i}`, at: new Date(Date.UTC(2026, 10, 10, 9) - i * 60_000).toISOString() }));
    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 480 });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 900 });
    try {
      render(<AuditLog events={many} showFilters={false} />);
      const rows = screen.getAllByRole("row").length;
      expect(rows).toBeGreaterThan(1);
      // jsdom measures rows as 0px, so the window is wider than in a browser — but never the whole log.
      expect(rows).toBeLessThan(many.length);
      expect(screen.getByText("500 events")).toBeInTheDocument();
    } finally {
      // Own props on HTMLElement.prototype shadow Element's getters — removing them restores jsdom.
      delete (HTMLElement.prototype as { clientHeight?: number }).clientHeight;
      delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
    }
  });
});
