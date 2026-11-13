"use client";

import * as React from "react";
import { Analytics, LEAD_EVENT } from "@vamos-ui/react/blocks";

// app/layout.tsx — the ids are the site owner's own (vamos.site.json → analytics).
//   <head><ConsentDefaults version={2} /></head>
//   <body>
//     {children}
//     <ConsentBanner version={2} policyLink={{ href: "/cerez-politikasi" }} />
//     <Analytics {...site.analytics} version={2} conversions={{ lead: "AW-123456789/AbCdEf", call: "AW-123456789/XyZ123" }} />
//   </body>
//
// This preview has no ids, so nothing loads: it only shows what reaches dataLayer.
export default function ConsentBannerAnalytics() {
  const [log, setLog] = React.useState<string[]>([]);
  React.useEffect(() => {
    const w = window as Window & { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    const layer = w.dataLayer;
    const push = layer.push.bind(layer);
    layer.push = (...items: unknown[]) => {
      for (const item of items) {
        if (item && typeof item === "object" && "event" in item && String((item as { event: unknown }).event).startsWith("vb_")) {
          setLog((l) => [JSON.stringify(item), ...l].slice(0, 6));
        }
      }
      return push(...items);
    };
    return () => {
      layer.push = push;
    };
  }, []);
  return (
    <div className="flex w-full flex-col gap-4">
      <Analytics />
      <div className="flex flex-wrap gap-3 text-small">
        <a href="tel:+902160000000" onClick={(e) => e.preventDefault()} className="focus-ring rounded-ui border border-line px-3 py-2 text-fg hover:bg-surface-2">
          Call (tel: link)
        </a>
        <a href="https://wa.me/902160000000" onClick={(e) => e.preventDefault()} className="focus-ring rounded-ui border border-line px-3 py-2 text-fg hover:bg-surface-2">
          WhatsApp
        </a>
        <button type="button" data-track="directions:google" className="focus-ring rounded-ui border border-line px-3 py-2 text-fg hover:bg-surface-2">
          Directions
        </button>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent(LEAD_EVENT, { detail: { form: "contact" } }))} className="focus-ring rounded-ui border border-line px-3 py-2 text-fg hover:bg-surface-2">
          Simulate a form lead
        </button>
      </div>
      <pre tabIndex={0} role="log" aria-label="Events sent to dataLayer" className="focus-ring min-h-24 overflow-auto rounded-ui border border-line bg-surface-2 p-4 font-mono text-xs text-fg-muted whitespace-pre-wrap">
        {log.length ? log.join("\n") : "Click something above."}
      </pre>
    </div>
  );
}
