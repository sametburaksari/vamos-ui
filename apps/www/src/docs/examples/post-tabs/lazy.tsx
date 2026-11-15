"use client";

import { PostLayout, PostTabs } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

// Panels loaded on first open: `load` returns rendered cards (a fetch in a real site).
const load = async (id: string) => {
  await new Promise((r) => setTimeout(r, 900));
  const offset = id.length % stories.length;
  return <PostLayout layout="lead-list" posts={[...stories.slice(offset), ...stories.slice(0, offset)].slice(0, 5)} columns={2} level={3} common={{}} empty="No stories yet." />;
};

export default function PostTabsLazy() {
  return (
    <SiteFrame width={860}>
      <div className="p-8">
        <PostTabs
          title="Lifestyle"
          load={load}
          tabs={[
            { id: "all", label: "All", content: <PostLayout layout="lead-list" posts={stories.slice(0, 5)} columns={2} level={3} common={{}} empty="No stories yet." /> },
            { id: "travel", label: "Travel" },
            { id: "food", label: "Food" },
            { id: "health", label: "Health" },
          ]}
        />
      </div>
    </SiteFrame>
  );
}
