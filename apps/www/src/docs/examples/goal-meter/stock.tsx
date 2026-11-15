"use client";

import { GoalMeter } from "@vamos-ui/react";

const items = [
  { name: "Canvas jacket", left: 31, run: 40 },
  { name: "Wool overshirt", left: 6, run: 40 },
  { name: "Field trousers", left: 0, run: 30 },
];

export default function GoalMeterStock() {
  return (
    <ul className="m-0 grid w-full max-w-sm list-none gap-5 p-0">
      {items.map((it) => (
        <li key={it.name}>
          <GoalMeter variant="stock" size="compact" label={it.name} value={it.left} goal={it.run} />
        </li>
      ))}
    </ul>
  );
}
