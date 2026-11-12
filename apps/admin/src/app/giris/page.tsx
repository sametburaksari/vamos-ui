"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, ShieldCheck } from "lucide-react";
import { Card, CardBody, CardHeader, CardFooter, Field, Input, NativeSelect, Button, Alert } from "@vamos-cms/ui";
import { TR_MONTHS } from "@/lib/no17-bday";
import { Logo } from "@/components/logo";

const days = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
const months = TR_MONTHS.map((m, i) => ({ value: String(i), label: m }));

function GirisForm() {
  const router = useRouter();
  const nextParam = useSearchParams().get("next");
  const [tc, setTc] = React.useState("");
  const [day, setDay] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (tc.length !== 11 || !day || !month) {
      setErr("11 haneli TC, gün ve ay gerekli.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tc, day: Number(day), month: Number(month) }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) {
        setErr(data.message || "Giriş başarısız.");
        setBusy(false);
        return;
      }
      const dest = data.role === "admin" ? nextParam || "/no17" : "/ben";
      router.replace(dest);
      router.refresh();
    } catch {
      setErr("Bağlantı hatası. Tekrar dene.");
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-5 text-center">
          <Logo className="mx-auto h-12 w-auto" />
        </div>

        <Card asChild>
          <form onSubmit={submit}>
            <CardHeader title="Giriş" description="TC kimlik numaran ve doğum günün (gün + ay)." />
            <CardBody className="grid gap-3">
              {err ? <Alert tone="danger">{err}</Alert> : null}
              <Field label="T.C. Kimlik No">
                <Input
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={11}
                  placeholder="11 haneli numara"
                  value={tc}
                  onChange={(e) => setTc(e.target.value.replace(/\D/g, "").slice(0, 11))}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Doğum günü">
                  <NativeSelect value={day} onChange={(e) => setDay(e.target.value)} placeholder="Gün" items={days} />
                </Field>
                <Field label="Ay">
                  <NativeSelect value={month} onChange={(e) => setMonth(e.target.value)} placeholder="Ay" items={months} />
                </Field>
              </div>
            </CardBody>
            <CardFooter className="grid gap-2">
              <Button type="submit" variant="solid" disabled={busy} className="w-full justify-center">
                <LogIn /> {busy ? "Kontrol ediliyor…" : "Giriş yap"}
              </Button>
              <p className="inline-flex items-center justify-center gap-1.5 text-xs text-fg-subtle">
                <ShieldCheck className="size-3.5" /> Bilgilerin yalnızca giriş için kullanılır.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default function GirisPage() {
  return (
    <React.Suspense fallback={<main className="grid min-h-dvh place-items-center bg-canvas" />}>
      <GirisForm />
    </React.Suspense>
  );
}
