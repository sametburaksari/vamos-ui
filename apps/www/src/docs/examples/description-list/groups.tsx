import { Button, Card, CardBody, DescriptionGroup, DescriptionList } from "@vamos-cms/ui";

export default function DescriptionListGroups() {
  return (
    <Card className="w-full max-w-xl">
      <CardBody className="grid gap-6 pt-(--card-p)">
        <DescriptionGroup title="Post" action={<Button variant="link" size="sm">Edit</Button>}>
          <DescriptionList
            size="sm"
            items={[
              { key: "status", label: "Status", value: "Scheduled" },
              { key: "publish", label: "Publish on", value: "2026-11-11T06:00:00Z", format: "datetime" },
              { key: "author", label: "Author", value: "Meltem Aydın" },
            ]}
          />
        </DescriptionGroup>
        <DescriptionGroup title="SEO" description="How the post appears in search results.">
          <DescriptionList
            size="sm"
            items={[
              { key: "slug", label: "Slug", value: "google-business-profile-guide", copyable: true },
              { key: "title", label: "Meta title", value: "How to stand out on Google Business Profile" },
              { key: "words", label: "Word count", value: 1840, format: "number" },
              { key: "canonical", label: "Canonical URL", value: "" },
            ]}
          />
        </DescriptionGroup>
      </CardBody>
    </Card>
  );
}
