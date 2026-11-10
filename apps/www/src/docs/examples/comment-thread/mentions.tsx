"use client";

import * as React from "react";
import { CommentComposer, CommentBody, type MentionItem } from "@vamos-cms/ui";

const people: MentionItem[] = [
  { id: "u2", label: "Daniel Brooks", kind: "user", description: "Account executive" },
  { id: "u5", label: "İlker Şahin", kind: "user", description: "Editor · Content" },
  { id: "u6", label: "Grace Liu", kind: "user", description: "Customer success" },
];
const records: MentionItem[] = [
  { id: "deal-118", label: "Northwind renewal 2027", kind: "record", description: "Deal · $182,400 · Negotiation" },
  { id: "post-77", label: "QR menus: the complete guide", kind: "record", description: "Post · Scheduled Nov 14" },
  { id: "inv-0412", label: "INV-2026-0412", kind: "record", description: "Invoice · Overdue 6 days" },
];
const search = (list: MentionItem[]) => async (q: string) => {
  await new Promise((r) => setTimeout(r, 150));
  return list.filter((m) => m.label.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr")));
};

export default function CommentThreadMentions() {
  const [body, setBody] = React.useState("");
  return (
    <div className="grid w-full max-w-xl gap-4">
      <CommentComposer
        author={{ id: "u1", name: "Ayşe Kaya" }}
        placeholder="Type @ for people, # for records…"
        mentionSources={[{ search: search(people) }, { search: search(records), trigger: "#" }]}
        onSubmit={({ body }) => setBody(body)}
      />
      {body ? (
        <div className="grid gap-2 rounded-ui border border-line bg-surface-2 p-3">
          <CommentBody body={body} />
          <code className="font-mono text-[11.5px] break-all text-fg-muted">{body}</code>
        </div>
      ) : (
        <p className="text-xs text-fg-subtle">Try “@ilk” (Turkish case folding) or “#north”, then press ⌘/Ctrl+Enter.</p>
      )}
    </div>
  );
}
