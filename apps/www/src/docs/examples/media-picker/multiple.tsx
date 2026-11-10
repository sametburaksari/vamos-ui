"use client";

import * as React from "react";
import { Button, Image } from "@vamos-ui/react";
import { MediaPicker, type MediaAsset } from "@vamos-ui/react/media";
import { createDemoMedia } from "../media-library/sample-media";

// Property listing gallery: up to 6 photos. The confirm button pluralises ("Insert 3 images");
// once the limit is reached the other tiles are disabled with a hint.
export default function MediaPickerMultiple() {
  const [adapter] = React.useState(() => createDemoMedia());
  const [photos, setPhotos] = React.useState<MediaAsset[]>([]);
  return (
    <div className="grid w-full max-w-lg gap-3">
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p) => (
          <Image key={p.id} src={p} aspect="4/3" rounded="ui" sizes="160px" />
        ))}
      </div>
      <MediaPicker adapter={adapter} accept="image/*" multiple max={6} value={photos.map((p) => p.id)} onSelect={setPhotos}>
        <Button className="justify-self-start">{photos.length ? `Edit gallery (${photos.length})` : "Add listing photos"}</Button>
      </MediaPicker>
    </div>
  );
}
