import { ComparisonTable } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// At phone width a radio plan picker shows one column at a time (CSS only).
export default function ComparisonMobile() {
  return (
    <SiteFrame width={390}>
      <ComparisonTable
        title="Compare *memberships*"
        columns={[{ name: "Day pass", note: "₺1,450" }, { name: "Monthly", note: "₺4,200 / mo", highlight: true }, { name: "Yearly", note: "₺39,000 / yr" }]}
        groups={[{ title: "Included", rows: [
          { feature: "Hammam and sauna", values: [true, true, true] },
          { feature: "Pool hours", values: ["10:00–18:00", "All day", "All day"] },
          { feature: "Massage discount", values: [null, "10%", "20%"] },
          { feature: "Guest passes", values: [false, "1 / month", "2 / month"] },
        ] }]}
      />
    </SiteFrame>
  );
}
