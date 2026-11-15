import type { TopicListItem } from "@vamos-ui/react";

/** A fixed "now" keeps the relative times in the docs stable. */
export const NOW = Date.parse("2026-11-15T12:00:00Z");
const ago = (minutes: number) => new Date(NOW - minutes * 60_000).toISOString();

export const topics: TopicListItem[] = [
  { id: "rules", title: "Welcome — read this before your first post", href: "#t/rules", pinned: true, locked: true, category: { label: "Announcements", href: "#c/announcements" }, replies: 0, views: 18400 },
  {
    id: "backup",
    title: "What's your backup routine for a small home server?",
    href: "#t/backup",
    excerpt: "I have two drives and a cloud bucket and I'm not sure the order makes sense…",
    category: { label: "Hardware", href: "#c/hardware" },
    tags: ["backup", "storage"],
    replies: 23,
    views: 1840,
    solved: true,
    unread: true,
    lastPost: { name: "Mira Kaya", at: ago(12) },
  },
  {
    id: "fans",
    title: "Quiet fans for a compact case",
    href: "#t/fans",
    category: { label: "Hardware", href: "#c/hardware" },
    tags: ["noise"],
    replies: 7,
    views: 402,
    lastPost: { name: "Jonas Ek", at: ago(3 * 60) },
  },
  { id: "first", title: "First build — does this parts list make sense?", href: "#t/first", category: { label: "Help", href: "#c/help" }, tags: ["beginner"], replies: 0, views: 31 },
  {
    id: "meetup",
    title: "Spring meetup: suggestions for the venue",
    href: "#t/meetup",
    category: { label: "Community", href: "#c/community" },
    replies: 41,
    views: 2900,
    lastPost: { name: "Leyla Aydın", at: ago(2 * 24 * 60) },
  },
];
