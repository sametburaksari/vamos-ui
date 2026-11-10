"use client";

import * as React from "react";
import { Field } from "@vamos-ui/react";
import { ImageField, type ImageFieldValue } from "@vamos-ui/react/media";
import { createDemoMedia, demoAsset } from "../media-library/sample-media";

// Social card image: 1.91:1, recommended 1200 × 630. A smaller image shows the low-res warning;
// the crop is stored as the named crop "og" on the asset.
export default function ImageFieldSocialImage() {
  const [adapter] = React.useState(() => createDemoMedia());
  const [og, setOg] = React.useState<ImageFieldValue | null>({ asset: demoAsset("m_logo") });
  return (
    <div className="w-full max-w-[24rem]">
      <Field label="Social image" hint="Used by LinkedIn, X and WhatsApp previews.">
        <ImageField adapter={adapter} aspect="1.91/1" recommended={{ width: 1200, height: 630 }} cropPresets={[{ label: "Social", value: 1.91, name: "og" }]} value={og} onChange={setOg} />
      </Field>
    </div>
  );
}
