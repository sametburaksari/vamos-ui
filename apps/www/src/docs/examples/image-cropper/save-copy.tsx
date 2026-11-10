"use client";

import * as React from "react";
import { Button } from "@vamos-cms/ui";
import { ImageCropper, getCroppedBlob, type CropRect } from "@vamos-cms/ui/media";

const src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80&auto=format&fit=crop";

// "Save as copy": bake the crop into a new file (canvas, rotation- and flip-aware), then upload it.
export default function ImageCropperSaveCopy() {
  const [rect, setRect] = React.useState<CropRect | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <ImageCropper src={src} defaultAspect={1} onChange={setRect} height="20rem" />
      <div className="flex items-center gap-4">
        <Button
          variant="primary"
          disabled={!rect}
          loading={busy}
          loadingText="Exporting…"
          onClick={async () => {
            if (!rect) return;
            setBusy(true);
            try {
              const blob = await getCroppedBlob(src, rect, { type: "image/webp", quality: 0.88, maxWidth: 640 });
              setPreview(URL.createObjectURL(blob)); // then: adapter.upload(new File([blob], "cover-square.webp"), …)
            } finally {
              setBusy(false);
            }
          }}
        >
          Save as copy
        </Button>
        {preview ? <img src={preview} alt="Exported square crop" className="size-16 rounded-ui-sm object-cover ring-1 ring-line" /> : null}
      </div>
    </div>
  );
}
