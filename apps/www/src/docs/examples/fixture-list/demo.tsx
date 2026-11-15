"use client";

import { FixtureList } from "@vamos-ui/react";
import { competitions, fixtures } from "./data";

export default function FixtureListDemo() {
  return (
    <div className="w-full max-w-3xl">
      <FixtureList side="Northgate" fixtures={fixtures} competitions={competitions} caption="Northgate 2026/27" />
    </div>
  );
}
