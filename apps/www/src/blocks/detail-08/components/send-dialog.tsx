"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Send } from "lucide-react";
import {
  Avatar,
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  IconButton,
  Input,
  Textarea,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";

export interface DraftSigner {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface SendRequest {
  signers: DraftSigner[];
  subject: string;
  message: string;
  attachPdf: boolean;
}

/** Send for e-signature: signing order, the covering email and a PDF copy. */
export function SendDialog({
  open,
  onOpenChange,
  signers: initialSigners,
  defaultSubject,
  defaultMessage,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signers: DraftSigner[];
  defaultSubject: string;
  defaultMessage: string;
  onSend: (req: SendRequest) => void;
}) {
  const { c } = useBlockFormat();
  const [signers, setSigners] = React.useState(initialSigners);
  const [subject, setSubject] = React.useState(defaultSubject);
  const [message, setMessage] = React.useState(defaultMessage);
  const [attachPdf, setAttachPdf] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setSigners(initialSigners);
    setSubject(defaultSubject);
    setMessage(defaultMessage);
    setError(null);
  }, [open, initialSigners, defaultSubject, defaultMessage]);

  const move = (i: number, dir: -1 | 1) =>
    setSigners((all) => {
      const next = [...all];
      const [row] = next.splice(i, 1);
      next.splice(i + dir, 0, row!);
      return next;
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader
          title={c("Send for signature", "İmzaya gönder")}
          description={c("Signers get the quote one after another, in this order. You can still revoke it until the first signature.", "İmzacılar teklifi bu sırayla, birbiri ardına alır. İlk imzaya kadar geri çekebilirsiniz.")}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!subject.trim()) {
              setError(c("Add a subject line", "Bir konu satırı ekleyin"));
              return;
            }
            onSend({ signers, subject: subject.trim(), message, attachPdf });
          }}
        >
          <DialogBody className="grid gap-5">
            <fieldset className="min-w-0">
              <legend className="mb-2 text-sm font-medium text-fg">{c("Signing order", "İmza sırası")}</legend>
              <ol className="divide-y divide-line rounded-ui border border-line">
                {signers.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                    <span className="w-4 text-center font-mono text-xs text-fg-subtle tabular">{i + 1}</span>
                    <Avatar name={s.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">{s.name}</p>
                      <p className="truncate text-xs text-fg-muted">{s.role} · {s.email}</p>
                    </div>
                    <IconButton size="xs" variant="ghost" label={c(`Move ${s.name} up`, `${s.name} yukarı taşı`)} disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowUp aria-hidden />
                    </IconButton>
                    <IconButton size="xs" variant="ghost" label={c(`Move ${s.name} down`, `${s.name} aşağı taşı`)} disabled={i === signers.length - 1} onClick={() => move(i, 1)}>
                      <ArrowDown aria-hidden />
                    </IconButton>
                  </li>
                ))}
              </ol>
            </fieldset>
            <Field label={c("Subject", "Konu")} error={error ?? undefined} required>
              <Input value={subject} onChange={(e) => { setSubject(e.target.value); setError(null); }} />
            </Field>
            <Field label={c("Message", "Mesaj")} hint={c("Goes to every signer above the signing link.", "İmza bağlantısının üstünde her imzacıya gider.")}>
              <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            </Field>
            <Checkbox checked={attachPdf} onCheckedChange={(v) => setAttachPdf(v === true)} label={c("Attach a PDF copy", "PDF kopyasını ekle")} />
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{c("Cancel", "Vazgeç")}</Button>
            <Button type="submit" variant="primary">
              <Send aria-hidden />
              {c("Send quote", "Teklifi gönder")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
