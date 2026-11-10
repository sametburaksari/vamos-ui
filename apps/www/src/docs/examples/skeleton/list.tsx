import { Card, Skeleton, SkeletonAvatar, SkeletonGroup } from "@vamos-ui/react";

export default function SkeletonList() {
  return (
    <Card className="w-full max-w-sm">
      <SkeletonGroup label="Loading team members" className="grid gap-4 p-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonAvatar size="lg" />
            <div className="grid flex-1 gap-2">
              <Skeleton shape="text" className="w-1/2 text-sm" />
              <Skeleton shape="text" className="w-3/4 text-xs" />
            </div>
          </div>
        ))}
      </SkeletonGroup>
    </Card>
  );
}
