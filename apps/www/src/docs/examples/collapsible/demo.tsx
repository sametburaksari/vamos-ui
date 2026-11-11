import { Settings2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger, Field, Input } from "@vamos-ui/react";

export default function CollapsibleDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Field label="Webhook URL">
        <Input defaultValue="https://hooks.northwind-studio.com/orders" />
      </Field>
      <Collapsible className="border-t border-line pt-1">
        <CollapsibleTrigger icon={<Settings2 />} meta="3 fields">
          Advanced settings
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4 pt-2 pb-1">
            <Field label="Signing secret" hint="Sent as X-Signature on every request.">
              <Input type="password" defaultValue="whsec_7f2a9c" />
            </Field>
            <Field label="Retries">
              <Input type="number" defaultValue={5} />
            </Field>
            <Field label="Timeout (seconds)">
              <Input type="number" defaultValue={10} />
            </Field>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
