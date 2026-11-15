"use client";

import { ChoiceGrid } from "@vamos-ui/react";

const rooms = [
  { id: "studio", label: "Studio", description: "Up to 8 people" },
  { id: "hall", label: "Hall", description: "Up to 60 people" },
  { id: "terrace", label: "Terrace", description: "Outdoor, up to 40" },
];
const terms = [
  { id: "half", label: "Half day" },
  { id: "day", label: "Full day" },
  { id: "evening", label: "Evening" },
  { id: "weekend", label: "Weekend" },
];
const prices: Record<string, Record<string, number | null>> = {
  studio: { half: 180, day: 320, evening: 150, weekend: 560 },
  hall: { half: 900, day: 1600, evening: 1100, weekend: null },
  terrace: { half: null, day: 1200, evening: 950, weekend: 2100 },
};

export default function ChoiceGridUnavailable() {
  return (
    <form className="w-full max-w-3xl" onSubmit={(e) => e.preventDefault()}>
      <ChoiceGrid
        aria-label="Room and booking length"
        size="sm"
        rows={rooms}
        columns={terms}
        cell={(row, column) => (prices[row]![column] == null ? null : { price: prices[row]![column]! })}
        defaultValue={{ row: "hall", column: "day" }}
        name="booking"
        rowName="room"
        columnName="term"
      />
    </form>
  );
}
