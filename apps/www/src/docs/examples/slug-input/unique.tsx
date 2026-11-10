"use client";

import * as React from "react";
import { Field, SlugInput } from "@vamos-ui/react";

const taken: Record<string, string> = {
  "summer-campaign": "Used by “Summer campaign 2025”",
  "summer-campaign-2": "Used by “Summer campaign (draft)”",
};

const checkSlug = (slug: string, signal: AbortSignal) =>
  new Promise<string | true>((resolve, reject) => {
    const timer = setTimeout(() => resolve(taken[slug] ?? true), 500);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });

const suggest = async (slug: string) => {
  let n = 2;
  while (taken[`${slug}-${n}`]) n++;
  return `${slug}-${n}`;
};

export default function SlugInputUnique() {
  return (
    <Field label="Landing page URL" className="w-full max-w-lg">
      <SlugInput defaultValue="summer-campaign" prefix="go.vamos.ist/" validate={checkSlug} suggestUnique={suggest} />
    </Field>
  );
}
