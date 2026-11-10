import { ArrowRight } from "lucide-react";
import { Button, Card, Field, Input } from "@vamos-ui/react";

/** Sign-in page: editorial split layout, works for any panel. */
export default function Login01() {
  return (
    <div className="relative z-10 grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="surface-nav hidden flex-col justify-between p-10 lg:flex">
        <div className="flex items-center gap-2 text-nav-fg-strong">
          <span className="grid size-7 place-items-center rounded-[9px] bg-accent font-display text-[19px] italic leading-none text-accent-fg">v</span>
          <span className="font-semibold">Northpoint Workspace</span>
        </div>
        <blockquote className="max-w-md">
          <p className="font-display text-[length:calc(34px*var(--display-scale))] leading-[1.15] text-nav-fg-strong">
            “We moved four internal tools into <em className="text-accent">one</em> panel and nobody had to relearn anything.”
          </p>
          <footer className="mt-4 text-[13px] text-nav-fg/70">Operations lead, 40-person agency</footer>
        </blockquote>
        <div className="text-[12px] text-nav-fg/50">© 2026 Northpoint</div>
      </section>

      <section className="grid place-items-center p-6">
        <Card className="w-full max-w-[380px] p-7">
          <h1 className="text-[20px] font-semibold tracking-[-0.015em]">Sign in</h1>
          <p className="mt-1 text-[13.5px] text-fg-muted">Use your work email. We’ll keep you signed in on this device.</p>
          <form className="mt-6 grid gap-4">
            <Field label="Email" id="login-email"><Input name="email" type="email" autoComplete="email" placeholder="you@company.com" /></Field>
            <Field label="Password" id="login-password"><Input name="password" type="password" autoComplete="current-password" /></Field>
            <Button variant="primary" block type="submit">Continue <ArrowRight /></Button>
          </form>
          <div className="mt-5 flex justify-between text-[12.5px]">
            <a href="#" className="text-fg-muted hover:text-fg">Forgot password?</a>
            <a href="#" className="font-medium text-accent-ink hover:underline">Use single sign-on</a>
          </div>
        </Card>
      </section>
    </div>
  );
}
