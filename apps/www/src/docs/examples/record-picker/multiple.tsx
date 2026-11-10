"use client";

import * as React from "react";
import { Field, RecordPicker, arrayRecordSource } from "@vamos-cms/ui";

interface Post {
  id: string;
  title: string;
  section: string;
  published: string;
}

const posts: Post[] = [
  { id: "p-1042", title: "How we cut onboarding time by 40%", section: "Case studies", published: "Oct 2" },
  { id: "p-1038", title: "A field guide to GDPR consent banners", section: "Guides", published: "Sep 18" },
  { id: "p-1031", title: "Pricing pages that don't scare buyers", section: "Guides", published: "Sep 4" },
  { id: "p-1027", title: "Release notes: September", section: "Product", published: "Aug 30" },
  { id: "p-1019", title: "Interview: running a 12-person agency", section: "Stories", published: "Aug 12" },
  { id: "p-1011", title: "Writing alt text that actually helps", section: "Guides", published: "Jul 28" },
  { id: "p-1004", title: "Why we moved our blog to static pages", section: "Engineering", published: "Jul 9" },
];

const postSource = arrayRecordSource("posts", posts, {
  getId: (p) => p.id,
  getLabel: (p) => p.title,
  getDescription: (p) => `${p.section} · ${p.published}`,
  getKeywords: (p) => [p.id],
  href: (p) => `/docs/components/record-picker?post=${p.id}`,
  delay: 200,
});

export default function RecordPickerMultiple() {
  const [related, setRelated] = React.useState<string[]>(["p-1038", "p-1011"]);
  return (
    <div className="w-full max-w-md">
      <Field label="Related posts" hint="Shown under the article. Up to 4.">
        <RecordPicker multiple max={4} source={postSource} selectedRecords={posts} value={related} onValueChange={setRelated} placeholder="Add a post" />
      </Field>
    </div>
  );
}
