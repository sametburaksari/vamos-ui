"use client";

import * as React from "react";
import { toast } from "@vamos-ui/react";
import { SetupChecklist, type SetupItem } from "@vamos-ui/react/business";

const initial: SetupItem[] = [
  { id: "store", title: "Connect your store", status: "done" },
  { id: "payments", title: "Connect payments", description: "Take cards and bank transfers. Payouts land in your account two business days later.", status: "in_progress", estimate: "4 min", action: { label: "Connect iyzico", href: "#payments" } },
  { id: "domain", title: "Add your domain", description: "Point shop.yourbrand.com at your store. We issue the SSL certificate.", status: "todo", estimate: "10 min", action: { label: "Add domain", href: "#domain" } },
  { id: "products", title: "Import products", description: "Bring a CSV from your old shop or add the first product by hand.", status: "todo", estimate: "5 min", action: { label: "Import CSV", href: "#import" } },
  { id: "team", title: "Invite your team", description: "Give co-workers their own login and role.", status: "todo", optional: true, action: { label: "Invite", href: "#team" } },
];

export default function SetupChecklistDemo() {
  const [items, setItems] = React.useState(initial);
  return (
    <div className="w-full max-w-md">
      <SetupChecklist
        title="Set up Moda Atölye"
        items={items}
        onSkip={(id) => setItems((l) => l.map((i) => (i.id === id ? { ...i, status: "skipped" } : i)))}
        onUndoSkip={(id) => setItems((l) => l.map((i) => (i.id === id ? { ...i, status: "todo" } : i)))}
        onAllDone={() => toast.success("Your store is ready to sell")}
      />
    </div>
  );
}
