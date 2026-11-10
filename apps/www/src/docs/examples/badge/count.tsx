import { Badge } from "@vamos-ui/react";

export default function BadgeCount() {
  return (
    <div className="flex flex-wrap items-center gap-5 text-[13px]">
      <span className="inline-flex items-center gap-2">
        Comments <Badge count={7} />
      </span>
      <span className="inline-flex items-center gap-2">
        Unassigned leads <Badge count={128} tone="accent" />
      </span>
      <span className="inline-flex items-center gap-2">
        Failed payments <Badge count={3} tone="danger" size="md" />
      </span>
    </div>
  );
}
