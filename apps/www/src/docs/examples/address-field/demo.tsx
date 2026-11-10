import { AddressField } from "@vamos-ui/react";

export default function AddressFieldDemo() {
  return (
    <AddressField
      legend="Shipping address"
      hint="Deliveries go out from the Maltepe warehouse on weekdays."
      name="shipping"
      defaultValue={{ country: "TR" }}
      required={["region1", "region2", "line1"]}
      className="w-full max-w-xl"
    />
  );
}
