import { Card, CardBody, CardHeader, DescriptionList } from "@vamos-ui/react";

export default function DescriptionListStates() {
  return (
    <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
      <Card>
        <CardHeader title="Order #10482" description="Loading" />
        <CardBody>
          <DescriptionList loading={4} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Order #10482" description="Vertical layout, custom empty value" />
        <CardBody>
          <DescriptionList
            layout="vertical"
            emptyValue={<span className="italic">Not provided</span>}
            items={[
              { key: "customer", label: "Customer", value: "İlker Şahin" },
              { key: "total", label: "Total", value: "1249.90", format: "currency" },
              { key: "coupon", label: "Coupon", value: null },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
