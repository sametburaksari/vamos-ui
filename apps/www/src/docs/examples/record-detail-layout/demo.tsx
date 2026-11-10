"use client";

import { RecordLayout, RecordPager } from "@vamos-cms/ui";
import { ContactAside, ContactHeader, ContactMain } from "./contact";

// CRM contact: header with key facts and pager, tabs + activity in the main column, details aside.
export default function RecordLayoutDemo() {
  return (
    <div className="w-full rounded-ui-lg border border-line bg-scene p-6">
      <RecordLayout>
        <ContactHeader pager={<RecordPager index={3} total={128} onPrevious={() => {}} onNext={() => {}} shortcuts={false} />} />
        <ContactMain />
        <ContactAside />
      </RecordLayout>
    </div>
  );
}
