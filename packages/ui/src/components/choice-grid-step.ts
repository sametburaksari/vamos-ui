/** Next selectable cell from `[r, c]` moving by `[dr, dc]`; rows wrap for left / right, columns stop at the edge. */
export function choiceGridStep(
  available: boolean[][],
  [r, c]: [number, number],
  move: "next" | "prev" | "up" | "down" | "rowStart" | "rowEnd" | "first" | "last",
): [number, number] | null {
  const rows = available.length;
  const cols = available[0]?.length ?? 0;
  const ok = (rr: number, cc: number) => available[rr]?.[cc] === true;
  const flat = (i: number): [number, number] => [Math.floor(i / cols), i % cols];
  if (move === "next" || move === "prev") {
    const d = move === "next" ? 1 : -1;
    for (let i = r * cols + c + d, n = 0; n < rows * cols; i += d, n++) {
      const j = ((i % (rows * cols)) + rows * cols) % (rows * cols);
      const [rr, cc] = flat(j);
      if (ok(rr, cc)) return [rr, cc];
    }
    return null;
  }
  if (move === "up" || move === "down") {
    const d = move === "down" ? 1 : -1;
    for (let rr = r + d; rr >= 0 && rr < rows; rr += d) if (ok(rr, c)) return [rr, c];
    return null;
  }
  if (move === "rowStart" || move === "rowEnd") {
    const range = [...Array(cols).keys()];
    for (const cc of move === "rowStart" ? range : range.reverse()) if (ok(r, cc)) return [r, cc];
    return null;
  }
  const all = [...Array(rows * cols).keys()];
  for (const i of move === "first" ? all : all.reverse()) {
    const [rr, cc] = flat(i);
    if (ok(rr, cc)) return [rr, cc];
  }
  return null;
}
