import { Card, CardBody, CardHeader, Switch } from "@vamos-ui/react";

const rows = [
  { id: "maintenance", label: "Maintenance mode", description: "Visitors see a holding page. Signed-in staff can still browse.", on: false },
  { id: "comments", label: "Comments on new posts", description: "Applies to posts published from now on.", on: true },
  { id: "sitemap", label: "Submit sitemap automatically", description: "Notify search engines when you publish or update a page.", on: true },
  { id: "analytics", label: "Cookie-free analytics", description: "Page views without a consent banner. Managed by your plan.", on: true, disabled: true },
];

export default function SwitchSettingsRow() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader title="Website" description="kadikoyroasters.com" divider />
      <CardBody className="grid gap-0 divide-y divide-line py-0">
        {rows.map((r) => (
          <Switch
            key={r.id}
            name={r.id}
            label={r.label}
            description={r.description}
            labelPosition="start"
            defaultChecked={r.on}
            disabled={r.disabled}
            className="py-4"
          />
        ))}
      </CardBody>
    </Card>
  );
}
