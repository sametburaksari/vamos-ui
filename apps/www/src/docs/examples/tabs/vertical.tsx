import { Bell, CreditCard, Shield, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vamos-ui/react";

export default function TabsVertical() {
  return (
    <Tabs defaultValue="security" orientation="vertical" className="w-full max-w-xl">
      <TabsList aria-label="Account settings" className="w-44 shrink-0">
        <TabsTrigger value="profile" icon={<User />}>Profile</TabsTrigger>
        <TabsTrigger value="security" icon={<Shield />}>Security</TabsTrigger>
        <TabsTrigger value="notifications" icon={<Bell />}>Notifications</TabsTrigger>
        <TabsTrigger value="billing" icon={<CreditCard />}>Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="text-sm text-fg-muted">Name, photo and contact details.</TabsContent>
      <TabsContent value="security" className="flex flex-col gap-1 text-sm">
        <p className="font-medium text-fg">Two-factor authentication</p>
        <p className="text-fg-muted">Enabled with an authenticator app since March 2026. 6 recovery codes left.</p>
      </TabsContent>
      <TabsContent value="notifications" className="text-sm text-fg-muted">Email and push preferences.</TabsContent>
      <TabsContent value="billing" className="text-sm text-fg-muted">Plan, invoices and payment method.</TabsContent>
    </Tabs>
  );
}
