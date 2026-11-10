"use client";

import * as React from "react";
import { FocalPointPicker, type FocalPoint } from "@vamos-ui/react/media";
import { demoAsset } from "../media-library/sample-media";

// The focal point on its own: drag the marker, or focus it and use the arrow keys
// (Shift = 10%). The previews show how 1:1, 16:9 and 4:5 crops keep the subject in view.
export default function ImageFieldFocalPoint() {
  const asset = demoAsset("m_harbour");
  const [point, setPoint] = React.useState<FocalPoint>(asset.focalPoint ?? { x: 0.5, y: 0.5 });
  return (
    <div className="grid w-full max-w-2xl gap-3">
      <FocalPointPicker src={asset} value={point} onValueChange={setPoint} />
      <code className="tabular rounded-ui bg-surface-2 px-3 py-2 font-mono text-[12px] text-fg-muted">focalPoint = {JSON.stringify(point)}</code>
    </div>
  );
}
