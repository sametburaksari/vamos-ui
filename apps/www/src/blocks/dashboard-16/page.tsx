"use client";

import { Toaster } from "@vamos-ui/react";
import { DispatchConsole } from "./components/dispatch-console";

/** Full-screen dispatch console for field service: job queue, live map and crew. */
export default function Dashboard16() {
  return (
    <>
      <DispatchConsole />
      <Toaster />
    </>
  );
}
