"use client";

import * as React from "react";
import { Button } from "@vamos-cms/ui";
import { MediaPicker, type MediaAsset } from "@vamos-cms/ui/media";
import { createDemoMedia } from "../media-library/sample-media";

// requireAlt: images without alt text get an inline field (or "Decorative") before Insert is
// enabled. The text is saved to the library on confirm. Pick team-planning.jpg to see it.
export default function MediaPickerRequireAlt() {
  const [adapter] = React.useState(() => createDemoMedia());
  const [picked, setPicked] = React.useState<MediaAsset[]>([]);
  return (
    <div className="grid gap-2">
      <MediaPicker adapter={adapter} accept="image/*" multiple requireAlt title="Insert images into the article" onSelect={setPicked}>
        <Button>Insert images</Button>
      </MediaPicker>
      {picked.length ? (
        <ul className="grid gap-1 text-[12.5px] text-fg-muted">
          {picked.map((a) => (
            <li key={a.id}>
              <span className="text-fg">{a.filename}</span> · alt “{a.alt || "decorative"}”
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
