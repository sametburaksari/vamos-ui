// Contract of the CLI's "vamos-ui/audit" library entry. Keeps this package typecheck-clean
// whether or not packages/cli has been built; the real module's types must match.
declare module "vamos-ui/audit" {
  export type AuditSeverity = "error" | "warning" | "info";
  export interface AuditIssue {
    rule: string;
    severity: AuditSeverity;
    message: string;
    url?: string;
    fix?: string;
  }
  export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;
  export class AuditRefusedError extends Error {}
  export interface AuditOptions {
    fetch?: FetchLike;
    maxPages?: number;
    concurrency?: number;
    timeoutMs?: number;
    deadlineMs?: number;
    maxBytes?: number;
    external?: boolean;
    maxLinks?: number;
    maxExternal?: number;
    maxImages?: number;
    userAgent?: string;
    guard?: (url: URL) => void | Promise<void>;
    hostVariants?: boolean;
  }
  export interface AuditReport {
    url: string;
    finalUrl: string;
    startedAt: string;
    durationMs: number;
    score: number;
    summary: { errors: number; warnings: number; info: number };
    crawl: { pages: { url: string; status: number; title: string | null }[]; linksChecked: number; externalChecked: number; imagesChecked: number; skippedByRobots: number; truncated: boolean };
    issues: AuditIssue[];
    [key: string]: unknown;
  }
  export function runAudit(url: string, options?: AuditOptions): Promise<AuditReport>;
  export function formatAuditText(report: AuditReport, opts?: { maxPerRule?: number }): string;
  export function normalizeAuditUrl(input: string): string;
}
