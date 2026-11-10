// `*emphasis*` in headings: one starred span becomes <em> (italic serif in editorial presets,
// accent ink in sans presets). Pure, shared by the schema (validation) and BlockHeading (render).

export interface EmphasisPart {
  text: string;
  em: boolean;
}

/**
 * Splits a heading string into plain and emphasized parts. `\*` is a literal star; an unmatched
 * star stays literal; `**` (empty) is ignored.
 *
 * ```ts
 * parseEmphasis("Dinner, *slowly*."); // [{ text: "Dinner, ", em: false }, { text: "slowly", em: true }, { text: ".", em: false }]
 * ```
 */
export function parseEmphasis(input: string): EmphasisPart[] {
  const parts: EmphasisPart[] = [];
  let buf = "";
  let i = 0;
  const push = (text: string, em: boolean) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    if (last && last.em === em) last.text += text;
    else parts.push({ text, em });
  };
  while (i < input.length) {
    const ch = input[i]!;
    if (ch === "\\" && input[i + 1] === "*") {
      buf += "*";
      i += 2;
      continue;
    }
    if (ch === "*") {
      // find the closing star (not escaped)
      let j = i + 1;
      let inner = "";
      let closed = false;
      while (j < input.length) {
        if (input[j] === "\\" && input[j + 1] === "*") {
          inner += "*";
          j += 2;
          continue;
        }
        if (input[j] === "*") {
          closed = true;
          break;
        }
        inner += input[j];
        j++;
      }
      if (closed && inner.trim() && inner === inner.trim()) {
        push(buf, false);
        buf = "";
        push(inner, true);
        i = j + 1;
        continue;
      }
      buf += "*";
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  push(buf, false);
  return parts;
}

/** Number of emphasized spans (the schema allows at most one). */
export const countEmphasis = (input: string): number => parseEmphasis(input).filter((p) => p.em).length;

/** The heading without emphasis markers (for `<title>`, aria-labels, search). */
export const stripEmphasis = (input: string): string => parseEmphasis(input).map((p) => p.text).join("");
