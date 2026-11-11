"use client";

// Hand-built picture-book illustrations: pastel token fills under one fg outline, so every
// drawing follows light/dark mode and the site accent. Decorative unless given a title.
import * as React from "react";
import { ink, type Doctor, type Hair, type SceneId } from "./content";

const S = { stroke: ink.line, strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** True when the visitor asked for less motion (checked after mount). */
export function useReducedMotion() {
  const [reduced, setReduced] = React.useState(true);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return reduced;
}

// ------------------------------------------------------------------ pieces

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 30 C-2 14 16 6 26 14 C30 0 54 -2 60 14 C74 8 88 18 84 30 Z" fill={ink.cloud} {...S} />
    </g>
  );
}

function Kite({ x, y, s = 1, fill = ink.kite, tail = true, sway = false }: { x: number; y: number; s?: number; fill?: string; tail?: boolean; sway?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g>
        {sway ? <animateTransform attributeName="transform" type="rotate" values="-5 0 40;5 0 40;-5 0 40" dur="5s" repeatCount="indefinite" /> : null}
        <path d="M0 0 L30 38 L0 92 L-30 38 Z" fill={fill} {...S} />
        <path d="M0 0 V92 M-30 38 H30" fill="none" {...S} strokeWidth={2} />
        {tail ? (
          <>
            <path d="M0 92 C14 112 -14 126 2 146 C14 162 -6 174 6 190" fill="none" {...S} strokeWidth={2.5} />
            <path d="M-8 116 L0 122 L-8 128 Z M8 148 L0 154 L8 160 Z M-6 176 L2 182 L-6 188 Z" fill={ink.sun} {...S} strokeWidth={2} />
          </>
        ) : null}
      </g>
    </g>
  );
}

function Hairdo({ hair, cx, cy, r }: { hair: Hair; cx: number; cy: number; r: number }) {
  const k = r / 34;
  const t = `translate(${cx} ${cy}) scale(${k})`;
  if (hair === "bun")
    return (
      <g transform={t}>
        <circle cx={0} cy={-44} r={14} fill={ink.hair} {...S} />
        <path d="M-34 4 C-38 -30 -14 -38 0 -38 C18 -38 38 -28 34 4 C26 -12 10 -20 -6 -20 C-20 -18 -30 -8 -34 4 Z" fill={ink.hair} {...S} />
      </g>
    );
  if (hair === "short")
    return (
      <g transform={t}>
        <path d="M-34 -2 C-36 -30 -16 -40 2 -38 C22 -38 36 -26 34 -2 C30 -16 22 -22 10 -22 C0 -14 -20 -16 -34 -2 Z" fill={ink.hair} {...S} />
      </g>
    );
  if (hair === "curly")
    return (
      <g transform={t} fill={ink.hair} {...S}>
        {[[-30, -8], [-26, -26], [-12, -36], [6, -38], [22, -32], [32, -16], [34, 2], [-34, 8]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={12} />
        ))}
      </g>
    );
  return (
    <g transform={t}>
      <path d="M-38 30 C-44 -10 -30 -38 0 -38 C30 -38 44 -10 38 30 L28 30 C30 6 22 -14 6 -18 C-8 -8 -22 -6 -28 0 C-30 10 -30 22 -28 30 Z" fill={ink.hair} {...S} />
    </g>
  );
}

function Face({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const k = r / 34;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${k})`}>
      <circle cx={-12} cy={2} r={3.5} fill={ink.line} />
      <circle cx={12} cy={2} r={3.5} fill={ink.line} />
      <circle cx={-20} cy={14} r={5} fill={ink.kiteSoft} />
      <circle cx={20} cy={14} r={5} fill={ink.kiteSoft} />
      <path d="M-9 14 C-4 21 4 21 9 14" fill="none" {...S} strokeWidth={3} />
    </g>
  );
}

/** A small child: x/y is the feet centre. */
interface KidProps {
  x: number;
  y: number;
  s?: number;
  shirt?: string;
  skin?: string;
  hair?: Hair;
  arm?: "down" | "up" | "hold";
}

function Kid({ x, y, s = 1, shirt = ink.berry, skin = ink.skin1, hair = "short", arm = "down" }: KidProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-10 -4 V-34 M10 -4 V-34" fill="none" {...S} strokeWidth={6} />
      <path d="M-16 -2 H-4 M4 -2 H16" fill="none" {...S} strokeWidth={6} />
      {arm === "up" ? <path d="M18 -70 C30 -84 34 -98 38 -112" fill="none" {...S} strokeWidth={6} /> : arm === "hold" ? <path d="M18 -70 C30 -66 36 -60 40 -54" fill="none" {...S} strokeWidth={6} /> : <path d="M18 -72 C24 -60 26 -52 26 -44" fill="none" {...S} strokeWidth={6} />}
      <path d="M-18 -72 C-24 -60 -26 -52 -26 -44" fill="none" {...S} strokeWidth={6} />
      <path d="M-22 -36 C-24 -60 -20 -80 0 -80 C20 -80 24 -60 22 -36 Z" fill={shirt} {...S} />
      <circle cx={0} cy={-104} r={24} fill={skin} {...S} />
      <Hairdo hair={hair} cx={0} cy={-104} r={24} />
      <Face cx={0} cy={-102} r={24} />
    </g>
  );
}

/** A grown-up in a white coat: x/y is the feet centre. */
interface GrownProps {
  x: number;
  y: number;
  s?: number;
  skin?: string;
  hair?: Hair;
  tone?: string;
  tool?: "none" | "steth";
}

function Grown({ x, y, s = 1, skin = ink.skin2, hair = "bun", tone = ink.mint, tool = "none" }: GrownProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14 -4 V-60 M14 -4 V-60" fill="none" {...S} strokeWidth={8} />
      <path d="M-30 -56 C-34 -100 -28 -136 0 -136 C28 -136 34 -100 30 -56 Z" fill={ink.coat} {...S} />
      <path d="M-12 -136 L0 -112 L12 -136" fill={tone} {...S} strokeWidth={2.5} />
      <path d="M0 -112 V-60" fill="none" {...S} strokeWidth={2} />
      {tool === "steth" ? <path d="M-10 -134 C-18 -110 -6 -96 4 -96 M10 -134 C18 -110 12 -100 4 -96 M4 -96 V-88" fill="none" {...S} strokeWidth={2.5} /> : null}
      {tool === "steth" ? <circle cx={4} cy={-84} r={5} fill={ink.blue} {...S} strokeWidth={2} /> : null}
      <circle cx={0} cy={-162} r={28} fill={skin} {...S} />
      <Hairdo hair={hair} cx={0} cy={-162} r={28} />
      <Face cx={0} cy={-160} r={28} />
    </g>
  );
}

function Teddy({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const fur = ink.sun;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fur} {...S} strokeWidth={2.5}>
      <circle cx={-14} cy={-58} r={8} />
      <circle cx={14} cy={-58} r={8} />
      <ellipse cx={0} cy={-20} rx={18} ry={20} />
      <circle cx={0} cy={-46} r={16} />
      <circle cx={-5} cy={-48} r={1.6} fill={ink.line} stroke="none" />
      <circle cx={5} cy={-48} r={1.6} fill={ink.line} stroke="none" />
      <ellipse cx={0} cy={-40} rx={5} ry={3.5} fill={ink.sand} />
    </g>
  );
}

function Star({ x, y, r = 14, fill = ink.sun }: { x: number; y: number; r?: number; fill?: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.48 : r;
    return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
  return <polygon points={pts} fill={fill} {...S} strokeWidth={2.5} />;
}

// ------------------------------------------------------------------ compositions

/** Hero: hills, a small round-windowed clinic, a child flying the kite that names the place. */
export function HeroScene({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <svg viewBox="0 0 640 560" className={className} aria-hidden focusable="false">
      <rect x={6} y={6} width={628} height={548} rx={56} fill={ink.sky} {...S} />
      <clipPath id="pk-hero-clip">
        <rect x={6} y={6} width={628} height={548} rx={56} />
      </clipPath>
      <g clipPath="url(#pk-hero-clip)">
        <circle cx={520} cy={112} r={50} fill={ink.sun} {...S} />
        <Cloud x={70} y={70} s={1.1} />
        <Cloud x={360} y={170} s={0.8} />
        <path d="M-20 420 C120 340 260 360 360 400 C460 440 560 380 680 360 V600 H-20 Z" fill={ink.hill} {...S} />
        <path d="M-20 480 C140 440 300 470 420 500 C520 524 600 490 680 470 V600 H-20 Z" fill={ink.hillDeep} {...S} />
        {/* clinic */}
        <g transform="translate(420 322)">
          <rect x={0} y={40} width={150} height={110} rx={18} fill={ink.paper} {...S} />
          <path d="M-12 50 L75 -10 L162 50 Z" fill={ink.kite} {...S} />
          <circle cx={75} cy={22} r={13} fill={ink.sky} {...S} strokeWidth={2.5} />
          <rect x={56} y={86} width={38} height={64} rx={19} fill={ink.blue} {...S} />
          <circle cx={30} cy={84} r={14} fill={ink.sky} {...S} strokeWidth={2.5} />
          <circle cx={120} cy={84} r={14} fill={ink.sky} {...S} strokeWidth={2.5} />
        </g>
        {/* string from hand to kite */}
        <path d="M222 336 C250 250 210 190 196 150" fill="none" stroke={ink.line} strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" />
        <Kite x={190} y={60} s={1} sway={!reduced} />
        <Kid x={186} y={470} s={1.15} shirt={ink.berry} hair="curly" skin={ink.skin3} arm="up" />
        <Kite x={560} y={250} s={0.32} fill={ink.blue} tail={false} />
      </g>
    </svg>
  );
}

/** Round illustrated portrait for a clinician. */
export function DoctorAvatar({ doctor, className }: { doctor: Doctor; className?: string }) {
  const skin = ink[doctor.skin];
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden focusable="false">
      <clipPath id={`pk-av-${doctor.id}`}>
        <circle cx={80} cy={80} r={76} />
      </clipPath>
      <circle cx={80} cy={80} r={76} fill={ink[doctor.tone]} {...S} />
      <g clipPath={`url(#pk-av-${doctor.id})`}>
        <path d="M14 170 C16 128 40 112 80 112 C120 112 144 128 146 170 Z" fill={ink.coat} {...S} />
        <path d="M66 112 L80 136 L94 112" fill={ink[doctor.tone]} {...S} strokeWidth={2.5} />
        {doctor.id !== "tan" ? <path d="M60 114 C52 138 66 150 80 150 C94 150 104 138 98 114" fill="none" {...S} strokeWidth={2.5} /> : null}
        <rect x={70} y={92} width={20} height={24} rx={8} fill={skin} {...S} strokeWidth={2.5} />
      </g>
      <circle cx={80} cy={72} r={34} fill={skin} {...S} />
      <Hairdo hair={doctor.hair} cx={80} cy={72} r={34} />
      <Face cx={80} cy={74} r={34} />
    </svg>
  );
}

function Room({ wall, children }: { wall: string; children: React.ReactNode }) {
  return (
    <>
      <rect x={4} y={4} width={472} height={312} rx={40} fill={wall} {...S} />
      <path d="M4 250 H476 V276 C476 298 458 316 436 316 H44 C22 316 4 298 4 276 Z" fill={ink.floor} {...S} />
      {children}
    </>
  );
}

/** One storybook page (visit page). */
export function StoryScene({ id, className, title }: { id: SceneId; className?: string; title?: string }) {
  const reduced = useReducedMotion();
  const label = title ? { role: "img", "aria-label": title } : { "aria-hidden": true as const };
  return (
    <svg viewBox="0 0 480 320" className={className} focusable="false" {...label}>
      {id === "door" ? (
        <Room wall={ink.sky}>
          <path d="M60 4 C60 30 80 40 80 40 M200 4 C196 26 210 36 210 36 M330 4 C334 24 322 34 322 34" fill="none" stroke={ink.line} strokeWidth={1.5} strokeDasharray="2 5" />
          <Kite x={80} y={34} s={0.34} fill={ink.blue} tail={false} />
          <Kite x={210} y={30} s={0.34} fill={ink.kite} tail={false} sway={!reduced} />
          <Kite x={322} y={30} s={0.34} fill={ink.plum} tail={false} />
          <rect x={44} y={106} width={96} height={146} rx={48} fill={ink.blue} {...S} />
          <circle cx={92} cy={150} r={18} fill={ink.sky} {...S} />
          <circle cx={122} cy={190} r={4} fill={ink.line} />
          <rect x={286} y={170} width={170} height={82} rx={18} fill={ink.sand} {...S} />
          <Grown x={372} y={236} s={0.62} skin={ink.skin1} hair="bob" tone={ink.berry} />
          <rect x={286} y={170} width={170} height={82} rx={18} fill={ink.sand} {...S} />
          <Kid x={210} y={276} s={0.95} shirt={ink.mint} hair="bun" skin={ink.skin2} />
        </Room>
      ) : id === "toy" ? (
        <Room wall={ink.mint}>
          <Cloud x={340} y={50} s={0.8} />
          <rect x={44} y={60} width={120} height={84} rx={16} fill={ink.paper} {...S} />
          <path d="M60 120 L90 88 L112 110 L128 96 L150 120" fill="none" {...S} />
          <circle cx={136} cy={78} r={8} fill={ink.sun} {...S} strokeWidth={2} />
          <Kid x={200} y={276} s={1} shirt={ink.blue} hair="short" skin={ink.skin1} arm="hold" />
          <Teddy x={250} y={236} s={0.9} />
          <Teddy x={380} y={276} s={1.1} />
          <path d="M340 200 C350 186 366 186 372 196" fill="none" {...S} strokeWidth={2} />
          <circle cx={380} cy={176} r={0} />
        </Room>
      ) : id === "scale" ? (
        <Room wall={ink.sand}>
          {/* giraffe height chart */}
          <g transform="translate(300 250)">
            <path d="M0 0 V-170 C0 -196 10 -206 30 -206 L56 -206 C64 -206 66 -196 58 -192 L36 -184 V0" fill={ink.sun} {...S} />
            {[[10, -40], [22, -84], [8, -120], [24, -150]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={6} fill={ink.sand} {...S} strokeWidth={2} />
            ))}
            <circle cx={40} cy={-198} r={2.5} fill={ink.line} />
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} d={`M42 ${-20 - i * 20} h12`} {...S} strokeWidth={2} />
            ))}
          </g>
          <rect x={170} y={256} width={92} height={16} rx={8} fill={ink.paper} {...S} />
          <Kid x={216} y={256} s={1.05} shirt={ink.kiteSoft} hair="bob" skin={ink.skin3} />
          <path d="M248 140 H290" fill="none" stroke={ink.line} strokeWidth={2} strokeDasharray="4 6" />
          <Kite x={80} y={70} s={0.5} fill={ink.blue} tail />
        </Room>
      ) : id === "listen" ? (
        <Room wall={ink.plum}>
          <rect x={40} y={60} width={100} height={70} rx={14} fill={ink.paper} {...S} />
          <path d="M58 98 H74 L82 80 L92 114 L100 98 H122" fill="none" {...S} strokeWidth={2.5} />
          <Grown x={310} y={276} s={0.98} skin={ink.skin1} hair="bun" tone={ink.mint} tool="steth" />
          <path d="M286 172 C262 176 246 182 232 196" fill="none" {...S} strokeWidth={6} />
          <Kid x={200} y={276} s={1} shirt={ink.sun} hair="curly" skin={ink.skin2} />
          <circle cx={232} cy={196} r={7} fill={ink.blue} {...S} strokeWidth={2} />
          <path d="M150 140 C140 130 140 116 152 114 C160 112 164 120 164 120 C164 120 168 112 176 114 C188 116 188 130 178 140 L164 152 Z" fill={ink.kite} {...S} strokeWidth={2.5} />
        </Room>
      ) : id === "ears" ? (
        <Room wall={ink.blue}>
          <Cloud x={60} y={44} s={0.7} />
          <Grown x={320} y={276} s={0.98} skin={ink.skin2} hair="short" tone={ink.blue} />
          <path d="M296 172 C276 170 262 166 250 160" fill="none" {...S} strokeWidth={6} />
          <rect x={232} y={150} width={26} height={12} rx={6} fill={ink.sun} {...S} strokeWidth={2} />
          <path d="M232 156 L198 142 L198 172 Z" fill={ink.sun} opacity={0.55} />
          <Kid x={176} y={276} s={1} shirt={ink.mint} hair="bun" skin={ink.skin1} />
        </Room>
      ) : (
        <Room wall={ink.berry}>
          <rect x={250} y={150} width={190} height={100} rx={14} fill={ink.sand} {...S} />
          <rect x={262} y={118} width={166} height={46} rx={10} fill={ink.paper} {...S} />
          <Star x={290} y={140} r={12} />
          <Star x={330} y={136} r={10} fill={ink.blue} />
          <Kite x={372} y={122} s={0.22} fill={ink.kite} tail={false} />
          <Star x={408} y={140} r={11} fill={ink.mint} />
          <rect x={330} y={196} width={30} height={10} rx={5} fill={ink.paper} {...S} strokeWidth={2} />
          <Kid x={170} y={276} s={1.05} shirt={ink.blue} hair="curly" skin={ink.skin3} arm="up" />
          <Star x={208} y={104} r={18} />
          <path d="M226 84 l8 -8 M232 100 h12 M222 70 l2 -12" {...S} strokeWidth={2.5} />
        </Room>
      )}
    </svg>
  );
}

/** Small kite mark used in the wordmark and as list bullets. */
export function KiteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-34 -4 68 100" className={className} aria-hidden focusable="false">
      <path d="M0 0 L30 38 L0 92 L-30 38 Z" fill={ink.kite} stroke={ink.line} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
}
