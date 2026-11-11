import * as React from "react";
import { parseEmphasis } from "../../schema/emphasis";

/**
 * A heading string with hand-set line breaks: `"Ateşte közde,\nmuhabbet sofrada."`. Each line is
 * a block `<span>` and the lines are joined by a real space, so `textContent` (search engines,
 * screen readers, reader mode, copy-paste) reads "közde, muhabbet", never "közde,muhabbet".
 * `*emphasis*` works across and within lines. Strings without `\n` and ReactNodes pass through
 * unchanged (BlockHeading renders their emphasis). Server-safe.
 */
export function headingLines(text: React.ReactNode): React.ReactNode {
  if (typeof text !== "string" || !text.includes("\n")) return text;
  const lines: { text: string; em: boolean }[][] = [[]];
  for (const part of parseEmphasis(text)) {
    part.text.split("\n").forEach((chunk, i) => {
      if (i > 0) lines.push([]);
      if (chunk) lines[lines.length - 1]!.push({ text: chunk, em: part.em });
    });
  }
  const filled = lines
    .map((parts) => parts.map((p, i, all) => {
      let t = i === 0 ? p.text.trimStart() : p.text;
      if (i === all.length - 1) t = t.trimEnd();
      return { ...p, text: t };
    }).filter((p) => p.text))
    .filter((parts) => parts.length);
  return filled.map((parts, i) => (
    <React.Fragment key={i}>
      {i > 0 ? " " : null}
      <span className="vb-heading-line block">
        {parts.map((p, j) => (p.em ? <em key={j}>{p.text}</em> : <React.Fragment key={j}>{p.text}</React.Fragment>))}
      </span>
    </React.Fragment>
  ));
}
