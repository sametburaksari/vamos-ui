// Lint issue shapes (lintPage + per-block `lint`). Types only.

export type LintSeverity = "error" | "warning" | "info";

export type LintCode =
  | "unknown-block"
  | "invalid-props"
  | "duplicate-id"
  | "duplicate-anchor"
  | "multiple-h1"
  | "missing-h1"
  | "heading-too-long"
  | "cliche-copy"
  | "multiple-primary-cta"
  | "missing-translation"
  | "too-many-cards"
  | "monotone-page"
  | "violet-accent"
  | "newer-version"
  | "missing-migration"
  | (string & {});

export interface LintIssueInput {
  code: LintCode;
  severity?: LintSeverity;
  message: string;
  /** Prop path inside the block, e.g. "props.items.2.title". */
  path?: string;
}

export interface LintIssue extends Required<Pick<LintIssueInput, "code" | "message">> {
  severity: LintSeverity;
  blockId?: string;
  blockType?: string;
  path?: string;
  locale?: string;
}
