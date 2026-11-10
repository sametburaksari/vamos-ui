"use client";

import * as React from "react";
import { Avatar, Card, CardHeader, Item, ItemContent, ItemDescription, ItemLeading, ItemList, ItemMeta, ItemTitle } from "@vamos-ui/react";

const team = [
  { id: "ece", name: "Ece Demir", role: "Product designer", load: "3 open tasks" },
  { id: "meltem", name: "Meltem Aydın", role: "Account manager", load: "7 open tasks" },
  { id: "can", name: "Can Özkan", role: "Frontend engineer", load: "On leave until Nov 14", away: true },
  { id: "samet", name: "Samet Sarı", role: "Founder", load: "2 open tasks" },
];

export default function ItemSelectable() {
  const [value, setValue] = React.useState<string[]>(["meltem"]);
  return (
    <Card className="w-full max-w-md">
      <CardHeader title="Assign reviewers" description={`${value.length} selected · ↑ ↓ to move, Space to toggle`} />
      <ItemList selectable="multiple" aria-label="Reviewers" value={value} onValueChange={setValue}>
        {team.map((p) => (
          <Item key={p.id} value={p.id} disabled={p.away}>
            <ItemLeading>
              <Avatar name={p.name} size="sm" />
            </ItemLeading>
            <ItemContent>
              <ItemTitle>{p.name}</ItemTitle>
              <ItemDescription>{p.role}</ItemDescription>
            </ItemContent>
            <ItemMeta>{p.load}</ItemMeta>
          </Item>
        ))}
      </ItemList>
    </Card>
  );
}
