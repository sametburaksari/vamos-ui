"use client";

import { PinMap, type MapPin } from "@vamos-ui/react";

const sites: MapPin[] = [
  { id: "gebze", lat: 40.8, lng: 29.43, label: "Gebze Central", tone: "accent" },
  { id: "kemalpasa", lat: 38.43, lng: 27.42, label: "Kemalpaşa Hub" },
  { id: "sincan", lat: 39.97, lng: 32.58, label: "Sincan Depot" },
  { id: "mersin", lat: 36.8, lng: 34.63, label: "Mersin Port", tone: "warning" },
];

export default function PinMapLabels() {
  return (
    <div className="w-full max-w-xl">
      {/* Few pins: show labels, use dots, no callout. */}
      <PinMap aria-label="Warehouses" variant="dot" pins={sites} showLabels callout={false} />
    </div>
  );
}
