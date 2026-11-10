"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vamos-ui/react";

const TABS = ["overview", "activity", "deals"] as const;

// URL sync stays in your app: read ?tab= and write it back on change.
// In Next.js use useSearchParams() + router.replace(`?tab=${v}`, { scroll: false }).
export default function TabsUrlSync() {
  const [tab, setTab] = React.useState<string>("overview");

  React.useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tab");
    if (fromUrl && (TABS as readonly string[]).includes(fromUrl)) setTab(fromUrl);
  }, []);

  const change = (value: string) => {
    setTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.replaceState(null, "", url);
  };

  return (
    <Tabs value={tab} onValueChange={change} className="w-full max-w-md">
      <TabsList aria-label="Deal">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="deals">Line items</TabsTrigger>
      </TabsList>
      <TabsContent value={tab} className="text-sm text-fg-muted">
        The address bar now ends in <code className="font-mono text-fg">?tab={tab}</code> — reload and the tab is kept.
      </TabsContent>
    </Tabs>
  );
}
