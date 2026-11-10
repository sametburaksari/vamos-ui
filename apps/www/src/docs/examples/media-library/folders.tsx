"use client";

import * as React from "react";
import { MediaLibrary } from "@vamos-ui/react/media";
import { createDemoMedia } from "./sample-media";

// CMS /media screen: a folder sidebar (with "New folder"), browse mode — a click opens details.
export default function MediaLibraryFolders() {
  const [adapter] = React.useState(() => createDemoMedia());
  return <MediaLibrary adapter={adapter} folders="sidebar" selection="none" tileSize="sm" className="w-full" />;
}
