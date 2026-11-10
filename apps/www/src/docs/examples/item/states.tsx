import { Card, CardBody, CardHeader, ItemList, ItemSkeleton } from "@vamos-ui/react";

export default function ItemStates() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader title="Upcoming birthdays" description="Loading" />
        <ItemSkeleton count={3} />
      </Card>
      <Card>
        <CardHeader title="Upcoming birthdays" description="Empty" />
        <CardBody className="p-0">
          <ItemList empty="No birthdays in the next 30 days." />
        </CardBody>
      </Card>
    </div>
  );
}
