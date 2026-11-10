import { CheckboxGroup, Field } from "@vamos-ui/react";

export default function CheckboxGroupExample() {
  return (
    <Field label="Notify me about new leads by" hint="We never send more than one digest per day.">
      <CheckboxGroup
        name="channels"
        defaultValue={["email", "push"]}
        items={[
          { value: "email", label: "Email", description: "To elif.kaya@northwind.co" },
          { value: "push", label: "Push notification", description: "On devices where you're signed in" },
          { value: "sms", label: "SMS", description: "Only for leads worth over $5,000" },
          { value: "slack", label: "Slack", description: "Connect a workspace first", disabled: true },
        ]}
      />
    </Field>
  );
}
