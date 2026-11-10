import { FileText, Receipt } from "lucide-react";
import { Avatar, Card, Checkbox, Item, ItemContent, ItemDescription, ItemLeading, ItemList, ItemMeta, ItemTitle } from "@vamos-ui/react";

export default function ItemLeadingExample() {
  return (
    <Card className="w-full max-w-lg">
      <ItemList>
        <Item>
          <ItemLeading>
            <Avatar name="Ayşe Kaya" size="md" />
          </ItemLeading>
          <ItemContent>
            <ItemTitle>Ayşe Kaya</ItemTitle>
            <ItemDescription>Head of Sales · Northwind Traders</ItemDescription>
          </ItemContent>
          <ItemMeta>Avatar</ItemMeta>
        </Item>
        <Item>
          <ItemLeading variant="icon">
            <Receipt aria-hidden />
          </ItemLeading>
          <ItemContent>
            <ItemTitle>Invoice INV-2041 paid</ItemTitle>
            <ItemDescription>$10,720.00 · Kadıköy Bistro</ItemDescription>
          </ItemContent>
          <ItemMeta>Icon</ItemMeta>
        </Item>
        <Item size="lg">
          <ItemLeading variant="thumbnail">
            <svg viewBox="0 0 56 40" aria-hidden className="size-full text-fg-subtle">
              <rect width="56" height="40" fill="var(--surface-2)" />
              <path d="M0 32 18 18l12 10 8-6 18 14v12H0Z" fill="currentColor" opacity=".35" />
              <circle cx="40" cy="12" r="5" fill="currentColor" opacity=".45" />
            </svg>
          </ItemLeading>
          <ItemContent>
            <ItemTitle>terrace-dinner-hero.jpg</ItemTitle>
            <ItemDescription>2400 × 1600 · 412 KB</ItemDescription>
          </ItemContent>
          <ItemMeta>Thumbnail</ItemMeta>
        </Item>
        <Item>
          <ItemLeading>
            <Checkbox aria-label="Include the cookie policy" defaultChecked />
          </ItemLeading>
          <ItemContent>
            <ItemTitle>Cookie policy</ItemTitle>
            <ItemDescription>
              <FileText aria-hidden className="me-1 inline size-3 align-[-2px]" />
              Legal page · updated Oct 2
            </ItemDescription>
          </ItemContent>
          <ItemMeta>Checkbox</ItemMeta>
        </Item>
      </ItemList>
    </Card>
  );
}
