"use client";

import * as React from "react";
import { MediaLibrary } from "@vamos-cms/ui/media";
import { createDemoMedia } from "./sample-media";

// Read-only (a viewer role, or an adapter with capabilities.edit = false): no upload, no delete,
// details are view-only. Copy URL and Download still work.
export default function MediaLibraryReadonly() {
  const [adapter] = React.useState(() => createDemoMedia({ capabilities: { edit: false } }));
  return <MediaLibrary adapter={adapter} readOnly selection="none" tileSize="lg" height="24rem" className="w-full" />;
}
