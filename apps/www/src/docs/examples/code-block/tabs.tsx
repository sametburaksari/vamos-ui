"use client";

import { CodeBlock, CodeTabs, useCodeLanguage } from "@vamos-ui/react";

const install = { ts: "npm install @example/sdk", python: "pip install example-sdk", go: "go get example.com/sdk" } as const;

const request = [
  { language: "ts", label: "TypeScript", title: "send.ts", code: `const receipt = await client.events.send({ type: "order.paid" });` },
  { language: "python", label: "Python", title: "send.py", code: `receipt = client.events.send(type="order.paid")` },
  { language: "go", label: "Go", title: "send.go", code: `receipt, err := client.Events.Send(ctx, sdk.Event{Type: "order.paid"})` },
];

const verify = [
  { language: "ts", label: "TypeScript", title: "verify.ts", code: `if (!client.webhooks.verify(body, signature)) throw new Error("bad signature");` },
  { language: "python", label: "Python", title: "verify.py", code: `if not client.webhooks.verify(body, signature):\n    raise ValueError("bad signature")` },
  { language: "go", label: "Go", title: "verify.go", code: `if !client.Webhooks.Verify(body, signature) {\n\treturn errors.New("bad signature")\n}` },
];

/** Pick a language in either block: both follow, and so does the install line (remembered per browser). */
export default function CodeBlockTabs() {
  const [lang = "ts"] = useCodeLanguage("docs-sdk", { persist: true });
  return (
    <div className="grid w-full max-w-2xl gap-5">
      <CodeBlock language="bash" code={install[lang as keyof typeof install] ?? install.ts} />
      <CodeTabs group="docs-sdk" persist samples={request} />
      <CodeTabs group="docs-sdk" persist samples={verify} lineNumbers />
    </div>
  );
}
