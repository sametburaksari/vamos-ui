"use client";

import { CapacityFinder } from "@vamos-ui/react";
import { arrangements, rooms } from "./data";

export default function CapacityFinderDetailed() {
  return (
    <div className="w-full max-w-2xl">
      <CapacityFinder options={rooms} arrangements={arrangements} defaultArrangement="boardroom" defaultCount={20} max={60} sortByFit showAllCapacities />
    </div>
  );
}
