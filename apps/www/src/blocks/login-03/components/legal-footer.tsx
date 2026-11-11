"use client";

import { useBlockFormat } from "../../_shared/format";

/** Small print under the form. */
export function LegalFooter() {
  const { c } = useBlockFormat();
  return (
    <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[12px] text-fg-subtle">
      <span>© 2026 Kiln & Linen Ltd.</span>
      <nav aria-label={c("Legal", "Yasal")} className="flex gap-5">
        <a href="#" className="rounded-ui-sm hover:text-fg focus-ring">{c("Privacy", "Gizlilik")}</a>
        <a href="#" className="rounded-ui-sm hover:text-fg focus-ring">{c("Terms", "Koşullar")}</a>
        <a href="#" className="rounded-ui-sm hover:text-fg focus-ring">{c("Help", "Yardım")}</a>
      </nav>
    </footer>
  );
}
