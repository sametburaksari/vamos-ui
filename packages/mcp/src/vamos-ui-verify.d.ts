// Contract of the CLI's library entry. Keeps this package typecheck-clean whether or not
// packages/cli has been built; the real module's types must match this signature.
declare module "vamos-ui/verify" {
  export interface VerifyIssue {
    rule: string;
    severity: "error" | "warning";
    message: string;
    line: number;
    column: number;
    fix?: string;
  }
  export function verifySource(code: string, filename: string): VerifyIssue[];
  export interface ProjectIssue extends VerifyIssue {
    file: string;
  }
  export function verifyProject(input: { paths: string[]; sources: { path: string; content: string }[]; sizes?: Record<string, number> }): ProjectIssue[];
}
