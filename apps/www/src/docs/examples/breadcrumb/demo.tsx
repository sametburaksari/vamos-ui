import { Breadcrumb } from "@vamos-ui/react";

export default function BreadcrumbDemo() {
  return (
    <Breadcrumb
      items={[
        { label: "Pages", href: "/cms/pages" },
        { label: "About", href: "/cms/pages/about" },
        { label: "Team" },
      ]}
    />
  );
}
