import { Check } from "lucide-react";
import { Card } from "@vamos-ui/react";
import { AuthFrame, AuthHeading } from "../login-02/components/auth-frame";
import { SignUpForm } from "./components/sign-up-form";

const included = [
  "Unlimited contacts, deals and pipelines",
  "Up to 10 teammates with role-based access",
  "Import from CSV, HubSpot or Pipedrive in minutes",
  "Help from a real person, weekdays 08:00–20:00",
];

/** Sign-up with live password strength, SSO shortcuts and a trial summary column. */
export default function Signup01() {
  return (
    <AuthFrame
      width="xl"
      topAction={
        <>
          Have an account?{" "}
          <a href="#" className="rounded-ui-sm font-medium text-fg hover:underline focus-ring">
            Sign in
          </a>
        </>
      }
    >
      <div className="ui-rise grid items-start gap-10 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-16">
        <div className="grid gap-6">
          <AuthHeading title={<>Start your <em>free</em> trial</>}>14 days on the Team plan. No card needed — you choose a plan when it ends.</AuthHeading>
          <Card className="p-5 sm:p-7">
            <SignUpForm />
          </Card>
        </div>

        <aside aria-labelledby="signup-included" className="grid gap-8 lg:sticky lg:top-10 lg:pt-24">
          <div className="grid gap-4">
            <h2 id="signup-included" className="text-[12px] font-medium tracking-[0.06em] text-fg-subtle">
              WHAT’S INCLUDED
            </h2>
            <ul className="grid gap-3">
              {included.map((line) => (
                <li key={line} className="flex items-start gap-3 text-[14px] text-fg">
                  <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <figure className="hidden border-s-2 border-accent ps-5 lg:block">
            <blockquote className="font-display text-[length:calc(22px*var(--display-scale))] leading-[1.3] text-fg">
              “Our reps stopped keeping deals in spreadsheets the first week. Pipeline reviews take twenty minutes now, not two hours.”
            </blockquote>
            <figcaption className="mt-3 text-[13px] text-fg-muted">
              Daniel Okafor · Head of Sales, Brightline Logistics
            </figcaption>
          </figure>
          <dl className="grid grid-cols-3 gap-4 border-t border-line pt-6">
            {[
              ["4,200+", "teams"],
              ["38 min", "median setup"],
              ["99.98%", "uptime, 12 mo"],
            ].map(([value, label]) => (
              <div key={label} className="grid gap-0.5">
                <dt className="order-2 text-[12px] text-fg-subtle">{label}</dt>
                <dd className="order-1 font-mono text-[15px] font-medium tabular text-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </AuthFrame>
  );
}
