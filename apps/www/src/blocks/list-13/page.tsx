"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { TasksView } from "./components/tasks-view";

/** Project tasks with list, board and calendar views inside the multi-app shell. */
export default function List13() {
  return (
    <Shell01 initialPath="/work/tasks">
      <TasksView />
      <Toaster />
    </Shell01>
  );
}
