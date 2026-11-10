import { Field, NativeSelect } from "@vamos-cms/ui";

export default function SelectNative() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Field label="Treatment" required>
        <NativeSelect
          name="treatment"
          defaultValue=""
          placeholder="Choose a treatment"
          required
          items={[
            { value: "signature-massage", label: "Signature massage · 60 min", group: "Massage" },
            { value: "deep-tissue", label: "Deep tissue · 75 min", group: "Massage" },
            { value: "hot-stone", label: "Hot stone · 90 min", group: "Massage" },
            { value: "hammam", label: "Traditional hammam · 45 min", group: "Hammam" },
            { value: "hammam-foam", label: "Hammam with foam massage · 60 min", group: "Hammam" },
            { value: "facial", label: "Hydrating facial · 50 min", group: "Skin" },
          ]}
        />
      </Field>
      <Field label="Guests">
        <NativeSelect name="guests" defaultValue="1" size="sm" className="w-32">
          <option value="1">1 guest</option>
          <option value="2">2 guests</option>
          <option value="3">3 guests</option>
          <option value="4">4 guests</option>
        </NativeSelect>
      </Field>
    </div>
  );
}
