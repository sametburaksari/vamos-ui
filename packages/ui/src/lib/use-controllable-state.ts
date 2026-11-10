import * as React from "react";

/** `useLayoutEffect` on the client, a no-op on the server (no SSR warning). */
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/**
 * Keeps a ref pointing at the latest value. Use it to call the newest callback from an
 * effect or event handler without re-subscribing.
 */
export function useLatest<T>(value: T): React.RefObject<T> {
  const ref = React.useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

/** A stable function identity that always calls the latest `fn`. */
export function useEventCallback<A extends unknown[], R>(fn: ((...args: A) => R) | undefined): (...args: A) => R | undefined {
  const ref = useLatest(fn);
  return React.useCallback((...args: A) => ref.current?.(...args), [ref]);
}

export interface UseControllableStateOptions<T> {
  /** Controlled value. The state is controlled whenever this is not `undefined`. */
  value?: T;
  /** Initial value for the uncontrolled case. */
  defaultValue: T | (() => T);
  /** Called with the next value whenever it changes (controlled and uncontrolled). */
  onChange?: (value: T) => void;
  /** Component name used in the dev warning when switching controlled ↔ uncontrolled. */
  name?: string;
}

/**
 * State that can be controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).
 * The kit's single implementation of the Radix contract (`value` / `defaultValue` / `onValueChange`).
 *
 * ```ts
 * const [open, setOpen] = useControllableState({ value: props.open, defaultValue: props.defaultOpen ?? false, onChange: props.onOpenChange });
 * ```
 *
 * - Empty controlled value is `null` (single) or `[]` (multi) — never `undefined`, which means "uncontrolled".
 * - `onChange` fires only when the value actually changes (`Object.is`).
 * - The setter accepts an updater function. If `T` itself is a function type, wrap it: `set(() => fn)`.
 */
export function useControllableState<T>({ value, defaultValue, onChange, name = "Component" }: UseControllableStateOptions<T>) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<T>(defaultValue);
  const current = (isControlled ? value : internal) as T;

  const currentRef = React.useRef(current);
  const controlledRef = React.useRef(isControlled);
  const onChangeRef = useLatest(onChange);
  currentRef.current = current;

  if (process.env.NODE_ENV !== "production" && controlledRef.current !== isControlled) {
    console.warn(
      `${name} is changing from ${controlledRef.current ? "controlled" : "uncontrolled"} to ${isControlled ? "controlled" : "uncontrolled"}. ` +
        "Decide between using a controlled or uncontrolled value for the lifetime of the component.",
    );
  }
  controlledRef.current = isControlled;

  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(currentRef.current) : next;
      if (Object.is(resolved, currentRef.current)) return;
      if (!controlledRef.current) {
        currentRef.current = resolved;
        setInternal(resolved);
      }
      onChangeRef.current?.(resolved);
    },
    [onChangeRef],
  );

  return [current, setValue] as const;
}
