"use client";

import * as React from "react";
import { MediaLibrary } from "@vamos-cms/ui/media";
import { createDemoMedia } from "./sample-media";

// HR document archive: list view (a real <table>), documents only, details in a dialog.
export default function MediaLibraryListView() {
  const [adapter] = React.useState(() => createDemoMedia());
  return (
    <MediaLibrary
      adapter={adapter}
      defaultView="list"
      selection="none"
      detailsPanel="dialog"
      accept=".pdf,.docx,.zip,application/pdf,application/zip"
      height="22rem"
      labels={{ library: "Employee documents", search: "Search documents" }}
      className="w-full"
    />
  );
}
