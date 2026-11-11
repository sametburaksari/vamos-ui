"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { ProjectOverview } from "./components/project-overview";

/** Client project overview inside the multi-app shell. */
export default function Detail10() {
  return (
    <Shell01 initialPath="/work/projects">
      <ProjectOverview />
      <Toaster />
    </Shell01>
  );
}
