import { Badge, Button, Card, CardBody, CardFooter, CardHeader } from "@/components/vamos";

const steps = [
  { command: "npx vamos-ui list --type block", text: "Pick a starting screen: dashboards, lists, settings, sign-in and full websites." },
  { command: "npx vamos-ui add dashboard-01", text: "Copy it into src/components/blocks with every component it needs." },
  { command: "npx vamos-ui theme", text: "Switch theme, material, accent, density and font. Every screen follows." },
  { command: "npx vamos-ui verify", text: "Check your code against the design and accessibility rules." },
];

/** The first screen of a new Vamos UI app. Replace it with your own. */
export function StarterScreen() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col items-start gap-3">
        <Badge tone="accent">__APP_TITLE__</Badge>
        <h1 className="font-display text-4xl text-fg">Your app is ready.</h1>
        <p className="max-w-prose text-fg-muted">
          Components live in <code className="font-mono text-sm">src/components/vamos</code> as source you own. Edit them freely;
          <code className="font-mono text-sm"> npx vamos-ui diff</code> and <code className="font-mono text-sm">upgrade</code> keep
          fixes flowing in.
        </p>
      </header>

      <Card>
        <CardHeader title="Next steps" description="Four commands from an empty page to a working screen." divider />
        <CardBody>
          <ol className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <li key={step.command} className="flex gap-3">
                <span className="font-mono text-sm text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex flex-col gap-1">
                  <code className="font-mono text-sm text-fg">{step.command}</code>
                  <span className="text-sm text-fg-muted">{step.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </CardBody>
        <CardFooter className="flex flex-wrap gap-2">
          <Button variant="primary" asChild>
            <a href="https://ui.vamos.ist/blocks">Browse blocks</a>
          </Button>
          <Button asChild>
            <a href="https://ui.vamos.ist/docs">Read the docs</a>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
