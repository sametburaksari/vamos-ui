"use client";

import Shell01 from "../shell-01/page";
import { NoAccess } from "./components/no-access";

/** A page the signed-in user's role can't open, inside the multi-app shell. */
export default function NoAccess01() {
  return (
    <Shell01 initialPath="/work/invoices">
      <NoAccess />
    </Shell01>
  );
}
