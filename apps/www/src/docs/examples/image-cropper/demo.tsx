"use client";

import * as React from "react";
import { ImageCropper, type CropRect } from "@vamos-cms/ui/media";

// The cropper never touches the file: it hands back a rect in source pixels.
export default function ImageCropperDemo() {
  const [rect, setRect] = React.useState<CropRect | null>(null);
  return (
    <div className="grid w-full max-w-2xl gap-3">
      <ImageCropper
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80&auto=format&fit=crop"
        defaultAspect={1.91}
        onChange={(r) => setRect(r)}
      />
      <pre className="tabular overflow-x-auto rounded-ui bg-surface-2 px-3 py-2 font-mono text-[12px] text-fg-muted">
        {rect ? `crops.og = ${JSON.stringify(rect)}` : "Move or zoom the image to see the crop rect"}
      </pre>
    </div>
  );
}
