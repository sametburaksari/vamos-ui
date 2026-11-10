import { highlight, readExample } from "@/lib/highlight";
import type { Example } from "@/docs/registry";
import { PreviewTabs } from "./preview-tabs";

/** Renders the example live; the Code tab shows the example's real source file. */
export async function ComponentPreview({ example }: { example: Example }) {
  const raw = await readExample(example.file);
  const html = await highlight(raw);
  const { Component } = example;
  return <PreviewTabs preview={<Component />} html={html} raw={raw} file={`examples/${example.file}`} />;
}
