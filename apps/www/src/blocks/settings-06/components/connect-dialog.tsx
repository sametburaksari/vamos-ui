"use client";

import * as React from "react";
import { ArrowLeftRight, Lock } from "lucide-react";
import { Alert, Button, Checkbox, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Field, Input } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { IntegrationMark } from "./integration-mark";
import type { MarketIntegration } from "./data";

export interface ConnectDialogProps {
  integration: MarketIntegration | null;
  /** Reconnect keeps the old settings and only asks for a new credential. */
  mode: "connect" | "reconnect";
  onOpenChange: (open: boolean) => void;
  onConnected: (id: string, scopes: string[]) => void;
}

/**
 * Connect (or reconnect) one provider: the credential, then the permissions it asks for.
 * Required permissions stay ticked; optional ones can be turned down. "Authorize" is simulated —
 * a credential containing "fail" is rejected so you can see the error state.
 */
export function ConnectDialog({ integration, mode, onOpenChange, onConnected }: ConnectDialogProps) {
  const { c, t, f } = useBlockFormat();
  const [credential, setCredential] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [granted, setGranted] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [failure, setFailure] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!integration) return;
    setCredential("");
    setTouched(false);
    setFailure(null);
    setBusy(false);
    setGranted(integration.scopes.map((s) => s.key));
  }, [integration]);

  if (!integration) return null;
  const valid = integration.credential.pattern.test(credential.trim());
  const error = touched && !valid ? c(`Enter a valid ${integration.credential.label.en}.`, `Geçerli bir ${integration.credential.label.tr} girin.`) : undefined;

  const authorize = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setBusy(true);
    setFailure(null);
    window.setTimeout(() => {
      if (/fail/i.test(credential)) {
        setBusy(false);
        setFailure(c(`${integration.name} rejected this key. Check that it hasn't been revoked.`, `${integration.name} bu anahtarı reddetti. İptal edilmediğini kontrol edin.`));
        return;
      }
      setBusy(false);
      onConnected(integration.id, granted);
    }, 900);
  };

  return (
    <Dialog open onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent size="md" mobile="fullscreen">
        <form onSubmit={authorize} noValidate className="contents">
          <DialogHeader
            title={mode === "reconnect" ? c(`Reconnect ${integration.name}`, `${integration.name} yeniden bağlansın`) : c(`Connect ${integration.name}`, `${integration.name} bağlansın`)}
            description={
              mode === "reconnect"
                ? c("Your sync settings stay as they are. Only the key changes.", "Senkron ayarlarınız aynı kalır, yalnızca anahtar değişir.")
                : c(`${integration.publisher} · used by ${f.number(integration.installs, { notation: "compact" })} workspaces`, `${integration.publisher} · ${f.number(integration.installs, { notation: "compact" })} çalışma alanında kullanılıyor`)
            }
          />
          <DialogBody className="grid gap-5">
            <div className="flex items-center justify-center gap-3 rounded-ui border border-dashed border-line py-5" aria-hidden>
              <IntegrationMark mark="KL" size="lg" />
              <ArrowLeftRight className="size-4 text-fg-subtle" strokeWidth={1.6} />
              <IntegrationMark mark={integration.mark} size="lg" />
            </div>

            <Field label={t(integration.credential.label)} hint={t(integration.credential.hint)} error={error} required>
              <Input
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder={integration.credential.placeholder}
                spellCheck={false}
                autoComplete="off"
                className="font-mono"
                data-autofocus
              />
            </Field>

            {mode === "connect" && integration.scopes.length > 0 ? (
              <fieldset className="grid gap-2">
                <legend className="mb-2 text-[13px] font-medium text-fg">{c(`${integration.name} will be able to`, `${integration.name} şunları yapabilecek`)}</legend>
                {integration.scopes.map((s) => (
                  <Checkbox
                    key={s.key}
                    label={t(s.label)}
                    description={s.required ? c("Required for this integration to work", "Entegrasyonun çalışması için gerekli") : undefined}
                    checked={granted.includes(s.key)}
                    disabled={s.required}
                    onCheckedChange={(v) => setGranted((g) => (v === true ? [...g, s.key] : g.filter((k) => k !== s.key)))}
                  />
                ))}
              </fieldset>
            ) : null}

            {failure ? <Alert tone="danger" size="sm" title={c("Couldn't connect", "Bağlanamadı")} live="assertive">{failure}</Alert> : null}

            <p className="flex items-start gap-2 text-[12.5px] text-fg-subtle">
              <Lock aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              {c("Keys are encrypted at rest and never shown again. Disconnecting revokes access immediately.", "Anahtarlar şifreli saklanır ve bir daha gösterilmez. Bağlantıyı kesmek erişimi hemen kaldırır.")}
            </p>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
              {c("Cancel", "Vazgeç")}
            </Button>
            <Button type="submit" variant="primary" loading={busy}>
              {busy ? c("Authorizing…", "Yetkilendiriliyor…") : mode === "reconnect" ? c("Reconnect", "Yeniden bağla") : c("Authorize & connect", "Yetkilendir ve bağla")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
