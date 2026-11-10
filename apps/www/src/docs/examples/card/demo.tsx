import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Inset } from "@vamos-ui/react";

export default function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader title="Publish" description="Visibility and schedule" action={<Badge tone="info" dot>Scheduled</Badge>} />
      <CardBody className="grid gap-2 text-[13px]">
        <Inset className="flex justify-between px-3 py-2">
          <span className="text-fg-muted">Status</span>
          <span>Draft</span>
        </Inset>
        <Inset className="flex justify-between px-3 py-2">
          <span className="text-fg-muted">Publish on</span>
          <span className="tabular">Nov 11, 09:00</span>
        </Inset>
      </CardBody>
      <CardFooter className="justify-between">
        <Button variant="danger-ghost" size="sm">Move to trash</Button>
        <Button variant="primary" size="sm">Update</Button>
      </CardFooter>
    </Card>
  );
}
