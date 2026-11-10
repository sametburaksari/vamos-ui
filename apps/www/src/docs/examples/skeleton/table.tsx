import { Card, SkeletonGroup, SkeletonRow } from "@vamos-cms/ui";

export default function SkeletonTable() {
  // Row height and padding come from --row-h / --cell-px, so they follow data-density.
  return (
    <Card className="w-full max-w-2xl overflow-hidden">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-line px-(--cell-px) py-2.5 text-xs font-medium text-fg-subtle">
        <span>Contact</span>
        <span>Company</span>
        <span>Stage</span>
        <span>Value</span>
      </div>
      <SkeletonGroup label="Loading contacts">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonRow key={i} columns={4} avatar />
        ))}
      </SkeletonGroup>
    </Card>
  );
}
