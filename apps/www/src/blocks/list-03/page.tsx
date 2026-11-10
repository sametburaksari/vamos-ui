"use client";

import Shell01 from "../shell-01/page";
import { EmployeeDirectory } from "./components/employee-directory";

/** HR employee directory inside the multi-app shell. */
export default function List03() {
  return (
    <Shell01 initialPath="/people/employees">
      <EmployeeDirectory />
    </Shell01>
  );
}
