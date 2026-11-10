"use client";

import * as React from "react";
import { CommentThread, type CommentData } from "@vamos-cms/ui";

const me = { id: "u1", name: "Ayşe Kaya" };

export default function CommentThreadOptimistic() {
  const [comments, setComments] = React.useState<CommentData[]>([
    { id: "o1", author: { id: "p9", name: "Kadıköy Roasters" }, createdAt: "2026-11-10T08:10:00Z", body: "The October commission statement shows 14 orders, our dashboard says 16." },
    { id: "o2", author: me, createdAt: "2026-11-10T08:30:00Z", body: "Checking now — two orders were refunded on Oct 30.", status: "failed" },
  ]);
  const [fail, setFail] = React.useState(true);

  const send = (body: string, id = crypto.randomUUID()) => {
    setComments((c) => [...c.filter((x) => x.id !== id), { id, author: me, body, createdAt: new Date().toISOString(), status: "sending" }]);
    setTimeout(() => {
      setComments((c) => c.map((x) => (x.id === id ? { ...x, status: fail ? "failed" : undefined } : x)));
    }, 1200);
  };

  return (
    <div className="grid w-full max-w-xl gap-3">
      <label className="inline-flex items-center gap-2 text-xs text-fg-muted">
        <input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} />
        Simulate a network failure
      </label>
      <CommentThread
        comments={comments}
        currentUserId={me.id}
        currentUser={me}
        onSubmit={({ body }) => send(body)}
        onRetry={(c) => send(c.body, c.id)}
        onDiscard={(c) => setComments((all) => all.filter((x) => x.id !== c.id))}
      />
    </div>
  );
}
