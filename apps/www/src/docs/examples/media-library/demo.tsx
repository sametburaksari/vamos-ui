"use client";

import * as React from "react";
import { MediaLibrary, MediaProvider } from "@vamos-ui/react/media";
import { createDemoMedia } from "./sample-media";

// The full library on the in-memory adapter: search, filters, grid/list, drop to upload,
// details with alt text and focal point. Select a tile and press Enter to open its details.
export default function MediaLibraryDemo() {
  const [adapter] = React.useState(() => createDemoMedia());
  return (
    <MediaProvider adapter={adapter}>
      <MediaLibrary selection="multiple" detailsPanel="side" className="w-full" />
    </MediaProvider>
  );
}
