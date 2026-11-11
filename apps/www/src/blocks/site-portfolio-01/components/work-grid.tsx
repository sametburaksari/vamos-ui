"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vamos-ui/react";
import { Gallery, type GalleryLabels, type LightboxLabels } from "@vamos-ui/react/media";

export interface WorkFrame {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  discipline: string;
}

export interface WorkGridProps {
  frames: WorkFrame[];
  /** Filter tabs; the first is "All". */
  filters: { id: string; label: string }[];
  /** Accessible name of the filter. */
  filterLabel: string;
  galleryLabels?: Partial<GalleryLabels>;
  lightboxLabels?: Partial<LightboxLabels>;
}

/** Selected work: a discipline filter (Tabs) over a masonry wall that opens in the Lightbox. */
export function WorkGrid({ frames, filters, filterLabel, galleryLabels, lightboxLabels }: WorkGridProps) {
  const [value, setValue] = React.useState(filters[0]?.id ?? "all");
  const count = (id: string) => (id === "all" ? frames.length : frames.filter((f) => f.discipline === id).length);

  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabsList variant="pill" aria-label={filterLabel} className="mb-6">
        {filters.map((f) => (
          <TabsTrigger key={f.id} value={f.id} count={count(f.id)}>
            {f.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {filters.map((f) => (
        <TabsContent key={f.id} value={f.id} className="focus-visible:outline-offset-4">
          <Gallery
            items={f.id === "all" ? frames : frames.filter((x) => x.discipline === f.id)}
            layout="masonry"
            columns={{ base: 2, md: 3, lg: 4 }}
            captions="below"
            gap="md"
            rounded="none"
            lightbox={{ backdrop: "solid", chrome: "minimal", thumbnails: true, labels: lightboxLabels }}
            label={f.label}
            labels={galleryLabels}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
