"use client";

import { Estimator, type EstimateResult, type EstimatorInput, type EstimatorValues } from "@vamos-ui/react";

const base: Record<string, number> = { studio: 4200, two: 6800, three: 9600, house: 14500 };
const crew: Record<string, number> = { studio: 2, two: 3, three: 4, house: 5 };

const inputs: EstimatorInput[] = [
  {
    type: "options",
    id: "size",
    label: "Home size",
    variant: "segmented",
    options: [
      { value: "studio", label: "Studio" },
      { value: "two", label: "2 rooms" },
      { value: "three", label: "3 rooms" },
      { value: "house", label: "House" },
    ],
    defaultValue: "two",
  },
  { type: "slider", id: "km", label: "Distance by road", min: 1, max: 80, defaultValue: 12, format: (v) => `${v} km`, marks: [1, 20, 40, 60, 80] },
  { type: "toggle", id: "lift", label: "A lift we can use at both ends", description: "Without one, every floor above the second adds time.", defaultValue: true },
  {
    type: "addons",
    id: "extras",
    label: "Extras",
    options: [
      { value: "packing", label: "Packing service", description: "Boxes, wrap and a packing crew the day before.", meta: "+ $900" },
      { value: "clean", label: "Move-out clean", description: "The empty home, cleaned as the truck leaves.", meta: "+ $650" },
      { value: "storage", label: "Two weeks' storage", meta: "+ $400" },
    ],
  },
];

function quote(v: EstimatorValues): EstimateResult {
  const size = v.size as string;
  const km = v.km as number;
  const extras = v.extras as string[];
  const lines = [
    { id: "base", label: "Crew and truck", amount: base[size]!, detail: `${crew[size]} people, about ${Math.round(base[size]! / 1200)} hours` },
    { id: "distance", label: "Distance", amount: km * 18, detail: `${km} km × $18` },
    ...(v.lift ? [] : [{ id: "stairs", label: "No lift", amount: 600 }]),
    ...(extras.includes("packing") ? [{ id: "packing", label: "Packing service", amount: 900 }] : []),
    ...(extras.includes("clean") ? [{ id: "clean", label: "Move-out clean", amount: 650 }] : []),
    ...(extras.includes("storage") ? [{ id: "storage", label: "Storage, two weeks", amount: 400 }] : []),
  ];
  const total = lines.reduce((s, l) => s + l.amount, 0);
  return {
    total,
    range: [Math.round((total * 0.92) / 50) * 50, Math.round((total * 1.12) / 50) * 50],
    lines,
    facts: [
      { label: "Crew", value: `${crew[size]} people` },
      { label: "Vehicle", value: size === "house" ? "Large truck" : "Box van" },
    ],
    notes: ["Most moves like this land in this range. A short video survey turns it into a fixed price."],
  };
}

export default function EstimatorDemo() {
  return (
    <div className="w-full max-w-4xl">
      <Estimator inputs={inputs} formula={quote} title="Your moving estimate" totalLabel="Estimated price" cta="Get a fixed price" ctaHref="#contact" />
    </div>
  );
}
