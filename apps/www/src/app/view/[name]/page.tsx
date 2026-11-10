import { notFound } from "next/navigation";
import { blocks, blocksByName } from "@/blocks/registry";

export function generateStaticParams() {
  return blocks.map((b) => ({ name: b.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const b = blocksByName[(await params).name];
  return { title: b?.title ?? "Block" };
}

/** Full-screen block, used by the /blocks iframes and "Open in new tab". */
export default async function ViewBlock({ params }: { params: Promise<{ name: string }> }) {
  const b = blocksByName[(await params).name];
  if (!b) notFound();
  const { Component } = b;
  return <Component />;
}
