import { Badge, Button, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@vamos-ui/react";

const releases = [
  { version: "4.12", date: "Nov 8", notes: ["Scheduled posts now respect the site time zone.", "Faster media library search on large sites.", "Fixed: duplicate slugs when two editors publish at once."] },
  { version: "4.11", date: "Oct 24", notes: ["New revision history with side-by-side diff.", "Bulk edit tags from the post list.", "Fixed: image focal point lost after crop."] },
  { version: "4.10", date: "Oct 9", notes: ["Redirect manager with 301 / 302 and wildcards.", "Comments can be closed per post type.", "Turkish interface translation completed."] },
  { version: "4.9", date: "Sep 22", notes: ["Reusable blocks can be converted back to regular blocks.", "Export a post as Markdown.", "Fixed: menu order reset after drag on Safari."] },
  { version: "4.8", date: "Sep 5", notes: ["Two-factor sign-in for editors.", "Custom fields support date ranges.", "Sitemap now excludes noindex pages."] },
];

export default function DialogScrollBody() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>What&apos;s new</Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader title="What's new in Vamos CMS" description="Release notes from the last three months." action={<Badge tone="accent">4.12</Badge>} />
        <DialogBody className="grid gap-6">
          {releases.map((r) => (
            <section key={r.version} className="grid gap-2">
              <h3 className="flex items-baseline gap-2 text-sm font-semibold">
                Version {r.version} <span className="font-mono text-xs font-normal text-fg-subtle">{r.date}</span>
              </h3>
              <ul className="grid list-disc gap-1.5 ps-5 text-fg-muted marker:text-fg-subtle">
                {r.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </section>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="primary">Got it</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
