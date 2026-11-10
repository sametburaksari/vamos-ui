"use client";

import * as React from "react";
import { Gallery, type MediaSource } from "@vamos-ui/react/media";

const url = (id: string) => `https://images.unsplash.com/${id}?w=600&q=72&auto=format&fit=crop`;

const initial: MediaSource[] = [
  { id: "e1", src: url("photo-1600596542815-ffad4c1539a9"), width: 600, height: 400, alt: "Villa front with pool", caption: "Front, at dusk" },
  { id: "e2", src: url("photo-1600585154340-be6161a56a0c"), width: 600, height: 400, alt: "Terrace with loungers", caption: "" },
  { id: "e3", src: url("photo-1493809842364-78817add7ffb"), width: 600, height: 400, alt: "Living room facing the garden", caption: "Living room" },
  { id: "e4", src: url("photo-1484154218962-a197022b5858"), width: 600, height: 400, alt: "Kitchen with island", caption: "" },
];

// Stands in for the Media picker in this demo.
const library: MediaSource[] = [
  { id: "e5", src: url("photo-1505691938895-1758d7feb511"), width: 600, height: 400, alt: "Main bedroom with linen bedding", caption: "" },
  { id: "e6", src: url("photo-1512917774080-9991f1c4c750"), width: 600, height: 400, alt: "Villa facade with palm trees", caption: "" },
];

// A product / listing image editor: drag by the handle (or Space + arrows), Move menu, remove, caption.
export default function GalleryEditable() {
  const [items, setItems] = React.useState(initial);
  return (
    <Gallery
      className="w-full"
      label="Listing photos"
      items={items}
      editable
      aspect="3/2"
      onReorder={(ids) => setItems((prev) => ids.map((id) => prev.find((p) => p.id === id)!))}
      onRemove={(id) => setItems((prev) => prev.filter((p) => p.id !== id))}
      onCaptionChange={(id, caption) => setItems((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)))}
      onAdd={() => {
        // In an app: const [asset] = await pick({ accept: "image/*" })
        const next = library.find((l) => !items.some((i) => i.id === l.id));
        if (next) setItems((prev) => [...prev, next]);
      }}
    />
  );
}
