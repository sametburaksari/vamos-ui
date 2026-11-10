"use client";

import Shell01 from "../shell-01/page";
import { NotFoundPanel } from "./components/not-found-panel";

/** A record that no longer exists, rendered inside the multi-app shell (`not-found.tsx`). */
export default function Error40401() {
  return (
    <Shell01 initialPath="/crm/pipeline">
      <NotFoundPanel />
    </Shell01>
  );
}
