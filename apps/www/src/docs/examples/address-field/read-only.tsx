import { AddressField } from "@vamos-ui/react";

export default function AddressReadOnly() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <AddressField
        readOnly
        legend="Registered office"
        value={{ country: "TR", region1: "İstanbul", region2: "Kadıköy", line1: "Rasimpaşa Mah. Rıhtım Cad. No: 14", line2: "Liman Han, Kat 3", postalCode: "34716" }}
      />
      <AddressField readOnly legend="US billing entity" value={{ country: "US", region1: "CA", region2: "San Francisco", line1: "548 Market St, Suite 41820", postalCode: "94104" }} />
    </div>
  );
}
