"use client";

import * as React from "react";
import { Avatar, Button } from "@vamos-ui/react";
import { MediaPickerProvider, MediaProvider, useMediaPicker, type MediaAsset } from "@vamos-ui/react/media";
import { createDemoMedia } from "../media-library/sample-media";

// From code: `await pick(options)` resolves with the chosen assets ([] when cancelled).
// Mount MediaPickerProvider once near the app root.
function CompanyLogo() {
  const pick = useMediaPicker();
  const [logo, setLogo] = React.useState<MediaAsset | null>(null);
  return (
    <div className="flex items-center gap-3">
      <Avatar src={logo?.url} name="Kalamış Yapı" size="lg" shape="square" />
      <div className="grid gap-1">
        <span className="text-sm font-medium">Kalamış Yapı A.Ş.</span>
        <Button
          size="sm"
          onClick={async () => {
            const [asset] = await pick({ accept: "image/*", title: "Company logo", confirmLabel: "Use as logo", size: "md" });
            if (asset) setLogo(asset);
          }}
        >
          Change logo
        </Button>
      </div>
    </div>
  );
}

export default function MediaPickerImperative() {
  const [adapter] = React.useState(() => createDemoMedia());
  return (
    <MediaProvider adapter={adapter}>
      <MediaPickerProvider>
        <CompanyLogo />
      </MediaPickerProvider>
    </MediaProvider>
  );
}
