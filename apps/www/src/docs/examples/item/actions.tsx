import { Mail, Phone } from "lucide-react";
import { Avatar, Card, CardHeader, IconButton, Item, ItemActions, ItemContent, ItemDescription, ItemLeading, ItemList, ItemTitle } from "@vamos-ui/react";

const contacts = [
  { name: "Ayşe Kaya", role: "Head of Sales", company: "Northwind Traders" },
  { name: "Burak Şen", role: "Owner", company: "Kadıköy Bistro" },
  { name: "İlker Şahin", role: "Marketing lead", company: "Moda Wellness" },
];

export default function ItemActionsExample() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader title="Contacts" description="Actions appear on hover, on focus and always on touch screens." />
      <ItemList>
        {contacts.map((c) => (
          <Item key={c.name}>
            <ItemLeading>
              <Avatar name={c.name} size="sm" />
            </ItemLeading>
            <ItemContent>
              <ItemTitle>{c.name}</ItemTitle>
              <ItemDescription>{c.role} · {c.company}</ItemDescription>
            </ItemContent>
            <ItemActions reveal="hover">
              <IconButton size="xs" label={`Email ${c.name}`}><Mail /></IconButton>
              <IconButton size="xs" label={`Call ${c.name}`}><Phone /></IconButton>
            </ItemActions>
          </Item>
        ))}
      </ItemList>
    </Card>
  );
}
