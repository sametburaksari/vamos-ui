"use client";

import { Toaster } from "@vamos-ui/react";
import { FieldApp } from "./components/field-app";

/** Field service app, phone first: bottom tab bar, job sheets and a "More" sheet for the rest. */
export default function Shell09() {
  return (
    <>
      <FieldApp />
      <Toaster position="top-center" />
    </>
  );
}
