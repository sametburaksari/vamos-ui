import { CodeBlock } from "@vamos-ui/react";

const log = `$ example deploy --env production
Uploading 14 files (2.1 MB)
Build finished in 38 s
Live at https://preview.example.com`;

/** A dark window on any page; long lines wrap instead of scrolling; plain text without colours. */
export default function CodeBlockDark() {
  return (
    <div className="grid w-full max-w-2xl gap-5">
      <CodeBlock scheme="dark" title="Terminal" language="bash" code={log} highlight={false} />
      <CodeBlock
        wrap
        language="json"
        code={`{ "id": "evt_01", "type": "order.paid", "data": { "amount": 4200, "currency": "EUR", "note": "Long values wrap onto the next line instead of scrolling the block sideways." } }`}
      />
    </div>
  );
}
