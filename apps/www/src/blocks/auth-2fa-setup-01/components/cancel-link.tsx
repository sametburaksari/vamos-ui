"use client";

import { X } from "lucide-react";
import { useBlockFormat } from "../../_shared/format";

/** "Cancel setup" in the top bar — goes back to security settings without enabling anything. */
export function CancelLink() {
  const { c } = useBlockFormat();
  return (
    <a href="#" className="inline-flex items-center gap-1.5 rounded-ui-sm hover:text-fg focus-ring">
      <X aria-hidden className="size-3.5" /> {c("Cancel setup", "Kurulumu iptal et")}
    </a>
  );
}
