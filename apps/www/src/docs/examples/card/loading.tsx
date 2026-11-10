import { Card, CardBody, CardHeader } from "@vamos-cms/ui";

export default function CardLoading() {
  return (
    <Card loading className="w-full max-w-sm">
      <CardHeader title="Quick draft" description="Saved to your drafts" />
      <CardBody loading loadingLines={4} />
    </Card>
  );
}
