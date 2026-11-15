"use client";

import * as React from "react";
import { StarRatingInput } from "@vamos-ui/react/blocks";

// A native radio group: one tab stop, arrow keys change the value, posts as `rating` with the form.
export default function StarRatingInputDemo() {
  const [value, setValue] = React.useState(0);
  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      <StarRatingInput name="rating" label="How would you rate the Tide mug?" description="Your rating appears next to your review." value={value} onValueChange={setValue} required />
      <p className="text-small text-fg-muted" aria-live="polite">
        {value ? `You chose ${value} of 5.` : "No rating yet."}
      </p>
    </form>
  );
}
