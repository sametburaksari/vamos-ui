"use client";

import { Progress } from "@vamos-ui/react";

export default function ProgressSizesTones() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <Progress label="xs · 2px" size="xs" value={64} showValue />
      <Progress label="sm · 4px (default)" size="sm" value={64} showValue />
      <Progress label="md · 8px" size="md" value={64} showValue />
      <Progress label="Complete (accent turns success)" value={100} showValue />
      <Progress label="Failed upload" tone="danger" value={73} showValue={() => "Failed"} />
    </div>
  );
}
