"use client";

import { Button, CapacityFinder } from "@vamos-ui/react";
import { arrangements, rooms } from "./data";

export default function CapacityFinderDemo() {
  return (
    <div className="w-full max-w-2xl">
      <CapacityFinder
        options={rooms}
        arrangements={arrangements}
        defaultCount={40}
        max={300}
        step={5}
        noneFitMessage="Larger group? Ask us about combining the Atrium and the North Room."
        renderAction={({ option, status }) => (
          <Button size="sm" variant={status === "fits" ? "primary" : "secondary"}>
            Request {option.name}
          </Button>
        )}
      />
    </div>
  );
}
