"use client";

import * as React from "react";
import { CommentThread, type CommentData, type MentionItem } from "@vamos-cms/ui";

const me = { id: "u1", name: "Ayşe Kaya" };
const team: MentionItem[] = [
  { id: "u2", label: "Daniel Brooks", kind: "user", description: "Account executive" },
  { id: "u3", label: "Jane Cooper", kind: "user", description: "Head of Operations · Northwind" },
  { id: "u4", label: "Mehmet Yılmaz", kind: "user", description: "Solutions engineer" },
  { id: "t1", label: "Legal", kind: "team", description: "4 members" },
];
// Fixed times keep server and client renders identical.
const ago = (min: number) => new Date(Date.UTC(2026, 10, 9, 16) - min * 60_000).toISOString();

const initial: CommentData[] = [
  { id: "c1", author: { id: "u2", name: "Daniel Brooks" }, createdAt: ago(190), body: "@[Ayşe Kaya](user:u1) Northwind asked for a 12-month price lock. Can we offer it if they sign before Dec 15?", reactions: [{ key: "like", count: 1 }] },
  { id: "c2", parentId: "c1", author: me, createdAt: ago(170), body: "Yes, if the seat count stays at 40 or more. Looping in @[Legal](team:t1) for the clause wording." },
  { id: "c3", parentId: "c1", author: { id: "u4", name: "Mehmet Yılmaz" }, createdAt: ago(95), editedAt: ago(90), body: "SSO setup is included either way, so that's not a blocker." },
  { id: "c4", author: { id: "u3", name: "Jane Cooper" }, createdAt: ago(25), body: "Our finance team needs the final quote as a PDF by Friday.", reactions: [{ key: "seen", count: 2, reacted: true }] },
];

export default function CommentThreadDemo() {
  const [comments, setComments] = React.useState(initial);
  return (
    <div className="w-full max-w-xl">
      <CommentThread
        comments={comments}
        currentUserId={me.id}
        currentUser={me}
        mentionSources={[{ search: (q) => team.filter((m) => m.label.toLowerCase().includes(q.toLowerCase())) }]}
        onSubmit={async ({ body, parentId }) => {
          await new Promise((r) => setTimeout(r, 300));
          setComments((c) => [...c, { id: crypto.randomUUID(), author: me, body, parentId, createdAt: new Date().toISOString() }]);
        }}
        onEdit={async (id, body) => setComments((c) => c.map((x) => (x.id === id ? { ...x, body, editedAt: new Date().toISOString() } : x)))}
        onDelete={async (id) => setComments((c) => c.filter((x) => x.id !== id))}
        onResolve={async (id, resolved) => setComments((c) => c.map((x) => (x.id === id ? { ...x, resolved, resolvedBy: resolved ? me.name : undefined } : x)))}
        onReact={(id, key, on) =>
          setComments((c) =>
            c.map((x) => {
              if (x.id !== id) return x;
              const rest = (x.reactions ?? []).filter((r) => r.key !== key);
              const cur = x.reactions?.find((r) => r.key === key);
              const count = (cur?.count ?? 0) + (on ? 1 : -1);
              return { ...x, reactions: count > 0 ? [...rest, { key, count, reacted: on }] : rest };
            }),
          )
        }
        getLink={(c) => `https://crm.example.com/deals/118#comment-${c.id}`}
      />
    </div>
  );
}
