"use client";

import { FixtureList } from "@vamos-ui/react";
import { competitions, fixtures } from "./data";

export default function FixtureListResults() {
  return (
    <div className="w-full max-w-3xl">
      <FixtureList side="Northgate" fixtures={fixtures} competitions={competitions} defaultView="results" caption="Northgate results" />
    </div>
  );
}
