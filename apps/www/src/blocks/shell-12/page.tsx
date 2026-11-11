"use client";

import { Toaster } from "@vamos-ui/react";
import { PageBuilder } from "./components/builder";

/** Page builder shell for a CMS: layers, live canvas with device widths, inspector, undo and autosave. */
export default function Shell12() {
  return (
    <>
      <PageBuilder />
      <Toaster />
    </>
  );
}
