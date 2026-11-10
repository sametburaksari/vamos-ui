"use client";

import { Field, StatusPicker, type StatusDef } from "@vamos-ui/react";

const order: StatusDef[] = [
  { value: "awaiting_payment", label: "Awaiting payment", category: "todo", tone: "warning" },
  { value: "processing", label: "Processing", category: "active" },
  { value: "shipped", label: "Shipped", category: "active", tone: "accent" },
  { value: "delivered", label: "Delivered", category: "done" },
  { value: "refunded", label: "Refunded", category: "cancelled" },
  { value: "cancelled", label: "Cancelled", category: "cancelled", tone: "danger" },
];

export default function StatusPickerField() {
  return (
    <form className="grid w-full max-w-sm gap-4" onSubmit={(e) => e.preventDefault()}>
      <Field label="Order status" hint="Customers get an email on Shipped and Delivered.">
        <StatusPicker trigger="field" name="status" statuses={order} defaultValue="processing" />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPicker statuses={order} defaultValue="shipped" size="sm" aria-label="Small status" />
        <StatusPicker statuses={order} defaultValue="delivered" disabled aria-label="Disabled status" />
        <StatusPicker statuses={order} value="refunded" readOnly />
      </div>
    </form>
  );
}
