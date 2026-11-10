"use client";

import { RecordLayout, RecordPager } from "@vamos-cms/ui";
import { ContactAside, ContactHeader, ContactMain } from "./contact";

// In a narrow container the side column moves under the header and its sections fold;
// at phone width the key facts become a horizontal strip.
export default function RecordLayoutResponsive() {
  return (
    <div className="w-[420px] max-w-full rounded-[28px] border border-line bg-scene p-4">
      <RecordLayout>
        <ContactHeader pager={<RecordPager index={3} total={128} onPrevious={() => {}} onNext={() => {}} shortcuts={false} />} />
        <ContactMain />
        <ContactAside />
      </RecordLayout>
    </div>
  );
}
