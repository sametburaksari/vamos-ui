import type { VerifyIssue } from "./types.js";

export type VerifySource = (code: string, filename: string) => VerifyIssue[];
export type VerifyProject = (input: { paths: string[]; sources: { path: string; content: string }[]; sizes?: Record<string, number> }) => (VerifyIssue & { file: string })[];

let project: VerifyProject | null | undefined;

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
      const vp = (mod as { verifyProject?: unknown }).verifyProject;
      project = typeof vp === "function" ? (vp as VerifyProject) : null;
      return fn as VerifySource;
    },
    (error: unknown) => {
      loadError = (error as Error)?.message ?? String(error);
      return null;
    },
  );
  return loaded;
}

/** The project-level checks (routes, website launch basics); null when the verifier predates them. */
export async function loadProjectVerifier(): Promise<VerifyProject | null> {
  await loadVerifier();
  return project ?? null;
}

export function verifierLoadError(): string | undefined {
  return loadError;
}

/** Test hook: use a specific verifier (or reset to lazy loading with undefined). */
export function setVerifier(fn: VerifySource | null | undefined): void {
  loaded = fn === undefined ? undefined : Promise.resolve(fn);
  project = undefined;
  loadError = fn === null ? "verifier disabled" : undefined;
}
