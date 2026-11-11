import type { PlanRoom } from "./content";

/**
 * A plan drawn from room rectangles on a 100 × 64 sheet: walls in the text colour, room names
 * in mono, a north arrow and a 5 m scale bar. Tokens only (currentColor), so it inks itself in
 * either mode.
 */
export function PlanDrawing({ rooms, label, pick }: { rooms: PlanRoom[]; label: string; pick: (l: { en: string; tr: string }) => string }) {
  return (
    <svg role="img" aria-label={label} viewBox="0 0 100 70" className="block h-auto w-full bg-surface text-fg">
      <defs>
        <pattern id="kerte-hatch" width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="1.6" stroke="currentColor" strokeWidth="0.18" opacity="0.35" />
        </pattern>
      </defs>
      {/* sheet grid */}
      <g stroke="currentColor" strokeWidth="0.06" opacity="0.18">
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="70" />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} />
        ))}
      </g>
      {rooms.map((r, i) => (
        <g key={i}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={i === rooms.length - 1 ? "url(#kerte-hatch)" : "none"} stroke="currentColor" strokeWidth="0.7" />
          <text x={r.x + r.w / 2} y={r.y + r.h / 2} textAnchor="middle" dominantBaseline="middle" fontSize="2.1" className="fill-fg-muted font-mono uppercase" letterSpacing="0.12">
            {pick(r.label)}
          </text>
        </g>
      ))}
      {/* north arrow */}
      <g transform="translate(92 63)" stroke="currentColor" strokeWidth="0.3" fill="none">
        <circle r="3" />
        <path d="M0 -2.6 L1.1 1.6 L0 0.8 L-1.1 1.6 Z" fill="currentColor" />
      </g>
      {/* scale bar: 5 m = 20 units at 1:200 on this sheet */}
      <g transform="translate(4 64)" className="text-fg">
        <rect x="0" y="0" width="10" height="1.2" fill="currentColor" />
        <rect x="10" y="0" width="10" height="1.2" fill="none" stroke="currentColor" strokeWidth="0.25" />
        <text x="0" y="4.6" fontSize="2" className="fill-fg-muted font-mono">0</text>
        <text x="20" y="4.6" fontSize="2" textAnchor="end" className="fill-fg-muted font-mono">5 m</text>
      </g>
    </svg>
  );
}
