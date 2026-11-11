"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { SecurityCenter } from "./components/security-center";

/** Account security: two-step methods, sessions, sign-in history and the IP allow list, inside the multi-app shell. */
export default function Settings07() {
  return (
    <Shell01 initialPath="/settings">
      <SecurityCenter />
      <Toaster />
    </Shell01>
  );
}
