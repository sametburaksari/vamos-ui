import type { AppNotification } from "@vamos-ui/react";

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

/** Realistic inbox content shared by the notification examples. */
export const inboxSeed = (): AppNotification[] => [
  { id: "n-1042", title: "Hannah Lindqvist mentioned you in “Q4 pricing”", body: "@Ada can you double-check the enterprise tier before Friday?", createdAt: ago(4), actor: { name: "Hannah Lindqvist" }, category: "mention", app: "CRM", href: "#deal-q4" },
  { id: "n-1041", title: "New comment awaiting moderation", body: "“Great guide — do you have a template for allergen labels?” on QR menus for restaurants", createdAt: ago(35), actor: { name: "Ahmet Kaya" }, category: "comment", app: "Site", href: "#comments" },
  {
    id: "n-1040",
    title: "Leave request from Mert Aydın",
    body: "Nov 24 – Nov 28 · 5 days annual leave · 9 days left after this",
    createdAt: ago(95),
    actor: { name: "Mert Aydın" },
    category: "approval",
    app: "People",
    actions: [
      { id: "approve", label: "Approve", variant: "primary" },
      { id: "reject", label: "Reject" },
    ],
  },
  { id: "n-1039", title: "Payment failed for invoice INV-2026-0412", body: "Card ending 4242 was declined. We'll retry tomorrow at 09:00.", createdAt: ago(60 * 20), tone: "danger", important: true, app: "Work", href: "#invoice" },
  { id: "n-1038", title: "Tuzla Play uploaded “Brand guidelines v3.pdf”", createdAt: ago(60 * 27), readAt: ago(60 * 26), actor: { name: "Ece Demir" }, category: "document", app: "Work", href: "#docs" },
  { id: "n-1037", title: "Export finished: contacts-2026-11.csv", body: "2,418 contacts · 1.2 MB", createdAt: ago(60 * 52), readAt: ago(60 * 50), tone: "success", app: "CRM" },
  { id: "n-1036", title: "Deal “Defne Spa — annual retainer” moved to Negotiation", createdAt: ago(60 * 75), readAt: ago(60 * 70), tone: "info", app: "CRM", href: "#pipeline" },
];
