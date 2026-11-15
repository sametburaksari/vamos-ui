import { CodeBlock } from "@vamos-ui/react";

const code = `import { createClient } from "@example/sdk";

const client = createClient({ apiKey: process.env.EXAMPLE_KEY });

// Send the first event and wait for the receipt.
const receipt = await client.events.send({ type: "order.paid", amount: 4200 });
console.log(receipt.id);`;

export default function CodeBlockDemo() {
  return (
    <div className="w-full max-w-2xl">
      <CodeBlock title="send-event.ts" language="ts" code={code} lineNumbers highlightLines="5-6" caption="Lines 5–6 send the event; the receipt id is logged." />
    </div>
  );
}
