import { Badge, Button, PageHeader } from "@vamos-cms/ui";

export default function PageHeaderSizes() {
  return (
    <div className="grid w-full gap-8">
      <PageHeader
        size="lg"
        className="mb-0"
        eyebrow="Monday, November 10"
        title={
          <>
            Good morning, <em className="text-accent-ink">Ada</em>.
          </>
        }
        description="What happened on your site in the last 30 days."
      />
      <PageHeader size="md" className="mb-0" title="Contacts" description="2,418 people · 312 added this month" actions={<Button variant="primary">New contact</Button>} />
      <PageHeader size="sm" className="mb-0" title="Leave request #1042" meta={<Badge tone="warning" dot>Pending approval</Badge>} />
    </div>
  );
}
