"use client";

import * as React from "react";
import { Field, Slider, useFormat } from "@vamos-ui/react";

const listings = [
  { name: "Moda loft with sea view", price: 145 },
  { name: "Cihangir studio", price: 98 },
  { name: "Bebek garden house", price: 420 },
  { name: "Karaköy design flat", price: 210 },
  { name: "Nişantaşı penthouse", price: 560 },
  { name: "Balat townhouse", price: 132 },
];

export default function SliderCommit() {
  const f = useFormat();
  const [preview, setPreview] = React.useState([100, 300]);
  const [range, setRange] = React.useState([100, 300]);
  const [requests, setRequests] = React.useState(0);
  const results = listings.filter((l) => l.price >= range[0]! && l.price <= range[1]!);

  return (
    <div className="grid w-full max-w-md gap-4">
      <Field label="Price per night">
        <Slider
          value={preview}
          onValueChange={setPreview}
          onValueCommit={(v) => {
            // Filter (and hit the server) only when the thumb is released.
            setRange(v);
            setRequests((n) => n + 1);
          }}
          min={50}
          max={600}
          step={10}
          formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        />
      </Field>
      <div className="flex items-baseline justify-between text-xs text-fg-subtle">
        <span>
          {results.length} of {listings.length} stays · {f.currency(range[0]!, { maximumFractionDigits: 0 })}–{f.currency(range[1]!, { maximumFractionDigits: 0 })}
        </span>
        <span className="tabular">{requests} requests</span>
      </div>
      <ul className="grid gap-1.5">
        {results.map((l) => (
          <li key={l.name} className="flex justify-between rounded-ui-sm bg-surface-2 px-3 py-2 text-sm">
            <span>{l.name}</span>
            <span className="tabular text-fg-muted">{f.currency(l.price, { maximumFractionDigits: 0 })}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
