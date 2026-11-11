import { cn } from "@vamos-ui/react";
import { ATLAS_H, ATLAS_W, CONTOURS, EMBERS, LAST_LIT, ROUTE } from "./atlas-geometry";

/**
 * Key art drawn live in tokens: contour rings in the ink colour, the walked route and lit embers
 * in the ember accent, unlit embers as rings. Embers breathe (motion-safe only).
 */
export function AtlasArt({ className, labels = true }: { className?: string; labels?: boolean }) {
  return (
    <svg viewBox={`0 0 ${ATLAS_W} ${ATLAS_H}`} preserveAspectRatio="xMidYMid slice" aria-hidden className={cn("block", className)}>
      <g fill="none" stroke="var(--fg)">
        {CONTOURS.map((c, i) => (
          <path key={i} d={c.d} strokeOpacity={0.07 + c.level * 0.22} strokeWidth={c.index ? 1.5 : 0.75} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      {/* Graticule */}
      <g stroke="var(--fg)" strokeOpacity="0.08" strokeWidth="1">
        {[200, 400, 600, 800, 1000, 1200, 1400].map((x) => (
          <line key={x} x1={x} x2={x} y1={0} y2={ATLAS_H} strokeDasharray="1 7" />
        ))}
        {[150, 300, 450, 600, 750].map((y) => (
          <line key={y} x1={0} x2={ATLAS_W} y1={y} y2={y} strokeDasharray="1 7" />
        ))}
      </g>
      <path d={ROUTE} fill="none" stroke="var(--accent)" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {EMBERS.map((e, i) => (
        <g key={e.label} transform={`translate(${e.x} ${e.y})`}>
          {e.lit ? (
            <>
              <circle r="22" fill="var(--accent)" opacity="0.18" className="ea-breathe" style={{ animationDelay: `${i * 0.6}s` }} />
              <circle r="6" fill="var(--accent)" />
            </>
          ) : (
            <circle r="5" fill="none" stroke="var(--accent)" strokeOpacity="0.7" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          )}
          {labels ? (
            <text x="14" y="-12" fontSize="13" fill="var(--fg)" fillOpacity={i <= LAST_LIT ? 0.6 : 0.35} style={{ fontFamily: "var(--font-code)" }}>
              {e.label}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
