"use client";

import * as React from "react";
import { CommentThread, type CommentData } from "@vamos-ui/react";

const me = { id: "u1", name: "Ayşe Kaya" };

export default function CommentThreadCompact() {
  const [comments, setComments] = React.useState<CommentData[]>([
    { id: "k1", author: { id: "u2", name: "Daniel Brooks" }, createdAt: "2026-11-10T07:50:00Z", body: "Called Jane — they want to start with 30 seats and grow to 45 by March." },
    { id: "k2", author: me, createdAt: "2026-11-10T08:05:00Z", body: "Updated the quote. Sending tomorrow morning." },
  ]);
  return (
    <aside className="flex h-96 w-full max-w-xs flex-col overflow-hidden rounded-ui border border-line bg-surface">
      <p className="border-b border-line px-4 py-2.5 text-[13px] font-semibold text-fg">Notes · Northwind renewal</p>
      <div className="flex-1 overflow-y-auto px-4 pt-3 [--composer-bleed:1rem]">
        <CommentThread
          layout="compact"
          composer="sticky-bottom"
          comments={comments}
          currentUserId={me.id}
          onSubmit={({ body }) => setComments((c) => [...c, { id: crypto.randomUUID(), author: me, body, createdAt: new Date().toISOString() }])}
        />
      </div>
    </aside>
  );
}
