"use client";

import * as React from "react";
import { Button, Field, NativeSelect } from "@vamos-ui/react";
import { RichTextEditor, isRichDocEmpty } from "@vamos-ui/react/editor";
import type { RichDoc } from "@vamos-ui/react/blocks/schema";

export default function RichTextField() {
  const [note, setNote] = React.useState<RichDoc>({
    type: "doc",
    content: [
      { type: "paragraph", content: [{ text: "Call with " }, { text: "Hannah Lindqvist", marks: [{ type: "bold" }] }, { text: " (Northwind). They want the renewal before 30 November." }] },
      { type: "list", items: [{ content: [{ type: "paragraph", content: [{ text: "Send the revised quote with 12 seats" }] }] }, { content: [{ type: "paragraph", content: [{ text: "Loop in procurement" }] }] }] },
    ],
  });
  const [error, setError] = React.useState<string>();

  return (
    <form
      className="flex w-full max-w-xl flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(isRichDocEmpty(note) ? "Write a short summary before logging the activity." : undefined);
      }}
    >
      <Field label="Activity type">
        <NativeSelect defaultValue="call" items={[{ value: "call", label: "Call" }, { value: "meeting", label: "Meeting" }, { value: "email", label: "Email" }]} />
      </Field>
      <Field label="Summary" hint="Visible to everyone on the account team." error={error} required>
        <RichTextEditor value={note} onChange={setNote} size="sm" minHeight="7rem" placeholder="What was agreed?" />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" type="reset">Cancel</Button>
        <Button variant="primary" type="submit">Log activity</Button>
      </div>
    </form>
  );
}
