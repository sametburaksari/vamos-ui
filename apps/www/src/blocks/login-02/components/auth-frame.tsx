import * as React from "react";
import { Badge, cn } from "@vamos-ui/react";

/** The product mark used on every auth screen. Swap for your own logo. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <a href="#" className={cn("inline-flex items-center gap-2 rounded-ui-sm text-fg focus-ring", className)}>
      <span
        aria-hidden
        className="grid size-7 place-items-center rounded-[9px] bg-accent font-display text-[19px] italic leading-none text-accent-fg"
      >
        a
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.01em]">Northpoint</span>
    </a>
  );
}

export interface AuthFrameProps {
  children: React.ReactNode;
  /** Slot at the end of the top bar ("No account? Sign up"). */
  topAction?: React.ReactNode;
  /** Width of the centred column. Default `"sm"` (26rem). */
  width?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const widths = { sm: "max-w-[26rem]", md: "max-w-[30rem]", lg: "max-w-[40rem]", xl: "max-w-[64rem]" } as const;

/**
 * Full-screen frame shared by the authentication blocks: brand + top action, a centred column
 * over a faint hairline grid, and a legal / status footer.
 */
export function AuthFrame({ children, topAction, width = "sm", className }: AuthFrameProps) {
  return (
    <div className="vb-auth relative z-10 flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-6">
        <BrandMark />
        {topAction ? <div className="text-[13px] text-fg-muted">{topAction}</div> : null}
      </header>
      <main className={cn("mx-auto flex w-full flex-1 flex-col justify-center px-4 pb-12 pt-4 sm:pt-8", widths[width], className)}>
        {children}
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-5 text-[12px] text-fg-subtle sm:px-8">
        <span>© 2026 Northpoint Studio Ltd.</span>
        <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href="#" className="rounded-ui-sm hover:text-fg focus-ring">
            Privacy
          </a>
          <a href="#" className="rounded-ui-sm hover:text-fg focus-ring">
            Terms
          </a>
          <Badge asChild tone="success" dot size="sm" className="focus-ring">
            <a href="#">All systems operational</a>
          </Badge>
        </nav>
      </footer>
    </div>
  );
}

/** Screen title + supporting line, used at the top of each auth column. */
export function AuthHeading({ title, children, className }: { title: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-2", className)}>
      <h1 tabIndex={-1} className="outline-none font-display text-[length:calc(30px*var(--display-scale))] leading-[1.1] text-fg text-balance">{title}</h1>
      {children ? <p className="text-[14px] leading-relaxed text-fg-muted text-pretty">{children}</p> : null}
    </div>
  );
}
