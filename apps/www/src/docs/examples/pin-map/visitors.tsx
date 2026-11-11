"use client";

import { PinMap, type MapPin } from "@vamos-ui/react";

const cities = [
  { city: "Istanbul", lat: 41.01, lng: 28.98, visitors: 86 },
  { city: "Ankara", lat: 39.93, lng: 32.86, visitors: 31 },
  { city: "Izmir", lat: 38.42, lng: 27.14, visitors: 24 },
  { city: "Berlin", lat: 52.52, lng: 13.4, visitors: 12 },
  { city: "London", lat: 51.51, lng: -0.13, visitors: 9 },
  { city: "Amsterdam", lat: 52.37, lng: 4.9, visitors: 6 },
  { city: "Dubai", lat: 25.2, lng: 55.27, visitors: 5 },
  { city: "Baku", lat: 40.41, lng: 49.87, visitors: 4 },
];

const pins: MapPin[] = cities.map((c) => ({
  id: c.city,
  lat: c.lat,
  lng: c.lng,
  label: `${c.city}, ${c.visitors} visitors right now`,
  description: `${c.visitors} active visitors`,
  value: c.visitors,
  pulse: c.visitors > 30,
}));

export default function PinMapVisitors() {
  return (
    <div className="relative w-full max-w-2xl">
      <PinMap aria-label="Live visitors by city" variant="bubble" pins={pins} bounds={{ north: 56, south: 22, west: -6, east: 58 }} aspectRatio={2}>
        <div className="absolute start-3 bottom-3 rounded-ui-sm bg-[color-mix(in_oklch,var(--surface-solid)_85%,transparent)] px-2.5 py-1.5">
          <p className="text-[11px] text-fg-muted">Right now</p>
          <p className="text-lg leading-tight font-semibold text-fg tabular">177</p>
        </div>
      </PinMap>
    </div>
  );
}
