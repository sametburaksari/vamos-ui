"use client";

import * as React from "react";
import { ImageCropper, type CropPreset } from "@vamos-cms/ui/media";

// Named presets are stored as asset.crops[name]; the loader applies the right one per placement.
const presets: CropPreset[] = [
  { label: "Card", value: 4 / 3, name: "card" },
  { label: "Open Graph", value: 1.91, name: "og" },
  { label: "Story", value: 9 / 16, name: "story" },
  { label: "Square", value: 1, name: "square" },
];

export default function ImageCropperPresets() {
  const [saved, setSaved] = React.useState<string>("—");
  return (
    <div className="grid w-full max-w-2xl gap-3">
      <ImageCropper
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80&auto=format&fit=crop"
        presets={presets}
        defaultAspect={4 / 3}
        onChange={(rect, preset) => setSaved(`${preset?.name ?? "custom"} → ${rect.width}×${rect.height} at ${rect.x},${rect.y}`)}
      />
      <p className="tabular text-[13px] text-fg-muted">Last saved: {saved}</p>
    </div>
  );
}
