"use client";

import * as React from "react";
import { FileText, Search } from "lucide-react";
import { Button, EmptyState, Input, ListContent, ListLayout, ListToolbar, ToggleGroup, ToggleGroupItem, type ListContentState } from "@vamos-cms/ui";

const posts = [
  { title: "How we cut onboarding time in half", author: "Defne Arslan", date: "Nov 8, 2026" },
  { title: "Spring menu: five dishes we're proud of", author: "Mert Kılıç", date: "Nov 6, 2026" },
  { title: "A field guide to QR menus", author: "Defne Arslan", date: "Nov 2, 2026" },
];

// CMS posts: every ListContentState with its default (or custom) placeholder.
export default function ListLayoutStates() {
  const [state, setState] = React.useState<ListContentState>("loading");
  return (
    <div className="grid w-full gap-4">
      <ToggleGroup aria-label="List state" value={state} onValueChange={(v) => setState(v as ListContentState)} size="sm" className="flex-wrap">
        {(["ready", "loading", "refreshing", "empty", "no-results", "error"] as const).map((s) => (
          <ToggleGroupItem key={s} value={s}>
            {s}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ListLayout stickyToolbar={false} className="rounded-ui-lg border border-line px-5">
        <ListToolbar search={<Input leading={<Search />} placeholder="Search posts" aria-label="Search posts" />} />
        <ListContent
          state={state}
          resultCount={posts.length}
          onRetry={() => setState("ready")}
          onClearFilters={() => setState("ready")}
          empty={
            <EmptyState
              icon={<FileText />}
              title="No posts yet"
              description="Write your first post, or import everything from WordPress in one go."
              actions={<Button variant="primary">Write a post</Button>}
            />
          }
        >
          <ul className="divide-y divide-line">
            {posts.map((p) => (
              <li key={p.title} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                <span className="font-medium">{p.title}</span>
                <span className="shrink-0 text-[13px] text-fg-subtle">
                  {p.author} · {p.date}
                </span>
              </li>
            ))}
          </ul>
        </ListContent>
      </ListLayout>
    </div>
  );
}
