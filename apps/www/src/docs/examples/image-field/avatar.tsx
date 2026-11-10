"use client";

import * as React from "react";
import { ImageField, type ImageFieldValue } from "@vamos-ui/react/media";
import { createDemoMedia, demoAsset } from "../media-library/sample-media";

// HR profile photo: round, 96px, actions beside the preview. Crop locks to 1:1.
export default function ImageFieldAvatar() {
  const [adapter] = React.useState(() => createDemoMedia());
  const [photo, setPhoto] = React.useState<ImageFieldValue | null>({ asset: demoAsset("m_portrait_1") });
  const [empty, setEmpty] = React.useState<ImageFieldValue | null>(null);
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div className="grid gap-2">
        <span className="text-[13px] font-medium">Selin Kaya</span>
        <ImageField adapter={adapter} shape="round" size="sm" layout="inline" value={photo} onChange={setPhoto} aria-label="Profile photo" />
      </div>
      <div className="grid gap-2">
        <span className="text-[13px] font-medium">New hire</span>
        <ImageField adapter={adapter} shape="round" size="sm" layout="inline" value={empty} onChange={setEmpty} aria-label="Profile photo" />
      </div>
    </div>
  );
}
