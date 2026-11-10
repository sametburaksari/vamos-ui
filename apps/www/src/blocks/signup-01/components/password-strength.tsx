"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { Progress, cn, type ProgressTone } from "@vamos-ui/react";

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string, context: { name: string; email: string }) => boolean;
}

export const passwordRules: PasswordRule[] = [
  { id: "length", label: "At least 12 characters", test: (p) => p.length >= 12 },
  { id: "case", label: "Upper and lower case letters", test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: "number", label: "A number or a symbol", test: (p) => /[\d\W_]/.test(p) },
  {
    id: "personal",
    label: "Doesn’t contain your name or email",
    test: (p, { name, email }) => {
      if (!p) return false;
      const lower = p.toLowerCase();
      const parts = [...name.toLowerCase().split(/\s+/), email.toLowerCase().split("@")[0] ?? ""].filter((s) => s.length >= 3);
      return !parts.some((part) => lower.includes(part));
    },
  },
];

const levels: { label: string; tone: ProgressTone }[] = [
  { label: "Too weak", tone: "danger" },
  { label: "Weak", tone: "danger" },
  { label: "Fair", tone: "warning" },
  { label: "Good", tone: "accent" },
  { label: "Strong", tone: "success" },
];

export function scorePassword(password: string, context: { name: string; email: string }) {
  const passed = passwordRules.map((r) => r.test(password, context));
  const score = password ? passed.filter(Boolean).length : 0;
  return { passed, score, level: levels[score]! };
}

export interface PasswordStrengthProps {
  password: string;
  name?: string;
  email?: string;
  id?: string;
  className?: string;
}

/** Strength meter (Progress) + the rule checklist under a new-password field. */
export function PasswordStrength({ password, name = "", email = "", id, className }: PasswordStrengthProps) {
  const { passed, score, level } = scorePassword(password, { name, email });
  return (
    <div id={id} className={cn("grid gap-2.5", className)}>
      <Progress
        size="xs"
        label={<span className="text-[12px] font-normal text-fg-muted">Password strength</span>}
        value={score}
        max={4}
        tone={password ? level.tone : "accent"}
        valueText={password ? level.label : "Not set"}
        showValue={() => (password ? level.label : "—")}
      />
      <ul className="grid gap-1 text-[12.5px] sm:grid-cols-2 sm:gap-x-4" aria-label="Password requirements">
        {passwordRules.map((rule, i) => {
          const ok = passed[i];
          return (
            <li key={rule.id} className={cn("flex items-center gap-1.5 transition-colors", ok ? "text-fg" : "text-fg-subtle")}>
              {ok ? <Check aria-hidden className="size-3.5 shrink-0 text-success" strokeWidth={2.5} /> : <Minus aria-hidden className="size-3.5 shrink-0" />}
              <span>
                {rule.label}
                <span className="sr-only">{ok ? " — done" : " — not yet"}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
