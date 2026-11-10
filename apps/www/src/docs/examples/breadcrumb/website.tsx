import { Breadcrumb } from "@vamos-cms/ui";

// Product page on a shop: also outputs schema.org BreadcrumbList JSON-LD for search results.
export default function BreadcrumbWebsite() {
  return (
    <Breadcrumb
      size="sm"
      jsonLd
      baseUrl="https://shop.example.com"
      items={[
        { label: "Home", href: "/" },
        { label: "Kitchen", href: "/kitchen" },
        { label: "Coffee & tea", href: "/kitchen/coffee-tea" },
        { label: "Hand grinder, ceramic burr", href: "/kitchen/coffee-tea/hand-grinder" },
      ]}
    />
  );
}
