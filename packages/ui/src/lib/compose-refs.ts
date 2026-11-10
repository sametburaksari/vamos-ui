import * as React from "react";

type PossibleRef<T> = React.Ref<T> | undefined | null;

/** Assigns `value` to a callback ref or an object ref. */
export function setRef<T>(ref: PossibleRef<T>, value: T | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

/**
 * Combines several refs into one callback ref.
 *
 * ```tsx
 * <input ref={composeRefs(forwardedRef, localRef)} />
 * ```
 */
export function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) setRef(ref, node);
  };
}

/** Memoised `composeRefs` — keeps the same callback while the refs don't change. */
export function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(composeRefs(...refs), refs);
}

/**
 * Joins id lists (e.g. `aria-describedby`) without duplicates or empty entries.
 * Returns `undefined` when nothing is left, so the attribute is omitted.
 *
 * ```ts
 * mergeIds("title-hint", props["aria-describedby"], error && "title-error"); // "title-hint own-id title-error"
 * ```
 */
export function mergeIds(...ids: (string | false | null | undefined)[]): string | undefined {
  const out: string[] = [];
  for (const group of ids) {
    if (!group) continue;
    for (const id of group.split(/\s+/)) if (id && !out.includes(id)) out.push(id);
  }
  return out.length ? out.join(" ") : undefined;
}
