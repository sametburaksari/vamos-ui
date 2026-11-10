import { Card, CardBody, CardHeader, KbdGroup, Separator } from "@vamos-cms/ui";

const groups = [
  {
    title: "Navigation",
    items: [
      { label: "Go to posts", keys: ["g", "p"] },
      { label: "Go to media", keys: ["g", "m"] },
      { label: "Open command menu", keys: "mod+k" },
    ],
  },
  {
    title: "Editor",
    items: [
      { label: "Bold", keys: "mod+b" },
      { label: "Heading 2", keys: "mod+alt+2" },
      { label: "Show shortcuts", keys: "shift+?" },
    ],
  },
];

export default function KbdHelpSheet() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader title="Keyboard shortcuts" description="Work faster in the post editor." divider />
      <CardBody className="grid gap-4 pt-4">
        {groups.map((g, i) => (
          <section key={g.title} className="grid gap-2">
            {i > 0 ? <Separator className="mb-2" /> : null}
            <h4 className="text-xs font-medium text-fg-subtle">{g.title}</h4>
            {g.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-[13px]">
                <span>{item.label}</span>
                <KbdGroup keys={item.keys} size="sm" separator={Array.isArray(item.keys) ? "then" : undefined} />
              </div>
            ))}
          </section>
        ))}
      </CardBody>
    </Card>
  );
}
