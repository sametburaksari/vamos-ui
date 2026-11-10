import * as React from "react";
import { act, screen, waitFor, within } from "@testing-library/react";
import { createMemoryNotificationAdapter, groupNotifications, NotificationCenter, NotificationItem, type AppNotification } from "./notification-center";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

const seed = (): AppNotification[] => [
  { id: "n1", title: "Jane Doe mentioned you in “Q4 pricing”", body: "Can you double-check the enterprise tier?", createdAt: ago(5), actor: { name: "Jane Doe" }, category: "mention", href: "/crm/deals/q4", app: "CRM" },
  {
    id: "n2",
    title: "Leave request from Mert Aydın",
    body: "Nov 24 – Nov 28 · 5 days annual leave",
    createdAt: ago(40),
    category: "approval",
    app: "People",
    actions: [
      { id: "approve", label: "Approve", variant: "primary" },
      { id: "reject", label: "Reject" },
    ],
  },
  { id: "n3", title: "Export finished", body: "contacts-2026-11.csv is ready", createdAt: ago(60 * 30), readAt: ago(60 * 29), tone: "success" },
];

function setDesktop(matches: boolean) {
  window.matchMedia = ((q: string) => ({ matches: q.includes("min-width: 768px") ? matches : false, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false })) as never;
}

describe("NotificationCenter", () => {
  afterEach(() => setDesktop(false));

  it("trigger announces the unread count", async () => {
    renderWithProviders(<NotificationCenter adapter={createMemoryNotificationAdapter(seed())} />);
    const bell = await screen.findByRole("button", { name: "Notifications, 2 unread" });
    expect(bell).toHaveAttribute("aria-haspopup", "dialog");
    expect(bell).toHaveAttribute("aria-expanded", "false");
  });

  it("opens a titled popover on desktop with grouped feeds and passes axe", async () => {
    setDesktop(true);
    const { user } = renderWithProviders(<NotificationCenter adapter={createMemoryNotificationAdapter(seed())} settingsHref="/settings/notifications" />);
    await user.click(await screen.findByRole("button", { name: /Notifications, 2 unread/ }));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    await within(panel).findByRole("feed", { name: "Today" });
    expect(within(panel).getAllByRole("article").length).toBeGreaterThanOrEqual(2);
    expect(within(panel).getByRole("link", { name: "Notification settings" })).toHaveAttribute("href", "/settings/notifications");
    await expectNoA11yViolations();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByRole("button", { name: /Notifications/ })).toHaveFocus();
  });

  it("filters with tabs and marks everything read", async () => {
    const { user } = renderWithProviders(<NotificationCenter adapter={createMemoryNotificationAdapter(seed())} />);
    await user.click(await screen.findByRole("button", { name: /Notifications, 2 unread/ }));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    await user.click(within(panel).getByRole("button", { name: "Mentions" }));
    await waitFor(() => expect(within(panel).getAllByRole("article")).toHaveLength(1));
    expect(within(panel).getByRole("button", { name: "Mentions" })).toHaveAttribute("aria-pressed", "true");
    await user.click(within(panel).getByRole("button", { name: "Mark all as read" }));
    // The sheet is modal, so the bell behind it is aria-hidden.
    await waitFor(() => expect(screen.getByRole("button", { name: "Notifications", hidden: true })).toBeInTheDocument());
    await user.click(within(panel).getByRole("button", { name: "Unread" }));
    expect(await within(panel).findByText("You're all caught up")).toBeInTheDocument();
  });

  it("runs inline actions and removes them on success", async () => {
    const onAction = vi.fn();
    const { user } = renderWithProviders(<NotificationCenter adapter={createMemoryNotificationAdapter(seed(), { onAction })} />);
    await user.click(await screen.findByRole("button", { name: /Notifications/ }));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    await user.click(await within(panel).findByRole("button", { name: "Approve" }));
    expect(onAction).toHaveBeenCalledWith("n2", "approve");
    await waitFor(() => expect(within(panel).queryByRole("button", { name: "Approve" })).toBeNull());
  });

  it("prepends live items from subscribe", async () => {
    const adapter = createMemoryNotificationAdapter(seed());
    const { user } = renderWithProviders(<NotificationCenter adapter={adapter} />);
    await user.click(await screen.findByRole("button", { name: /Notifications/ }));
    const panel = await screen.findByRole("dialog", { name: "Notifications" });
    await within(panel).findAllByRole("article");
    act(() => adapter.push({ id: "n9", title: "New form submission on Contact", createdAt: new Date().toISOString() }));
    expect(await within(panel).findByText("New form submission on Contact")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notifications, 3 unread", hidden: true })).toBeInTheDocument();
  });

  it("NotificationItem works on its own", async () => {
    const onMarkRead = vi.fn();
    const { user } = renderWithProviders(<NotificationItem notification={seed()[0]!} onMarkRead={onMarkRead} />);
    expect(screen.getByRole("article", { name: /Jane Doe mentioned you/ })).toHaveAttribute("data-unread");
    await user.click(screen.getByRole("button", { name: "Mark as read" }));
    expect(onMarkRead).toHaveBeenCalled();
    await expectNoA11yViolations();
  });

  it("groups by day", () => {
    const now = new Date("2026-11-10T12:00:00Z");
    const groups = groupNotifications(
      [
        { id: "a", title: "a", createdAt: "2026-11-10T08:00:00Z" },
        { id: "b", title: "b", createdAt: "2026-11-09T08:00:00Z" },
        { id: "c", title: "c", createdAt: "2026-10-01T08:00:00Z" },
      ],
      "UTC",
      now,
    );
    expect(groups.map((g) => g.id)).toEqual(["today", "yesterday", "earlier"]);
  });
});
