import { Skeleton, SkeletonGroup, SkeletonText } from "@vamos-ui/react";

export default function SkeletonTextExample() {
  return (
    <SkeletonGroup className="grid w-full max-w-md gap-4">
      <Skeleton shape="text" className="w-2/3 text-2xl" />
      <SkeletonText lines={4} />
      <SkeletonText lines={2} lastLineWidth="35%" shimmer={false} />
    </SkeletonGroup>
  );
}
