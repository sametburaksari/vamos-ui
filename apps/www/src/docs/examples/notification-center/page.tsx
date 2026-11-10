"use client";

import * as React from "react";
import { Button, NotificationItem, PageHeader, Pagination, type AppNotification } from "@vamos-ui/react";
import { inboxSeed } from "./data";

const all = [...inboxSeed(), ...inboxSeed().map((n) => ({ ...n, id: `${n.id}-b`, createdAt: new Date(new Date(n.createdAt).getTime() - 6 * 864e5).toISOString(), readAt: n.createdAt }))];
const perPage = 5;

/** A full “/notifications” page built from NotificationItem and Pagination. */
export default function NotificationPage() {
  const [items, setItems] = React.useState<AppNotification[]>(all);
  const [page, setPage] = React.useState(1);
  const markRead = (ids: string[]) => setItems((list) => list.map((n) => (ids.includes(n.id) ? { ...n, readAt: new Date().toISOString(), actions: undefined } : n)));
  const visible = items.slice((page - 1) * perPage, page * perPage);
  const unread = items.filter((n) => !n.readAt);
  return (
    <div className="w-full max-w-2xl">
      <PageHeader size="sm" title="Notifications" description={`${unread.length} unread`} actions={<Button size="sm" disabled={!unread.length} onClick={() => markRead(unread.map((n) => n.id))}>Mark all as read</Button>} />
      <div role="feed" aria-label="Notifications" className="surface grid gap-px rounded-ui-lg p-1.5">
        {visible.map((n, i) => (
          <NotificationItem key={n.id} notification={n} posinset={(page - 1) * perPage + i + 1} setsize={items.length} onMarkRead={() => markRead([n.id])} onAction={() => markRead([n.id])} />
        ))}
      </div>
      <Pagination className="mt-4" page={page} pageCount={Math.ceil(items.length / perPage)} onPageChange={setPage} />
    </div>
  );
}
