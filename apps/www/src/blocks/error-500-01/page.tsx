"use client";

import { ServerError } from "./components/server-error";

/** Full-page 500 — drop into `app/error.tsx` and pass Next.js's `reset`. */
export default function Error50001() {
  return <ServerError />;
}
