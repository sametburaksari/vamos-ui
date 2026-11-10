import { Badge } from "@vamos-ui/react";

export default function BadgeTones() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Draft</Badge>
      <Badge tone="accent">Featured</Badge>
      <Badge tone="success">Published</Badge>
      <Badge tone="info">Scheduled</Badge>
      <Badge tone="warning">In review</Badge>
      <Badge tone="danger">Rejected</Badge>
      <Badge tone="outline">Pinned</Badge>
    </div>
  );
}
