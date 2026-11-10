import { MoreHorizontal } from "lucide-react";
import { Badge, Button, Card, CardHeader, IconButton, Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMeta, ItemTitle } from "@vamos-ui/react";

const posts = [
  { title: "A practical guide to QR menus for restaurants", author: "Samet", status: "Published", tone: "success", date: "Today, 09:00" },
  { title: "How to stand out on Google Business Profile", author: "Meltem", status: "Scheduled", tone: "info", date: "Nov 11, 09:00" },
  { title: "Local SEO checklist for 2026", author: "Samet", status: "Draft", tone: "neutral", date: "Edited yesterday" },
  { title: "NFC business cards vs. paper", author: "Ece", status: "In review", tone: "warning", date: "Nov 8" },
] as const;

export default function ItemDemo() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader title="Recent posts" action={<Button variant="link" size="sm">View all</Button>} divider />
      <ItemList>
        {posts.map((p) => (
          <Item key={p.title} interactive>
            <ItemContent>
              <ItemTitle>{p.title}</ItemTitle>
              <ItemDescription>{p.author} · {p.date}</ItemDescription>
            </ItemContent>
            <ItemMeta>
              <Badge tone={p.tone} dot>{p.status}</Badge>
            </ItemMeta>
            <ItemActions reveal="hover">
              <IconButton size="xs" label={`More actions for “${p.title}”`}>
                <MoreHorizontal />
              </IconButton>
            </ItemActions>
          </Item>
        ))}
      </ItemList>
    </Card>
  );
}
