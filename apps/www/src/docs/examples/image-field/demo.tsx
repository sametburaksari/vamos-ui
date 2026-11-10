"use client";

import * as React from "react";
import { Field } from "@vamos-ui/react";
import { ImageField, MediaProvider, type ImageFieldValue } from "@vamos-ui/react/media";
import { createDemoMedia, demoAsset } from "../media-library/sample-media";

// Featured image in a post editor sidebar: preview, Replace (click the image), Crop, Focal point,
// Remove, and the alt text the editor picked. Drop an image file on it to upload directly.
export default function ImageFieldDemo() {
  const [adapter] = React.useState(() => createDemoMedia());
  const [cover, setCover] = React.useState<ImageFieldValue | null>({ asset: demoAsset("m_harbour") });
  return (
    <MediaProvider adapter={adapter}>
      <div className="w-full max-w-[22rem]">
        <Field label="Featured image" hint="Shown on the blog index and in link previews.">
          <ImageField aspect="16/9" value={cover} onChange={setCover} />
        </Field>
      </div>
    </MediaProvider>
  );
}
