"use client";

import * as React from "react";
import { Button, ButtonGroup } from "@vamos-cms/ui";
import { Lightbox, type MediaSource } from "@vamos-cms/ui/media";

const url = (id: string) => `https://images.unsplash.com/${id}?w=1800&q=80&auto=format&fit=crop`;
const receipts: MediaSource[] = [
  { id: "r1", src: url("photo-1556761175-b413da4baf72"), width: 1800, height: 1200, alt: "Client workshop in the meeting room", caption: "Workshop — Atlas Lojistik, 6 Nov" },
  { id: "r2", src: url("photo-1522071820081-009f0129c71c"), width: 1800, height: 1200, alt: "Team working on laptops", caption: "Sprint planning, 7 Nov" },
  { id: "r3", src: url("photo-1531297484001-80022131f5a1"), width: 1800, height: 1200, alt: "Laptop on a desk with notes", caption: "Prototype review, 8 Nov" },
];

// Keep the index in your state (or your router: ?photo=2). Here two buttons open specific photos.
export default function LightboxControlled() {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  return (
    <div className="flex flex-col items-start gap-3">
      <ButtonGroup>
        {receipts.map((r, i) => (
          <Button
            key={r.id}
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
          >
            {r.caption?.split(",")[0]}
          </Button>
        ))}
      </ButtonGroup>
      <p className="tabular text-[13px] text-fg-muted">
        {open ? `Viewing ${index + 1} of ${receipts.length}` : `Closed · opens on “${receipts[index]!.caption}”`}
      </p>
      <Lightbox items={receipts} open={open} onOpenChange={setOpen} index={index} onIndexChange={setIndex} loop={false} />
    </div>
  );
}
