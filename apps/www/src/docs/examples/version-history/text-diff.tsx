"use client";

import * as React from "react";
import { DiffView, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";

const before = `Vamos builds websites and panels for restaurants, clinics and agencies.
Our team is based in Istanbul and works with clients across Europe.
Projects start at $4,500 and launch in six weeks.`;

const after = `Vamos builds fast, accessible websites and admin panels for restaurants, clinics and agencies.
Our team is based in Istanbul and works with clients across Europe and the Gulf.
Projects start at $4,500 and launch in four to six weeks.`;

export default function VersionHistoryTextDiff() {
  const [mode, setMode] = React.useState<"unified" | "split">("unified");
  const [granularity, setGranularity] = React.useState<"word" | "char" | "line">("word");
  return (
    <div className="grid w-full gap-3">
      <div className="flex flex-wrap gap-2">
        <ToggleGroup aria-label="Layout" size="xs" value={mode} onValueChange={(v) => v && setMode(v as typeof mode)}>
          <ToggleGroupItem value="unified">Unified</ToggleGroupItem>
          <ToggleGroupItem value="split">Split</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup aria-label="Highlight" size="xs" value={granularity} onValueChange={(v) => v && setGranularity(v as typeof granularity)}>
          <ToggleGroupItem value="word">Words</ToggleGroupItem>
          <ToggleGroupItem value="char">Characters</ToggleGroupItem>
          <ToggleGroupItem value="line">Lines only</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <DiffView before={before} after={after} mode={mode} granularity={granularity} beforeLabel="About page · Oct 2" afterLabel="About page · Draft" />
    </div>
  );
}
