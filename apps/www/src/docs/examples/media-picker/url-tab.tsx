"use client";

import * as React from "react";
import { Button } from "@vamos-ui/react";
import { MediaPicker, type MediaAdapter, type MediaAsset } from "@vamos-ui/react/media";
import { createDemoMedia } from "../media-library/sample-media";

// The "From URL" tab appears when the adapter can sideload. The imported file lands in the
// library and is selected. Try https://images.unsplash.com/photo-1505691938895-1758d7feb511
export default function MediaPickerUrlTab() {
  const [adapter] = React.useState<MediaAdapter>(() => {
    const base = createDemoMedia();
    return {
      ...base,
      async sideload(url, opts) {
        await new Promise((r) => setTimeout(r, 700));
        const res = await fetch(url, { signal: opts.signal });
        if (!res.ok) throw new Error("Not reachable");
        const blob = await res.blob();
        const name = new URL(url).pathname.split("/").pop() || "imported";
        return base.upload(new File([blob], `${name}.${blob.type.split("/")[1] ?? "bin"}`, { type: blob.type }), opts);
      },
    };
  });
  const [picked, setPicked] = React.useState<MediaAsset[]>([]);
  return (
    <div className="grid gap-2">
      <MediaPicker adapter={adapter} accept="image/*" tabs={["url", "library", "upload"]} onSelect={setPicked}>
        <Button>Import from a link</Button>
      </MediaPicker>
      {picked[0] ? <p className="text-[12.5px] text-fg-muted">Picked {picked[0].filename}</p> : null}
    </div>
  );
}
