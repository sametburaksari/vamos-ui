import { Card, Skeleton, SkeletonGroup } from "@vamos-ui/react";

export default function SkeletonDemo() {
  return (
    <SkeletonGroup label="Loading revenue">
      <Card className="w-full max-w-xs p-5">
        <Skeleton shape="text" className="w-32 text-[13px]" />
        <Skeleton className="mt-3 h-8 w-40" />
        <Skeleton className="mt-5 h-1.5 w-full rounded-full" />
        <div className="mt-2.5 flex justify-between">
          <Skeleton shape="text" className="w-20 text-xs" />
          <Skeleton shape="text" className="w-8 text-xs" />
        </div>
      </Card>
    </SkeletonGroup>
  );
}
