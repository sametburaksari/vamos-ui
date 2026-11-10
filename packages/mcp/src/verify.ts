import type { VerifyIssue } from "./types.js";

export type VerifySource = (code: string, filename: string) => VerifyIssue[];

let loaded: Promise<VerifySource | null> | undefined;
let loadError: string | undefined;

/**
 * Loads `verifySource` from the CLI package ("vamos-ui/verify"). It is bundled into the
 * published server (tsup noExternal); in a workspace where the CLI is not built yet the
 * import fails and verify_code reports that instead of crashing the server.
 */
export function loadVerifier(): Promise<VerifySource | null> {
  loaded ??= import("vamos-ui/verify").then(
    (mod) => {
      const fn = (mod as { verifySource?: unknown }).verifySource;
      if (typeof fn !== "function") {
        loadError = '"vamos-ui/verify" does not export verifySource().';
        return null;
      }
      return fn as VerifySource;
    },
    (error: unknown) => {
      loadError = (error as Error)?.message ?? String(error);
      return null;
    },
  );
  return loaded;
}

export function verifierLoadError(): string | undefined {
  return loadError;
}

/** Test hook: use a specific verifier (or reset to lazy loading with undefined). */
export function setVerifier(fn: VerifySource | null | undefined): void {
  loaded = fn === undefined ? undefined : Promise.resolve(fn);
  loadError = fn === null ? "verifier disabled" : undefined;
}
