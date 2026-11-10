"use client";

import * as React from "react";
import { CommentThread, type CommentData } from "@vamos-cms/ui";

const me = { id: "u1", name: "Selin Arslan" };
const initial: CommentData[] = [
  {
    id: "a1",
    author: { id: "u7", name: "Can Demir" },
    createdAt: "2026-11-09T15:20:00Z",
    body: "Interview notes and the take-home review are attached. Strong on systems thinking, a bit light on accessibility.",
    attachments: [
      { id: "f1", name: "Interview notes — Elif Aydın.pdf", size: 214_000, mime: "application/pdf", url: "#" },
      { id: "f2", name: "take-home-review.md", size: 9_800, mime: "text/markdown", url: "#" },
    ],
  },
];

export default function CommentThreadAttachments() {
  const [comments, setComments] = React.useState(initial);
  return (
    <div className="w-full max-w-xl">
      <CommentThread
        comments={comments}
        currentUserId={me.id}
        currentUser={me}
        allowAttachments
        onSubmit={async ({ body, attachments }) => {
          setComments((c) => [
            ...c,
            {
              id: crypto.randomUUID(),
              author: me,
              body,
              createdAt: new Date().toISOString(),
              attachments: attachments.map((f, i) => ({ id: `${i}`, name: f.name, size: f.size, mime: f.type, url: "#" })),
            },
          ]);
        }}
      />
    </div>
  );
}
