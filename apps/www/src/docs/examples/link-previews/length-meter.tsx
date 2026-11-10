"use client";

import * as React from "react";
import { Field, Input, Textarea } from "@vamos-cms/ui";
import { LengthMeter, SearchPreview } from "@vamos-cms/ui/media";

// The SEO panel of a post editor: meters count graphemes and rendered pixels.
export default function LinkPreviewsLengthMeter() {
  const [title, setTitle] = React.useState("Spring Menu 2027: Twelve New Plates from Our Garden");
  const [description, setDescription] = React.useState("Asparagus, wild garlic and the first broad beans: our chef walks you through the new spring menu, served from 1 March.");
  return (
    <div className="grid w-full gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="grid content-start gap-4">
        <Field label="SEO title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <LengthMeter value={title} field="title" label="SEO title length" className="-mt-2" />
        <Field label="Meta description">
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <LengthMeter value={description} field="description" label="Meta description length" className="-mt-2" />
      </div>
      <SearchPreview data={{ url: "https://kalamisbistro.com/journal/spring-menu-2027", title, description, siteName: "Kalamış Bistro" }} highlight="spring menu" size="sm" />
    </div>
  );
}
