"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { Button, EmptyState, RadioGroup } from "@vamos-ui/react";
import { DataTable, type DataTableColumn } from "@vamos-ui/react/data-table";
import { departmentOptions, makeEmployees, type Employee } from "./_data";

const employees = makeEmployees(6);
const columns: DataTableColumn<Employee>[] = [
  { id: "name", header: "Name", accessor: "name" },
  { id: "department", header: "Department", accessor: "department", type: "enum", options: departmentOptions },
  { id: "manager", header: "Manager", accessor: "manager", type: "user" },
  { id: "salary", header: "Salary", accessor: "salary", type: "currency" },
  { id: "startDate", header: "Start date", accessor: "startDate", type: "date" },
];

type Demo = "loading" | "refreshing" | "empty" | "no-results" | "error";

export default function DataTableStates() {
  const [demo, setDemo] = React.useState<Demo>("loading");
  return (
    <div className="grid w-full gap-3">
      <RadioGroup
        variant="segmented"
        size="sm"
        aria-label="State"
        value={demo}
        onValueChange={(v) => setDemo(v as Demo)}
        items={[
          { value: "loading", label: "First load" },
          { value: "refreshing", label: "Refreshing" },
          { value: "empty", label: "Empty" },
          { value: "no-results", label: "No results" },
          { value: "error", label: "Error" },
        ]}
      />
      <DataTable
        key={demo}
        caption="Team"
        columns={columns}
        data={demo === "empty" || demo === "loading" ? [] : employees}
        getRowId={(e) => e.id}
        loading={demo === "loading" || demo === "refreshing"}
        defaultState={demo === "no-results" ? { q: "zebra" } : undefined}
        error={demo === "error" ? { message: "The HR service timed out after 10 seconds. Showing the last loaded rows.", onRetry: () => setDemo("refreshing") } : null}
        empty={<EmptyState kind="first-use" size="sm" icon={<UserPlus />} title="Add your first teammate" description="Invite people by email or import a CSV from your payroll tool." actions={<Button size="sm" variant="primary">Invite people</Button>} />}
        pagination="none"
        className="w-full"
      />
    </div>
  );
}
