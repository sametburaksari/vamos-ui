"use client";

import * as React from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { Button } from "./button";

export const typingDemoLabels = { play: "Play", pause: "Pause", replay: "Replay" };
export type TypingDemoLabels = typeof typingDemoLabels;

/**
 * One step of the script. A plain string is shorthand for `{ type: "type", text }`.
 * - `type`: append `text`, character by character.
 * - `delete`: backspace `count` characters (default: everything).
 * - `replace`: erase everything, then type `text` (a rewrite).
 * - `pause`: hold for `duration` ms.
 * - `set`: show `text` at once.
 */
export type TypingStep =
  | string
  | { type: "type"; text: string; speed?: number }
  | { type: "delete"; count?: number; speed?: number }
  | { type: "replace"; text: string; speed?: number }
  | { type: "pause"; duration: number }
  | { type: "set"; text: string };

export interface TypingFrame {
  text: string;
  /** Wait before this frame shows, in ms. */
  delay: number;
}

const PUNCTUATION = /[.,;:!?…—–]/;

/** Expands a script into frames (one per keystroke). Pure; exported for tests and custom players. */
export function typingFrames(steps: TypingStep[], speed = 35): TypingFrame[] {
  const frames: TypingFrame[] = [{ text: "", delay: 0 }];
  let chars: string[] = [];
  const push = (delay: number) => frames.push({ text: chars.join(""), delay });
  const typeIn = (text: string, s: number) => {
    let prev = "";
    for (const ch of Array.from(text)) {
      chars.push(ch);
      // A beat after punctuation, quicker over spaces: reads like someone typing.
      push(PUNCTUATION.test(prev) ? s * 4 : ch === " " ? s * 0.5 : s);
      prev = ch;
    }
  };
  const erase = (count: number, s: number) => {
    for (let i = 0; i < count && chars.length; i++) {
      chars.pop();
      push(s / 2);
    }
  };
  for (const raw of steps) {
    const step: Exclude<TypingStep, string> = typeof raw === "string" ? { type: "type", text: raw } : raw;
    if (step.type === "type") typeIn(step.text, step.speed ?? speed);
    else if (step.type === "delete") erase(step.count ?? chars.length, step.speed ?? speed);
    else if (step.type === "replace") {
      erase(chars.length, step.speed ?? speed);
      typeIn(step.text, step.speed ?? speed);
    } else if (step.type === "pause") push(step.duration);
    else if (step.type === "set") {
      chars = Array.from(step.text);
      push(0);
    }
  }
  return frames;
}

/** The text a script ends on — what the server renders and screen readers read. */
export const typingFinalText = (steps: TypingStep[]) => {
  const frames = typingFrames(steps, 0);
  return frames[frames.length - 1]!.text;
};

type Status = "static" | "idle" | "playing" | "paused" | "done";

export interface TypingDemoProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The script: what gets typed, paused on, deleted and rewritten. */
  steps: TypingStep[];
  /** Milliseconds per character. Default `35`. */
  speed?: number;
  /** `"in-view"` (default): start when a third of it scrolls into view. `true`: on mount. `false`: show the final text until Play. */
  autoPlay?: boolean | "in-view";
  /** Delay before an automatic start, in ms. Default `400`. */
  startDelay?: number;
  /** Start over after finishing. Default `false`. */
  loop?: boolean;
  /** Hold on the final text before looping, in ms. Default `2400`. */
  loopDelay?: number;
  /** The play / pause / replay button. Default `true` (keep it with `loop`: WCAG 2.2.2). */
  controls?: boolean;
  /** Blinking caret while typing. Default `true`. */
  cursor?: boolean;
  /** Element for the text. Default `"p"`. */
  as?: "p" | "div" | "span" | "pre";
  /** Classes for the text element. */
  textClassName?: string;
  /** Called each time the script reaches its end. */
  onComplete?: () => void;
  labels?: Partial<TypingDemoLabels>;
}

const motionOff = (el: Element | null) =>
  (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
  document.documentElement.getAttribute("data-motion") === "off" ||
  el?.closest('[data-motion="off"]') != null;

/**
 * Plays a scripted typing sequence — type, pause, delete, rewrite — for product demos and
 * heroes ("Draft → rewrite"). The server and screen readers get the final text only (the
 * animated copy is `aria-hidden`); its height is reserved, so nothing below jumps. Reduced motion
 * and `data-motion="off"` show the final text with no controls.
 *
 * ```tsx
 * <TypingDemo steps={["Hey, just checking in on", { type: "pause", duration: 600 }, { type: "replace", text: "Could you confirm Friday’s delivery?" }]} />
 * ```
 */
export const TypingDemo = /*#__PURE__*/ React.forwardRef<HTMLDivElement, TypingDemoProps>(function TypingDemo(
  {
    steps,
    speed = 35,
    autoPlay = "in-view",
    startDelay = 400,
    loop = false,
    loopDelay = 2400,
    controls = true,
    cursor = true,
    as: Text = "p",
    textClassName,
    onComplete,
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("typingDemo", typingDemoLabels, labels);
  const frames = React.useMemo(() => typingFrames(steps, speed), [steps, speed]);
  const finalText = frames[frames.length - 1]!.text;
  // Every text the script settles on (step ends), stacked invisibly: the tallest reserves the height.
  const reserve = React.useMemo(() => {
    const set = new Set<string>();
    for (let i = 1; i <= steps.length; i++) set.add(typingFinalText(steps.slice(0, i)));
    set.add(finalText);
    return [...set].filter(Boolean);
  }, [steps, finalText]);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = React.useState<Status>("static");
  const [index, setIndex] = React.useState(frames.length - 1);
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  const play = React.useCallback((from?: number) => {
    if (from != null) setIndex(from);
    setStatus("playing");
  }, []);

  // Decide on mount: static (reduced motion), waiting for the viewport, or showing the final text until Play.
  React.useEffect(() => {
    const el = rootRef.current;
    if (motionOff(el)) return;
    if (autoPlay === false) {
      setIndex(frames.length - 1);
      setStatus("done");
      return;
    }
    setIndex(0);
    setStatus("idle");
    let timer = 0;
    const start = () => {
      timer = window.setTimeout(() => play(0), startDelay);
    };
    if (autoPlay === true || typeof IntersectionObserver === "undefined" || !el) {
      start();
      return () => window.clearTimeout(timer);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames]);

  // The player: one timeout per frame.
  React.useEffect(() => {
    if (status !== "playing") return;
    if (index >= frames.length - 1) {
      setStatus("done");
      onCompleteRef.current?.();
      return;
    }
    const id = window.setTimeout(() => setIndex((i) => Math.min(frames.length - 1, i + 1)), frames[index + 1]!.delay);
    return () => window.clearTimeout(id);
  }, [status, index, frames]);

  React.useEffect(() => {
    if (status !== "done" || !loop) return;
    const id = window.setTimeout(() => play(0), loopDelay);
    return () => window.clearTimeout(id);
  }, [status, loop, loopDelay, play]);

  const animated = status !== "static";
  const shown = animated ? (frames[index]?.text ?? finalText) : finalText;
  const control =
    status === "playing"
      ? { label: t("pause"), Icon: Pause, onClick: () => setStatus("paused") }
      : status === "done"
        ? { label: t("replay"), Icon: RotateCcw, onClick: () => play(0) }
        : { label: t("play"), Icon: Play, onClick: () => play() };

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="typing-demo"
      data-state={status}
      className={cn("flex items-start gap-3", className)}
      {...props}
    >
      <Text className={cn("m-0 grid min-w-0 flex-1 whitespace-pre-wrap", textClassName)}>
        {reserve.map((text) => (
          <span key={text} aria-hidden="true" className="invisible col-start-1 row-start-1">
            {text}
          </span>
        ))}
        <span aria-hidden="true" className="col-start-1 row-start-1">
          {shown}
          {cursor && animated && status !== "done" ? (
            <span className="ms-0.5 inline-block h-[1em] w-0.5 translate-y-[0.15em] bg-accent motion-safe:animate-pulse" />
          ) : null}
        </span>
        <span className="sr-only">{finalText}</span>
      </Text>
      {controls && animated ? (
        <Button variant="ghost" size="icon-sm" aria-label={control.label} title={control.label} onClick={control.onClick} className="shrink-0">
          <control.Icon aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
});
