"use client";

import * as React from "react";
import { Eye, Send } from "lucide-react";
import { Button, CommandPalette, CommandProvider, toast, useCommandPalette, useRegisterCommands } from "@vamos-ui/react";

/** A page registers its own commands; they disappear when it unmounts. */
function PostEditor() {
  const [status, setStatus] = React.useState<"Draft" | "Published">("Draft");
  useRegisterCommands([
    {
      id: "cms.post.preview",
      title: "Preview post",
      group: "This post",
      icon: Eye,
      perform: () => toast("Preview opened in a new tab"),
    },
    {
      id: "cms.post.publish",
      title: status === "Draft" ? "Publish post" : "Unpublish post",
      group: "This post",
      icon: Send,
      // Returning a promise keeps the palette open with a spinner on the item.
      perform: () =>
        new Promise((resolve) => setTimeout(resolve, 900)).then(() => {
          setStatus((s) => (s === "Draft" ? "Published" : "Draft"));
          toast.success(status === "Draft" ? "Post published" : "Post moved back to drafts");
        }),
    },
  ]);
  return (
    <p className="text-sm text-fg-muted">
      “Local SEO checklist for 2026” · <span className="font-medium text-fg">{status}</span>
    </p>
  );
}

function OpenButton() {
  const palette = useCommandPalette();
  return <Button onClick={() => palette.open()}>Open commands</Button>;
}

export default function CommandRegister() {
  const [editing, setEditing] = React.useState(true);
  return (
    // App shell already provides CommandProvider + CommandPalette; mount them yourself without it.
    <CommandProvider shortcut={false} actions={[{ id: "nav.posts", title: "Posts", group: "Go to", perform: () => toast("Navigating to Posts") }]}>
      <div className="grid justify-items-center gap-3">
        {editing ? <PostEditor /> : <p className="text-sm text-fg-muted">Editor closed — its commands are gone.</p>}
        <div className="flex gap-2">
          <OpenButton />
          <Button variant="ghost" onClick={() => setEditing((e) => !e)}>
            {editing ? "Close editor" : "Open editor"}
          </Button>
        </div>
      </div>
      <CommandPalette />
    </CommandProvider>
  );
}
