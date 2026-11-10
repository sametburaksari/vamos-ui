"use client";

import * as React from "react";
import { Badge, Tabs, TabsContent, TabsList, TabsTrigger } from "@vamos-ui/react";
import {
  BlockEditor,
  BlockEditorBubbleMenu,
  BlockEditorContent,
  BlockEditorDragHandle,
  BlockEditorOutline,
  BlockEditorSlashMenu,
  BlockInserter,
  BlockInspector,
} from "@vamos-ui/react/editor";
import type { VamosDoc } from "@vamos-ui/react/blocks/schema";
import { landingDraft, siteBlocks } from "./_blocks";

const pages = [
  { title: "Pricing", href: "/pricing", type: "page" },
  { title: "Waitlist autofill", href: "/features/waitlist", type: "feature" },
  { title: "Reminder templates", href: "/features/reminders", type: "feature" },
  { title: "How Moda Dental cut no-shows by 40%", href: "/blog/moda-dental", type: "post" },
];

export default function BlockEditorDemo() {
  const [doc, setDoc] = React.useState<VamosDoc>(landingDraft);
  const [words, setWords] = React.useState<number | null>(null);
  const [tab, setTab] = React.useState("block");

  return (
    <BlockEditor
      value={doc}
      onChange={(next, info) => {
        setDoc(next);
        setWords(info.wordCount);
      }}
      registry={siteBlocks}
      variant="document"
      aria-label="Landing page body"
      linkSearch={async (q) => pages.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))}
    >
      <div className="grid w-full overflow-hidden rounded-ui-lg border border-line lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 border-line bg-scene max-lg:border-b lg:border-e">
          <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-2.5">
            <p className="truncate text-sm font-medium text-fg">Harbor for clinics — landing page</p>
            <Badge tone="neutral">{words === null ? "Draft" : `Draft · ${words} words`}</Badge>
          </div>
          <BlockEditorContent className="max-h-[38rem] overflow-y-auto" />
          <BlockInserter />
        </div>
        <aside aria-label="Page settings" className="min-w-0 bg-surface-2 p-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="block">Block</TabsTrigger>
              <TabsTrigger value="outline">Outline</TabsTrigger>
            </TabsList>
            <TabsContent value="block" className="pt-4">
              <BlockInspector onShowDocument={() => setTab("outline")} documentLabel="Show outline" />
            </TabsContent>
            <TabsContent value="outline" className="pt-4">
              <BlockEditorOutline />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
      <BlockEditorBubbleMenu />
      <BlockEditorSlashMenu />
      <BlockEditorDragHandle />
    </BlockEditor>
  );
}
