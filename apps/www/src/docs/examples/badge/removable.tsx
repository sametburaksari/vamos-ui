"use client";

import * as React from "react";
import { Badge } from "@vamos-cms/ui";

export default function BadgeRemovable() {
  const [tags, setTags] = React.useState(["Brunch", "Vegan", "Kadıköy", "Weekend"]);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <Badge key={tag} size="lg" onRemove={() => setTags((t) => t.filter((x) => x !== tag))}>
          {tag}
        </Badge>
      ))}
      {tags.length === 0 ? <span className="text-[13px] text-fg-subtle">No tags</span> : null}
    </div>
  );
}
