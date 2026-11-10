"use client";

import * as React from "react";
import { MessageSquareText, ShieldCheck, Smartphone } from "lucide-react";
import { Alert, Button, Checkbox, Field, Input, InputOTP, Tabs, TabsContent, TabsList, TabsTrigger, useFormat } from "@vamos-ui/react";

type Method = "app" | "sms" | "recovery";
type Result = { kind: "idle" } | { kind: "verifying" } | { kind: "invalid"; message: string } | { kind: "verified" };

const RESEND_SECONDS = 30;

/** Demo rule: 000000 and any recovery code not shaped like XXXX-XXXX are rejected. */
function check(method: Method, code: string): string | null {
  if (method === "recovery") return /^[a-z0-9]{4}-?[a-z0-9]{4}$/i.test(code.trim()) ? null : "Recovery codes look like 7KQ2-M9XD.";
  return code === "000000" ? "That code didn’t work. Codes change every 30 seconds — try the newest one." : null;
}

function useCountdown(seconds: number) {
  const [left, setLeft] = React.useState(seconds);
  React.useEffect(() => {
    if (left <= 0) return;
    const id = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left]);
  return [left, () => setLeft(seconds)] as const;
}

/** Second-factor step: authenticator app or SMS code (Input OTP), or a recovery code. */
export function TwoFactorForm() {
  const f = useFormat();
  const [method, setMethod] = React.useState<Method>("app");
  const [code, setCode] = React.useState("");
  const [recovery, setRecovery] = React.useState("");
  const [result, setResult] = React.useState<Result>({ kind: "idle" });
  const [resendIn, restartResend] = useCountdown(RESEND_SECONDS);

  const verify = (value: string, via: Method = method) => {
    setResult({ kind: "verifying" });
    window.setTimeout(() => {
      const error = check(via, value);
      if (error) {
        setResult({ kind: "invalid", message: error });
        if (via !== "recovery") setCode("");
      } else {
        setResult({ kind: "verified" });
      }
    }, 900);
  };

  const switchMethod = (next: string) => {
    setMethod(next as Method);
    setCode("");
    setResult({ kind: "idle" });
  };

  const invalid = result.kind === "invalid";
  const verifying = result.kind === "verifying";

  if (result.kind === "verified") {
    return (
      <Alert tone="success" icon={<ShieldCheck aria-hidden />} live="polite" title="Verified">
        Signing you in to Northwind… This device {method === "recovery" ? "used a recovery code — 9 codes remain." : "is now recognised."}
      </Alert>
    );
  }

  const otp = (hint: React.ReactNode) => (
    <Field label="Verification code" id={`otp-${method}`} hint={hint} error={invalid ? result.message : undefined}>
      <InputOTP
        name="code"
        size="lg"
        groups={[3, 3]}
        value={code}
        onValueChange={(v) => {
          setCode(v);
          if (invalid) setResult({ kind: "idle" });
        }}
        onComplete={(v) => verify(v)}
        loading={verifying}
      />
    </Field>
  );

  return (
    <div className="grid gap-5">
      {method !== "recovery" ? (
        <Tabs value={method} onValueChange={switchMethod}>
          <TabsList variant="segmented" fill aria-label="Verification method">
            <TabsTrigger value="app">
              <Smartphone /> Authenticator
            </TabsTrigger>
            <TabsTrigger value="sms">
              <MessageSquareText /> Text message
            </TabsTrigger>
          </TabsList>
          <TabsContent value="app" className="pt-5">
            {otp("Open Google Authenticator, 1Password or Authy and enter the code for Northpoint · maya.chen.")}
          </TabsContent>
          <TabsContent value="sms" className="grid gap-3 pt-5">
            {otp("We texted a code to +1 (415) ••• ••07.")}
            <p className="text-[12.5px] text-fg-muted" aria-live="polite">
              {resendIn > 0 ? (
                <>
                  Resend available in <span className="font-mono tabular">{f.number(resendIn)}s</span>
                </>
              ) : (
                <Button variant="link" className="text-[12.5px]" onClick={restartResend}>
                  Send a new code
                </Button>
              )}
            </p>
          </TabsContent>
        </Tabs>
      ) : null}

      {method === "recovery" ? (
        <form
          noValidate
          className="grid gap-4"
          aria-label="Use a recovery code"
          onSubmit={(e) => {
            e.preventDefault();
            verify(recovery, "recovery");
          }}
        >
          <Field label="Recovery code" id="otp-recovery" hint="One of the 10 codes you saved when you turned on two-step verification." error={invalid ? result.message : undefined}>
            <Input name="recovery" autoComplete="off" spellCheck={false} placeholder="7KQ2-M9XD" className="font-mono" value={recovery} onChange={(e) => setRecovery(e.target.value)} autoFocus />
          </Field>
          <Button type="submit" variant="primary" block loading={verifying} loadingText="Verifying…">
            Verify recovery code
          </Button>
        </form>
      ) : null}

      <Checkbox name="trust" size="sm" defaultChecked label="Trust this browser for 30 days" description="You won’t be asked for a code on this device unless you sign out." />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-4 text-[13px]">
        {method === "recovery" ? (
          <Button variant="link" className="text-[13px]" onClick={() => switchMethod("app")}>
            Use a verification code instead
          </Button>
        ) : (
          <Button variant="link" className="text-[13px]" onClick={() => switchMethod("recovery")}>
            Use a recovery code
          </Button>
        )}
        <a href="#" className="rounded-ui-sm text-fg-muted hover:text-fg focus-ring">
          Lost access to your phone?
        </a>
      </div>
    </div>
  );
}
