/**
 * Built-in UI strings. English is the default and the source of truth;
 * every other locale implements the same shape (see `Messages`).
 */
export const en = {
  common: {
    loading: "Loading…",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    copy: "Copy",
    copied: "Copied",
    search: "Search",
    noResults: "No results",
    more: "More",
    required: "Required",
  },
  pagination: {
    previous: "Previous",
    next: "Next",
    page: (n: number, total: number) => `Page ${n} of ${total}`,
  },
  command: {
    placeholder: "Type a command or search…",
  },
} as const;

type Widen<T> = T extends (...args: infer A) => infer R ? (...args: A) => R : T extends object ? { [K in keyof T]: Widen<T[K]> } : string;
export type Messages = Widen<typeof en>;
