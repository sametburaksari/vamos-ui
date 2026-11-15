"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem, TopicList } from "@vamos-ui/react";
import { NOW, topics } from "./data";

type Sort = "latest" | "top" | "unanswered";

export default function TopicListSorted() {
  const [sort, setSort] = React.useState<Sort>("latest");
  const shown = React.useMemo(() => {
    if (sort === "unanswered") return topics.filter((t) => t.replies === 0 && !t.locked);
    if (sort === "top") return [...topics].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    return topics;
  }, [sort]);
  return (
    <div className="flex w-full max-w-4xl flex-col gap-3">
      <ToggleGroup type="single" size="sm" aria-label="Sort topics" value={sort} onValueChange={(v) => v && setSort(v as Sort)}>
        <ToggleGroupItem value="latest">Latest</ToggleGroupItem>
        <ToggleGroupItem value="top">Most viewed</ToggleGroupItem>
        <ToggleGroupItem value="unanswered">Unanswered</ToggleGroupItem>
      </ToggleGroup>
      <TopicList aria-label="Topics" topics={shown} now={NOW} empty={<p className="m-0">Every topic here has an answer.</p>} />
    </div>
  );
}
