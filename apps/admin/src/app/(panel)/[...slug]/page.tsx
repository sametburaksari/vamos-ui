import { Construction } from "lucide-react";
import { Card } from "@vamos-cms/ui";
import { PageHeader } from "@vamos-cms/ui";

export default async function Placeholder({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return (
    <>
      <PageHeader breadcrumb="auto" title="Under construction" description={`/${slug.join("/")}`} />
      <Card className="grid place-items-center px-6 py-20 text-center">
        <Construction className="mb-3 size-6 text-fg-subtle" strokeWidth={1.6} />
        <p className="text-fg-muted">This screen is on the roadmap. The menu and shell already work.</p>
      </Card>
    </>
  );
}
