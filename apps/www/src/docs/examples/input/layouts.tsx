import { Card, CardBody, CardHeader, Field, Fieldset, Input } from "@vamos-ui/react";

export default function FieldLayouts() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader title="Workspace" description="Shown on invoices and email footers." divider />
      <CardBody className="grid gap-5 pt-5">
        {/* layout="inline": fixed label column, the classic settings page */}
        <Field label="Company name" layout="inline" required>
          <Input defaultValue="Vamos Dijital" />
        </Field>
        <Field label="Tax office" layout="inline" optional hint="Required for Turkish e-invoices.">
          <Input defaultValue="Kozyatağı" />
        </Field>
        <Fieldset legend="Email notifications" hint="We never send more than one digest per day." className="sm:ps-[calc(14rem+1.5rem)]">
          {/* orientation="horizontal": control first, then label + hint */}
          <Field label="New lead assigned to me" hint="Instantly, by email and push." orientation="horizontal">
            <input type="checkbox" defaultChecked className="size-4 accent-(--accent-ink)" />
          </Field>
          <Field label="Weekly pipeline summary" orientation="horizontal">
            <input type="checkbox" className="size-4 accent-(--accent-ink)" />
          </Field>
        </Fieldset>
      </CardBody>
    </Card>
  );
}
