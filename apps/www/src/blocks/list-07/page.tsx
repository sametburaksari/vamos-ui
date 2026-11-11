"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { MediaScreen } from "./components/media-screen";

/** The website media library inside the multi-app shell. */
export default function List07() {
  return (
    <Shell01 initialPath="/site/media">
      <MediaScreen />
      <Toaster />
    </Shell01>
  );
}
