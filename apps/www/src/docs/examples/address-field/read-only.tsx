import { AddressField } from "@vamos-cms/ui";

export default function AddressReadOnly() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <AddressField
        readOnly
        legend="Registered office"
        value={{ country: "TR", region1: "İstanbul", region2: "Maltepe", line1: "Cevizli Mah. Tugay Yolu Cad. No: 69", line2: "Piazza AVM Office Link, Kat 12", postalCode: "34846" }}
      />
      <AddressField readOnly legend="US billing entity" value={{ country: "US", region1: "CA", region2: "San Francisco", line1: "548 Market St, Suite 41820", postalCode: "94104" }} />
    </div>
  );
}
