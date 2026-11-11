import { blocks } from "@/blocks/registry";
import { highlight, readBlockFile } from "@/lib/highlight";

// One JSON file per block (/blocks/code/<name>.json) with its source, raw and highlighted.
// The /blocks page fetches it only when someone opens the Code tab, so the page itself stays light.
export const dynamic = "force-static";

export function generateStaticParams() {
  return blocks.map((b) => ({ file: `${b.name}.json` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const block = blocks.find((b) => `${b.name}.json` === file);
  if (!block) return Response.json({ error: "Not found" }, { status: 404 });
  const files = await Promise.all(
    block.files.map(async (path) => {
      const raw = await readBlockFile(path);
      return { path, raw, html: await highlight(raw) };
    }),
  );
  return Response.json({ name: block.name, files });
}
