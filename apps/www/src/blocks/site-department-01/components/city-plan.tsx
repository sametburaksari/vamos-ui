/**
 * A figure-ground plan of an invented city quarter: a street grid bent by a river, one diagonal
 * avenue and a square — drawn as hairlines in the current text colour. Deterministic (seeded),
 * so server and client draw the same plan. Decorative.
 */
export function CityPlan({ className }: { className?: string }) {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const blocks: string[] = [];
  const cols = 9;
  const rows = 7;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Leave out the square and the river bend.
      if ((r === 3 && (c === 4 || c === 5)) || c + r * 0.6 > 10.6) continue;
      const x = 12 + c * 44 + (r % 2) * 6;
      const y = 12 + r * 40;
      const w = 34 - rand() * 8;
      const h = 30 - rand() * 8;
      // Some blocks split into two plots.
      if (rand() > 0.62) {
        const cut = w * (0.4 + rand() * 0.2);
        blocks.push(`M${x} ${y}h${cut.toFixed(1)}v${h.toFixed(1)}h-${cut.toFixed(1)}Z`, `M${(x + cut + 3).toFixed(1)} ${y}h${(w - cut - 3).toFixed(1)}v${h.toFixed(1)}h-${(w - cut - 3).toFixed(1)}Z`);
      } else blocks.push(`M${x} ${y}h${w.toFixed(1)}v${h.toFixed(1)}h-${w.toFixed(1)}Z`);
    }
  }
  return (
    <svg aria-hidden viewBox="0 0 420 300" className={className} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
      <path d={blocks.join("")} opacity="0.55" />
      {/* the river */}
      <path d="M300 300C330 240 360 210 420 190M330 300C352 250 380 228 420 215" strokeWidth="1.4" />
      {/* the avenue */}
      <path d="M0 290L250 20" strokeWidth="2" opacity="0.8" />
      {/* the square */}
      <circle cx="210" cy="148" r="16" strokeWidth="1.4" />
      <circle cx="210" cy="148" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}
