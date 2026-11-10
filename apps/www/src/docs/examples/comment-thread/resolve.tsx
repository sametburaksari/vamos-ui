"use client";

import * as React from "react";
import { CommentThread, type CommentData } from "@vamos-ui/react";

const me = { id: "u5", name: "İlker Şahin" };

export default function CommentThreadResolve() {
  const [comments, setComments] = React.useState<CommentData[]>([
    { id: "r1", author: { id: "u8", name: "Meltem Öz" }, createdAt: "2026-11-08T10:00:00Z", body: "The intro paragraph promises “10 tips” but the post has 8.", resolved: true, resolvedBy: "İlker Şahin" },
    { id: "r2", parentId: "r1", author: me, createdAt: "2026-11-08T10:40:00Z", body: "Renamed to “8 tips” and updated the meta description." },
    { id: "r3", author: { id: "u8", name: "Meltem Öz" }, createdAt: "2026-11-09T09:15:00Z", body: "Hero image is 4.1 MB — please export it as WebP under 300 KB." },
    { id: "r4", parentId: "r3", author: { id: "u9", name: "Grace Liu" }, createdAt: "2026-11-09T09:20:00Z", body: "I'll handle it after lunch.", deleted: true },
  ]);
  return (
    <div className="w-full max-w-xl">
      <CommentThread
        comments={comments}
        currentUserId={me.id}
        onResolve={(id, resolved) => setComments((c) => c.map((x) => (x.id === id ? { ...x, resolved, resolvedBy: resolved ? me.name : undefined } : x)))}
      />
    </div>
  );
}
