"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Check, CloudUpload, Pencil } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useLatest } from "../lib/use-controllable-state";
import { focusFirstInvalid } from "../lib/field-context";
import { Button } from "../components/button";
import { Alert } from "../components/alert";
import { Stepper, type StepItem } from "../components/stepper";

export const multiStepFormLabels = {
  back: "Back",
  next: "Next",
  submit: "Submit",
  submitting: "Submitting…",
  saveDraft: "Save draft",
  savingDraft: "Saving…",
  draftSaved: "Draft saved {time}",
  draftFailed: "Draft not saved",
  step: "Step {current} of {total}",
  stepHeading: "Step {current} of {total}: {title}",
  optional: "Optional",
  fixErrors: "Check this step",
  submitFailed: "Couldn't submit",
  edit: "Edit {title}",
  review: "Review",
  leave: "You have unsaved changes. Leave anyway?",
};
export type MultiStepFormLabels = typeof multiStepFormLabels;

export type MultiStepStatus = "upcoming" | "current" | "complete" | "error";

export interface StepDef<C = unknown> {
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
  /** Conditional step: hidden (and skipped) while it returns `false`. Receives `context`. */
  when?: (ctx: C) => boolean;
  /** Runs on Next. `true` passes; a string is the summary error shown at the top of the step. */
  validate?: () => true | string | Promise<true | string>;
}

export interface MultiStepFormProps<C = unknown> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "defaultValue"> {
  steps: StepDef<C>[];
  /** Current step id (controlled). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Passed to `when` of conditional steps (usually the form values). */
  context?: C;
  /** Can't jump ahead past an invalid or unvisited step. Default `true`. */
  linear?: boolean;
  /** Runs on Submit (the last step). Throw to show the error and stay on the step. */
  onComplete: () => Promise<void> | void;
  onSaveDraft?: () => Promise<void> | void;
  /** Saves the draft every `intervalMs` (needs `onSaveDraft`). */
  autosave?: { intervalMs: number };
  /** `"page"`: sticky footer. `"dialog"`: footer in flow (put the form inside `DialogBody`). Default `"page"`. */
  presentation?: "page" | "dialog";
  orientation?: "horizontal" | "vertical";
  /** Mirror the step in the URL (`?step=contract`), so a reload or a shared link resumes there. */
  syncUrl?: boolean | { key: string };
  /** Warn before closing the tab until the form is submitted. */
  confirmLeave?: boolean;
  labels?: Partial<MultiStepFormLabels>;
  children?: React.ReactNode;
}

interface Ctx {
  steps: StepDef[];
  visible: StepDef[];
  current: StepDef;
  index: number;
  status: Record<string, MultiStepStatus>;
  errors: Record<string, string | undefined>;
  isFirst: boolean;
  isLast: boolean;
  submitting: boolean;
  validating: boolean;
  submitError: string | null;
  draft: { state: "idle" | "saving" | "saved" | "error"; at?: number };
  canSaveDraft: boolean;
  linear: boolean;
  presentation: "page" | "dialog";
  orientation: "horizontal" | "vertical";
  next(): Promise<void>;
  back(): void;
  goTo(id: string): void;
  saveDraft(): Promise<void>;
  canGoTo(id: string): boolean;
  t: LabelFn<MultiStepFormLabels>;
  headingRef: React.MutableRefObject<HTMLHeadingElement | null>;
}

const MultiStepFormContext = /*#__PURE__*/ React.createContext<Ctx | null>(null);

function useCtx(part: string): Ctx {
  const ctx = React.useContext(MultiStepFormContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <MultiStepForm>.`);
  return ctx;
}

/** State and navigation of the surrounding `MultiStepForm`. */
export function useMultiStepForm() {
  const c = useCtx("useMultiStepForm");
  return {
    current: c.current.id,
    index: c.index,
    total: c.visible.length,
    steps: c.visible,
    next: c.next,
    back: c.back,
    goTo: c.goTo,
    saveDraft: c.saveDraft,
    isFirst: c.isFirst,
    isLast: c.isLast,
    status: c.status,
    submitting: c.submitting,
  };
}

function urlKey(syncUrl: MultiStepFormProps["syncUrl"]): string | null {
  if (!syncUrl) return null;
  return typeof syncUrl === "object" ? syncUrl.key : "step";
}

function MultiStepFormInner<C>(props: MultiStepFormProps<C>, ref: React.ForwardedRef<HTMLFormElement>) {
  const {
    steps,
    value,
    defaultValue,
    onValueChange,
    context,
    linear = true,
    onComplete,
    onSaveDraft,
    autosave,
    presentation = "page",
    orientation = "horizontal",
    syncUrl,
    confirmLeave,
    labels,
    className,
    children,
    ...formProps
  } = props;
  const t = useLabels("multiStepForm", multiStepFormLabels, labels);
  const visible = React.useMemo(() => steps.filter((s) => !s.when || s.when(context as C)), [steps, context]);
  const key = urlKey(syncUrl);

  const [inner, setInner] = React.useState<string>(() => defaultValue ?? steps[0]?.id ?? "");
  // Resume from the URL after mount (keeps server and client markup identical).
  React.useEffect(() => {
    if (!key) return;
    const fromUrl = new URLSearchParams(window.location.search).get(key);
    if (fromUrl && steps.some((s) => s.id === fromUrl)) {
      if (value === undefined) setInner(fromUrl);
      onValueChange?.(fromUrl);
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const currentId = value ?? inner;
  const index = Math.max(0, visible.findIndex((s) => s.id === currentId));
  const current = visible[index] ?? visible[0]!;

  const [completed, setCompleted] = React.useState<Set<string>>(() => new Set());
  const [errors, setErrors] = React.useState<Record<string, string | undefined>>({});
  const [validating, setValidating] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Ctx["draft"]>({ state: "idle" });
  const [done, setDone] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const moved = React.useRef(false);

  const setStep = React.useCallback(
    (id: string) => {
      moved.current = true;
      if (value === undefined) setInner(id);
      onValueChange?.(id);
      setSubmitError(null);
      if (key && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set(key, id);
        window.history.replaceState(window.history.state, "", url);
      }
    },
    [value, onValueChange, key],
  );

  // Focus the step heading after a step change (announced as "Step 3 of 6: Contract").
  React.useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    headingRef.current?.focus({ preventScroll: false });
  }, [current?.id]);

  const runValidate = async (step: StepDef<C>): Promise<boolean> => {
    if (!step.validate) return true;
    setValidating(true);
    try {
      const r = await step.validate();
      setErrors((e) => ({ ...e, [step.id]: r === true ? undefined : r }));
      if (r !== true) {
        requestAnimationFrame(() => {
          const panel = formRef.current?.querySelector<HTMLElement>(`[data-step-panel="${step.id}"]`);
          if (!focusFirstInvalid(panel)) panel?.querySelector<HTMLElement>("[data-msf-error]")?.focus();
        });
      }
      return r === true;
    } finally {
      setValidating(false);
    }
  };

  const isLast = index === visible.length - 1;

  const next = async () => {
    if (submitting || validating) return;
    const ok = await runValidate(current);
    if (!ok) return;
    setCompleted((s) => new Set(s).add(current.id));
    if (!isLast) {
      setStep(visible[index + 1]!.id);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onComplete();
      setDone(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };
  const back = () => {
    if (index > 0 && !submitting) setStep(visible[index - 1]!.id);
  };
  const canGoTo = (id: string) => {
    if (submitting) return false;
    const target = visible.findIndex((s) => s.id === id);
    if (target < 0) return false;
    if (!linear || target <= index) return true;
    // Linear: every step before the target must be complete.
    return visible.slice(0, target).every((s) => completed.has(s.id) && !errors[s.id]);
  };
  const goTo = (id: string) => {
    if (canGoTo(id)) setStep(id);
  };

  const saveRef = useLatest(onSaveDraft);
  const saveDraft = React.useCallback(async () => {
    if (!saveRef.current) return;
    setDraft((d) => ({ ...d, state: "saving" }));
    try {
      await saveRef.current();
      setDraft({ state: "saved", at: Date.now() });
    } catch {
      setDraft({ state: "error" });
    }
  }, [saveRef]);

  React.useEffect(() => {
    if (!autosave || !onSaveDraft || done) return;
    const id = setInterval(() => void saveDraft(), Math.max(2000, autosave.intervalMs));
    return () => clearInterval(id);
  }, [autosave?.intervalMs, onSaveDraft, saveDraft, done]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!confirmLeave || done) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = t("leave");
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [confirmLeave, done, t]);

  const status: Record<string, MultiStepStatus> = {};
  visible.forEach((s, i) => {
    status[s.id] = errors[s.id] ? "error" : i === index ? "current" : completed.has(s.id) ? "complete" : "upcoming";
  });

  const ctx: Ctx = {
    steps: steps as StepDef[],
    visible: visible as StepDef[],
    current: current as StepDef,
    index,
    status,
    errors,
    isFirst: index === 0,
    isLast,
    submitting,
    validating,
    submitError,
    draft,
    canSaveDraft: !!onSaveDraft,
    linear,
    presentation,
    orientation,
    next,
    back,
    goTo,
    saveDraft,
    canGoTo,
    t,
    headingRef,
  };

  return (
    <MultiStepFormContext.Provider value={ctx}>
      <form
        ref={(node) => {
          formRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        noValidate
        data-slot="multi-step-form"
        data-presentation={presentation}
        data-orientation={orientation}
        aria-busy={submitting || undefined}
        className={cn(
          "vui-msf flex min-w-0 flex-col gap-6",
          orientation === "vertical" && "md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-x-10",
          className,
        )}
        onSubmit={(e) => {
          e.preventDefault();
          void next();
        }}
        onKeyDown={(e) => {
          // Enter in a single-line field moves to the next step instead of submitting everything.
          const el = e.target as HTMLElement;
          if (e.key !== "Enter" || e.shiftKey || e.altKey || e.nativeEvent.isComposing) return;
          if (el.tagName === "INPUT" && !["checkbox", "radio", "button", "submit", "file"].includes((el as HTMLInputElement).type)) {
            e.preventDefault();
            void next();
          }
        }}
        {...formProps}
      >
        {children}
      </form>
    </MultiStepFormContext.Provider>
  );
}

/**
 * A long form split into steps: per-step validation, conditional steps, draft saving, a review
 * step and URL resume. Form-library agnostic — each step exposes `validate()`.
 *
 * ```tsx
 * <MultiStepForm steps={steps} onComplete={submit}>
 *   <MultiStepFormStepper />
 *   <MultiStepFormStep id="identity">…fields…</MultiStepFormStep>
 *   <MultiStepFormStep id="review"><MultiStepFormReview>…</MultiStepFormReview></MultiStepFormStep>
 *   <MultiStepFormFooter />
 * </MultiStepForm>
 * ```
 */
export const MultiStepForm = /*#__PURE__*/ React.forwardRef(MultiStepFormInner) as <C = unknown>(
  props: MultiStepFormProps<C> & { ref?: React.Ref<HTMLFormElement> },
) => React.ReactElement;

/* ------------------------------------------------------------------ */
/* Stepper                                                             */
/* ------------------------------------------------------------------ */

export interface MultiStepFormStepperProps {
  /** Stepper look. Default `"numbered"` (switches to compact on small screens). */
  variant?: "numbered" | "compact" | "bar" | "dots";
  className?: string;
}

/** The progress display (kit `Stepper`), wired to the form: completed steps are clickable. */
export function MultiStepFormStepper({ variant = "numbered", className }: MultiStepFormStepperProps) {
  const c = useCtx("MultiStepFormStepper");
  const items: StepItem[] = c.visible.map((s) => ({
    id: s.id,
    title: s.title,
    description: c.orientation === "vertical" ? s.description : undefined,
    optional: s.optional,
    status: c.status[s.id] === "error" ? "error" : undefined,
    disabled: !c.canGoTo(s.id),
  }));
  return (
    <Stepper
      data-slot="multi-step-form-stepper"
      value={c.index}
      steps={items}
      orientation={c.orientation}
      variant={variant}
      loading={c.validating || c.submitting}
      navigable={(i) => i !== c.index && c.canGoTo(c.visible[i]!.id)}
      onValueChange={(i) => c.goTo(c.visible[i]!.id)}
      className={cn(c.orientation === "vertical" && "md:row-span-3 md:sticky md:top-4 md:self-start", className)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Step                                                                */
/* ------------------------------------------------------------------ */

export interface MultiStepFormStepProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  id: string;
  /** Hide the built-in heading (render your own `h2` with `useMultiStepForm`). */
  hideHeading?: boolean;
  /** Keep the step mounted while hidden (keeps uncontrolled field values). Default `true`. */
  keepMounted?: boolean;
}

/** One step's content. Shows its heading ("Step 2 of 5" + title) and the error summary. */
export function MultiStepFormStep({ id, hideHeading, keepMounted = true, className, children, ...props }: MultiStepFormStepProps) {
  const c = useCtx("MultiStepFormStep");
  const step = c.visible.find((s) => s.id === id);
  if (!step) return null;
  const active = c.current.id === id;
  if (!active && !keepMounted) return null;
  const position = c.visible.indexOf(step) + 1;
  const error = c.errors[id];
  const headingId = `msf-${id}-heading`;
  return (
    <section
      data-slot="multi-step-form-step"
      data-step-panel={id}
      hidden={!active}
      aria-labelledby={headingId}
      className={cn("min-w-0", active && "vui-msf-step-in", className)}
      {...props}
    >
      <fieldset disabled={c.submitting} className="m-0 min-w-0 border-0 p-0">
        {hideHeading ? (
          <h2 id={headingId} className="sr-only" tabIndex={-1} ref={active ? c.headingRef : undefined}>
            {c.t("stepHeading", { current: position, total: c.visible.length, title: step.title })}
          </h2>
        ) : (
          <header className="mb-5">
            <p className="font-mono text-[11px] tracking-[0.06em] text-fg-subtle uppercase" aria-hidden>
              {c.t("step", { current: position, total: c.visible.length })}
              {step.optional ? ` · ${c.t("optional")}` : ""}
            </p>
            <h2
              id={headingId}
              tabIndex={-1}
              ref={active ? c.headingRef : undefined}
              className="mt-1 text-[22px] font-semibold tracking-[-0.016em] text-fg outline-none"
            >
              <span className="sr-only">{c.t("step", { current: position, total: c.visible.length })}:</span> {step.title}
            </h2>
            {step.description ? <p className="mt-1 max-w-prose text-sm text-fg-muted">{step.description}</p> : null}
          </header>
        )}
        {error ? (
          <Alert tone="danger" title={c.t("fixErrors")} className="mb-5" data-msf-error="" tabIndex={-1} live="assertive">
            {error}
          </Alert>
        ) : null}
        {active && c.isLast && c.submitError ? (
          <Alert tone="danger" title={c.t("submitFailed")} className="mb-5" live="assertive">
            {c.submitError}
          </Alert>
        ) : null}
        {children}
      </fieldset>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Review                                                              */
/* ------------------------------------------------------------------ */

export interface MultiStepFormReviewSection {
  /** Step id the "Edit" link jumps to. */
  step: string;
  /** Rows: label → value. */
  items: { label: string; value: React.ReactNode }[];
  /** Heading. Default: the step title. */
  title?: string;
}

export interface MultiStepFormReviewProps extends React.HTMLAttributes<HTMLDivElement> {
  sections: MultiStepFormReviewSection[];
}

/** A summary of earlier steps with "Edit" links back to each one. */
export function MultiStepFormReview({ sections, className, ...props }: MultiStepFormReviewProps) {
  const c = useCtx("MultiStepFormReview");
  return (
    <div data-slot="multi-step-form-review" className={cn("flex flex-col divide-y divide-line rounded-ui-lg border border-line", className)} {...props}>
      {sections
        .filter((s) => c.visible.some((v) => v.id === s.step))
        .map((s) => {
          const title = s.title ?? c.visible.find((v) => v.id === s.step)?.title ?? s.step;
          return (
            <section key={s.step} className="px-4 py-3.5" aria-label={title}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-[13px] font-semibold text-fg">{title}</h3>
                <Button size="xs" variant="ghost" onClick={() => c.goTo(s.step)} aria-label={c.t("edit", { title })}>
                  <Pencil /> <span aria-hidden>{c.t("edit", { title: "" }).trim()}</span>
                </Button>
              </div>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[minmax(8rem,12rem)_1fr]">
                {s.items.map((it) => (
                  <div key={it.label} className="contents">
                    <dt className="text-fg-muted">{it.label}</dt>
                    <dd className="min-w-0 text-fg [overflow-wrap:anywhere]">{it.value || <span className="text-fg-subtle">—</span>}</dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export interface MultiStepFormFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Submit button label on the last step. */
  submitLabel?: string;
  /** Extra content at the start (a "Cancel" link). */
  start?: React.ReactNode;
}

/** Back · Save draft · Next / Submit. Sticky at the bottom in page presentation. */
export function MultiStepFormFooter({ submitLabel, start, className, ...props }: MultiStepFormFooterProps) {
  const c = useCtx("MultiStepFormFooter");
  // The opaque backing only appears while the footer is actually stuck over scrolling content;
  // at rest it sits flush on whatever surface holds the form.
  const footerRef = React.useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = React.useState(false);
  React.useEffect(() => {
    const el = footerRef.current;
    if (c.presentation !== "page" || !el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setStuck(!!e && e.intersectionRatio < 1 && e.boundingClientRect.top > 0), {
      rootMargin: "0px 0px -1px 0px",
      threshold: [1],
    });
    io.observe(el);
    return () => io.disconnect();
  }, [c.presentation]);
  const { format } = useLocale();
  const [, tick] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (c.draft.state !== "saved") return;
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [c.draft.state]);
  const draftText =
    c.draft.state === "saving"
      ? c.t("savingDraft")
      : c.draft.state === "saved" && c.draft.at
        ? c.t("draftSaved", { time: format.relative(c.draft.at) })
        : c.draft.state === "error"
          ? c.t("draftFailed")
          : "";
  return (
    <div
      ref={footerRef}
      data-slot="multi-step-form-footer"
      data-stuck={stuck ? "" : undefined}
      className={cn(
        "vui-msf-footer flex flex-wrap items-center gap-2 border-t border-line pt-4",
        c.presentation === "page" && "sticky bottom-0 z-10 -mx-1 px-1 pb-1",
        c.orientation === "vertical" && "md:col-start-2",
        className,
      )}
      {...props}
    >
      {start}
      {!c.isFirst ? (
        <Button variant="ghost" onClick={c.back} disabled={c.submitting}>
          <ArrowLeft className="rtl:rotate-180" /> {c.t("back")}
        </Button>
      ) : null}
      <span className="flex-1" />
      <span className={cn("text-xs text-fg-subtle", c.draft.state === "error" && "text-danger")} aria-live="polite">
        {draftText}
      </span>
      {c.canSaveDraft ? (
        <Button variant="secondary" onClick={() => void c.saveDraft()} loading={c.draft.state === "saving"} disabled={c.submitting}>
          <CloudUpload /> {c.t("saveDraft")}
        </Button>
      ) : null}
      <Button type="submit" variant="primary" loading={c.submitting || c.validating} loadingText={c.submitting ? c.t("submitting") : undefined}>
        {c.isLast ? (
          <>
            <Check /> {submitLabel ?? c.t("submit")}
          </>
        ) : (
          <>
            {c.t("next")} <ArrowRight className="rtl:rotate-180" />
          </>
        )}
      </Button>
    </div>
  );
}
