import { notFound } from "next/navigation";
import { blocks, blocksByName } from "@/blocks/registry";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return blocks.map((b) => ({ name: b.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const b = blocksByName[(await params).name];
  if (!b) return { title: "Block" };
  // Fictional demo content: keep it out of search results, the /blocks page is the indexable entry.
  return pageMeta({ title: b.title, description: b.description, path: `/view/${b.name}/`, noindex: true });
}

/** Full-screen block, used by the /blocks iframes and "Open in new tab". */
export default async function ViewBlock({ params }: { params: Promise<{ name: string }> }) {
  const b = blocksByName[(await params).name];
  if (!b) notFound();
  const { default: Component } = await b.load();
  return <Component />;
}
