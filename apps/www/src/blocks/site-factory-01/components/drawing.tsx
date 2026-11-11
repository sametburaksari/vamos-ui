"use client";

import * as React from "react";

/**
 * Engineering drawings in tokens: outlines in `fg`, centre lines dash-dot, sections hatched, and
 * dimensions in accent ink. Decorative unless `label` is given.
 */
export function Drawing({ kind, label, dims, className }: { kind: "flange" | "housing" | "fitting" | "shaft"; label?: string; dims?: string[]; className?: string }) {
  const hatchId = React.useId().replace(/:/g, "");
  const line = "fill-none stroke-fg";
  const center = "fill-none stroke-fg-muted";
  const dim = "fill-none stroke-accent-ink";
  const txt = "fill-accent-ink font-mono text-[11px]";
  const d = dims ?? [];
  return (
    <svg viewBox="0 0 480 300" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={className}>
      <defs>
        <pattern id={hatchId} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" className="stroke-fg-muted" strokeWidth="1" />
        </pattern>
      </defs>
      {kind === "flange" ? (
        <g>
          {/* Front view */}
          <circle cx="130" cy="150" r="100" className={line} strokeWidth="2" />
          <circle cx="130" cy="150" r="76" className={center} strokeWidth="0.75" strokeDasharray="14 3 2 3" />
          <circle cx="130" cy="150" r="40" className={line} strokeWidth="2" />
          <circle cx="130" cy="150" r="30" className={line} strokeWidth="1.25" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4 + Math.PI / 8;
            return <circle key={i} cx={(130 + 76 * Math.cos(a)).toFixed(2)} cy={(150 + 76 * Math.sin(a)).toFixed(2)} r="8" className={line} strokeWidth="1.5" />;
          })}
          <path d="M20 150 H240 M130 40 V260" className={center} strokeWidth="0.75" strokeDasharray="14 3 2 3" />
          {/* Section view */}
          <path d={`M300 50 H322 V120 H348 L362 132 V168 L348 180 H322 V250 H300 Z`} fill={`url(#${hatchId})`} className={line} strokeWidth="2" />
          <path d="M290 150 H380" className={center} strokeWidth="0.75" strokeDasharray="14 3 2 3" />
          {/* Dimensions */}
          <path d="M405 50 V250 M399 50 H411 M399 250 H411" className={dim} strokeWidth="1" />
          <text x="420" y="154" className={txt}>
            Ø{d[0] ?? "D"}
          </text>
          <path d="M300 272 H322 M300 266 V278 M322 266 V278" className={dim} strokeWidth="1" />
          <text x="311" y="292" textAnchor="middle" className={txt}>
            {d[1] ?? "b"}
          </text>
          <path d="M54 270 L206 270" className={dim} strokeWidth="1" />
          <text x="130" y="290" textAnchor="middle" className={txt}>
            K {d[2] ?? ""}
          </text>
        </g>
      ) : null}
      {kind === "housing" ? (
        <g>
          <path d="M40 250 H440 V226 H360 Q352 120 240 100 Q128 120 120 226 H40 Z" className={line} strokeWidth="2" />
          <circle cx="240" cy="178" r="56" fill={`url(#${hatchId})`} className={line} strokeWidth="2" />
          <circle cx="240" cy="178" r="34" className="fill-scene stroke-fg" strokeWidth="2" />
          <path d="M60 238 H100 M380 238 H420" className={line} strokeWidth="1.5" />
          <path d="M80 220 V256 M400 220 V256" className={center} strokeWidth="0.75" strokeDasharray="10 3 2 3" />
          <path d="M240 60 V270 M150 178 H330" className={center} strokeWidth="0.75" strokeDasharray="14 3 2 3" />
          <path d="M80 280 H400 M80 274 V286 M400 274 V286" className={dim} strokeWidth="1" />
          <text x="240" y="297" textAnchor="middle" className={txt}>
            J {d[0] ?? ""}
          </text>
          <path d="M458 178 V250 M452 178 H464 M452 250 H464" className={dim} strokeWidth="1" />
          <text x="452" y="168" textAnchor="end" className={txt}>
            H {d[1] ?? ""}
          </text>
        </g>
      ) : null}
      {kind === "fitting" ? (
        <g>
          <path d="M60 120 H140 V100 H200 V120 H300 L320 112 H420 V188 H320 L300 180 H200 V200 H140 V180 H60 Z" className={line} strokeWidth="2" />
          <path d="M60 135 H140 M60 165 H140" className={line} strokeWidth="0.75" />
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${66 + i * 8} 120 l4 -6 l4 6`} className={line} strokeWidth="0.75" />
          ))}
          <path d="M200 132 H420 V168 H200 Z" fill={`url(#${hatchId})`} className={line} strokeWidth="1" />
          <path d="M40 150 H440" className={center} strokeWidth="0.75" strokeDasharray="14 3 2 3" />
          <path d="M60 240 H420 M60 234 V246 M420 234 V246" className={dim} strokeWidth="1" />
          <text x="240" y="262" textAnchor="middle" className={txt}>
            L {d[0] ?? ""}
          </text>
          <path d="M140 70 H200 M140 64 V76 M200 64 V76" className={dim} strokeWidth="1" />
          <text x="170" y="58" textAnchor="middle" className={txt}>
            S {d[1] ?? ""}
          </text>
        </g>
      ) : null}
      {kind === "shaft" ? (
        <g>
          <path d="M40 130 H120 V118 H360 V130 H440 V170 H360 V182 H120 V170 H40 Z" className={line} strokeWidth="2" />
          <path d="M120 124 H360 M120 176 H360" className="fill-none stroke-accent-ink" strokeWidth="3" strokeOpacity="0.45" />
          <path d="M20 150 H460" className={center} strokeWidth="0.75" strokeDasharray="14 3 2 3" />
          <path d="M240 118 V182" className={line} strokeWidth="0.75" strokeDasharray="4 3" />
          <path d="M470 118 V182 M464 118 H476 M464 182 H476" className={dim} strokeWidth="1" />
          <text x="462" y="110" textAnchor="end" className={txt}>
            Ø {d[0] ?? ""}
          </text>
          <path d="M40 230 H440 M40 224 V236 M440 224 V236" className={dim} strokeWidth="1" />
          <text x="240" y="252" textAnchor="middle" className={txt}>
            {d[1] ?? "L"}
          </text>
        </g>
      ) : null}
    </svg>
  );
}
