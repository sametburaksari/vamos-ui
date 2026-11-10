"use client";

import * as React from "react";
import { MediaLibrary, createMemoryAdapter } from "@vamos-ui/react/media";

// A brand-new site: the empty state invites a drop or an upload.
export default function MediaLibraryEmpty() {
  const [adapter] = React.useState(() => createMemoryAdapter());
  return <MediaLibrary adapter={adapter} height="20rem" className="w-full" />;
}
