import { Button, PageHeader } from "@vamos-cms/ui";

/** While the record loads, the h1 keeps its place with a skeleton line (aria-busy). */
export default function PageHeaderLoading() {
  return <PageHeader className="w-full" back={{ href: "/crm/companies", label: "Companies" }} title="" loading description="Loading company…" actions={<Button disabled>Edit</Button>} />;
}
