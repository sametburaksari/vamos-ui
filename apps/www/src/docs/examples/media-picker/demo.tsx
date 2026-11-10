"use client";

import * as React from "react";
import { Button, Image } from "@vamos-ui/react";
import { MediaPicker, MediaProvider, type MediaAsset } from "@vamos-ui/react/media";
import { createDemoMedia } from "../media-library/sample-media";

// Featured image for a blog post: images only, one file, a task-specific confirm label.
export default function MediaPickerDemo() {
  const [adapter] = React.useState(() => createDemoMedia());
  const [cover, setCover] = React.useState<MediaAsset | null>(null);
  return (
    <MediaProvider adapter={adapter}>
      <div className="grid w-full max-w-sm gap-3">
        {cover ? <Image src={cover} aspect="16/9" rounded="ui" sizes="384px" /> : null}
        <MediaPicker accept="image/*" title="Featured image" confirmLabel="Set featured image" value={cover ? [cover.id] : undefined} onSelect={([asset]) => setCover(asset ?? null)}>
          <Button variant={cover ? "secondary" : "primary"}>{cover ? "Change featured image" : "Set featured image"}</Button>
        </MediaPicker>
      </div>
    </MediaProvider>
  );
}
