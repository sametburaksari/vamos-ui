import { StatsBand } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Ledger: label, dotted leader, figure — an annual-report line with a mono source.
export default function StatsBandLedger() {
  return (
    <SiteFrame>
      <StatsBand
        variant="ledger"
        eyebrow="Annual report"
        title="Lena Clinic, *2026*"
        lead="Two physicians, four nurses, one address in Suadiye."
        items={[
          { value: 3812, label: "Consultations", source: "Clinic records, Jan–Oct 2026" },
          { value: 96.4, unit: "%", label: "Patients who would recommend us", source: "Post-visit survey, n = 1,107" },
          { value: 4.9, label: "Google rating", source: "684 reviews, Nov 2026" },
          { value: 0, label: "Reportable complications", source: "Ministry of Health filing, Q3" },
        ]}
      />
    </SiteFrame>
  );
}
