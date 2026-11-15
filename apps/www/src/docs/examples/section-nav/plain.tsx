"use client";

import { SectionNav } from "@vamos-ui/react";

// Not sticky, no numbers: a compact contents list at the top of a long page.
export default function SectionNavPlain() {
  return (
    <SectionNav
      sticky={false}
      aria-label="Guide sections"
      items={[
        { id: "sn-plain-intro", label: "Introduction" },
        { id: "sn-plain-install", label: "Installation" },
        { id: "sn-plain-faq", label: "Questions" },
      ]}
      className="w-full max-w-48"
    />
  );
}
