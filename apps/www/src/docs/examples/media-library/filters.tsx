"use client";

import * as React from "react";
import { MediaLibrary, type MediaQuery } from "@vamos-cms/ui/media";
import { createDemoMedia } from "./sample-media";

// Controlled filters. URL sync is the app's job: write the query to search params on change
// (router.replace(`?${toSearchParams(q)}`)) and read it back on load.
export default function MediaLibraryFilters() {
  const [adapter] = React.useState(() => createDemoMedia());
  const [query, setQuery] = React.useState<MediaQuery>({ kind: "image", sort: "newest" });
  const search = new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])).toString();
  return (
    <div className="grid w-full gap-3">
      <code className="tabular block truncate rounded-ui bg-surface-2 px-3 py-2 font-mono text-[12px] text-fg-muted">/admin/media?{search}</code>
      <MediaLibrary adapter={adapter} query={query} onQueryChange={setQuery} detailsPanel={false} height="22rem" />
    </div>
  );
}
