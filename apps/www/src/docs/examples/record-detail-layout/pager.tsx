"use client";

import * as React from "react";
import { Avatar, Badge, RecordHeader, RecordLayout, RecordPager } from "@vamos-cms/ui";

const employees = [
  { name: "Selin Öztürk", role: "Product designer · Design", since: "Mar 2023", manager: "Burak Şahin" },
  { name: "Marcus Lindqvist", role: "Backend engineer · Platform", since: "Jan 2022", manager: "Ece Yılmaz" },
  { name: "Aylin Çelik", role: "People partner · People", since: "Sep 2024", manager: "Deniz Koç" },
  { name: "Tomás Ribeiro", role: "Account executive · Sales", since: "Jun 2021", manager: "Can Demir" },
];

// HR profile: step through the filtered employee list with the buttons, or press j / k.
export default function RecordLayoutPager() {
  const [i, setI] = React.useState(0);
  const e = employees[i]!;
  return (
    <div className="w-full rounded-ui-lg border border-line bg-scene p-6">
      <RecordLayout>
        <RecordHeader
          back={{ href: "/hr/people", label: "People" }}
          media={<Avatar name={e.name} size="xl" />}
          title={e.name}
          subtitle={e.role}
          status={<Badge tone="success">Active</Badge>}
          facts={[
            { label: "Employee since", value: e.since },
            { label: "Manager", value: e.manager },
            { label: "Location", value: "Istanbul office" },
          ]}
          pager={<RecordPager index={i + 1} total={employees.length} onPrevious={() => setI((n) => Math.max(0, n - 1))} onNext={() => setI((n) => Math.min(employees.length - 1, n + 1))} />}
        />
      </RecordLayout>
    </div>
  );
}
