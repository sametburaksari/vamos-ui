"use client";

import * as React from "react";
import { ImageField, type ImageFieldValue } from "@vamos-ui/react/media";
import { createDemoMedia, demoAsset } from "../media-library/sample-media";

// crop="metadata" stores a non-destructive rect (the loader applies it); crop="copy" bakes a
// new file and uploads it. crop={true} offers both when the adapter can edit.
export default function ImageFieldCropModes() {
  const [adapter] = React.useState(() => createDemoMedia());
  const [a, setA] = React.useState<ImageFieldValue | null>({ asset: demoAsset("m_kitchen") });
  const [b, setB] = React.useState<ImageFieldValue | null>({ asset: demoAsset("m_bistro") });
  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      <div className="grid content-start gap-2">
        <span className="text-[13px] font-medium">Metadata (non-destructive)</span>
        <ImageField adapter={adapter} aspect="4/3" crop="metadata" value={a} onChange={setA} aria-label="Listing image" />
        <code className="truncate font-mono text-[11.5px] text-fg-subtle">crop: {a?.crop ? JSON.stringify(a.crop) : "none"}</code>
      </div>
      <div className="grid content-start gap-2">
        <span className="text-[13px] font-medium">Save as copy</span>
        <ImageField adapter={adapter} aspect="4/3" crop="copy" value={b} onChange={setB} aria-label="Menu image" />
        <code className="truncate font-mono text-[11.5px] text-fg-subtle">file: {b?.asset.filename}</code>
      </div>
    </div>
  );
}
