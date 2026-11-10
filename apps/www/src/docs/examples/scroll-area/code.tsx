import { ScrollArea } from "@vamos-ui/react";

const payload = `{
  "event": "order.created",
  "id": "evt_01JCZ3N8Q4W7M2V6T5K9R1XH0B",
  "created_at": "2026-11-10T09:42:17Z",
  "data": {
    "order_id": "ord_8841",
    "customer": { "name": "Ayşe Demir", "email": "ayse.demir@example.com" },
    "lines": [
      { "sku": "GRN-CER-01", "name": "Hand grinder, ceramic burr", "qty": 1, "unit_price": "89.00" },
      { "sku": "BEAN-ETH-250", "name": "Ethiopia Guji, 250 g", "qty": 2, "unit_price": "16.50" }
    ],
    "total": "122.00",
    "currency": "EUR"
  }
}`;

// Both scrollbars: long lines scroll sideways, the block scrolls down.
export default function ScrollAreaCode() {
  return (
    <ScrollArea orientation="both" maxHeight={220} type="auto" aria-label="Webhook payload" className="w-full max-w-md rounded-ui-lg border border-line bg-surface-2">
      <pre className="w-max p-4 font-mono text-[12px] leading-relaxed text-fg">{payload}</pre>
    </ScrollArea>
  );
}
