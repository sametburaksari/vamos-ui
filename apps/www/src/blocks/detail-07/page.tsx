"use client";

import { AdminShell } from "../detail-04/components/admin-shell";
import { ProductEditor } from "./components/product-editor";

/** Product information editor inside the workspace shell. */
export default function Detail07() {
  return (
    <AdminShell path="/commerce/products/KL-TEX-201">
      <ProductEditor />
    </AdminShell>
  );
}
