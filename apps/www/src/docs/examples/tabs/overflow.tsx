import { Tabs, TabsList, TabsTrigger } from "@vamos-ui/react";

const sections = ["General", "Branding", "Domains", "Members", "Roles", "Billing", "Integrations", "Webhooks", "API keys", "Audit log", "Data export", "Danger zone"];

export default function TabsOverflow() {
  return (
    <Tabs defaultValue="Webhooks" className="w-full max-w-md">
      <TabsList aria-label="Workspace settings">
        {sections.map((s) => (
          <TabsTrigger key={s} value={s}>
            {s}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
