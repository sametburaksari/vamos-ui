"use client";

import { TopicRow } from "@vamos-ui/react";
import { NOW } from "./data";

export default function TopicListRows() {
  return (
    <ul className="m-0 w-full max-w-md list-none divide-y divide-line rounded-ui-lg border border-line p-0 @container">
      <li>
        <TopicRow title="Calibrating a new label printer" href="#t/printer" tags={["setup"]} tagHref={(t) => `#tag/${t}`} replies={3} solved lastPost={{ name: "Ana Ruiz", at: NOW - 40 * 60_000 }} now={NOW} />
      </li>
      <li>
        <TopicRow title="Keyboard shortcuts you can't live without" href="#t/shortcuts" replies={58} unread lastPost={{ name: "Theo Laine", at: NOW - 5 * 60_000 }} now={NOW} />
      </li>
    </ul>
  );
}
