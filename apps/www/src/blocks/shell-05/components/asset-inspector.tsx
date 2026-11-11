"use client";

import * as React from "react";
import { Copy, Link2, Trash2, X } from "lucide-react";
import { Avatar, Badge, Button, Field, IconButton, Textarea, toast } from "@vamos-ui/react";
import { person } from "../../_shared/people";
import { useBlockFormat } from "../../_shared/format";
import { folderName, type Asset } from "../data";
import { Thumb, fmtDuration } from "./media-library";

export interface AssetInspectorProps {
  asset: Asset;
  onClose: () => void;
  onAltSave: (id: string, alt: string) => Promise<void>;
  onDelete: (id: string) => void;
}

/** Details of the opened file: preview, alt text (saved optimistically), facts, where it is used. */
export function AssetInspector({ asset: a, onClose, onAltSave, onDelete }: AssetInspectorProps) {
  const { c, t, f, ago } = useBlockFormat();
  const [alt, setAlt] = React.useState(a.alt);
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => setAlt(a.alt), [a.id, a.alt]);
  const dirty = alt.trim() !== a.alt;
  const uploader = person(a.uploadedBy);
  const url = `https://cdn.example.com/kiln-linen/${a.name}`;

  const save = async () => {
    setSaving(true);
    try {
      await onAltSave(a.id, alt.trim());
    } finally {
      setSaving(false);
    }
  };

  const facts: Array<[string, React.ReactNode]> = [
    [c("Type", "Tür"), <span key="t" className="uppercase">{a.ext}</span>],
    ...(a.width ? ([[c("Dimensions", "Boyutlar"), `${a.width} × ${a.height} px`]] as Array<[string, React.ReactNode]>) : []),
    ...(a.duration ? ([[c("Length", "Süre"), fmtDuration(a.duration)]] as Array<[string, React.ReactNode]>) : []),
    [c("File size", "Dosya boyutu"), f.bytes(a.size)],
    [c("Folder", "Klasör"), t(folderName(a.folder) ?? { en: a.folder, tr: a.folder })],
    [
      c("Uploaded", "Yüklendi"),
      <span key="u" className="inline-flex items-center gap-1.5">
        <Avatar name={uploader.name} size="xs" /> {uploader.name.split(" ")[0]} · {ago(a.uploadedAt)}
      </span>,
    ],
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-4">
        <h2 className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-fg">{a.name}</h2>
        <IconButton size="sm" label={c("Close details", "Ayrıntıları kapat")} onClick={onClose}>
          <X />
        </IconButton>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <Thumb asset={a} className="aspect-[4/3] w-full rounded-ui" />

        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => {
              void navigator.clipboard?.writeText(url).catch(() => undefined);
              toast.success(c("Link copied", "Bağlantı kopyalandı"), { description: url });
            }}
          >
            <Copy aria-hidden /> {c("Copy link", "Bağlantıyı kopyala")}
          </Button>
          <IconButton size="sm" variant="danger-ghost" label={c("Delete file", "Dosyayı sil")} onClick={() => onDelete(a.id)}>
            <Trash2 />
          </IconButton>
        </div>

        {a.kind !== "document" && (
          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (dirty) void save();
            }}
          >
            <Field
              label={c("Alt text", "Alt metin")}
              hint={c("Describe what the photo shows for people using screen readers and for search.", "Ekran okuyucu kullananlar ve arama motorları için görselde ne olduğunu anlatın.")}
              error={!a.alt && !dirty ? c("Missing: this file is used without a description.", "Eksik: bu dosya açıklamasız kullanılıyor.") : undefined}
            >
              <Textarea rows={3} value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={160} showCount />
            </Field>
            <div className="mt-2 flex justify-end gap-2">
              {dirty && (
                <Button size="sm" variant="ghost" onClick={() => setAlt(a.alt)}>
                  {c("Reset", "Sıfırla")}
                </Button>
              )}
              <Button size="sm" variant={dirty ? "primary" : "secondary"} type="submit" disabled={!dirty} loading={saving}>
                {c("Save alt text", "Alt metni kaydet")}
              </Button>
            </div>
          </form>
        )}

        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-line pt-4 text-[12.5px]">
          {facts.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="text-fg-subtle">{k}</dt>
              <dd className="min-w-0 truncate text-end text-fg">{v}</dd>
            </React.Fragment>
          ))}
        </dl>

        <div className="mt-6 border-t border-line pt-4">
          <h3 className="flex items-center gap-2 text-[12.5px] font-medium text-fg">
            <Link2 className="size-3.5 text-fg-subtle" aria-hidden /> {c("Used in", "Kullanıldığı yerler")}
            <Badge>{f.number(a.usedIn.length)}</Badge>
          </h3>
          {a.usedIn.length ? (
            <ul className="mt-2 grid gap-1">
              {a.usedIn.map((u) => (
                <li key={u.en} className="rounded-md bg-surface-2 px-2.5 py-1.5 text-[12.5px] text-fg-muted">
                  {t(u)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[12.5px] text-fg-subtle">{c("Not used on any page yet. Safe to delete.", "Henüz hiçbir sayfada kullanılmıyor. Silmek güvenli.")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
