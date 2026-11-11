"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { ProjectsApp } from "./components/projects-app";

/** First run of the Projects app inside the multi-app shell. */
export default function Empty03() {
  return (
    <Shell01 initialPath="/work/projects">
      <ProjectsApp />
      <Toaster />
    </Shell01>
  );
}
