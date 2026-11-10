"use client";

import * as React from "react";
import { Field, Input, SlugInput } from "@vamos-ui/react";

export default function SlugInputDemo() {
  const [title, setTitle] = React.useState("Spring menu: wild garlic & morels");
  return (
    <div className="grid w-full max-w-lg gap-3">
      <Field label="Title">
        <Input value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
      </Field>
      <SlugInput variant="permalink" source={title} prefix="https://lacasa.vamos.ist/journal/" />
    </div>
  );
}
