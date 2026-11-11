import * as React from "react";

/** Line-drawn olive sprig, the site's one ornament. Decorative. */
export function Sprig({ className, flip }: { className?: string; flip?: boolean }) {
  const leaves: [number, number, number, boolean][] = [
    [22, 30, -32, true],
    [34, 22, 28, false],
    [48, 24, -28, true],
    [60, 15, 30, false],
    [74, 18, -24, true],
    [86, 9, 26, false],
    [100, 10, -18, true],
  ];
  return (
    <svg viewBox="0 0 120 40" fill="none" aria-hidden focusable="false" className={`wd-sprig ${className ?? ""}`} style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path pathLength={1} d="M4 34 C 32 30, 64 20, 116 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {leaves.map(([x, y, r, filled], i) => (
        <ellipse key={`${x}-${y}`} style={{ "--wd-i": i } as React.CSSProperties} cx={x} cy={y} rx="8" ry="2.8" transform={`rotate(${r} ${x} ${y})`} stroke="currentColor" strokeWidth="1" fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 0.85 : 0} />
      ))}
      <circle cx="112" cy="10" r="2.6" fill="currentColor" style={{ "--wd-i": leaves.length } as React.CSSProperties} />
    </svg>
  );
}
