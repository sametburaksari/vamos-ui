import Link from "next/link";
import { ChevronRight, FileText, Globe, Users } from "lucide-react";
import { Card, Item, ItemContent, ItemDescription, ItemLeading, ItemList, ItemMeta, ItemTitle } from "@vamos-ui/react";

const results = [
  { icon: FileText, title: "Local SEO checklist for 2026", where: "Posts · Draft", href: "#link-rows" },
  { icon: Users, title: "Moda Wellness", where: "Clients · 3 open deals", href: "#link-rows" },
  { icon: Globe, title: "/blog/local-seo-2026", where: "Redirects · 301 to /guides/local-seo", href: "#link-rows" },
];

export default function ItemLinkRows() {
  return (
    <Card className="w-full max-w-md">
      <ItemList aria-label="Search results for “local seo”">
        {results.map((r) => (
          <Item key={r.title} asChild size="sm">
            <Link href={r.href}>
              <ItemLeading variant="icon">
                <r.icon aria-hidden />
              </ItemLeading>
              <ItemContent>
                <ItemTitle>{r.title}</ItemTitle>
                <ItemDescription>{r.where}</ItemDescription>
              </ItemContent>
              <ItemMeta>
                <ChevronRight aria-hidden className="size-4 rtl:-scale-x-100" />
              </ItemMeta>
            </Link>
          </Item>
        ))}
      </ItemList>
    </Card>
  );
}
