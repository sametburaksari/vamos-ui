"use client";

import { AdminShell } from "../detail-04/components/admin-shell";
import { OrderDetail } from "./components/order-detail";

/** Order detail inside the workspace shell. */
export default function Detail05() {
  return (
    <AdminShell path="/commerce/orders/KL-24220">
      <OrderDetail />
    </AdminShell>
  );
}
