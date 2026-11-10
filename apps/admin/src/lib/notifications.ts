import { createMemoryNotificationAdapter, type AppNotification } from "@vamos-cms/ui";

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

/** Demo inbox until the notifications API lands. Swap for a REST/SSE adapter with the same shape. */
const seed: AppNotification[] = [
  {
    id: "n-1042",
    title: "Ahmet K. commented on “A practical guide to QR menus”",
    body: "Great piece. Could you add a section about allergen labels?",
    createdAt: minutesAgo(6),
    actor: { name: "Ahmet Kaya" },
    category: "comment",
    href: "/site/comments",
    app: "Site",
  },
  {
    id: "n-1041",
    title: "Meltem mentioned you in “Local SEO checklist for 2026”",
    body: "@Samet can you review the intro before Friday?",
    createdAt: minutesAgo(48),
    actor: { name: "Meltem Yıldız" },
    category: "mention",
    href: "/site/posts",
    app: "Site",
  },
  {
    id: "n-1040",
    title: "Leave request from Ece Demir",
    body: "Nov 24 – Nov 28 · 5 days annual leave",
    createdAt: minutesAgo(130),
    actor: { name: "Ece Demir" },
    category: "approval",
    app: "People",
    actions: [
      { id: "approve", label: "Approve", variant: "primary" },
      { id: "reject", label: "Reject" },
    ],
  },
  {
    id: "n-1039",
    title: "Deal “Lena Spa — annual retainer” moved to Negotiation",
    createdAt: minutesAgo(60 * 26),
    readAt: minutesAgo(60 * 25),
    tone: "info",
    category: "deal",
    href: "/crm/pipeline",
    app: "CRM",
  },
  {
    id: "n-1038",
    title: "Export finished: contacts-2026-11.csv",
    createdAt: minutesAgo(60 * 50),
    readAt: minutesAgo(60 * 49),
    tone: "success",
    app: "CRM",
  },
];

export const notificationAdapter = createMemoryNotificationAdapter(seed, { latency: 250 });
