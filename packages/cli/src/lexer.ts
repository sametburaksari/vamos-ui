/**
 * Shared lexing helpers for vamos-ui/verify and the brand fixer. Pure: no Node built-ins.
 */

export interface StringLit {
  start: number; // offset of the opening quote
  end: number; // offset after the closing quote
  value: string; // raw contents between the quotes
  quote: string;
}

export interface Comment {
  start: number;
  end: number;
  text: string;
}

export interface Lexed {
  /** Source with comments replaced by spaces (newlines kept), so offsets stay valid. */
  masked: string;
  strings: StringLit[];
  comments: Comment[];
}

/**
 * Splits source into comments and string literals. ' and " strings end at a
 * newline (JS forbids multi-line quoted strings), which keeps apostrophes in JSX
 * text from swallowing the rest of the file.
 */
export function lex(code: string, opts: { css?: boolean } = {}): Lexed {
  const strings: StringLit[] = [];
  const comments: Comment[] = [];
  const out = code.split("");
  const n = code.length;
  let i = 0;
  const blank = (from: number, to: number) => {
    for (let k = from; k < to; k++) if (out[k] !== "\n") out[k] = " ";
  };
  while (i < n) {
    const c = code[i]!;
    const next = code[i + 1];
    if (c === "/" && next === "*") {
      const end = code.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      comments.push({ start: i, end: stop, text: code.slice(i, stop) });
      blank(i, stop);
      i = stop;
      continue;
    }
    if (!opts.css && c === "/" && next === "/" && code[i - 1] !== ":" && code[i - 1] !== "\\") {
      let stop = code.indexOf("\n", i);
      if (stop === -1) stop = n;
      comments.push({ start: i, end: stop, text: code.slice(i, stop) });
      blank(i, stop);
      i = stop;
      continue;
    }
    if (!opts.css && c === "<" && code.startsWith("<!--", i)) {
      const end = code.indexOf("-->", i + 4);
      const stop = end === -1 ? n : end + 3;
      comments.push({ start: i, end: stop, text: code.slice(i, stop) });
      blank(i, stop);
      i = stop;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      let closed = false;
      while (j < n) {
        const d = code[j]!;
        if (d === "\\") {
          j += 2;
          continue;
        }
        if (d === c) {
          closed = true;
          break;
        }
        if (d === "\n" && c !== "`") break;
        j++;
      }
      if (closed) {
        strings.push({ start: i, end: j + 1, value: code.slice(i + 1, j), quote: c });
        i = j + 1;
      } else {
        i++; // stray quote (e.g. an apostrophe in JSX text)
      }
      continue;
    }
    i++;
  }
  return { masked: out.join(""), strings, comments };
}

export function lineIndex(code: string): number[] {
  const starts = [0];
  for (let i = 0; i < code.length; i++) if (code[i] === "\n") starts.push(i + 1);
  return starts;
}

export function position(starts: number[], offset: number): { line: number; column: number } {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid]! <= offset) lo = mid;
    else hi = mid - 1;
  }
  return { line: lo + 1, column: offset - starts[lo]! + 1 };
}

/** Index of the bracket that closes the one at `open`, skipping strings. */
export function matchBracket(code: string, open: number): number {
  const pairs: Record<string, string> = { "{": "}", "(": ")", "[": "]" };
  const stack: string[] = [];
  for (let i = open; i < code.length; i++) {
    const c = code[i]!;
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < code.length && code[j] !== c) {
        if (code[j] === "\\") j++;
        if (code[j] === "\n" && c !== "`") break;
        j++;
      }
      if (code[j] === c) i = j;
      continue;
    }
    if (pairs[c]) stack.push(pairs[c]!);
    else if (c === stack[stack.length - 1]) {
      stack.pop();
      if (stack.length === 0) return i;
    }
  }
  return code.length - 1;
}

